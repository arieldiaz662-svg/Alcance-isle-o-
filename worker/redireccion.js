// www y la dirección de workers.dev se redirigen al dominio principal, para que solo haya una dirección
// de la web. Va en su propio módulo porque un Worker solo puede exportar manejadores.
export const DOMINIO = 'alcanceisleno.com';

export function redireccion(url) {
  const host = url.hostname;
  if (host !== `www.${DOMINIO}` && !host.endsWith('.workers.dev')) return null;
  return `https://${DOMINIO}${url.pathname}${url.search}`;
}

// Cloudflare redirige /pagina.html a /pagina. Para que las direcciones con .html (enlaces, sitemap,
// canonical y la verificación de Google) respondan directamente sin redirección, se pide el recurso
// sin la extensión, que Cloudflare sirve desde pagina.html.
export function sinExtension(url) {
  if (!url.pathname.endsWith('.html') || url.pathname.endsWith('/index.html')) return null;
  const destino = new URL(url);
  destino.pathname = url.pathname.slice(0, -'.html'.length);
  return destino;
}
