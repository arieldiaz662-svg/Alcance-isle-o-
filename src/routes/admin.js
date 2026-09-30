import { randomInt } from 'node:crypto';

const LEAD_STATUSES = ['new', 'contacted', 'proposal', 'won', 'lost'];
const SLUG_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // sin 0/o, 1/l/i para evitar confusiones

const idParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'integer', minimum: 1 } },
};
const text = (maxLength) => ({ type: ['string', 'null'], maxLength });
const httpsUrl = { type: 'string', maxLength: 500, pattern: '^https://[^\\s]+$' };

const clientFields = {
  name: { type: 'string', minLength: 1, maxLength: 120 },
  business_type: text(80),
  contact_name: text(80),
  phone: text(30),
  email: text(120),
  notes: text(2000),
};

function randomSlug(length = 7) {
  let slug = '';
  for (let i = 0; i < length; i += 1) slug += SLUG_ALPHABET[randomInt(SLUG_ALPHABET.length)];
  return slug;
}

// Todas las rutas de este plugin exigen sesión (hook preHandler) y viven bajo /api/admin.
export default async function adminRoutes(app, { repos, requireAuth }) {
  app.addHook('preHandler', requireAuth);

  const notFound = (reply, what) => reply.code(404).send({ error: `${what} no encontrado` });

  // ---------- Resumen ----------
  app.get('/stats', async () => {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const byStatus = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0]));
    for (const row of repos.leads.countByStatus()) byStatus[row.status] = row.count;
    return {
      leadsByStatus: byStatus,
      leadsLast30d: repos.leads.countSince(since),
      tapsLast30d: repos.cards.tapsSince(since),
    };
  });

  // ---------- Leads ----------
  app.get('/leads', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: LEAD_STATUSES },
          q: { type: 'string', maxLength: 100 },
          limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
    },
  }, async (request) => repos.leads.list(request.query));

  app.patch('/leads/:id', {
    schema: {
      params: idParams,
      body: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: { status: { type: 'string', enum: LEAD_STATUSES }, notes: text(2000) },
      },
    },
  }, async (request, reply) => {
    if (!repos.leads.findById(request.params.id)) return notFound(reply, 'Lead');
    return repos.leads.update(request.params.id, request.body);
  });

  app.post('/leads/:id/convert', { schema: { params: idParams } }, async (request, reply) => {
    const lead = repos.leads.findById(request.params.id);
    if (!lead) return notFound(reply, 'Lead');
    if (lead.client_id) return reply.code(409).send({ error: 'Este lead ya es cliente', clientId: lead.client_id });
    const client = repos.clients.createFromLead(lead);
    return reply.code(201).send(client);
  });

  // ---------- Clientes ----------
  app.get('/clients', async () => ({ items: repos.clients.list() }));

  app.post('/clients', {
    schema: {
      body: { type: 'object', required: ['name'], additionalProperties: false, properties: clientFields },
    },
  }, async (request, reply) => reply.code(201).send(repos.clients.create(request.body)));

  app.patch('/clients/:id', {
    schema: {
      params: idParams,
      body: { type: 'object', minProperties: 1, additionalProperties: false, properties: clientFields },
    },
  }, async (request, reply) => {
    if (!repos.clients.findById(request.params.id)) return notFound(reply, 'Cliente');
    return repos.clients.update(request.params.id, request.body);
  });

  // ---------- Tarjetas NFC ----------
  app.get('/cards', {
    schema: {
      querystring: { type: 'object', properties: { client_id: { type: 'integer', minimum: 1 } } },
    },
  }, async (request) => ({ items: repos.cards.list({ clientId: request.query.client_id }) }));

  app.post('/cards', {
    schema: {
      body: {
        type: 'object',
        required: ['client_id', 'target_url'],
        additionalProperties: false,
        properties: {
          client_id: { type: 'integer', minimum: 1 },
          target_url: httpsUrl,
          label: text(80),
          slug: { type: 'string', pattern: '^[a-z0-9-]{3,40}$' },
        },
      },
    },
  }, async (request, reply) => {
    const { client_id: clientId, slug: requestedSlug, ...rest } = request.body;
    if (!repos.clients.findById(clientId)) return notFound(reply, 'Cliente');

    let slug = requestedSlug;
    if (slug && repos.cards.slugExists(slug)) {
      return reply.code(409).send({ error: 'Ese enlace ya está en uso' });
    }
    while (!slug || repos.cards.slugExists(slug)) slug = randomSlug();

    return reply.code(201).send(repos.cards.create({ ...rest, client_id: clientId, slug }));
  });

  app.patch('/cards/:id', {
    schema: {
      params: idParams,
      body: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: { target_url: httpsUrl, label: text(80), active: { type: 'boolean' } },
      },
    },
  }, async (request, reply) => {
    if (!repos.cards.findById(request.params.id)) return notFound(reply, 'Tarjeta');
    return repos.cards.update(request.params.id, request.body);
  });

  app.get('/cards/:id/taps', {
    schema: {
      params: idParams,
      querystring: {
        type: 'object',
        properties: { days: { type: 'integer', minimum: 1, maximum: 365, default: 30 } },
      },
    },
  }, async (request, reply) => {
    if (!repos.cards.findById(request.params.id)) return notFound(reply, 'Tarjeta');
    const since = new Date(Date.now() - request.query.days * 86400_000).toISOString();
    return { items: repos.cards.tapsByDay(request.params.id, since) };
  });
}
