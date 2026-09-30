import { renderLanding } from '../views/landing.js';
import { renderCookies, renderLegalNotice, renderPrivacy } from '../views/legal.js';

export default async function publicRoutes(app, { site, config, db }) {
  // Las páginas se generan una vez al arrancar: el contenido solo cambia con un despliegue.
  const pages = {
    '/': renderLanding({ site, config }),
    '/aviso-legal': renderLegalNotice({ site, config }),
    '/privacidad': renderPrivacy({ site, config }),
    '/cookies': renderCookies({ site, config }),
  };

  for (const [path, html] of Object.entries(pages)) {
    app.get(path, (request, reply) => {
      reply
        .header('cache-control', 'public, max-age=300')
        .type('text/html; charset=utf-8')
        .send(html);
    });
  }

  app.get('/robots.txt', (request, reply) => {
    reply.type('text/plain').send(
      `User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /r/\nSitemap: ${config.publicBaseUrl}/sitemap.xml\n`,
    );
  });

  app.get('/sitemap.xml', (request, reply) => {
    const urls = Object.keys(pages)
      .map((path) => `  <url><loc>${config.publicBaseUrl}${path === '/' ? '/' : path}</loc></url>`)
      .join('\n');
    reply.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    );
  });

  app.get('/healthz', (request, reply) => {
    db.prepare('SELECT 1').get();
    reply.header('cache-control', 'no-store').send({ status: 'ok' });
  });
}
