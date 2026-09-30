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

// Esqueleto común: <head>, navegación y pie. "nav" es la lista de enlaces del menú.
export function layout({ site, config, title, description, path = '/', nav = [], body, scripts = [] }) {
  const canonical = `${config.publicBaseUrl}${path}`;
  const year = new Date().getFullYear();
  const home = path === '/' ? '' : '/';
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="es_ES">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css">
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
      <a href="/aviso-legal">Aviso legal</a>
      <a href="/privacidad">Política de privacidad</a>
      <a href="/cookies">Cookies</a>
    </nav>
  </div>
</footer>
${scripts.map((src) => `<script src="${esc(src)}" defer></script>`).join('\n')}
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
  <p><a class="btn btn-sol" href="/">Volver al inicio</a></p>
</div></main>`,
  });
}
