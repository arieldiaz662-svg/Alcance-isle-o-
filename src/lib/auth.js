import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;

export const SESSION_COOKIE = 'ai_session';

// Formato: scrypt$N$r$p$salt$hash (base64url). Guardar los parámetros permite endurecerlos en el futuro.
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH, PARAMS);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64url'), hash.toString('base64url')].join('$');
}

export async function verifyPassword(password, stored) {
  const [algorithm, N, r, p, salt, hash] = String(stored).split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = await scryptAsync(password, Buffer.from(salt, 'base64url'), expected.length, {
    N: Number(N), r: Number(r), p: Number(p),
  });
  return timingSafeEqual(expected, actual);
}

// Hash con el que se compara cuando el email no existe, para no revelar por tiempos qué emails hay.
export const DUMMY_HASH = await hashPassword(randomBytes(16).toString('hex'));

export function newSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
