import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';

import { buildStatic } from '../scripts/build-static.js';

const outDir = mkdtempSync(join(tmpdir(), 'alcance-static-'));
// Fila de la carta de precios: concepto, puntos guía e importe.
const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const priceRow = (label, price) => new RegExp(`<span>${escapeRe(label)}</span><span class="guia" aria-hidden="true"></span><span class="importe">${escapeRe(price)}</span>`);
after(() => rmSync(outDir, { recursive: true, force: true }));

test('genera la web estática con rutas relativas y el contacto de site.js', () => {
  buildStatic({ outDir, publicBaseUrl: 'https://ejemplo.github.io/alcance-isleno/' });

  for (const file of ['index.html', 'privacidad.html', 'cookies.html', '404.html',
    'robots.txt', 'sitemap.xml', '_headers', '.nojekyll', 'assets/css/site.css', 'assets/js/site.js',
    'assets/fonts/familjen-grotesk.woff2', 'assets/img/terrazo.svg', 'assets/img/favicon.svg']) {
    assert.ok(existsSync(join(outDir, file)), file);
  }
  assert.ok(!existsSync(join(outDir, 'assets/admin')), 'el panel no se publica');

  const index = readFileSync(join(outDir, 'index.html'), 'utf8');
  assert.match(index, /wa\.me\/34623243294/);
  assert.match(index, /\+34 623 24 32 94/);
  assert.match(index, /100 €/);
  // Servicios digitales primero; los complementos físicos van después, con la maqueta.
  assert.match(index, /Landing page con carta digital/);
  assert.match(index, /id="local"/);
  assert.ok(index.indexOf('id="servicios"') < index.indexOf('id="local"'));
  assert.match(index, /assets\/img\/productos\/expositor-mesa-800\.webp/);
  assert.ok(existsSync(join(outDir, 'assets/img/productos/expositor-mesa-800.webp')));
  assert.match(index, /<figcaption>Imagen de muestra<\/figcaption>/);
  assert.doesNotMatch(index, /producto estrella/i);
  assert.match(index, /Impreso en 3D en Tenerife/);
  const precios = index.slice(index.indexOf('id="precios"'));
  assert.ok(precios.indexOf('Servicios digitales') < precios.indexOf('Para tu local'));
  assert.match(precios, priceRow('Creación u optimización de la ficha de Google Business', '100 €'));
  assert.match(precios, priceRow('Expositor de mesa personalizado', '10 € / unidad'));
  assert.match(precios, priceRow('Pegatinas QR para mesa', '50 € / 10 uds.'));
  // Portada: la mesa con la carta de demostración (pestañas accesibles) y el recorrido del cliente.
  assert.match(index, /role="tablist"/);
  assert.match(index, /id="carta-panel-1"[^>]*hidden/);
  assert.match(index, /Bar\/Restaurante Isleño/);
  assert.doesNotMatch(index, /Marisol/);
  // Packs por tipo de negocio: selector de dos pestañas justo después de la portada.
  const packs = index.slice(index.indexOf('id="packs"'), index.indexOf('class="recorrido"'));
  assert.ok(index.indexOf('id="packs"') < index.indexOf('id="servicios"'), 'va justo después de la portada');
  assert.match(index, /href="#packs">Packs</);
  assert.match(packs, /<h2>¿Qué tipo de negocio tienes\?<\/h2>/);
  assert.match(packs, /role="tab" id="tab-hosteleria" aria-controls="hosteleria" aria-selected="true">Bares, restaurantes y cafeterías</);
  assert.match(packs, /role="tab" id="tab-cita-previa" aria-controls="cita-previa" aria-selected="false" tabindex="-1">Negocios con cita previa</);
  assert.doesNotMatch(packs, /Barberías y salones de belleza|belleza"/, 'la categoría ahora es "Negocios con cita previa"');
  const hosteleria = packs.slice(packs.indexOf('id="hosteleria"'), packs.indexOf('id="cita-previa"'));
  const citaPrevia = packs.slice(packs.indexOf('id="cita-previa"'));
  assert.match(hosteleria, /Placa de reseñas QR \+ NFC<\/h4>[\s\S]*?De regalo/);
  assert.match(hosteleria, /class="pack-total">[\s\S]*?<s>415 €<\/s> 390 €/);
  assert.match(hosteleria, /href="#local">Expositores de mesa y pegatinas QR/);
  assert.doesNotMatch(hosteleria, /pack-hosting/, 'el pack de hostelería incluye el hosting del primer año');
  assert.match(citaPrevia, /Landing page con tus servicios<\/h4>[\s\S]*?Incluido/);
  assert.match(citaPrevia, /Tarjeta NFC de reseñas<\/h4>[\s\S]*?Incluido/);
  assert.match(citaPrevia, /Web \+ tarjeta NFC de reseñas<\/h4>\s*<span class="local-precio">225 €/);
  assert.match(citaPrevia, /class="pack-hosting">[\s\S]*?Hosting y dominio \(12 meses\)[\s\S]*?se paga aparte[\s\S]*?90 € \/ año/);
  assert.match(citaPrevia, /Opcional: Tarjetas de visita personalizadas[\s\S]*?50 € \/ 100 uds\./);
  assert.match(citaPrevia, /wa\.me\/34623243294\?text=Hola%2C%20tengo%20un%20negocio%20con%20cita%20previa/);
  assert.match(precios, priceRow('Pack negocios con cita previa (web + tarjeta NFC de reseñas; hosting aparte)', '225 €'));
  assert.match(precios, priceRow('Tarjetas de visita personalizadas (opcional)', '50 € / 100 uds.'));
  // El QR del expositor es real y, además, un enlace (en el móvil no se puede escanear la propia pantalla).
  assert.match(index, /<a class="expositor" href="https:\/\/wa\.me\/34623243294\?text=Hola%2C%20quiero%20mi%20escaparate%20digital"/);
  assert.match(index, /<svg class="qr" viewBox="-1 -1 39 39"/);
  assert.match(index, /Así llega un cliente a tu negocio/);
  // Portada con el eslogan y contenido de la propuesta.
  assert.match(index, /<h1>Tu escaparate digital<\/h1>/);
  assert.match(index, /<p class="lead">Presencia digital para negocios locales de Tenerife\. Tu ficha de Google, tus reseñas y tu web, conectadas entre sí\. Sin tecnicismos/);
  assert.doesNotMatch(index, /mesa digital/i);
  assert.match(index, /Pide tu diagnóstico gratuito/);
  assert.match(index, /id="por-que"/);
  assert.match(index, /Todo conectado, no piezas sueltas/);
  assert.doesNotMatch(index, /10 días|dos semanas/, 'no se publica ningún plazo de entrega');
  assert.match(precios, priceRow('Hosting y dominio (12 meses)', '90 € / año'));
  assert.match(precios, priceRow('Cambio puntual de contenido (precios, horarios, fotos, un plato…)', '15 € / cambio'));
  assert.match(precios, priceRow('Actualización completa de la carta', '40 €'));
  assert.match(precios, /class="pack"[\s\S]*<s>415 €<\/s> <strong>390 €<\/strong>/);
  assert.match(precios, priceRow('Placa de reseñas QR + NFC', '25 €'));
  assert.doesNotMatch(precios, /Tarjeta NFC/, 'en la lista de precios se llama "Placa de reseñas QR + NFC"');
  assert.doesNotMatch(index, /300 €/);
  assert.match(precios, /Precios sin IGIC/);
  // Sin datos del titular no se publica el aviso legal ni su enlace.
  assert.ok(!existsSync(join(outDir, 'aviso-legal.html')));
  assert.doesNotMatch(index, /Aviso legal/);
  assert.doesNotMatch(readFileSync(join(outDir, 'privacidad.html'), 'utf8'), /\[|NIF\/CIF/);
  assert.match(index, /data-mode="whatsapp"/);
  assert.doesNotMatch(index, /name="consent"/, 'la versión estática no guarda datos');
  assert.match(index, /<link rel="canonical" href="https:\/\/ejemplo\.github\.io\/alcance-isleno\/">/);
  assert.match(index, /href="privacidad\.html"/);
  // Nada de rutas absolutas ni recursos de terceros: la web debe funcionar en una subcarpeta.
  assert.doesNotMatch(index, /(href|src)="\/(?!\/)/);
  assert.doesNotMatch(index, /fonts\.googleapis|fonts\.gstatic/);

  const privacy = readFileSync(join(outDir, 'privacidad.html'), 'utf8');
  assert.match(privacy, /no guarda ningún dato/);
  assert.doesNotMatch(privacy, /Tarjetas NFC/);

  assert.match(readFileSync(join(outDir, 'sitemap.xml'), 'utf8'), /https:\/\/ejemplo\.github\.io\/alcance-isleno\/privacidad\.html/);
});
