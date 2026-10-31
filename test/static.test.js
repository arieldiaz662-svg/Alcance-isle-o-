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
// Los espacios de no separación ("12\u00a0€") se leen como espacios normales para comparar con site.js.
const read = (file) => readFileSync(join(outDir, file), 'utf8').replace(/\u00a0/g, ' ');
const between = (html, from, to) => html.slice(html.indexOf(from), to ? html.indexOf(to) : undefined);
const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
// Fila de la carta de precios: concepto, puntos guía e importe.
const priceRow = (label, price) => new RegExp(`<span>${escapeRe(label)}</span><span class="guia" aria-hidden="true"></span><span class="importe">${escapeRe(price)}</span>`);
// Primer número de un precio ("desde 200 €", "90 € / año", "3,50 €").
const amount = (price) => Number(String(price).match(/\d+(?:,\d+)?/)[0].replace(',', '.'));
const service = (id) => site.services.find((s) => s.id === id);
const extra = (id) => site.extras.items.find((i) => i.id === id);
// Precio normal de un pack (con la oferta de lanzamiento activa, el que aparece tachado).
const normalPrice = (pack) => pack.regularPrice || pack.price;
const launch = site.launch.active ? site.launch : null;
// Importe de un pack en la web: con la oferta, el precio normal tachado delante del de lanzamiento.
const packPriceRe = (pack) => (pack.regularPrice
  ? `<s class="antes"><span class="solo-lectores">Precio normal con ${site.launch.regularMonths} meses de mantenimiento: </span>${escapeRe(pack.regularPrice)}</s> <span class="solo-lectores">Precio de lanzamiento: </span>${escapeRe(pack.price)}`
  : escapeRe(pack.price));

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
      'assets/img/terrazo.svg', 'assets/img/favicon.svg', 'assets/img/og.jpg']) {
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

  test('icono de la pestaña: con versión para no quedarse en caché, favicon.ico y el de iPhone en la raíz', () => {
    assert.match(index, /<link rel="icon" href="assets\/img\/favicon\.svg\?v=[0-9a-f]{10}" type="image\/svg\+xml">/);
    assert.match(index, /<link rel="apple-touch-icon" href="\.\/apple-touch-icon\.png">/);
    const ico = readFileSync(join(outDir, 'favicon.ico'));
    assert.deepEqual([...ico.subarray(0, 4)], [0, 0, 1, 0], 'favicon.ico es un icono de verdad, no la página 404');
    assert.ok(existsSync(join(outDir, 'apple-touch-icon.png')));
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

  test('cada pack (a precio normal) es más barato que sus servicios sueltos, sin mostrar ahorro', () => {
    // Pack completo hostelería = ficha + landing + primer año del plan de mantenimiento (pago anual) + tarjeta de reseñas.
    const planAnual = amount(service('hosting').prices[1].price);
    const suelto = amount(service('gbp').price) + amount(service('landing').price) + planAnual + amount(extra('nfc').price);
    assert.equal(suelto - amount(normalPrice(site.pack)), 25, 'el pack de hostelería ahorra 25 € frente a los servicios sueltos');
    // Pack negocios con cita previa = landing + tarjeta de reseñas + primer año del plan, más barato que por separado.
    const cita = site.sectors.find((s) => s.id === 'cita-previa');
    assert.equal(amount(service('landing').price) + amount(extra('nfc').price) + planAnual - amount(normalPrice(cita.pack)), 25,
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
    assert.match(between(index, 'class="recorrido"', 'id="por-que"'), new RegExp(escapeRe(`por ${plan}. ${launch ? `Los packs de lanzamiento incluyen los ${launch.months} primeros meses.` : 'El primer año va incluido en los packs.'}`)));
  });

  test('plan de mantenimiento: sustituye al hosting suelto, hasta 2 cambios al mes e incluido en los dos packs', () => {
    const plan = service('hosting');
    assert.equal(plan.name, 'Plan de mantenimiento');
    assert.deepEqual(plan.prices.slice(0, 2).map((row) => row.price), ['12 € / mes', '120 € / año']);
    assert.doesNotMatch(index, /90 € \/ año|90 € al año|se paga aparte|hosting aparte/);
    for (const sector of site.sectors) {
      const panel = between(index, `id="${sector.id}"`, sector.id === 'hosteleria' ? 'id="cita-previa"' : 'class="recorrido"');
      const incluido = sector.includes.find((i) => i.name.startsWith('Plan de mantenimiento'));
      assert.equal(incluido.name, launch ? `Plan de mantenimiento los ${launch.months} primeros meses` : 'Plan de mantenimiento el primer año');
      assert.match(panel, new RegExp(`<h4>${escapeRe(incluido.name)}</h4>\\s*<p>[^<]*hosting, dominio y hasta 2 cambios al mes`, 'i'), sector.id);
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

  test('franja de canales bajo la portada, con iconos propios y sin logotipos de marcas', () => {
    const franja = between(index, 'class="canales"', 'id="packs"');
    assert.ok(index.indexOf('id="inicio"') < index.indexOf('class="canales"'));
    assert.ok(index.indexOf('class="canales"') < index.indexOf('id="packs"'));
    for (const item of site.channels.items) assert.match(franja, new RegExp(`</svg><span>${escapeRe(item.label)}</span>`));
    assert.equal((franja.match(/<svg class="canal-icono"/g) || []).length, site.channels.items.length);
    assert.doesNotMatch(franja, /<img|logo/i, 'sin imágenes ni logotipos oficiales');
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
  test('selector de dos pestañas justo después de la portada', () => {
    assert.ok(index.indexOf('id="packs"') < index.indexOf('id="servicios"'));
    for (const [i, sector] of site.sectors.entries()) {
      assert.match(index, new RegExp(`role="tab" id="tab-${sector.id}" aria-controls="${sector.id}" aria-selected="${i === 0}"`));
    }
    assert.match(index, /class="sector-tabs" role="tablist"[^>]*hidden/, 'sin JavaScript se ven los dos paneles');
  });

  test('hostelería: pack completo y todo "Incluido" (sin "De regalo"); sin material de mesa a precio fijo', () => {
    const panel = between(index, 'id="hosteleria"', 'id="cita-previa"');
    assert.doesNotMatch(index, /[Dd]e regalo/);
    assert.equal((panel.match(/class="local-precio incluido">Incluido</g) || []).length, site.sectors[0].includes.length);
    assert.match(panel, new RegExp(`class="pack-total">[\\s\\S]*?<span class="local-precio">${packPriceRe(site.pack)}</span>`));
    // Sin material de mesa a precio fijo: ni el expositor impreso en 3D ni las pegatinas (estas, solo a presupuesto).
    assert.equal(extra('mesa'), undefined);
    assert.equal(extra('pegatinas'), undefined, 'las pegatinas ya no se venden con precio fijo');
    assert.equal(site.sectors[0].option, undefined);
    assert.doesNotMatch(index, /[Ee]xpositor de mesa|Impreso en 3D|Imagen de muestra|expositor-mesa|50 € \/ 10 uds|Para tus mesas/);
  });

  test('cita previa: pack con mantenimiento y diseño de tarjetas de visita a presupuesto; sin material de mesa', () => {
    const cita = site.sectors.find((s) => s.id === 'cita-previa');
    const panel = between(index, 'id="cita-previa"', 'class="recorrido"');
    assert.match(panel, new RegExp(`${escapeRe(cita.pack.label)}</h4>\\s*<span class="local-precio">${packPriceRe(cita.pack)}</span>`));
    assert.equal(cita.option, undefined);
    assert.match(panel, /<h4>Diseño personalizado de tarjetas de visita<\/h4>[\s\S]*?Pedir presupuesto/);
    assert.doesNotMatch(panel, /Expositor de mesa|50 € \/ 100 uds/);
    assert.match(panel, /wa\.me\/34623243294\?text=Hola%2C%20tengo%20un%20negocio%20con%20cita%20previa/);
  });
});

describe('precios', () => {
  test('todos los servicios, el material y los packs aparecen en la carta de precios', () => {
    for (const s of site.services) {
      for (const row of s.prices || [{ label: s.priceLabel || s.name, price: s.price }]) assert.match(precios, priceRow(row.label, row.price));
    }
    for (const item of site.extras.items) assert.match(precios, priceRow(item.name, item.price));
    const precioPack = launch ? '<s class="antes"><span class="solo-lectores">Precio normal con 12 meses de mantenimiento: </span>520 €</s> <span class="solo-lectores">Precio de lanzamiento: </span><strong>260 €</strong>' : '<strong>520 €</strong>';
    assert.match(precios, new RegExp(`class="pack"[\\s\\S]*?<p class="pack-precio">${escapeRe(precioPack)}</p>`));
    assert.doesNotMatch(index, /ahorr|antes \d/i, 'sin ahorro calculado');
    assert.equal(index.includes('<s '), Boolean(launch), 'precio tachado solo mientras dura la oferta');
    const cita = site.sectors.find((s) => s.id === 'cita-previa');
    assert.match(precios, new RegExp(`Pack negocios con cita previa \\(${escapeRe(cita.pack.label.charAt(0).toLowerCase() + cita.pack.label.slice(1))}\\)`));
    assert.match(precios, new RegExp(`<span class="importe">${packPriceRe(cita.pack)}</span>`));
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

  test('el logo para Google es el de la marca: PNG cuadrado de al menos 112 px', () => {
    const [negocio] = leer('index.html')['@graph'];
    assert.equal(negocio.logo, `${BASE}/assets/${site.logo}`);
    const png = readFileSync(join(outDir, 'assets', site.logo));
    assert.equal(png.toString('ascii', 1, 4), 'PNG');
    const [ancho, alto] = [png.readUInt32BE(16), png.readUInt32BE(20)];
    assert.equal(ancho, alto, 'cuadrado');
    assert.ok(ancho >= 112, 'Google pide al menos 112 × 112 px');
  });

  test('los servicios y precios son los mismos que se ven en la web, sin IGIC', () => {
    const [negocio] = leer('index.html')['@graph'];
    const ofertas = negocio.hasOfferCatalog.itemListElement.flatMap((g) => g.itemListElement);
    // Los servicios a presupuesto (sin importe) no se anuncian con precio.
    const filas = [{ label: site.pack.name, price: site.pack.price }, ...priceList(site).flatMap((g) => g.rows)].filter((f) => /\d/.test(f.price));
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

describe('oferta de lanzamiento', () => {
  test('50 % de descuento en los dos packs, con precio normal, cupo y condiciones visibles (o sin oferta si está apagada)', () => {
    if (!launch) {
      // launch.active: false → packs a precio normal y con el primer año de mantenimiento, sin banner ni precios tachados.
      assert.deepEqual([site.pack.price, site.pack.regularPrice], ['520 €', undefined]);
      assert.equal(site.sectors.find((s) => s.id === 'cita-previa').pack.price, '420 €');
      assert.doesNotMatch(index, /class="oferta"|oferta-chapa|<s |Oferta de lanzamiento|pack-nota|primeros 5 clientes/);
      assert.match(index, /Plan de mantenimiento el primer año/);
      assert.match(index, /El primer año va incluido en los packs\./);
      return;
    }
    assert.equal(site.launch.percent, 50);
    for (const pack of [site.pack, site.sectors.find((s) => s.id === 'cita-previa').pack]) {
      assert.equal(amount(pack.price), amount(pack.regularPrice) / 2, pack.name);
    }
    assert.deepEqual([site.pack.price, site.pack.regularPrice], ['260 €', '520 €']);
    const oferta = between(index, 'class="oferta"', '</aside>');
    assert.match(oferta, /Oferta de lanzamiento: -50 %/);
    assert.match(oferta, /los 5 primeros clientes/);
    assert.match(oferta, /Incluye la tarjeta de reseñas QR \+ NFC y 3 meses de mantenimiento/);
    assert.ok(oferta.replace(/<[^>]+>/g, '').length < 560, 'banner breve');
    assert.match(precios, /El precio tachado es el del pack normal, que incluye 12 meses de mantenimiento/);
    for (const sector of site.sectors) {
      const panel = between(index, `id="${sector.id}"`, sector.id === 'hosteleria' ? 'id="cita-previa"' : 'class="recorrido"');
      assert.match(panel.slice(panel.indexOf('class="pack-total"')).split('</li>')[0], /class="pack-nota">El precio tachado es el del pack normal, que incluye 12 meses/, sector.id);
    }
    for (const sector of site.sectors) {
      const panel = between(index, `id="${sector.id}"`, sector.id === 'hosteleria' ? 'id="cita-previa"' : 'class="recorrido"');
      assert.match(panel, /<h4>Tarjeta de reseñas QR \+ NFC<\/h4>[\s\S]*?class="local-precio incluido">Incluido</, `${sector.id}: la tarjeta va dentro del pack`);
      assert.ok(panel.indexOf('Tarjeta de reseñas QR + NFC') < panel.indexOf('class="pack-total"'), sector.id);
    }
    assert.match(oferta, /Precios sin IGIC/);
    assert.match(oferta, /wa\.me\/34623243294\?text=Hola%2C%20quiero%20aprovechar%20la%20oferta/);
    assert.match(index, /class="oferta-chapa" href="#packs"/);
  });

  test('los servicios extra y externalizados van aparte del pack y fuera del descuento', () => {
    for (const [id, hasta] of [['hosteleria', 'id="cita-previa"'], ['cita-previa', 'class="recorrido"']]) {
      const panel = between(index, `id="${id}"`, hasta);
      assert.ok(panel.indexOf('class="pack-total"') < panel.indexOf('class="extras-aparte"'), id);
      const extras = between(panel, 'class="extras-aparte"');
      assert.match(extras, /Servicios externalizados<\/h3>/);
      assert.match(extras, /<h4>Diseño personalizado de tarjetas de visita<\/h4>/);
      // Las pegatinas QR para mesas son un servicio externalizado a presupuesto, solo en la pestaña de hostelería.
      assert.equal(/<h4>Pegatinas QR para mesas<\/h4>[\s\S]*?Pedir presupuesto/.test(extras), id === 'hosteleria', id);
      assert.doesNotMatch(extras, /<s /);
      assert.doesNotMatch(panel, /Servicios extra<\/h3>/, `${id}: sin servicios extra bajo el pack`);
    }
    assert.match(precios, /Diseño personalizado de tarjetas de visita<\/span><span class="guia" aria-hidden="true"><\/span><span class="importe">Pide presupuesto</);
    assert.match(precios, /<h3>Servicios extra<\/h3>/);
    assert.match(precios, /Pegatinas QR para mesas<\/span><span class="guia" aria-hidden="true"><\/span><span class="importe">Pide presupuesto</);
    assert.match(index, /wa\.me\/34623243294\?text=Hola%2C%20quiero%20pedir%20presupuesto%20para%20pegatinas%20QR/);
    assert.doesNotMatch(index, /Material para tu local/);
    if (!launch) return;
    assert.match(between(index, 'class="oferta"', '</aside>'), /ni aplicable a servicios sueltos, extras o externalizados, que van a su precio normal/);
  });

  test('la oferta no toca los servicios sueltos ni el material', () => {
    const grupos = precios.split('class="carta-grupo"').slice(1);
    assert.ok(grupos.length >= 3);
    assert.doesNotMatch(grupos.slice(0, 2).join(''), /<s /);
  });

  test('los datos estructurados anuncian el precio vigente (el de lanzamiento mientras dura)', () => {
    const [negocio] = JSON.parse(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(index)[1])['@graph'];
    const precios = negocio.hasOfferCatalog.itemListElement.flatMap((g) => g.itemListElement)
      .filter((o) => /^Pack /.test(o.itemOffered.name)).map((o) => o.priceSpecification.price);
    assert.deepEqual(precios, launch ? [260, 210] : [520, 420]);
  });
});

describe('instagram', () => {
  test('la cuenta @alcanceisleno aparece en contacto, en el pie de todas las páginas y en los datos para Google', () => {
    const url = `https://www.instagram.com/${site.instagram}/`;
    assert.equal(site.instagram, 'alcanceisleno');
    assert.match(between(index, 'id="contacto"'), new RegExp(`Instagram: <a href="${escapeRe(url)}" rel="me noopener" target="_blank">@alcanceisleno</a>`));
    for (const file of ['index.html', 'privacidad.html', 'cookies.html', '404.html']) {
      assert.match(between(read(file), '<footer'), new RegExp(`href="${escapeRe(url)}"`), file);
    }
    const ld = JSON.parse(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(index)[1]);
    assert.ok(ld['@graph'][0].sameAs.includes(url));
  });
});


describe('plantilla y skills de diseño', () => {
  test('el plugin de diseño está conectado por referencia al marketplace público de GitHub', () => {
    const settings = JSON.parse(readFileSync(new URL('../.claude/settings.json', import.meta.url), 'utf8'));
    assert.equal(settings.extraKnownMarketplaces['knowledge-work-plugins'].source.repo, 'anthropics/knowledge-work-plugins');
    assert.equal(settings.enabledPlugins['design@knowledge-work-plugins'], true);
  });

  test('la guía de plantilla existe y está enlazada desde el README', () => {
    const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
    assert.match(readme, /docs\/PLANTILLA\.md/);
    assert.ok(existsSync(new URL('../docs/PLANTILLA.md', import.meta.url)));
  });
});

describe('conversión a WhatsApp', () => {
  test('llamada final tras "Así trabajamos" con WhatsApp ya escrito', () => {
    const cierre = between(index, 'id="empezar"', 'id="precios"');
    assert.ok(index.indexOf('id="como"') < index.indexOf('id="empezar"') && index.indexOf('id="empezar"') < index.indexOf('id="precios"'));
    assert.match(cierre, new RegExp(`<h2 id="cierre-titulo">${escapeRe(site.closing.title)}</h2>`));
    assert.match(cierre, /wa\.me\/34623243294\?text=Hola%2C%20me%20gustar%C3%ADa%20pedir%20el%20diagn%C3%B3stico%20gratuito/);
  });

  test('botón fijo de WhatsApp para móvil, accesible y sin tapar el pie', () => {
    assert.match(index, /<a class="wa-flotante" href="https:\/\/wa\.me\/34623243294\?text=[^"]+" rel="noopener" target="_blank"><svg[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/svg><span>Escribir por WhatsApp<\/span><\/a>/);
    const css = read('assets/css/site.css');
    assert.match(css, /\.wa-flotante \{ display: none; \}/, 'oculto en escritorio');
    assert.match(css, /safe-area-inset-bottom/);
    assert.match(css, /min-height: 48px/);
    assert.equal(read('privacidad.html').includes('wa-flotante'), false, 'solo en la portada');
  });

  test('galería de trabajos: marcos uniformes, imagen real con alternativa jpg, texto alternativo y descripción detallada', () => {
    const galeria = between(index, 'id="trabajos"', 'id="como"');
    assert.match(index, /href="#trabajos"/);
    assert.equal(site.works.items.length, 4);
    assert.equal((galeria.match(/<div class="trabajo-marco">/g) || []).length, site.works.items.length, 'todas en el mismo marco');
    for (const item of site.works.items) {
      assert.ok(item.alt.length > 30, `texto alternativo descriptivo: ${item.img}`);
      assert.ok(item.description.length > 120, `descripción detallada: ${item.img}`);
      assert.ok(['contain', 'cover'].includes(item.fit), item.img);
      assert.match(galeria, new RegExp(`<source type="image/webp" srcset="[^"]*${escapeRe(item.img)}\\.webp">`));
      assert.match(galeria, new RegExp(`<img class="trabajo-(entera|cubre)" src="[^"]*${escapeRe(item.img)}\\.jpg" alt="[^"]+" loading="lazy" decoding="async" width="${item.width}" height="${item.height}">`));
      assert.match(galeria, new RegExp(`<strong>${escapeRe(item.title)}</strong>\\s*<span>${escapeRe(item.description)}</span>`));
      for (const ext of ['webp', 'jpg']) assert.ok(existsSync(join(outDir, 'assets', `${item.img}.${ext}`)), `${item.img}.${ext}`);
      const jpg = readFileSync(join(outDir, 'assets', `${item.img}.jpg`));
      let o = 2; // SOF0/SOF2: alto y ancho reales del JPEG
      while (o < jpg.length) {
        const marker = jpg[o + 1];
        if (marker >= 0xC0 && marker <= 0xC3) { assert.deepEqual([jpg.readUInt16BE(o + 7), jpg.readUInt16BE(o + 5)], [item.width, item.height], item.img); break; }
        o += 2 + jpg.readUInt16BE(o + 2);
      }
    }
    const css = read('assets/css/site.css');
    assert.match(css, /\.trabajo-marco \{ aspect-ratio: 3 \/ 2;/, 'marco 3:2 para todas');
    assert.doesNotMatch(css, /trabajo-compacto/);
  });
});

describe('recorrido animado', () => {
  test('cada paso lleva su icono propio (Google, página web y tarjeta NFC), decorativo y sin logotipos', () => {
    const recorrido = between(index, 'class="recorrido"', 'id="por-que"');
    assert.deepEqual(site.journey.steps.map((s) => s.icon), ['google', 'web', 'nfc']);
    const iconos = recorrido.match(/<div class="paso-icono">[\s\S]*?<\/svg><\/div>/g) || [];
    assert.equal(iconos.length, 3);
    for (const icono of iconos) {
      assert.match(icono, /<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">/);
      assert.doesNotMatch(icono, /<img|<text|logo/i, 'dibujos propios, sin logotipos ni texto');
    }
    assert.match(iconos[0], /ic-caida/);
    assert.match(iconos[1], /ic-linea/);
    assert.match(iconos[2], /ic-onda/);
    assert.ok((iconos[0].match(/pathLength="1"/g) || []).length >= 1);
  });

  test('movimiento: solo con prefers-reduced-motion: no-preference, sin transition: all y con curva fuerte', () => {
    const css = read('assets/css/site.css');
    const bloque = css.slice(css.indexOf('/* ---------- Recorrido animado'));
    assert.match(bloque, /@media \(prefers-reduced-motion: no-preference\)/);
    assert.match(bloque, /\.anim-listo \.recorrido:not\(\.en-vista\)/, 'el estado oculto solo existe si el script lo activa');
    assert.doesNotMatch(bloque, /transition: all|ease-in[^-]|scale\(0\)/);
    assert.match(bloque, /var\(--ease-out\)/);
    // Duraciones: 450 ms los trazos, 700 ms las ondas; ninguna pasa de 700 ms en cada animación (explicativa, una sola vez).
    for (const [, ms] of bloque.matchAll(/animation: ic-[a-z]+ (\d+)ms/g)) assert.ok(Number(ms) <= 700, `${ms} ms`);
  });

  test('script: IntersectionObserver una sola vez y sin animar con movimiento reducido', () => {
    const js = read('assets/js/site.js');
    assert.match(js, /new IntersectionObserver/);
    assert.match(js, /prefers-reduced-motion: reduce/);
    assert.match(js, /observer\.disconnect\(\)/);
    assert.match(js, /classList\.add\('en-vista'\)/);
  });
});
