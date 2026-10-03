// Tests de la web estática (lo que se publica en Cloudflare).
// Los valores esperados se toman de src/content/site.js siempre que es posible, para que un cambio
// de redacción no rompa los tests y un error de coherencia (precios, enlaces, nombres) sí lo haga.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { after, before, describe, test } from 'node:test';

import QRCode from 'qrcode';

import { buildStatic } from '../scripts/build-static.js';
import { site } from '../src/content/site.js';
import { STATIC_CSP } from '../src/views/html.js';
import { QR_SOLAPE, priceList, qrSvg } from '../src/views/landing.js';
import { parsePrice } from '../src/views/schema.js';
import worker from '../worker/index.js';
import { DOMINIO, redireccion, sinExtension } from '../worker/redireccion.js';

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
  test('_headers da a Cloudflare la misma CSP que el HTML y las cabeceras de seguridad', () => {
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

  test('wrangler.jsonc pasa los tests, construye con el dominio propio y publica dist/ con la página 404', () => {
    const raw = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
    const config = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, ''));
    assert.equal(config.assets.directory, './dist');
    assert.equal(config.assets.not_found_handling, '404-page');
    assert.equal(config.build.command, `npm test && PUBLIC_BASE_URL=https://${DOMINIO} npm run build`);
    assert.deepEqual(config.routes.map((r) => r.pattern), [DOMINIO, `www.${DOMINIO}`]);
    assert.ok(config.routes.every((r) => r.custom_domain));
  });

  test('una sola dirección: www y workers.dev redirigen al dominio principal', async () => {
    assert.equal(redireccion(new URL(`https://www.${DOMINIO}/privacidad.html?a=1`)), `https://${DOMINIO}/privacidad.html?a=1`);
    assert.equal(redireccion(new URL('https://alcance-isle-o.ariel-diaz662.workers.dev/')), `https://${DOMINIO}/`);
    assert.equal(redireccion(new URL(`https://${DOMINIO}/`)), null);
    assert.equal(redireccion(new URL('http://localhost:8787/')), null);

    const env = { ASSETS: { fetch: async () => new Response('web') } };
    const redirigida = await worker.fetch(new Request(`https://www.${DOMINIO}/`), env);
    assert.equal(redirigida.status, 301);
    assert.equal(redirigida.headers.get('location'), `https://${DOMINIO}/`);
    assert.equal(await (await worker.fetch(new Request(`https://${DOMINIO}/`), env)).text(), 'web');
  });

  test('las páginas .html se sirven sin redirección y la verificación de Google está en la raíz', async () => {
    assert.equal(sinExtension(new URL(`https://${DOMINIO}/privacidad.html?a=1`)).href, `https://${DOMINIO}/privacidad?a=1`);
    assert.equal(sinExtension(new URL(`https://${DOMINIO}/`)), null);
    assert.equal(sinExtension(new URL(`https://${DOMINIO}/index.html`)), null);
    assert.equal(sinExtension(new URL(`https://${DOMINIO}/assets/css/site.css`)), null);

    const pedidas = [];
    const env = { ASSETS: { fetch: async (req) => { pedidas.push(new URL(req.url).pathname); return new Response('ok'); } } };
    await worker.fetch(new Request(`https://${DOMINIO}/cookies.html`), env);
    assert.deepEqual(pedidas, ['/cookies']);

    const verificacion = readFileSync(join(outDir, 'googlef960d0c81659e9c5.html'), 'utf8');
    assert.equal(verificacion, 'google-site-verification: googlef960d0c81659e9c5.html');
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
      '_headers', 'assets/css/site.css', 'assets/js/site.js', 'assets/fonts/familjen-grotesk.woff2',
      'assets/img/favicon.svg', 'assets/img/og.jpg']) {
      assert.ok(existsSync(join(outDir, file)), file);
    }
    assert.ok(!existsSync(join(outDir, 'assets/admin')), 'el panel no se publica');
  });

  test('cabecera con el logotipo de la marca (puerta con tilde) y nombre accesible', () => {
    const marca = index.match(/<a class="marca"[\s\S]*?<\/a>/)[0];
    assert.match(marca, /aria-label="Alcance Isleño, inicio"/);
    assert.match(marca, /<svg class="marca-logo" aria-hidden="true"/);
    assert.match(marca, /fill="#FFC93C"/, 'la puerta encendida');
    assert.doesNotMatch(read('assets/img/favicon.svg'), /#1B62C9/, 'sin la chincheta azul anterior');
  });

  test('funciona en una subcarpeta y sin recursos de terceros', () => {
    assert.doesNotMatch(index, /(href|src)="\/(?!\/)/, 'sin rutas absolutas');
    assert.doesNotMatch(index, /fonts\.googleapis|fonts\.gstatic/);
    assert.match(index, new RegExp(`<link rel="canonical" href="${escapeRe(BASE)}/">`));
    assert.match(read('sitemap.xml'), new RegExp(`${escapeRe(BASE)}/privacidad\\.html`));
    assert.match(read("404.html"), /<base href="\/">/, "la 404 carga estilos en cualquier ruta y dominio");
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

  test('cada pack es más barato que sus servicios sueltos, sin mostrar precio "antes" ni ahorro', () => {
    // Pack completo hostelería = ficha + landing + primer año del plan de mantenimiento (pago anual) + tarjeta de reseñas.
    const planAnual = amount(service('hosting').prices[1].price);
    const suelto = amount(service('gbp').price) + amount(service('landing').price) + planAnual + amount(extra('nfc').price);
    assert.equal(suelto - amount(site.pack.price), 25, 'el pack de hostelería ahorra 25 € frente a los servicios sueltos');
    // Pack negocios con cita previa = landing + tarjeta de reseñas + primer año del plan, más barato que por separado.
    const cita = site.sectors.find((s) => s.id === 'cita-previa');
    assert.equal(amount(service('landing').price) + amount(extra('nfc').price) + planAnual - amount(cita.pack.price), 25,
      'el pack de cita previa ahorra 25 € frente a los servicios sueltos');
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
    const [mensual, anual] = service('hosting').prices.map((row) => row.price);
    const plan = `${mensual.replace(' / mes', ' al mes')} o ${anual.replace(' / año', ' al año')}`;
    assert.equal(plan, '12 € al mes o 120 € al año');
    assert.match(between(index, 'class="recorrido"', 'id="por-que"'), new RegExp(escapeRe(`por ${plan}. El primer año va incluido en los packs.`)));
  });

  test('plan de mantenimiento: sustituye al hosting suelto, hasta 2 cambios al mes y primer año incluido en los dos packs', () => {
    const plan = service('hosting');
    assert.equal(plan.name, 'Plan de mantenimiento');
    assert.deepEqual(plan.prices.slice(0, 2).map((row) => row.price), ['12 € / mes', '120 € / año']);
    assert.doesNotMatch(index, /90 € \/ año|90 € al año|se paga aparte|hosting aparte/);
    for (const sector of site.sectors) {
      const panel = between(index, `id="${sector.id}"`, sector.id === 'hosteleria' ? 'id="cita-previa"' : 'class="recorrido"');
      assert.match(panel, /<h4>Plan de mantenimiento el primer año<\/h4>\s*<p>Hosting, dominio y hasta 2 cambios al mes/, sector.id);
    }
  });

  test('"Por qué elegirnos" presenta al equipo sin mencionar formaciones concretas', () => {
    assert.match(between(index, 'id="por-que"', 'id="como"'), /Somos un equipo interdisciplinar: observamos/);
    assert.doesNotMatch(index, /antropolog|administración de empresas/i);
  });

  test('no se publica ningún plazo de entrega ni datos de ejemplo antiguos', () => {
    assert.doesNotMatch(index, /10 días|dos semanas|laborables/);
    assert.doesNotMatch(index, /Marisol|mesa digital/i);
    // La ficha de Google cuesta 100 € (la maqueta original decía 300 €); 300 € es solo la landing.
    assert.equal(service('gbp').price, '100 €');
    for (const [, label] of precios.matchAll(/<li><span>([^<]*)<\/span><span class="guia" aria-hidden="true"><\/span><span class="importe">300 €</g)) {
      assert.equal(label, service('landing').priceLabel);
    }
  });
});

describe('portada', () => {
  test('se siente nativa en el móvil: hover solo con ratón, sin destello al tocar y respuesta al pulsar', () => {
    const css = readFileSync(new URL('../public/css/site.css', import.meta.url), 'utf8');
    const bloqueHover = css.match(/@media \(hover: hover\) and \(pointer: fine\) \{([^}]*\}\s*)*?\}/)[0];
    const hoversFuera = css.replace(bloqueHover, '').split('\n').filter((l) => l.includes(':hover'));
    assert.deepEqual(hoversFuera, [], 'todos los :hover dentro de @media (hover: hover) and (pointer: fine)');
    assert.match(css, /-webkit-tap-highlight-color: transparent/);
    assert.match(css, /\.btn:active[^{]*\{ transform: scale\(0\.97\); \}/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*transform: none/);
    assert.match(index, /<meta name="theme-color" content="#FFFFFF">/, 'la barra del móvil del color de la cabecera');
  });

  test('la carta del móvil oculta las filas que no caben en vez de mostrarlas cortadas', () => {
    const css = readFileSync(new URL('../public/css/site.css', import.meta.url), 'utf8');
    const regla = css.match(/\.carta-lista \{[^}]*\}/)[0];
    for (const decl of ['overflow: hidden', 'flex-direction: column', 'flex-wrap: wrap']) assert.ok(regla.includes(decl), decl);
  });

  test('franja de canales bajo la portada, solo con texto y sin logotipos de marcas', () => {
    const franja = between(index, 'class="canales"', 'id="packs"');
    assert.ok(index.indexOf('id="inicio"') < index.indexOf('class="canales"'));
    assert.ok(index.indexOf('class="canales"') < index.indexOf('id="packs"'));
    for (const item of site.channels.items) assert.match(franja, new RegExp(`<li>${escapeRe(item.label)}</li>`));
    assert.doesNotMatch(franja, /<img|<svg|logo/i, 'sin iconos, imágenes ni logotipos oficiales');
  });

  test('el QR se dibuja suavizado, por tramos y solapado, para que no salga escalonado en el móvil', () => {
    const svg = qrSvg('https://wa.me/34623243294');
    assert.doesNotMatch(svg, /crispEdges/);
    const tramos = svg.match(/M/g).length;
    const modulos = QRCode.create('https://wa.me/34623243294', { errorCorrectionLevel: 'M' }).modules.data.filter(Boolean).length;
    assert.ok(tramos < modulos, 'los módulos seguidos de una fila forman un solo rectángulo');
    assert.match(svg, new RegExp(`M${-QR_SOLAPE} ${-QR_SOLAPE}h`), 'cada tramo se solapa un poco con sus vecinos');
  });

  test('eslogan, texto y llamada principal', () => {
    assert.match(index, new RegExp(`<h1>${escapeRe(site.hero.title)}</h1>`));
    assert.match(index, new RegExp(`<p class="lead">${escapeRe(site.hero.lead)}`));
    assert.match(index, new RegExp(escapeRe(site.hero.cta)));
    assert.match(index, /wa\.me\/34623243294/);
    assert.match(index, />\+34&nbsp;623&nbsp;24&nbsp;32&nbsp;94</, "el teléfono no se parte entre líneas");
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
  test('los dos tipos de negocio a la vista, sin pestañas, justo después de la portada', () => {
    assert.ok(index.indexOf('id="packs"') < index.indexOf('id="servicios"'));
    for (const sector of site.sectors) {
      assert.match(index, new RegExp(`<article class="sector" id="${sector.id}">\\s*<div>\\s*<h3>${escapeRe(sector.title)}</h3>`));
    }
    assert.doesNotMatch(between(index, 'id="packs"', 'id="servicios"'), /role="tab"/, 'sin pestañas: el dueño ve el suyo sin tocar nada');
  });

  test('sin objetos dibujados: ni móvil, ni barraquito, ni tarjeta inclinada', () => {
    assert.doesNotMatch(index, /class="(movil|barraquito|bodegon|mostrador|tarjeta-nfc)/);
    const css = readFileSync(new URL('../public/css/site.css', import.meta.url), 'utf8');
    assert.doesNotMatch(css, /rotate\(/, 'nada inclinado');
    assert.doesNotMatch(css, /border-radius: 999px/, 'sin botones en forma de píldora');
  });

  test('hostelería: pack completo, todo "Incluido" (sin "De regalo") y material para mesas', () => {
    const panel = between(index, 'id="hosteleria"', 'id="cita-previa"');
    assert.doesNotMatch(index, /[Dd]e regalo/);
    assert.equal((panel.match(/class="local-precio incluido">Incluido</g) || []).length, site.sectors[0].includes.length);
    assert.match(panel, new RegExp(`class="pack-total">[\\s\\S]*?<span class="local-precio">${site.pack.price}</span>`));
    for (const id of ['mesa', 'pegatinas']) {
      assert.match(panel, new RegExp(`${escapeRe(extra(id).name)}</h5>[\\s\\S]*?${escapeRe(extra(id).price)}`));
    }
    assert.match(panel, /<figcaption>Imagen de muestra<\/figcaption>/);
    assert.match(panel, /Impreso en 3D en Tenerife/);
  });

  test('cita previa: pack con el primer año de mantenimiento y tarjetas de visita; sin material de mesa', () => {
    const cita = site.sectors.find((s) => s.id === 'cita-previa');
    const panel = between(index, 'id="cita-previa"', 'class="recorrido"');
    assert.match(panel, new RegExp(`${escapeRe(cita.pack.label)}</h4>\\s*<span class="local-precio">${cita.pack.price}`));
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
    assert.match(precios, /class="pack"[\s\S]*?<p class="pack-precio"><strong>520 €<\/strong>/);
    assert.doesNotMatch(index, /<s>|ahorr|antes \d/i, 'sin precio tachado ni ahorro');
    assert.match(precios, /Pack negocios con cita previa \(web, tarjeta de reseñas QR \+ NFC y primer año de mantenimiento\)/);
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

describe('datos estructurados para Google', () => {
  const leer = (file) => {
    const match = /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(readFileSync(join(outDir, file), 'utf8'));
    return match && JSON.parse(match[1]);
  };

  test('la portada describe el negocio local: nombre, web, teléfono, zona y horario', () => {
    const [negocio, web] = leer('index.html')['@graph'];
    assert.equal(negocio['@type'], 'ProfessionalService');
    assert.equal(negocio.name, site.name);
    assert.equal(negocio.url, `${BASE}/`);
    assert.equal(negocio.telephone, `+${site.whatsappNumber}`);
    assert.equal(negocio.areaServed.name, site.region);
    assert.deepEqual(negocio.openingHoursSpecification[0].dayOfWeek, site.business.hours.days);
    assert.equal(negocio.openingHoursSpecification[0].opens, site.business.hours.opens);
    assert.equal(negocio.openingHoursSpecification[0].closes, site.business.hours.closes);
    assert.equal(web['@type'], 'WebSite');
    assert.equal(web.publisher['@id'], negocio['@id']);
  });

  test('los servicios y precios son los mismos que se ven en la web, sin IGIC', () => {
    const [negocio] = leer('index.html')['@graph'];
    const ofertas = negocio.hasOfferCatalog.itemListElement.flatMap((g) => g.itemListElement);
    const filas = [{ label: site.pack.name, price: site.pack.price }, ...priceList(site).flatMap((g) => g.rows)];
    assert.deepEqual(ofertas.map((o) => o.itemOffered.name), filas.map((f) => f.label));
    assert.deepEqual(ofertas.map((o) => o.priceSpecification), filas.map((f) => parsePrice(f.price)));
    assert.ok(ofertas.every((o) => o.priceSpecification.valueAddedTaxIncluded === false));
  });

  test('interpreta los formatos de precio de site.js y rechaza los desconocidos', () => {
    assert.equal(parsePrice('desde 200 €').minPrice, 200);
    assert.deepEqual([parsePrice('50 € / 10 uds.').price, parsePrice('50 € / 10 uds.').unitText], [50, '10 uds.']);
    assert.throws(() => parsePrice('consultar'), /Precio no reconocido/);
  });

  test('solo en la portada y solo si se conoce la dirección pública', () => {
    for (const file of ['privacidad.html', 'cookies.html', '404.html']) assert.equal(leer(file), null, file);
    const dir = mkdtempSync(join(tmpdir(), 'alcance-sin-url-'));
    try {
      buildStatic({ outDir: dir, publicBaseUrl: '' });
      assert.doesNotMatch(readFileSync(join(dir, 'index.html'), 'utf8'), /ld\+json/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
