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

  for (const file of ['index.html', 'aviso-legal.html', 'privacidad.html', 'cookies.html', '404.html',
    'robots.txt', 'sitemap.xml', '_headers', '.nojekyll', 'assets/css/site.css', 'assets/js/site.js',
    'assets/fonts/figtree.woff2', 'assets/fonts/bricolage-grotesque.woff2', 'assets/img/favicon.svg']) {
    assert.ok(existsSync(join(outDir, file)), file);
  }
  assert.ok(!existsSync(join(outDir, 'assets/admin')), 'el panel no se publica');

  const index = readFileSync(join(outDir, 'index.html'), 'utf8');
  assert.match(index, /wa\.me\/34623243294/);
  assert.match(index, /\+34 623 24 32 94/);
  assert.match(index, /100 €/);
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
