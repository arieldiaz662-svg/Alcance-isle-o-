# Trabajos pendientes de publicar

Imágenes de trabajos ya hechos que **no se publican en la web** todavía. Están fuera de `public/`, así que no se copian a `dist/`
ni se sirven en alcanceisleno.com.

## Memphis Belle Coctelería

Pendiente del **visto bueno del cliente y del pago del trabajo**. La galería «Trabajos» está oculta por eso.

Para mostrarla, cuando el cliente lo apruebe y haya pagado:

1. `git mv docs/trabajos-pendientes/memphis-belle/* public/img/trabajos/`
2. En `src/content/site.js`, poner `TRABAJOS_AUTORIZADOS = true`.
3. `npm test && npm run build`, y publicar (PR a `main`).

> Este repositorio es público: las imágenes y los textos siguen siendo visibles en GitHub y en su historial aunque no estén en la web.
