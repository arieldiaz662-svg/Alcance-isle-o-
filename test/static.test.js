// Tests de la web estática (lo que se publica en GitHub Pages).
// Los valores esperados se toman de src/content/site.js siempre que es posible, para que un cambio
// de redacción no rompa los tests y un error de coherencia (precios, enlaces, nombres) sí lo haga.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { after, before, describe, test } from 'node:test';

import { buildStatic } from '../scripts/build-static.js';
import { site } from '../src/content/site.js';
import { STATIC_CSP } from '../src/views/html.js';

const BASE = 'https://ejemplo.github.io/alcance-isleno';
const outDir = mkdtempSync(join(tmpdir(), 'alcance-static-'));
let index;
let precios;
const read = (file) => readFileSync(join(outDir, file), 'utf8');
const between = (html, from, to) => html.slice(html.indexOf(from), to ? html.indexOf(to) : undefined);
const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
// Fila de la carta de precios: concepto, puntos guía e importe.
const priceRow = (label, price) => new RegExp(`<span>${escapeRe(label)}</span><span class="guia" aria-hidden="true"></span><span class="importe">${escapeRe(price)}</span>`);
// Primer número de un precio ("desde 200 €", "90 € / año", "3,50 €").
const amount = (price) => Number(String(price).match(/\d+(?:,\d+)?/)[0].replace(',', '.'));
const service = (id) => site.services.find((s) => s.id === id);
const extra = (id) => site.extras.items.find((i) => i.id === id);

before(() => {
  buildStatic({ outDir, publicBaseUrl: `${BASE}/` });
  index = read('index.html');
  precios = between(index, 'id="precios"');
});
after(() => rmSync(outDir, { recursive: true, force: true }));

describe('construcción y publicación', () => {
  test('_headers da a Cloudflare Pages la misma CSP que el HTML y las cabeceras de seguridad', () => {
    const dir = mkdtempSync(join(tmpdir(), 'alcance-headers-'));
    try {
      buildStatic({ outDir: dir, publicBaseUrl: '' });
      const headers = readFileSync(join(dir, '_headers'), 'utf8');
      assert.ok(headers.includes(`Content-Security-Policy: ${STATIC_CSP}; frame-ancestors 'none'`));
      assert.match(headers, /X-Content-Type-Options: nosniff/);
      assert.match(headers, /\/assets\/\*\n\s+Cache-Control:/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('en Cloudflare Pages, sin PUBLIC_BASE_URL, canonical y og:image usan el dominio del proyecto', () => {
    const dir = mkdtempSync(join(tmpdir(), 'alcance-cf-'));
    const saved = { base: process.env.PUBLIC_BASE_URL, host: process.env.CF_PAGES_URL };
    try {
      delete process.env.PUBLIC_BASE_URL;
      process.env.CF_PAGES_URL = 'https://3f2a9c1b.alcance-isleno.pages.dev';
      buildStatic({ outDir: dir });
      const html = readFileSync(join(dir, 'index.html'), 'utf8');
      assert.match(html, /<link rel="canonical" href="https:\/\/alcance-isleno\.pages\.dev\/"/);
      assert.match(html, /og:image" content="https:\/\/alcance-isleno\.pages\.dev\/assets\//);
      assert.ok(existsSync(join(dir, 'sitemap.xml')));
    } finally {
      for (const [key, value] of [['PUBLIC_BASE_URL', saved.base], ['CF_PAGES_URL', saved.host]]) {
        if (value === undefined) delete process.env[key]; else process.env[key] = value;
      }
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('sitio 100 % estático: una sola dependencia y sin restos del servidor archivado', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    assert.deepEqual(Object.keys(pkg.dependencies), ['qrcode']);
    for (const path of ['src/app.js', 'src/routes', 'public/admin', 'Dockerfile']) {
      assert.ok(!existsSync(new URL(`../${path}`, import.meta.url)), `${path} está en la rama archivo-app-servidor`);
    }
  });


  test('genera las páginas y recursos, sin el panel de administración', () => {
    for (const file of ['index.html', 'privacidad.html', 'cookies.html', '404.html', 'robots.txt', 'sitemap.xml',
      '_headers', '.nojekyll', 'assets/css/site.css', 'assets/js/site.js', 'assets/fonts/familjen-grotesk.woff2',
      'assets/img/terrazo.svg', 'assets/img/favicon.svg', 'assets/img/og.jpg']) {
      assert.ok(existsSync(join(outDir, file)), file);
    }
    assert.ok(!existsSync(join(outDir, 'assets/admin')), 'el panel no se publica');
  });

  test('funciona en una subcarpeta y sin recursos de terceros', () => {
    assert.doesNotMatch(index, /(href|src)="\/(?!\/)/, 'sin rutas absolutas');
    assert.doesNotMatch(index, /fonts\.googleapis|fonts\.gstatic/);
    assert.match(index, new RegExp(`<link rel="canonical" href="${escapeRe(BASE)}/">`));
    assert.match(read('sitemap.xml'), new RegExp(`${escapeRe(BASE)}/privacidad\\.html`));
    assert.match(read('404.html'), new RegExp(`<base href="${escapeRe(BASE)}/">`), 'la 404 carga estilos en cualquier ruta');
  });

  test('seguridad y caché: CSP en <meta>, versión en CSS/JS', () => {
    assert.match(index, /<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'/);
    assert.match(index, /href="assets\/css\/site\.css\?v=[0-9a-f]{10}"/);
    assert.match(index, /src="assets\/js\/site\.js\?v=[0-9a-f]{10}"/);
  });

  test('vista previa al compartir: og:image absoluta de 1200×630', () => {
    assert.match(index, new RegExp(`<meta property="og:image" content="${escapeRe(BASE)}/assets/img/og\\.jpg">`));
    assert.match(index, /<meta name="twitter:card" content="summary_large_image">/);
  });

  test('no se publican recursos que ninguna página usa', () => {
    const pages = ['index.html', 'privacidad.html', 'cookies.html', '404.html'].map(read).join(' ') + read('assets/css/site.css');
    const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
    for (const file of walk(join(outDir, 'assets')).filter((f) => !f.endsWith('.txt'))) {
      const name = relative(join(outDir, 'assets'), file).split('/').pop();
      assert.ok(pages.includes(name), `recurso sin uso: ${name}`);
    }
  });
});

describe('coherencia del contenido', () => {
  test('todos los enlaces internos (#...) llevan a una sección que existe', () => {
    for (const [, id] of index.matchAll(/href="#([\w-]+)"/g)) {
      assert.match(index, new RegExp(`id="${id}"`), `enlace roto: #${id}`);
    }
  });

  test('el menú sigue el orden de las secciones de la página', () => {
    const navIds = [...between(index, '<header', '</header>').matchAll(/href="#([\w-]+)"/g)].map((m) => m[1]).filter((id) => !['inicio', 'contacto'].includes(id));
    const positions = navIds.map((id) => index.indexOf(`id="${id}"`));
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b), `orden del menú: ${navIds.join(', ')}`);
  });

  test('el precio "antes" de cada pack es la suma de sus servicios sueltos', () => {
    // Pack completo hostelería = ficha + landing + hosting 1er año + tarjeta de reseñas.
    const suelto = amount(service('gbp').price) + amount(service('landing').price)
      + amount(service('hosting').prices[0].price) + amount(extra('nfc').price);
    assert.equal(amount(site.pack.was), suelto, 'site.pack.was');
    assert.ok(amount(site.pack.price) < suelto, 'el pack debe ser más barato que los servicios sueltos');
    // Pack negocios con cita previa = landing + tarjeta de reseñas (sin hosting).
    const cita = site.sectors.find((s) => s.id === 'cita-previa');
    assert.equal(amount(cita.pack.price), amount(service('landing').price) + amount(extra('nfc').price));
  });

  test('un solo nombre para la tarjeta de reseñas en toda la web', () => {
    const name = extra('nfc').name;
    assert.equal(name, 'Tarjeta de reseñas QR + NFC');
    // Texto visible y mensajes de WhatsApp de todas las páginas (sin etiquetas ni clases CSS).
    const text = ['index.html', 'privacidad.html', 'cookies.html', '404.html'].map(read).join(' ')
      .replace(/<[^>]+>/g, ' ').concat(' ', decodeURIComponent((index.match(/text=[^"]+/g) || []).join(' ')));
    assert.doesNotMatch(text, /[Pp]laca de reseñas|tarjetas? NFC|tarjeta en el mostrador/);
    for (const [mention] of text.matchAll(/[Tt]arjetas? de reseñas.{0,9}/g)) {
      assert.match(mention, /^[Tt]arjetas? de reseñas QR \+ NFC/, `nombre incompleto: "${mention}"`);
    }
    for (const sector of site.sectors) {
      assert.ok(sector.includes.some((i) => i.name === name), `${sector.id} debe usar "${name}"`);
    }
  });

  test('los importes repetidos salen de la lista de precios', () => {
    const hosting = service('hosting').prices[0].price;
    assert.match(between(index, 'class="recorrido"', 'id="por-que"'), new RegExp(escapeRe(hosting.replace(' / año', ' al año'))));
    assert.match(between(index, 'id="cita-previa"'), new RegExp(`class="pack-hosting">[\\s\\S]*?${escapeRe(hosting)}`));
  });

  test('"Por qué elegirnos" presenta al equipo sin mencionar formaciones concretas', () => {
    assert.match(between(index, 'id="por-que"', 'id="como"'), /Somos un equipo interdisciplinar: observamos/);
    assert.doesNotMatch(index, /antropolog|administración de empresas/i);
  });

  test('no se publica ningún plazo de entrega ni datos de ejemplo antiguos', () => {
    assert.doesNotMatch(index, /10 días|dos semanas|laborables/);
    assert.doesNotMatch(index, /Marisol|mesa digital|300 €/i);
  });
});

describe('portada', () => {
  test('eslogan, texto y llamada principal', () => {
    assert.match(index, new RegExp(`<h1>${escapeRe(site.hero.title)}</h1>`));
    assert.match(index, new RegExp(`<p class="lead">${escapeRe(site.hero.lead)}`));
    assert.match(index, new RegExp(escapeRe(site.hero.cta)));
    assert.match(index, /wa\.me\/34623243294/);
    assert.match(index, /\+34 623 24 32 94/);
  });

  test('carta de demostración con pestañas y QR real que abre WhatsApp', () => {
    assert.match(index, /role="tablist" aria-label="Secciones de la carta"/);
    assert.match(index, /id="carta-panel-1"[^>]*hidden/);
    assert.match(index, new RegExp(escapeRe(site.demoMenu.business)));
    const qr = `https://wa.me/34623243294?text=${encodeURIComponent(site.demoMenu.qrWhatsappText)}`;
    assert.match(index, new RegExp(`<a class="expositor" href="${escapeRe(qr)}"`));
    assert.match(index, /<svg class="qr" viewBox="-1 -1 \d+ \d+"/);
  });
});

describe('packs por tipo de negocio', () => {
  test('selector de dos pestañas justo después de la portada', () => {
    assert.ok(index.indexOf('id="packs"') < index.indexOf('id="servicios"'));
    for (const [i, sector] of site.sectors.entries()) {
      assert.match(index, new RegExp(`role="tab" id="tab-${sector.id}" aria-controls="${sector.id}" aria-selected="${i === 0}"`));
    }
    assert.match(index, /class="sector-tabs" role="tablist"[^>]*hidden/, 'sin JavaScript se ven los dos paneles');
  });

  test('hostelería: pack completo con regalo y material para mesas', () => {
    const panel = between(index, 'id="hosteleria"', 'id="cita-previa"');
    assert.match(panel, /De regalo/);
    assert.match(panel, new RegExp(`class="pack-total">[\\s\\S]*?<s>${site.pack.was}</s> ${site.pack.price}`));
    assert.doesNotMatch(panel, /pack-hosting/, 'incluye el hosting del primer año');
    for (const id of ['mesa', 'pegatinas']) {
      assert.match(panel, new RegExp(`${escapeRe(extra(id).name)}</h5>[\\s\\S]*?${escapeRe(extra(id).price)}`));
    }
    assert.match(panel, /<figcaption>Imagen de muestra<\/figcaption>/);
    assert.match(panel, /Impreso en 3D en Tenerife/);
  });

  test('cita previa: pack, hosting aparte y tarjetas de visita; sin material de mesa', () => {
    const cita = site.sectors.find((s) => s.id === 'cita-previa');
    const panel = between(index, 'id="cita-previa"', 'class="recorrido"');
    assert.match(panel, new RegExp(`${escapeRe(cita.pack.label)}</h4>\\s*<span class="local-precio">${cita.pack.price}`));
    assert.match(panel, /class="pack-hosting">[\s\S]*?se paga aparte/);
    assert.match(panel, new RegExp(`Opcional: ${escapeRe(cita.option.name)}[\\s\\S]*?${escapeRe(cita.option.price)}`));
    assert.doesNotMatch(panel, /Expositor de mesa/);
    assert.match(panel, /wa\.me\/34623243294\?text=Hola%2C%20tengo%20un%20negocio%20con%20cita%20previa/);
  });
});

describe('precios', () => {
  test('todos los servicios, el material y los packs aparecen en la carta de precios', () => {
    for (const s of site.services) {
      for (const row of s.prices || [{ label: s.priceLabel || s.name, price: s.price }]) assert.match(precios, priceRow(row.label, row.price));
    }
    for (const item of site.extras.items) assert.match(precios, priceRow(item.name, item.price));
    assert.match(precios, /class="pack"[\s\S]*?<s>415 €<\/s> <strong>390 €<\/strong>/);
    assert.match(precios, /Pack negocios con cita previa \(web \+ tarjeta de reseñas QR \+ NFC; hosting aparte\)/);
    assert.match(precios, /Precios sin IGIC/);
  });
});

describe('textos legales', () => {
  test('sin datos del titular no se publica el aviso legal', () => {
    assert.ok(!existsSync(join(outDir, 'aviso-legal.html')));
    assert.doesNotMatch(index, /Aviso legal/);
    assert.doesNotMatch(read('privacidad.html'), /\[|NIF\/CIF/);
  });

  test('la web no guarda datos: el formulario solo abre WhatsApp', () => {
    assert.match(index, /<form id="formulario" novalidate data-whatsapp="34623243294">/);
    assert.doesNotMatch(index, /name="consent"|name="phone"|\/api\//);
    assert.match(read('privacidad.html'), /no guarda ningún dato/);
    assert.doesNotMatch(read('privacidad.html'), /Tarjetas NFC/);
  });
});
