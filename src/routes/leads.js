const optionalText = (maxLength) => ({ type: 'string', maxLength });

const createLeadSchema = {
  body: {
    type: 'object',
    required: ['name', 'phone', 'consent'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 80 },
      phone: { type: 'string', minLength: 6, maxLength: 30, pattern: '^[+0-9 ()-]+$' },
      email: { anyOf: [{ type: 'string', format: 'email', maxLength: 120 }, { type: 'string', maxLength: 0 }] },
      business_type: optionalText(80),
      service: optionalText(20),
      message: optionalText(1000),
      consent: { type: 'boolean', const: true },
      website: optionalText(200), // honeypot: las personas no lo ven; los bots lo rellenan
      utm_source: optionalText(100),
      utm_medium: optionalText(100),
      utm_campaign: optionalText(100),
    },
  },
};

const clean = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || null;
};

export default async function leadRoutes(app, { repos, site, notify }) {
  const serviceIds = new Set([...site.services.map((service) => service.id), 'varios', 'no-se']);
  const serviceNames = Object.fromEntries(site.services.map((service) => [service.id, service.name]));

  app.post('/api/leads', {
    schema: createLeadSchema,
    config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
  }, async (request, reply) => {
    const body = request.body;

    // Si un bot ha rellenado el honeypot respondemos como si todo fuera bien, pero no guardamos nada.
    if (clean(body.website)) {
      request.log.info('Lead descartado por honeypot');
      return reply.code(201).send({ ok: true });
    }

    const lead = repos.leads.create({
      name: clean(body.name),
      phone: clean(body.phone),
      email: clean(body.email),
      business_type: clean(body.business_type),
      service: serviceIds.has(body.service) ? body.service : null,
      message: clean(body.message),
      utm_source: clean(body.utm_source),
      utm_medium: clean(body.utm_medium),
      utm_campaign: clean(body.utm_campaign),
    });

    request.log.info({ leadId: lead.id }, 'Nuevo lead');
    // No se espera al webhook: si falla o tarda, el usuario no lo nota.
    notify([
      `Nuevo lead #${lead.id}: ${lead.name}`,
      `Tel: ${lead.phone}${lead.email ? ` · ${lead.email}` : ''}`,
      lead.business_type && `Negocio: ${lead.business_type}`,
      lead.service && `Interés: ${serviceNames[lead.service] || lead.service}`,
      lead.message && `Mensaje: ${lead.message}`,
    ].filter(Boolean).join('\n'));

    return reply.code(201).send({ ok: true });
  });
}
