// Worker mínimo delante de la web estática: redirige (301) las direcciones secundarias al dominio
// principal y el resto lo sirven los recursos estáticos de dist/ (cabeceras de _headers y página 404
// incluidas).
import { redireccion } from './redireccion.js';

export default {
  async fetch(request, env) {
    const destino = redireccion(new URL(request.url));
    if (destino) return Response.redirect(destino, 301);
    return env.ASSETS.fetch(request);
  },
};
