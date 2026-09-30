# Alcance Isleño

MVP de la web de Alcance Isleño: landing para negocios de Tenerife, captación de leads, panel interno y redirector de tarjetas NFC de reseñas.

- **Web pública** en `/` con la landing, páginas legales, `robots.txt` y `sitemap.xml`.
- **Formulario** que guarda cada solicitud (con consentimiento RGPD y antispam) y luego ofrece seguir por WhatsApp.
- **Panel** en `/admin`: leads con estados y notas, clientes y tarjetas NFC.
- **Tarjetas NFC** que apuntan a `/r/<slug>`: miden los usos y permiten cambiar el destino sin reprogramarlas.

El proyecto tiene **dos modos** que comparten plantillas y contenido:

| Modo | Para qué | Comando |
|---|---|---|
| **Web estática** (actual) | Enseñar la información. Sin servidor ni base de datos; el formulario abre WhatsApp. Se aloja gratis. | `npm run build` → carpeta `dist/` |
| Aplicación completa | Guardar leads, panel `/admin` y tarjetas NFC con estadísticas. Necesita un servidor. | `npm start` |

Arquitectura, esquema de base de datos y API: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
Auditoría técnica y desglose de la web publicada: [docs/AUDITORIA.md](docs/AUDITORIA.md). Diseño: [docs/DISENO.md](docs/DISENO.md).

## Publicar la web estática gratis

```bash
npm install
npm run build        # genera dist/
npm run preview      # revísala en http://localhost:4000
npm run og-image     # regenera la imagen para compartir (tras cambiar la portada; necesita Playwright)
```

Opciones con dominio gratuito de prueba:

- **Netlify Drop** (la más rápida, sin cuenta de GitHub): entra en <https://app.netlify.com/drop> y arrastra la carpeta `dist/`. Te da una dirección `*.netlify.app` que puedes renombrar (p. ej. `alcance-isleno.netlify.app`) en *Site configuration → Change site name*. Para actualizar, arrastra de nuevo la carpeta en *Deploys*.
- **GitHub Pages** (se actualiza sola con cada cambio): en cada push a `main`, el flujo `.github/workflows/pages.yml` pasa los tests, genera la web y la sube a la rama `gh-pages`, que se publica en `https://<usuario>.github.io/<repositorio>/`. Si Pages no se activa solo: *Settings → Pages → Source: Deploy from a branch → gh-pages / (root)*.
- **Cloudflare Pages**: conecta el repositorio con comando de build `npm run build` y carpeta de salida `dist` → `*.pages.dev`.

## Aplicación completa (servidor)

Requisitos: Node.js 22.9 o superior.

```bash
npm install
cp .env.example .env                              # rellena WHATSAPP_NUMBER y CONTACT_EMAIL
npm run create-admin -- tu-email@dominio.es       # pide la contraseña (mín. 12 caracteres)
npm run dev                                       # http://localhost:3000 y http://localhost:3000/admin
```

Tests: `npm test`

## Qué editar antes de publicar

| Qué | Dónde |
|---|---|
| Textos, servicios, precios y equipo | `src/content/site.js` |
| Datos del titular para los textos legales | `src/content/site.js` → `legal` |
| WhatsApp, teléfono y email | `src/content/site.js` (las variables de entorno tienen prioridad) |
| Colores y tipografías | `public/css/site.css` → `:root` |
| Fotos del equipo | `public/img/equipo/` y la ruta `img/equipo/nombre.jpg` en `site.js` |

## Producción

```bash
docker build -t alcance-isleno .
docker run -d -p 3000:3000 -v alcance-data:/app/data \
  -e PUBLIC_BASE_URL=https://tudominio.es -e WHATSAPP_NUMBER=34600000000 \
  -e CONTACT_EMAIL=hola@tudominio.es -e TRUST_PROXY=true alcance-isleno
```

Pon un proxy con HTTPS delante (Caddy o el de tu plataforma) y configura copias de seguridad del volumen `/app/data` (recomendado: Litestream). Detalles en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#8-despliegue).
