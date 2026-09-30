import { messagePage } from '../views/html.js';

// Destino de las tarjetas NFC: /r/<slug> registra el uso y redirige a la URL de reseñas del cliente.
export default async function redirectRoutes(app, { repos, site, config }) {
  app.get('/r/:slug', {
    schema: { params: { type: 'object', properties: { slug: { type: 'string', maxLength: 40 } } } },
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, (request, reply) => {
    const card = repos.cards.findBySlug(String(request.params.slug).toLowerCase());
    reply.header('cache-control', 'no-store');

    if (!card) {
      return reply.code(404).type('text/html; charset=utf-8').send(messagePage({
        site, config, title: 'Tarjeta no encontrada', heading: 'Esta tarjeta no existe',
        text: 'No hemos encontrado ninguna tarjeta con este enlace.',
      }));
    }
    if (!card.active) {
      return reply.code(410).type('text/html; charset=utf-8').send(messagePage({
        site, config, title: 'Tarjeta desactivada', heading: 'Esta tarjeta ya no está activa',
        text: 'Gracias por tu interés. Esta tarjeta de reseñas ha sido desactivada.',
      }));
    }

    const userAgent = (request.headers['user-agent'] || '').slice(0, 200) || null;
    try {
      repos.cards.recordTap(card.id, userAgent);
    } catch (err) {
      // Un fallo al registrar estadísticas nunca debe impedir que el cliente deje su reseña.
      request.log.error({ err, cardId: card.id }, 'No se pudo registrar el uso de la tarjeta');
    }
    return reply.redirect(card.target_url, 302);
  });
}
