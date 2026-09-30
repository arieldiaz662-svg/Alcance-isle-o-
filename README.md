# Alcance Isleño

Página web (landing) de Alcance Isleño: **tu escaparate digital** para negocios locales de Tenerife.

Es una web **100 % estática**: sin servidor, sin base de datos y sin cookies. El formulario de contacto no guarda datos, solo abre WhatsApp con el mensaje ya escrito. Se aloja gratis en Cloudflare Pages (y, en paralelo, en GitHub Pages).

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

En cada cambio que llega a la rama `main`, el flujo `.github/workflows/pages.yml` pasa los tests, genera la web y la sube a la rama `gh-pages`, que GitHub Pages publica en `https://<usuario>.github.io/<repositorio>/`.

**Cloudflare Pages**: proyecto conectado a este repositorio con comando de compilación `npm run build` y carpeta de salida `dist` (Node 22, fijado en `.node-version`). Cada cambio en `main` se publica en `https://<proyecto>.pages.dev` y cada rama tiene su vista previa. Las cabeceras de seguridad salen del archivo `_headers` que genera la construcción. Si no se define `PUBLIC_BASE_URL`, canonical, sitemap y og:image usan `https://<proyecto>.pages.dev`; al conectar un dominio propio, hay que definir `PUBLIC_BASE_URL` con él en las variables del proyecto.

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
