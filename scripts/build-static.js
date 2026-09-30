// Genera la versión estática de la web en dist/ (o en la carpeta indicada).
// No necesita servidor ni base de datos: se puede subir tal cual a GitHub Pages, Netlify o Cloudflare Pages.
//
// Uso:  npm run build
//       PUBLIC_BASE_URL=https://alcance-isleno.netlify.app npm run build   (añade canonical y sitemap)
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { site } from '../src/content/site.js';
import { hasLegalNotice, messagePage } from '../src/views/html.js';
import { renderLanding } from '../src/views/landing.js';
import { renderCookies, renderLegalNotice, renderPrivacy } from '../src/views/legal.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function buildStatic({
  outDir = join(ROOT, 'dist'),
  publicBaseUrl = process.env.PUBLIC_BASE_URL || '',
  whatsappNumber = process.env.WHATSAPP_NUMBER || '',
  contactEmail = process.env.CONTACT_EMAIL || '',
} = {}) {
  const config = {
    static: true,
    publicBaseUrl: publicBaseUrl.replace(/\/+$/, ''),
    whatsappNumber: whatsappNumber.replace(/\D/g, ''),
    contactEmail,
  };

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const pages = {
    'index.html': renderLanding({ site, config }),
    ...(hasLegalNotice(site) ? { 'aviso-legal.html': renderLegalNotice({ site, config }) } : {}),
    'privacidad.html': renderPrivacy({ site, config }),
    'cookies.html': renderCookies({ site, config }),
    '404.html': messagePage({
      site, config, title: 'Página no encontrada', heading: 'Esta página no existe',
      text: 'Puede que el enlace esté mal escrito o que la página se haya movido.',
    }),
  };
  for (const [file, html] of Object.entries(pages)) writeFileSync(join(outDir, file), html);

  // Recursos públicos, sin el panel de administración (no tiene sentido sin servidor).
  for (const folder of ['css', 'js', 'img', 'fonts']) {
    cpSync(join(ROOT, 'public', folder), join(outDir, 'assets', folder), { recursive: true });
  }

  const sitemapUrls = Object.keys(pages)
    .filter((file) => file !== '404.html')
    .map((file) => (file === 'index.html' ? '' : file));
  writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n${
    config.publicBaseUrl ? `Sitemap: ${config.publicBaseUrl}/sitemap.xml\n` : ''}`);
  if (config.publicBaseUrl) {
    writeFileSync(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((path) => `  <url><loc>${config.publicBaseUrl}/${path}</loc></url>`).join('\n')}
</urlset>
`);
  }

  // Cabeceras de seguridad para Netlify y Cloudflare Pages (GitHub Pages las ignora).
  writeFileSync(join(outDir, '_headers'), `/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/assets/*
  Cache-Control: public, max-age=86400
`);
  // Evita que GitHub Pages procese la carpeta con Jekyll.
  writeFileSync(join(outDir, '.nojekyll'), '');

  return { outDir, files: Object.keys(pages) };
}

if (resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  const { outDir, files } = buildStatic({ outDir: process.argv[2] ? resolve(process.argv[2]) : undefined });
  console.log(`Web estática generada en ${outDir}: ${files.join(', ')}`);
}
