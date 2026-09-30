// www y la dirección de workers.dev se redirigen al dominio principal, para que solo haya una dirección
// de la web. Va en su propio módulo porque un Worker solo puede exportar manejadores.
export const DOMINIO = 'alcanceisleno.com';

export function redireccion(url) {
  const host = url.hostname;
  if (host !== `www.${DOMINIO}` && !host.endsWith('.workers.dev')) return null;
  return `https://${DOMINIO}${url.pathname}${url.search}`;
}
