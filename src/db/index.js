import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });

  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');

  migrate(db);
  return db;
}

// Aplica en orden los ficheros NNN_nombre.sql que aún no estén registrados.
export function migrate(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`);

  const applied = new Set(db.prepare('SELECT name FROM schema_migrations').pluck().all());
  const pending = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql') && !applied.has(file))
    .sort();

  const record = db.prepare('INSERT INTO schema_migrations (name) VALUES (?)');
  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      record.run(file);
    })();
  }
}
