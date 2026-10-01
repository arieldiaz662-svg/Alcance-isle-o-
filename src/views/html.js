const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function whatsappUrl(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

// Logo: el Teide en blanco saliendo del mar, con ondas amarillas de señal sobre un círculo azul
// (blanco, azul y amarillo, como la bandera de Canarias). Original en docs/logo/.
const LOGO = `<svg viewBox="0 0 48 48" aria-hidden="true">
        <defs><clipPath id="logo-circulo"><circle cx="24" cy="24" r="23"/></clipPath></defs>
        <circle cx="24" cy="24" r="23" fill="#1B62C9"/>
        <g clip-path="url(#logo-circulo)">
          <path d="M5 41 9.1 38.3 12.8 35.8 15.4 33.9 17 32.9 18.4 32.4 19.6 32.6 20.7 31.4 21.9 27.9 23 24.5 23.6 22.8 24.1 22.1H26.4L26.9 22.8 27.7 24.7 29.2 28.3 31 31 33.9 33.5 38 36.8 42.7 41Z" fill="#FFFFFF"/>
          <rect y="39.2" width="48" height="9" fill="#1B62C9"/>
          <path d="M6 42.4H42" stroke="#FFFFFF" stroke-width="1.1" stroke-linecap="round" opacity=".45"/>
        </g>
        <g fill="none" stroke="#FFC93C" stroke-width="2.4" stroke-linecap="round">
          <path d="M22.16 17.42A3.8 3.8 0 0 1 28.39 17.42"/>
          <path d="M19.05 15.24A7.6 7.6 0 0 1 31.5 15.24"/>
          <path d="M15.94 13.06A11.4 11.4 0 0 1 34.61 13.06"/>
        </g>
      </svg>`;

// El aviso legal solo se publica cuando están los datos del titular (site.legal.owner).
export function hasLegalNotice(site) {
  return Boolean(site.legal && site.legal.owner && site.legal.owner.trim());
}

// Datos de contacto efectivos: WHATSAPP_NUMBER y CONTACT_EMAIL (variables de entorno al construir)
// tienen prioridad sobre site.js.
export function contact(site, config) {
  return {
    whatsapp: config.whatsappNumber || site.whatsappNumber,
    phoneDisplay: site.phoneDisplay,
    email: config.contactEmail || site.email,
  };
}

// Política de seguridad de contenidos. Va como <meta> en cada página (vale en cualquier alojamiento, también
// en la vista previa local) y _headers la repite como cabecera para Cloudflare o Netlify.
export const STATIC_CSP = "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; form-action 'self'; object-src 'none'; base-uri 'self'";

// Rutas de enlaces y recursos, relativas y con .html para que la web funcione en cualquier subcarpeta
// o dominio. assetVersions añade ?v=<hash> a CSS y JS para evitar cachés antiguas.
export function links(config) {
  return {
    home: './', legal: 'aviso-legal.html', privacy: 'privacidad.html', cookies: 'cookies.html',
    asset: (file) => `assets/${file}${config.assetVersions && config.assetVersions[file] ? `?v=${config.assetVersions[file]}` : ''}`,
    page: (path) => (path === '/' ? '' : `${path.slice(1)}.html`),
  };
}

// baseHref: para páginas que se sirven desde cualquier ruta (la página 404), fija la base de los
// enlaces relativos en la raíz de la web. head: HTML extra para <head> (p. ej. datos estructurados).
export function layout({ site, config, title, description, path = '/', nav = [], body, scripts = [], baseHref = '', head = '' }) {
  const to = links(config);
  // og:image necesita URL absoluta: solo se añade cuando se conoce la dirección pública.
  const ogImage = config.publicBaseUrl && site.ogImage ? `${config.publicBaseUrl}/assets/${site.ogImage}` : '';
  const canonical = config.publicBaseUrl ? `${config.publicBaseUrl}/${to.page(path)}` : '';
  const year = new Date().getFullYear();
  const home = path === '/' ? '' : to.home;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${baseHref ? `<base href="${esc(baseHref)}">
` : ''}<meta http-equiv="Content-Security-Policy" content="${STATIC_CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">
<meta property="og:url" content="${esc(canonical)}">
` : ''}<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="${esc(site.name)}">
${ogImage ? `<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.ogImageAlt || title)}">
<meta name="twitter:card" content="summary_large_image">
` : ''}
<meta name="theme-color" content="#0E2A47">
<link rel="icon" href="${to.asset('img/favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${to.asset('fonts/familjen-grotesk.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${to.asset('css/site.css')}">
${head}</head>
<body>

<header class="nav">
  <div class="wrap">
    <a class="marca" href="${home}#inicio" aria-label="${esc(site.name)}, inicio">
      ${LOGO}
      <span aria-hidden="true">${esc(site.name.toLowerCase())}</span>
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

// Página sencilla para errores (404).
export function messagePage({ site, config, title, heading, text, baseHref = '' }) {
  return layout({
    site, config, title: `${title} | ${site.name}`, description: text, path: '/', baseHref,
    body: `<main class="pagina-simple"><div class="wrap">
  <h1>${esc(heading)}</h1>
  <p>${esc(text)}</p>
  <p><a class="btn btn-sol" href="${links(config).home}">Volver al inicio</a></p>
</div></main>`,
  });
}
