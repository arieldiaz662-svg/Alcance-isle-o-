-- Esquema inicial de Alcance Isleño.
-- Todas las fechas se guardan como texto ISO-8601 en UTC (formato de Date.toISOString()).

CREATE TABLE users (
  id            INTEGER PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Solo se guarda el hash SHA-256 del token; el token en claro vive únicamente en la cookie.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Clientes: negocios que ya han contratado algún servicio.
CREATE TABLE clients (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  business_type TEXT,
  contact_name  TEXT,
  phone         TEXT,
  email         TEXT,
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Leads: solicitudes que llegan desde el formulario de la web.
CREATE TABLE leads (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  business_type TEXT,
  service       TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'proposal', 'won', 'lost')),
  notes         TEXT,
  client_id     INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  consent_at    TEXT NOT NULL,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_status_created ON leads(status, created_at DESC);

-- Tarjetas NFC: cada tarjeta apunta a /r/<slug>, que redirige a la URL de reseñas del cliente.
-- Así se puede cambiar el destino sin reprogramar la tarjeta y medir cuántas veces se usa.
CREATE TABLE nfc_cards (
  id         INTEGER PRIMARY KEY,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  slug       TEXT NOT NULL UNIQUE,
  label      TEXT,
  target_url TEXT NOT NULL,
  active     INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_cards_client ON nfc_cards(client_id);

-- Usos de cada tarjeta. No se guarda la IP (minimización de datos, RGPD).
CREATE TABLE nfc_taps (
  id         INTEGER PRIMARY KEY,
  card_id    INTEGER NOT NULL REFERENCES nfc_cards(id) ON DELETE CASCADE,
  tapped_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  user_agent TEXT
);
CREATE INDEX idx_taps_card_time ON nfc_taps(card_id, tapped_at);
