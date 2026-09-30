// Genera public/img/og.jpg (1200×630) a partir de la portada, para la vista previa al compartir el enlace.
// Uso: npm run build && npm run og-image   (necesita Playwright con Chromium instalado en el equipo)
const { execSync } = require('node:child_process');
const { join } = require('node:path');
const http = require('node:http');
const { readFileSync, existsSync } = require('node:fs');

const root = join(__dirname, '..', 'dist');
const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', svg: 'image/svg+xml', woff2: 'font/woff2', webp: 'image/webp', jpg: 'image/jpeg' };
const server = http.createServer((req, res) => {
  const file = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': types[file.split('.').pop()] || 'application/octet-stream' }).end(readFileSync(file));
});

(async () => {
  let playwright;
  try { playwright = require('playwright'); } catch { playwright = require(join(execSync('npm root -g').toString().trim(), 'playwright')); }
  await new Promise((resolve) => server.listen(4099, resolve));
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 760 }, deviceScaleFactor: 1, bypassCSP: true }); // la CSP de la web bloquearía el estilo que oculta el menú
  await page.goto('http://localhost:4099/');
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.nav{display:none}.mesa-nota,.bodegon figcaption{visibility:hidden}' });
  const box = await page.locator('.mesa').boundingBox();
  await page.screenshot({ path: join(__dirname, '..', 'public', 'img', 'og.jpg'), type: 'jpeg', quality: 82, clip: { x: 0, y: box.y + 40, width: 1200, height: 630 } });
  await browser.close();
  server.close();
  console.log('public/img/og.jpg generada');
})();
