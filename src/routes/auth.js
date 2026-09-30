import {
  DUMMY_HASH, SESSION_COOKIE, hashToken, newSessionToken, verifyPassword,
} from '../lib/auth.js';

// Devuelve un preHandler que exige una sesión válida y deja el usuario en request.user.
export function createRequireAuth(repos) {
  return async function requireAuth(request, reply) {
    const token = request.cookies[SESSION_COOKIE];
    const session = token ? repos.sessions.findValid(hashToken(token)) : null;
    if (!session) return reply.code(401).send({ error: 'No autenticado' });
    request.user = { id: session.user_id, email: session.email };
  };
}

export default async function authRoutes(app, { repos, config, requireAuth }) {
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'strict', // junto con exigir JSON en las peticiones, protege frente a CSRF
    secure: config.isProduction,
  };

  app.post('/api/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', maxLength: 120 },
          password: { type: 'string', maxLength: 200 },
        },
      },
    },
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
  }, async (request, reply) => {
    const { email, password } = request.body;
    const user = repos.users.findByEmail(email.trim());
    const valid = await verifyPassword(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !valid) return reply.code(401).send({ error: 'Email o contraseña incorrectos' });

    repos.sessions.deleteExpired();
    const token = newSessionToken();
    const maxAge = config.sessionTtlDays * 86400;
    repos.sessions.create(hashToken(token), user.id, new Date(Date.now() + maxAge * 1000).toISOString());

    reply.setCookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge });
    return { user: { id: user.id, email: user.email } };
  });

  app.post('/api/auth/logout', async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];
    if (token) repos.sessions.delete(hashToken(token));
    reply.clearCookie(SESSION_COOKIE, cookieOptions);
    return { ok: true };
  });

  app.get('/api/auth/me', { preHandler: requireAuth }, async (request) => ({ user: request.user }));
}
