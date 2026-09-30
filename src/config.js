// Configuración centralizada. Todo lo que cambia entre entornos viene de variables de entorno.

function bool(value, fallback = false) {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export function loadConfig(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';

  const config = {
    isProduction,
    port: Number(env.PORT || 3000),
    host: env.HOST || '0.0.0.0',
    databasePath: env.DATABASE_PATH || './data/app.db',
    publicBaseUrl: (env.PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
    whatsappNumber: (env.WHATSAPP_NUMBER || '').replace(/\D/g, ''),
    contactEmail: env.CONTACT_EMAIL || '',
    notifyWebhookUrl: env.NOTIFY_WEBHOOK_URL || '',
    trustProxy: bool(env.TRUST_PROXY, false),
    sessionTtlDays: Number(env.SESSION_TTL_DAYS || 7),
    logLevel: env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  };

  if (isProduction) {
    const missing = [];
    if (!config.whatsappNumber) missing.push('WHATSAPP_NUMBER');
    if (!env.PUBLIC_BASE_URL) missing.push('PUBLIC_BASE_URL');
    if (missing.length) {
      throw new Error(`Faltan variables de entorno obligatorias en producción: ${missing.join(', ')}`);
    }
  }

  return config;
}
