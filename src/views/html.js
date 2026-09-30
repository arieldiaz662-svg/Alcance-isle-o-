const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function whatsappUrl(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

const LOGO = `<svg viewBox="0 0 48 60" aria-hidden="true">
        <path d="M24 2C12.4 2 3 11.2 3 22.6 3 38 24 58 24 58s21-20 21-35.4C45 11.2 35.6 2 24 2z" fill="#1B62C9"/>
        <polygon points="24,11 35,22 24,42 13,22" fill="#FFFFFF"/>
        <polygon points="24,11 35,22 24,22" fill="#DCE9FA"/>
        <polygon points="13,22 24,22 24,42" fill="#9EC1F2"/>
      </svg>`;

// El aviso legal solo se publica cuando están los datos del titular (site.legal.owner).
export function hasLegalNotice(site) {
  return Boolean(site.legal && site.legal.owner && site.legal.owner.trim());
}

// Datos de contacto efectivos: las variables de entorno tienen prioridad sobre site.js.
export function contact(site, config) {
  return {
    whatsapp: config.whatsappNumber || site.whatsappNumber,
    phoneDisplay: site.phoneDisplay,
    email: config.contactEmail || site.email,
  };
}

// Rutas de enlaces y recursos. En modo servidor son absolutas ("/privacidad"); en la versión
// estática son relativas y con .html, para que funcionen en cualquier subcarpeta (p. ej. GitHub Pages).
export function links(config) {
  if (config.static) {
    return {
      home: './', legal: 'aviso-legal.html', privacy: 'privacidad.html', cookies: 'cookies.html',
      asset: (file) => `assets/${file}`,
      page: (path) => (path === '/' ? '' : `${path.slice(1)}.html`),
    };
  }
  return {
    home: '/', legal: '/aviso-legal', privacy: '/privacidad', cookies: '/cookies',
    asset: (file) => `/assets/${file}`,
    page: (path) => path,
  };
}

// Esqueleto común: <head>, navegación y pie. "nav" es la lista de enlaces del menú.
export function layout({ site, config, title, description, path = '/', nav = [], body, scripts = [] }) {
  const to = links(config);
  const canonical = config.publicBaseUrl ? `${config.publicBaseUrl}${config.static ? `/${to.page(path)}` : path}` : '';
  const year = new Date().getFullYear();
  const home = path === '/' ? '' : to.home;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">
<meta property="og:url" content="${esc(canonical)}">
` : ''}<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="es_ES">
<meta name="theme-color" content="#0E2A47">
<link rel="icon" href="${to.asset('img/favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${to.asset('fonts/bricolage-grotesque.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${to.asset('css/site.css')}">
</head>
<body>

<header class="nav">
  <div class="wrap">
    <a class="marca" href="${home}#inicio" aria-label="${esc(site.name)}, inicio">
      ${LOGO}
      ${esc(site.name)}
    </a>
    <ul>
      ${nav.map((item) => `<li><a href="${home}#${esc(item.id)}">${esc(item.label)}</a></li>`).join('\n      ')}
    </ul>
    <a class="btn btn-sol" href="${home}#contacto">Hablemos</a>
  </div>
</header>

${body}

<footer>
  <div class="wrap">
    <div>© ${year} ${esc(site.name)}</div>
    <nav aria-label="Información legal">
      ${hasLegalNotice(site) ? `<a href="${to.legal}">Aviso legal</a>` : ''}
      <a href="${to.privacy}">Política de privacidad</a>
      <a href="${to.cookies}">Cookies</a>
    </nav>
  </div>
</footer>
${scripts.map((file) => `<script src="${esc(to.asset(file))}" defer></script>`).join('\n')}
</body>
</html>`;
}

// Página sencilla para errores o mensajes (404, tarjeta desactivada...).
export function messagePage({ site, config, title, heading, text }) {
  return layout({
    site, config, title: `${title} | ${site.name}`, description: text, path: '/',
    body: `<main class="pagina-simple"><div class="wrap">
  <h1>${esc(heading)}</h1>
  <p>${esc(text)}</p>
  <p><a class="btn btn-sol" href="${links(config).home}">Volver al inicio</a></p>
</div></main>`,
  });
}
