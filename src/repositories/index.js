// Capa de acceso a datos. Todo el SQL vive aquí: si en el futuro se migra a PostgreSQL,
// solo cambia este módulo; las rutas no conocen la base de datos.

const now = () => new Date().toISOString();

// Construye "SET a = @a, b = @b" solo con los campos permitidos presentes en el patch.
function buildUpdate(patch, allowed) {
  const fields = allowed.filter((key) => Object.hasOwn(patch, key));
  if (!fields.length) return null;
  const params = { updated_at: now() };
  for (const key of fields) params[key] = patch[key];
  const set = [...fields, 'updated_at'].map((key) => `${key} = @${key}`).join(', ');
  return { set, params };
}

export function createRepositories(db) {
  const users = {
    findByEmail: (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(email),
    findById: (id) => db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(id),
    upsert(email, passwordHash) {
      db.prepare(`INSERT INTO users (email, password_hash) VALUES (?, ?)
                  ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash`)
        .run(email, passwordHash);
      return users.findByEmail(email);
    },
  };

  const sessions = {
    create: (tokenHash, userId, expiresAt) =>
      db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
        .run(tokenHash, userId, expiresAt),
    findValid: (tokenHash) =>
      db.prepare(`SELECT s.user_id, u.email FROM sessions s JOIN users u ON u.id = s.user_id
                  WHERE s.token_hash = ? AND s.expires_at > ?`).get(tokenHash, now()),
    delete: (tokenHash) => db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash),
    deleteExpired: () => db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now()),
  };

  const leads = {
    create(lead) {
      const info = db.prepare(`INSERT INTO leads
          (name, phone, email, business_type, service, message, consent_at, utm_source, utm_medium, utm_campaign)
        VALUES
          (@name, @phone, @email, @business_type, @service, @message, @consent_at, @utm_source, @utm_medium, @utm_campaign)`)
        .run({
          email: null, business_type: null, service: null, message: null,
          utm_source: null, utm_medium: null, utm_campaign: null,
          ...lead,
          consent_at: now(),
        });
      return leads.findById(info.lastInsertRowid);
    },
    findById: (id) => db.prepare('SELECT * FROM leads WHERE id = ?').get(id),
    list({ status, q, limit = 50, offset = 0 } = {}) {
      const where = [];
      const params = { limit, offset };
      if (status) { where.push('status = @status'); params.status = status; }
      if (q) {
        where.push('(name LIKE @q OR phone LIKE @q OR email LIKE @q OR business_type LIKE @q)');
        params.q = `%${q}%`;
      }
      const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const items = db.prepare(`SELECT * FROM leads ${clause} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`).all(params);
      const { total } = db.prepare(`SELECT COUNT(*) AS total FROM leads ${clause}`).get(params);
      return { items, total };
    },
    update(id, patch) {
      const update = buildUpdate(patch, ['status', 'notes', 'client_id']);
      if (update) db.prepare(`UPDATE leads SET ${update.set} WHERE id = @id`).run({ ...update.params, id });
      return leads.findById(id);
    },
    countByStatus: () => db.prepare('SELECT status, COUNT(*) AS count FROM leads GROUP BY status').all(),
    countSince: (since) => db.prepare('SELECT COUNT(*) FROM leads WHERE created_at >= ?').pluck().get(since),
  };

  const clients = {
    create(client) {
      const info = db.prepare(`INSERT INTO clients (name, business_type, contact_name, phone, email, notes)
                               VALUES (@name, @business_type, @contact_name, @phone, @email, @notes)`)
        .run({ business_type: null, contact_name: null, phone: null, email: null, notes: null, ...client });
      return clients.findById(info.lastInsertRowid);
    },
    findById: (id) => db.prepare('SELECT * FROM clients WHERE id = ?').get(id),
    list: () => db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM nfc_cards WHERE client_id = c.id) AS card_count
                            FROM clients c ORDER BY c.name COLLATE NOCASE`).all(),
    update(id, patch) {
      const update = buildUpdate(patch, ['name', 'business_type', 'contact_name', 'phone', 'email', 'notes']);
      if (update) db.prepare(`UPDATE clients SET ${update.set} WHERE id = @id`).run({ ...update.params, id });
      return clients.findById(id);
    },
    // Convierte un lead en cliente y lo marca como ganado, todo en una transacción.
    createFromLead: db.transaction((lead) => {
      const client = clients.create({
        name: lead.business_type ? `${lead.name} (${lead.business_type})` : lead.name,
        business_type: lead.business_type,
        contact_name: lead.name,
        phone: lead.phone,
        email: lead.email,
      });
      leads.update(lead.id, { client_id: client.id, status: 'won' });
      return client;
    }),
  };

  const cardSelect = `SELECT k.*, c.name AS client_name,
      (SELECT COUNT(*) FROM nfc_taps t WHERE t.card_id = k.id) AS tap_count,
      (SELECT COUNT(*) FROM nfc_taps t WHERE t.card_id = k.id AND t.tapped_at >= @since) AS taps_30d
    FROM nfc_cards k JOIN clients c ON c.id = k.client_id`;
  const since30d = () => new Date(Date.now() - 30 * 86400_000).toISOString();

  const cards = {
    create(card) {
      const info = db.prepare(`INSERT INTO nfc_cards (client_id, slug, label, target_url)
                               VALUES (@client_id, @slug, @label, @target_url)`)
        .run({ label: null, ...card });
      return cards.findById(info.lastInsertRowid);
    },
    findById: (id) => db.prepare(`${cardSelect} WHERE k.id = @id`).get({ id, since: since30d() }),
    findBySlug: (slug) => db.prepare('SELECT * FROM nfc_cards WHERE slug = ?').get(slug),
    slugExists: (slug) => Boolean(db.prepare('SELECT 1 FROM nfc_cards WHERE slug = ?').get(slug)),
    list: ({ clientId } = {}) => db.prepare(
      `${cardSelect} ${clientId ? 'WHERE k.client_id = @clientId' : ''} ORDER BY k.created_at DESC`,
    ).all({ since: since30d(), ...(clientId ? { clientId } : {}) }),
    update(id, patch) {
      const values = { ...patch };
      if (Object.hasOwn(values, 'active')) values.active = values.active ? 1 : 0;
      const update = buildUpdate(values, ['label', 'target_url', 'active']);
      if (update) db.prepare(`UPDATE nfc_cards SET ${update.set} WHERE id = @id`).run({ ...update.params, id });
      return cards.findById(id);
    },
    recordTap: (cardId, userAgent) =>
      db.prepare('INSERT INTO nfc_taps (card_id, user_agent) VALUES (?, ?)').run(cardId, userAgent),
    tapsByDay: (cardId, since) => db.prepare(`SELECT substr(tapped_at, 1, 10) AS day, COUNT(*) AS count
        FROM nfc_taps WHERE card_id = ? AND tapped_at >= ? GROUP BY day ORDER BY day`).all(cardId, since),
    tapsSince: (since) => db.prepare('SELECT COUNT(*) FROM nfc_taps WHERE tapped_at >= ?').pluck().get(since),
  };

  return { users, sessions, leads, clients, cards };
}
