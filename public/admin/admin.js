// Panel interno de Alcance Isleño. Sin frameworks ni build: DOM + fetch.
// Todo el contenido se inserta con textContent (vía h()) para evitar XSS con datos de los leads.

const STATUS = {
  new: 'Nuevo', contacted: 'Contactado', proposal: 'Propuesta enviada', won: 'Ganado', lost: 'Perdido',
};
const SERVICES = {
  nfc: 'Tarjeta NFC', gbp: 'Google Business', landing: 'Landing page', varios: 'Varios', 'no-se': 'No lo sabe',
};

const $ = (selector) => document.querySelector(selector);

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else if (key === 'class') el.className = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

const formatDate = (iso) => new Date(iso).toLocaleString('es-ES', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

let noticeTimer;
function notice(message, isError = false) {
  const box = $('#aviso');
  box.textContent = message;
  box.className = isError ? 'aviso error' : 'aviso';
  box.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { box.hidden = true; }, 3500);
}

async function api(method, path, body) {
  const response = await fetch(path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  if (response.status === 401 && path !== '/api/auth/login') {
    showLogin();
    throw new Error('Sesión caducada');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
  return data;
}

// Envuelve una acción para mostrar el error sin romper la interfaz.
const safely = (fn) => async (...args) => {
  try { await fn(...args); } catch (err) { notice(err.message, true); }
};

// Convierte un formulario en objeto, omitiendo campos vacíos.
function formData(form) {
  const data = {};
  for (const [key, value] of new FormData(form)) {
    const trimmed = String(value).trim();
    if (trimmed) data[key] = trimmed;
  }
  return data;
}

// ---------------- Sesión ----------------

function showLogin() {
  $('#vista-app').hidden = true;
  $('#vista-login').hidden = false;
  $('#form-login [name=email]').focus();
}

async function showApp(user) {
  $('#usuario-email').textContent = user.email;
  $('#vista-login').hidden = true;
  $('#vista-app').hidden = false;
  await Promise.all([loadStats(), loadLeads()]);
}

$('#form-login').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorBox = $('#login-error');
  errorBox.hidden = true;
  try {
    const { user } = await api('POST', '/api/auth/login', formData(event.target));
    event.target.reset();
    await showApp(user);
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.hidden = false;
  }
});

$('#salir').addEventListener('click', safely(async () => {
  await api('POST', '/api/auth/logout');
  showLogin();
}));

// ---------------- Pestañas ----------------

const loaders = { leads: () => loadLeads(), clientes: () => loadClients(), tarjetas: () => loadCards() };

document.querySelectorAll('[data-tab]').forEach((tab) => {
  tab.addEventListener('click', safely(async () => {
    document.querySelectorAll('[data-tab]').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    document.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== tab.dataset.tab; });
    await Promise.all([loadStats(), loaders[tab.dataset.tab]()]);
  }));
});

// ---------------- Resumen ----------------

async function loadStats() {
  const stats = await api('GET', '/api/admin/stats');
  const items = [
    [stats.leadsByStatus.new, 'Leads sin atender'],
    [stats.leadsLast30d, 'Leads (30 días)'],
    [stats.leadsByStatus.won, 'Clientes ganados'],
    [stats.tapsLast30d, 'Usos de tarjetas (30 días)'],
  ];
  $('#stats').replaceChildren(...items.map(([value, label]) => h('div', { class: 'stat' }, h('b', {}, value), h('span', {}, label))));
}

// ---------------- Leads ----------------

const statusFilter = $('#leads-estado');
for (const [value, label] of Object.entries(STATUS)) statusFilter.append(h('option', { value }, label));
statusFilter.addEventListener('change', safely(loadLeads));

let searchTimer;
$('#leads-buscar').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(safely(loadLeads), 300);
});

async function loadLeads() {
  const params = new URLSearchParams();
  if (statusFilter.value) params.set('status', statusFilter.value);
  const q = $('#leads-buscar').value.trim();
  if (q) params.set('q', q);
  const { items, total } = await api('GET', `/api/admin/leads?${params}`);
  const list = $('#leads-lista');
  if (!items.length) return list.replaceChildren(h('p', { class: 'vacio' }, 'No hay leads que mostrar.'));
  list.replaceChildren(
    h('p', { class: 'suave' }, `${total} lead${total === 1 ? '' : 's'}${total > items.length ? ` (mostrando ${items.length})` : ''}`),
    ...items.map(leadRow),
  );
}

function leadRow(lead) {
  const phoneDigits = lead.phone.replace(/\D/g, '');
  const waNumber = phoneDigits.length === 9 ? `34${phoneDigits}` : phoneDigits; // números españoles sin prefijo

  const statusSelect = h('select', {
    'aria-label': 'Estado',
    onchange: safely(async (event) => {
      await api('PATCH', `/api/admin/leads/${lead.id}`, { status: event.target.value });
      notice('Estado actualizado');
      await Promise.all([loadStats(), loadLeads()]);
    }),
  }, Object.entries(STATUS).map(([value, label]) => h('option', { value, selected: value === lead.status }, label)));

  const notes = h('textarea', { placeholder: 'Notas internas…', maxlength: '2000' }, lead.notes || '');

  return h('article', { class: 'fila' },
    h('div', { class: 'fila-cab' },
      h('strong', {}, lead.name, lead.business_type ? ` · ${lead.business_type}` : ''),
      h('span', { class: `chip ${lead.status}` }, STATUS[lead.status])),
    h('div', { class: 'meta' },
      h('span', {}, formatDate(lead.created_at)),
      h('a', { href: `tel:${lead.phone}` }, lead.phone),
      h('a', { href: `https://wa.me/${waNumber}`, target: '_blank', rel: 'noopener' }, 'WhatsApp'),
      lead.email && h('a', { href: `mailto:${lead.email}` }, lead.email),
      lead.service && h('span', {}, `Interés: ${SERVICES[lead.service] || lead.service}`),
      lead.utm_source && h('span', {}, `Origen: ${lead.utm_source}`)),
    lead.message && h('p', {}, lead.message),
    notes,
    h('div', { class: 'acciones' },
      statusSelect,
      h('button', {
        class: 'btn secundario',
        onclick: safely(async () => {
          await api('PATCH', `/api/admin/leads/${lead.id}`, { notes: notes.value.trim() || null });
          notice('Notas guardadas');
        }),
      }, 'Guardar notas'),
      lead.client_id
        ? h('span', { class: 'chip won' }, 'Ya es cliente')
        : h('button', {
          class: 'btn',
          onclick: safely(async () => {
            await api('POST', `/api/admin/leads/${lead.id}/convert`);
            notice('Cliente creado');
            await Promise.all([loadStats(), loadLeads()]);
          }),
        }, 'Convertir en cliente')));
}

// ---------------- Clientes ----------------

$('#form-cliente').addEventListener('submit', safely(async (event) => {
  event.preventDefault();
  await api('POST', '/api/admin/clients', formData(event.target));
  event.target.reset();
  notice('Cliente creado');
  await loadClients();
}));

async function loadClients() {
  const { items } = await api('GET', '/api/admin/clients');
  const list = $('#clientes-lista');
  if (!items.length) return list.replaceChildren(h('p', { class: 'vacio' }, 'Todavía no hay clientes.'));
  list.replaceChildren(...items.map((client) => h('article', { class: 'fila' },
    h('div', { class: 'fila-cab' },
      h('strong', {}, client.name),
      h('span', { class: 'chip' }, `${client.card_count} tarjeta${client.card_count === 1 ? '' : 's'}`)),
    h('div', { class: 'meta' },
      client.business_type && h('span', {}, client.business_type),
      client.contact_name && h('span', {}, client.contact_name),
      client.phone && h('a', { href: `tel:${client.phone}` }, client.phone),
      client.email && h('a', { href: `mailto:${client.email}` }, client.email),
      h('span', {}, `Alta: ${formatDate(client.created_at)}`)))));
}

// ---------------- Tarjetas NFC ----------------

$('#form-tarjeta').addEventListener('submit', safely(async (event) => {
  event.preventDefault();
  const data = formData(event.target);
  data.client_id = Number(data.client_id);
  await api('POST', '/api/admin/cards', data);
  event.target.reset();
  notice('Tarjeta creada');
  await loadCards();
}));

async function loadCards() {
  const [{ items: clients }, { items: cards }] = await Promise.all([
    api('GET', '/api/admin/clients'),
    api('GET', '/api/admin/cards'),
  ]);

  const clientSelect = $('#form-tarjeta [name=client_id]');
  clientSelect.replaceChildren(
    h('option', { value: '' }, clients.length ? 'Elige cliente *' : 'Crea antes un cliente'),
    ...clients.map((client) => h('option', { value: client.id }, client.name)),
  );

  const list = $('#tarjetas-lista');
  if (!cards.length) return list.replaceChildren(h('p', { class: 'vacio' }, 'Todavía no hay tarjetas.'));
  list.replaceChildren(...cards.map(cardRow));
}

function cardRow(card) {
  const link = `${location.origin}/r/${card.slug}`;
  const chart = h('div', { class: 'grafica', hidden: true, 'aria-label': 'Usos diarios de los últimos 30 días' });

  return h('article', { class: 'fila' },
    h('div', { class: 'fila-cab' },
      h('strong', {}, card.client_name, card.label ? ` · ${card.label}` : ''),
      h('span', { class: `chip ${card.active ? 'won' : 'off'}` }, card.active ? 'Activa' : 'Desactivada')),
    h('div', { class: 'meta' },
      h('code', {}, link),
      h('span', {}, `${card.taps_30d} usos (30 días) · ${card.tap_count} en total`)),
    h('div', { class: 'meta' }, 'Destino: ', h('a', { href: card.target_url, target: '_blank', rel: 'noopener' }, card.target_url)),
    chart,
    h('div', { class: 'acciones' },
      h('button', {
        class: 'btn secundario',
        onclick: safely(async () => {
          await navigator.clipboard.writeText(link);
          notice('Enlace copiado');
        }),
      }, 'Copiar enlace'),
      h('button', {
        class: 'btn secundario',
        onclick: safely(async () => {
          const target = prompt('Nueva URL de destino (https://…)', card.target_url);
          if (!target || target === card.target_url) return;
          await api('PATCH', `/api/admin/cards/${card.id}`, { target_url: target.trim() });
          notice('Destino actualizado');
          await loadCards();
        }),
      }, 'Cambiar destino'),
      h('button', {
        class: 'btn secundario',
        onclick: safely(async () => {
          const { items } = await api('GET', `/api/admin/cards/${card.id}/taps?days=30`);
          renderChart(chart, items);
        }),
      }, 'Ver usos'),
      h('button', {
        class: 'enlace',
        onclick: safely(async () => {
          if (card.active && !confirm('¿Desactivar esta tarjeta? Quien la use verá un aviso en lugar de la página de reseñas.')) return;
          await api('PATCH', `/api/admin/cards/${card.id}`, { active: !card.active });
          await loadCards();
        }),
      }, card.active ? 'Desactivar' : 'Activar')));
}

function renderChart(container, rows) {
  const counts = Object.fromEntries(rows.map((row) => [row.day, row.count]));
  const days = [];
  for (let i = 29; i >= 0; i -= 1) days.push(new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10));
  const max = Math.max(1, ...days.map((day) => counts[day] || 0));
  container.replaceChildren(...days.map((day) => {
    const bar = h('span', { title: `${day}: ${counts[day] || 0} usos` });
    bar.style.height = `${((counts[day] || 0) / max) * 100}%`; // vía CSSOM: la CSP bloquea style="" en línea
    return bar;
  }));
  container.hidden = false;
}

// ---------------- Arranque ----------------

api('GET', '/api/auth/me').then(({ user }) => showApp(user)).catch(() => {});
