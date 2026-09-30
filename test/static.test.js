import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';

import { buildStatic } from '../scripts/build-static.js';

const outDir = mkdtempSync(join(tmpdir(), 'alcance-static-'));
after(() => rmSync(outDir, { recursive: true, force: true }));

test('genera la web estática con rutas relativas y el contacto de site.js', () => {
  buildStatic({ outDir, publicBaseUrl: 'https://ejemplo.github.io/alcance-isleno/' });

  for (const file of ['index.html', 'privacidad.html', 'cookies.html', '404.html',
    'robots.txt', 'sitemap.xml', '_headers', '.nojekyll', 'assets/css/site.css', 'assets/js/site.js',
    'assets/fonts/figtree.woff2', 'assets/fonts/bricolage-grotesque.woff2', 'assets/img/favicon.svg']) {
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
  assert.doesNotMatch(index, /producto estrella|hecha en Tenerife/i);
  const precios = index.slice(index.indexOf('id="precios"'));
  assert.ok(precios.indexOf('Servicios digitales') < precios.indexOf('Para tu local'));
  assert.match(precios, /Creación u optimización de la ficha de Google Business<\/span><span class="importe">100 €/);
  assert.match(precios, /Expositor de mesa personalizado<\/span><span class="importe">10 € \/ unidad/);
  assert.match(precios, /Pegatinas QR para mesa<\/span><span class="importe">50 € \/ 10 uds\./);
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
