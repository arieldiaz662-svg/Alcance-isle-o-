import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';

import { site as defaultSite } from './content/site.js';
import { createNotifier } from './lib/notify.js';
import { createRepositories } from './repositories/index.js';
import adminRoutes from './routes/admin.js';
import authRoutes, { createRequireAuth } from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import publicRoutes from './routes/public.js';
import redirectRoutes from './routes/redirect.js';
import { messagePage } from './views/html.js';

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

export async function buildApp({ config, db, site = defaultSite, logger = true }) {
  const app = Fastify({
    logger: logger && {
      level: config.logLevel,
      redact: ['req.headers.cookie', 'res.headers["set-cookie"]'],
    },
    trustProxy: config.trustProxy,
    bodyLimit: 32 * 1024,
  });

  const repos = createRepositories(db);
  const requireAuth = createRequireAuth(repos);
  const notify = createNotifier({ webhookUrl: config.notifyWebhookUrl, log: app.log });
  const deps = { config, db, repos, site, notify, requireAuth };

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: config.isProduction ? [] : null,
      },
    },
    strictTransportSecurity: config.isProduction,
  });
  await app.register(cookie);
  await app.register(rateLimit, { global: false });

  await app.register(fastifyStatic, {
    root: PUBLIC_DIR,
    prefix: '/assets/',
    maxAge: config.isProduction ? '1d' : 0,
  });

  // Panel de administración: una SPA estática; los datos llegan por /api/admin/*.
  app.get('/admin', (request, reply) => {
    reply.header('cache-control', 'no-store').sendFile('admin/index.html');
  });

  await app.register(publicRoutes, deps);
  await app.register(leadRoutes, deps);
  await app.register(redirectRoutes, deps);
  await app.register(authRoutes, deps);
  await app.register(adminRoutes, { ...deps, prefix: '/api/admin' });

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/')) return reply.code(404).send({ error: 'No encontrado' });
    return reply.code(404).type('text/html; charset=utf-8').send(messagePage({
      site, config, title: 'Página no encontrada', heading: 'Esta página no existe',
      text: 'Puede que el enlace esté mal escrito o que la página se haya movido.',
    }));
  });

  app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      return reply.code(400).send({ error: 'Datos no válidos', details: error.validation.map((v) => v.message) });
    }
    const status = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
    if (status >= 500) request.log.error({ err: error }, 'Error no controlado');
    return reply.code(status).send({ error: status >= 500 ? 'Error interno' : error.message });
  });

  return app;
}
