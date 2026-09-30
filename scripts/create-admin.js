// Crea un usuario del panel o cambia su contraseña si ya existe.
// Uso: npm run create-admin -- email@dominio.es
// La contraseña se pide por consola (o se lee de ADMIN_PASSWORD, útil en despliegues).
import { createInterface } from 'node:readline/promises';
import { loadConfig } from '../src/config.js';
import { openDatabase } from '../src/db/index.js';
import { hashPassword } from '../src/lib/auth.js';
import { createRepositories } from '../src/repositories/index.js';

const email = process.argv[2];
if (!email || !email.includes('@')) {
  console.error('Uso: npm run create-admin -- email@dominio.es');
  process.exit(1);
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question('Contraseña (mínimo 12 caracteres): ');
  rl.close();
}
if (!password || password.length < 12) {
  console.error('La contraseña debe tener al menos 12 caracteres.');
  process.exit(1);
}

const config = loadConfig({ ...process.env, NODE_ENV: 'development' });
const db = openDatabase(config.databasePath);
const user = createRepositories(db).users.upsert(email.trim(), await hashPassword(password));
db.close();
console.log(`Usuario listo: ${user.email} (id ${user.id})`);
