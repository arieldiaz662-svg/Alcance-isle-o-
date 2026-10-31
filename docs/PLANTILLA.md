# Usar este repositorio como plantilla

La web de Alcance Isleño es 100 % estática y todo lo que cambia de un negocio a otro vive en un solo archivo.
Para montar la web de otro negocio (o una nueva versión de esta) no hace falta tocar el código.

## Qué es plantilla y qué es contenido

| Parte | Dónde | ¿Se toca por negocio? |
|---|---|---|
| Textos, packs, precios, oferta, contacto, equipo y datos legales | `src/content/site.js` | **Sí, es lo único imprescindible** |
| Marca: logo, colores y tipografía | `docs/marca/`, `public/img/`, `public/css/site.css` (`:root`) | Sí, al cambiar de marca |
| Plantillas HTML (portada, textos legales, datos para Google) | `src/views/` | No |
| Construcción de la web | `scripts/build-static.js` | No |
| Tests (precios, enlaces, textos legales, oferta) | `test/static.test.js` | No; se adaptan solos al contenido |
| Publicación (dominio, redirecciones, cabeceras) | `wrangler.jsonc`, `worker/` | Solo el dominio |

## Pasos para crear la web de un nuevo negocio

1. **Copiar el repositorio.** En GitHub: *Settings → General → Template repository* (marcarlo una vez) y luego
   *Use this template → Create a new repository*. Sin eso, también sirve clonar y subir a un repositorio nuevo.
2. **Contenido** (`src/content/site.js`): nombre, descripción, WhatsApp, teléfono, email, Instagram, horario, zona,
   packs, precios, equipo y datos del titular (`legal`: sin ellos el Aviso legal no se publica).
3. **Oferta de lanzamiento:** `launch` al principio de `site.js`. `active: false` la apaga y los packs vuelven a su
   precio y contenido normales. El cupo no se descuenta solo.
4. **Marca:** sustituye `docs/marca/*`, `public/img/logo.png`, `public/img/favicon.svg` y los colores de
   `public/css/site.css`. Regenera la imagen para compartir con `npm run build && npm run og-image`.
5. **Dominio:** `wrangler.jsonc` y `worker/redireccion.js` (un test comprueba que coinciden).
6. **Comprobar:** `npm install && npm test && npm run preview`.
7. **Publicar:** conecta el repositorio a Cloudflare Workers (ver el README).

## Conversión a WhatsApp

- **Llamada final** tras «Así trabajamos» (`closing` en `site.js`) y **botón fijo de WhatsApp en móvil** (`floatingCta`; vacío para quitarlo).
- **Trabajos** (`works` en `site.js`): galería de webs, cartas y tarjetas ya hechas. Sin elementos no se muestra ni aparece en el menú.
  Guarda las fotos en `public/img/trabajos/` y añade `{ img: 'img/trabajos/bar-luna.jpg', alt: '…', caption: '…' }`.
  Usa solo trabajos reales y con permiso del cliente; las fotos se muestran en proporción 4:3.

## Revisión antes de publicar

- Las políticas de privacidad y cookies (`src/views/legal.js`) son plantillas orientativas: revísalas con un
  profesional y ajusta proveedores y plazos si el negocio usa otros servicios.
- Cambia los textos que mencionan Tenerife si el negocio es de otra zona (`site.region`, `hero`, `whyUs`).
- Si el negocio no es de hostelería o cita previa, edita `sectors` (cada pestaña es un bloque independiente).

## Skills de diseño conectadas

El repositorio trae dos grupos de skills para Claude Code:

| Grupo | Cómo está | Qué ofrece |
|---|---|---|
| Animación y pulido de interfaz | Copiadas en `.claude/skills/` (MIT, de emilkowalski/skill) | Animar, revisar y auditar movimiento; web que se sienta nativa en el móvil |
| **Plugin `design`** (Anthropic) | **Conectado por referencia** en `.claude/settings.json`, no copiado | Crítica de diseño, auditoría de accesibilidad (WCAG), design system, UX copy, handoff e investigación de usuarios |

El plugin `design` viene del marketplace público `anthropics/knowledge-work-plugins`. Al abrir el repositorio en
Claude Code y confiar en la carpeta, queda disponible el marketplace y el plugin; sus skills aparecen como
`design:design-critique`, `design:accessibility-review`, `design:ux-copy`, `design:design-system`, etc. Está por referencia y no copiado para recibir sus actualizaciones y
respetar su licencia. Algunas funciones usan conectores externos (Figma, Notion…) que son opcionales: sin ellos
las skills funcionan describiendo el diseño o pegando capturas.

Para quitarlo, borra la entrada `design@knowledge-work-plugins` de `.claude/settings.json`.
