import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db/index.js';

const config = loadConfig();
const db = openDatabase(config.databasePath);
const app = await buildApp({ config, db });

async function shutdown(signal) {
  app.log.info({ signal }, 'Cerrando servidor');
  try {
    await app.close();
    db.close();
    process.exit(0);
  } catch (err) {
    app.log.error({ err }, 'Error al cerrar');
    process.exit(1);
  }
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

try {
  await app.listen({ port: config.port, host: config.host });
} catch (err) {
  app.log.error({ err }, 'No se pudo arrancar el servidor');
  db.close();
  process.exit(1);
}
