# Alcance Isleño

Página web (landing) de Alcance Isleño: **tu escaparate digital** para negocios locales de Tenerife.

Es una web **100 % estática**: sin servidor, sin base de datos y sin cookies. El formulario de contacto no guarda datos, solo abre WhatsApp con el mensaje ya escrito. Se aloja gratis en Cloudflare Workers.

- Diseño y criterios visuales: [docs/DISENO.md](docs/DISENO.md)
- Auditoría técnica y desglose de la web: [docs/AUDITORIA.md](docs/AUDITORIA.md)

## Uso

Requisitos: Node.js 22 o superior.

```bash
npm install
npm run build        # genera la web en dist/
npm run preview      # la sirve en http://localhost:4000 para revisarla
npm test             # comprueba la web generada (precios, enlaces, textos legales…)
npm run og-image     # regenera la imagen para compartir (tras cambiar la portada; necesita Playwright)
```

## Publicación

**Cloudflare Workers**: el Worker `alcance-isle-o` está conectado a este repositorio y publica cada cambio de `main` en https://alcance-isle-o.ariel-diaz662.workers.dev. Toda la configuración está en `wrangler.jsonc`: pasa los tests (si alguno falla, no se publica), construye con `PUBLIC_BASE_URL` apuntando a esa dirección (canonical, sitemap y og:image), publica `dist/`, sirve `404.html` en rutas inexistentes y aplica las cabeceras de `_headers`. Node 22 queda fijado en `.node-version`. Si se conecta un dominio propio, hay que cambiar la URL en `wrangler.jsonc`.

Además, GitHub Actions (`.github/workflows/ci.yml`) pasa los tests en cada push y pull request.

Alternativas: arrastrar la carpeta `dist/` a [Netlify Drop](https://app.netlify.com/drop) o conectar el repositorio a Vercel o Netlify (comando `npm run build`, carpeta `dist`).

## Qué editar

| Qué | Dónde |
|---|---|
| Textos, servicios, precios, packs y equipo | `src/content/site.js` |
| Datos del titular para el aviso legal | `src/content/site.js` → `legal` (mientras esté vacío, el aviso legal no se publica) |
| WhatsApp, teléfono y email | `src/content/site.js` |
| Colores y tipografía | `public/css/site.css` → `:root` |
| Foto del expositor | `public/img/productos/expositor-mesa-480.{jpg,webp}` y quitar `caption` en `site.js` |

## Estructura

```
src/content/site.js     contenido editable (una sola fuente de textos y precios)
src/views/              plantillas: portada (landing.js), base (html.js), textos legales (legal.js)
public/                 CSS, JS del navegador (pestañas y formulario), imágenes y tipografía
scripts/build-static.js genera dist/
test/static.test.js     tests de la web generada
```

## Historial

Hasta la versión 0.1 el repositorio incluía también una aplicación con servidor (panel de administración, base de datos de contactos y redirector de tarjetas NFC). No se llegó a usar y se archivó en la rama `archivo-app-servidor`.
