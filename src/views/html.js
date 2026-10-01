const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function whatsappUrl(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

// Logo: el Teide (volcán marino con la cima nevada en blanco, Pico Viejo y el Pilón) con ondas amarillas
// de señal sobre un círculo azul: blanco, azul y amarillo, como la bandera de Canarias. Original en docs/logo/.
const LOGO = `<svg viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <clipPath id="logo-circulo"><circle cx="24" cy="24" r="23"/></clipPath>
          <clipPath id="logo-teide"><path d="M0 39.5 L4.5 37.4 L8.6 35.6 L11.6 34.1 L13.3 32.6 L14.8 31.0 L16.2 30.1 L18.4 29.9 L19.4 30.3 L20.3 29.6 L21.4 27.8 L22.6 25.6 L24.0 23.4 L24.9 23.2 L25.3 21.6 L27.1 21.6 L27.5 23.2 L28.4 23.4 L29.6 25.0 L31.0 27.2 L32.8 29.4 L35.2 31.4 L38.4 33.3 L42.2 35.0 L46 36.4 L48 37 L48 48 L0 48Z"/></clipPath>
        </defs>
        <circle cx="24" cy="24" r="23" fill="#1B62C9"/>
        <g clip-path="url(#logo-circulo)">
          <path d="M0 39.5 L4.5 37.4 L8.6 35.6 L11.6 34.1 L13.3 32.6 L14.8 31.0 L16.2 30.1 L18.4 29.9 L19.4 30.3 L20.3 29.6 L21.4 27.8 L22.6 25.6 L24.0 23.4 L24.9 23.2 L25.3 21.6 L27.1 21.6 L27.5 23.2 L28.4 23.4 L29.6 25.0 L31.0 27.2 L32.8 29.4 L35.2 31.4 L38.4 33.3 L42.2 35.0 L46 36.4 L48 37 L48 48 L0 48Z" fill="#0E2A47"/>
          <g clip-path="url(#logo-teide)">
            <path d="M26.6 21.6 L27.1 21.6 L27.5 23.2 L28.4 23.4 L29.6 25.0 L31.0 27.2 L32.8 29.4 L35.2 31.4 L38.4 33.3 L42.2 35.0 L46 36.4 L48 37 L48 48 L31.5 48 L29.4 36 L27.9 29 L27.1 25Z" fill="#1F4A7A"/>
            <path d="M21.4 27.4 Q21.9 29.2 22.5 28.4 Q22.7 26.8 23.4 27.0 Q23.9 28.0 24.4 27.4 Q24.6 26.0 25.2 26.2 Q25.7 28.9 26.4 28.2 Q26.5 26.4 27.2 26.6 Q27.6 27.6 28.2 27.2 Q28.4 26.0 29.0 26.3 Q29.5 28.4 30.2 27.6 Q30.4 26.6 31.2 27.0 L32 22 L24 18 L20 24Z" fill="#FFFFFF"/>
            <path d="M26.6 21.6 L27.1 25 L27.5 26.9 Q27.6 27.6 28.2 27.2 Q28.4 26.0 29.0 26.3 Q29.5 28.4 30.2 27.6 Q30.4 26.6 31.2 27.0 L32 22 L28 20Z" fill="#D6E4F5"/>
          </g>
        </g>
        <g fill="none" stroke="#FFC93C" stroke-width="2.3" stroke-linecap="round">
          <path d="M23.58 16.36A3.2 3.2 0 0 1 28.82 16.36"/><path d="M20.96 14.53A6.4 6.4 0 0 1 31.44 14.53"/><path d="M18.34 12.69A9.6 9.6 0 0 1 34.06 12.69"/>
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
