// Aviso opcional de nuevos leads a un webhook (Slack, Discord, Make, n8n, Zapier...).
// Se envían "text" y "content" para que funcione tal cual con Slack y con Discord.
export function createNotifier({ webhookUrl, log }) {
  return async function notify(text) {
    if (!webhookUrl) return;
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, content: text }),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) log.warn({ status: response.status }, 'El webhook de avisos respondió con error');
    } catch (err) {
      log.warn({ err }, 'No se pudo enviar el aviso al webhook');
    }
  };
}
