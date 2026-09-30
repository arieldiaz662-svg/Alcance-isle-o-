import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { openDatabase } from '../src/db/index.js';
import { hashPassword } from '../src/lib/auth.js';
import { createRepositories } from '../src/repositories/index.js';

const config = loadConfig({ NODE_ENV: 'test', WHATSAPP_NUMBER: '34600111222', CONTACT_EMAIL: 'hola@example.es' });
const EMAIL = 'equipo@example.es';
const PASSWORD = 'una-contraseña-larga';

let app;
let db;
let repos;

before(async () => {
  db = openDatabase(':memory:');
  repos = createRepositories(db);
  repos.users.upsert(EMAIL, await hashPassword(PASSWORD));
  app = await buildApp({ config, db, logger: false });
});

after(async () => {
  await app.close();
  db.close();
});

const validLead = {
  name: 'Marisol Pérez',
  phone: '600 123 456',
  email: '',
  business_type: 'Peluquería',
  service: 'nfc',
  message: 'Quiero más reseñas',
  consent: true,
  website: '',
};

async function login() {
  const response = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: EMAIL, password: PASSWORD } });
  assert.equal(response.statusCode, 200);
  const cookie = response.cookies.find((c) => c.name === 'ai_session');
  assert.ok(cookie.httpOnly);
  return { cookie: `ai_session=${cookie.value}` };
}

describe('web pública', () => {
  test('la landing se sirve con el WhatsApp configurado y cabeceras de seguridad', async () => {
    const response = await app.inject('/');
    assert.equal(response.statusCode, 200);
    assert.match(response.body, /<h1>Tu mesa digital<\/h1>/);
    assert.match(response.body, /wa\.me\/34600111222/);
    assert.match(response.headers['content-security-policy'], /default-src 'self'/);
    // La sección de equipo se oculta mientras no haya nombres.
    assert.doesNotMatch(response.body, /id="equipo"/);
  });

  test('páginas legales, robots, sitemap y healthz', async () => {
    for (const url of ['/privacidad', '/cookies', '/robots.txt', '/sitemap.xml', '/healthz']) {
      const response = await app.inject(url);
      assert.equal(response.statusCode, 200, url);
    }
  });

  test('sin datos del titular no hay aviso legal', async () => {
    assert.equal((await app.inject('/aviso-legal')).statusCode, 404);
  });

  test('404 en HTML para páginas y en JSON para la API', async () => {
    assert.equal((await app.inject('/no-existe')).headers['content-type'].split(';')[0], 'text/html');
    const api = await app.inject('/api/no-existe');
    assert.equal(api.statusCode, 404);
    assert.deepEqual(api.json(), { error: 'No encontrado' });
  });
});

describe('POST /api/leads', () => {
  test('guarda un lead válido', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/leads', payload: validLead });
    assert.equal(response.statusCode, 201);
    const { items } = repos.leads.list({ q: 'Marisol' });
    assert.equal(items.length, 1);
    assert.equal(items[0].status, 'new');
    assert.equal(items[0].email, null);
    assert.ok(items[0].consent_at);
  });

  test('rechaza sin consentimiento o sin teléfono', async () => {
    const noConsent = await app.inject({ method: 'POST', url: '/api/leads', payload: { ...validLead, consent: false } });
    assert.equal(noConsent.statusCode, 400);
    const { phone, ...noPhone } = validLead;
    const missingPhone = await app.inject({ method: 'POST', url: '/api/leads', payload: noPhone });
    assert.equal(missingPhone.statusCode, 400);
  });

  test('el honeypot responde 201 pero no guarda nada', async () => {
    const before = repos.leads.list().total;
    const response = await app.inject({ method: 'POST', url: '/api/leads', payload: { ...validLead, name: 'Bot', website: 'http://spam' } });
    assert.equal(response.statusCode, 201);
    assert.equal(repos.leads.list().total, before);
  });
});

describe('autenticación', () => {
  test('el panel exige sesión', async () => {
    assert.equal((await app.inject('/api/admin/leads')).statusCode, 401);
    assert.equal((await app.inject('/api/auth/me')).statusCode, 401);
  });

  test('credenciales incorrectas devuelven 401', async () => {
    const wrong = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: EMAIL, password: 'mala' } });
    assert.equal(wrong.statusCode, 401);
    const unknown = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'x@y.es', password: 'mala' } });
    assert.equal(unknown.statusCode, 401);
  });

  test('logout invalida la sesión', async () => {
    const headers = await login();
    assert.equal((await app.inject({ url: '/api/auth/me', headers })).statusCode, 200);
    await app.inject({ method: 'POST', url: '/api/auth/logout', headers });
    assert.equal((await app.inject({ url: '/api/auth/me', headers })).statusCode, 401);
  });
});

describe('panel de administración', () => {
  test('flujo completo: lead → cliente → tarjeta NFC → redirección con registro de uso', async () => {
    const headers = await login();

    const { items } = (await app.inject({ url: '/api/admin/leads?status=new', headers })).json();
    const lead = items[0];

    const patched = await app.inject({ method: 'PATCH', url: `/api/admin/leads/${lead.id}`, headers, payload: { status: 'contacted', notes: 'Llamar el lunes' } });
    assert.equal(patched.json().status, 'contacted');

    const converted = await app.inject({ method: 'POST', url: `/api/admin/leads/${lead.id}/convert`, headers });
    assert.equal(converted.statusCode, 201);
    const client = converted.json();
    assert.equal(repos.leads.findById(lead.id).status, 'won');
    const again = await app.inject({ method: 'POST', url: `/api/admin/leads/${lead.id}/convert`, headers });
    assert.equal(again.statusCode, 409);

    const insecure = await app.inject({ method: 'POST', url: '/api/admin/cards', headers, payload: { client_id: client.id, target_url: 'http://example.com' } });
    assert.equal(insecure.statusCode, 400);

    const created = await app.inject({
      method: 'POST', url: '/api/admin/cards', headers,
      payload: { client_id: client.id, target_url: 'https://g.page/r/ejemplo/review', label: 'Mostrador', slug: 'marisol' },
    });
    assert.equal(created.statusCode, 201);
    const card = created.json();

    const duplicate = await app.inject({ method: 'POST', url: '/api/admin/cards', headers, payload: { client_id: client.id, target_url: 'https://g.page/x', slug: 'marisol' } });
    assert.equal(duplicate.statusCode, 409);

    const auto = await app.inject({ method: 'POST', url: '/api/admin/cards', headers, payload: { client_id: client.id, target_url: 'https://g.page/x' } });
    assert.match(auto.json().slug, /^[a-z2-9]{7}$/);

    const tap = await app.inject({ url: '/r/marisol', headers: { 'user-agent': 'test-phone' } });
    assert.equal(tap.statusCode, 302);
    assert.equal(tap.headers.location, 'https://g.page/r/ejemplo/review');

    const taps = (await app.inject({ url: `/api/admin/cards/${card.id}/taps`, headers })).json();
    assert.equal(taps.items.reduce((sum, row) => sum + row.count, 0), 1);

    const stats = (await app.inject({ url: '/api/admin/stats', headers })).json();
    assert.equal(stats.tapsLast30d, 1);
    assert.equal(stats.leadsByStatus.won, 1);

    await app.inject({ method: 'PATCH', url: `/api/admin/cards/${card.id}`, headers, payload: { active: false } });
    assert.equal((await app.inject('/r/marisol')).statusCode, 410);
    assert.equal((await app.inject('/r/no-existe')).statusCode, 404);
  });

  test('crear cliente valida el nombre', async () => {
    const headers = await login();
    const bad = await app.inject({ method: 'POST', url: '/api/admin/clients', headers, payload: { phone: '600' } });
    assert.equal(bad.statusCode, 400);
    const ok = await app.inject({ method: 'POST', url: '/api/admin/clients', headers, payload: { name: 'Bar Tito' } });
    assert.equal(ok.statusCode, 201);
  });
});
