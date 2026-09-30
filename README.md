# Alcance Isleño

MVP de la web de Alcance Isleño: landing para negocios de Tenerife, captación de leads, panel interno y redirector de tarjetas NFC de reseñas.

- **Web pública** en `/` con la landing, páginas legales, `robots.txt` y `sitemap.xml`.
- **Formulario** que guarda cada solicitud (con consentimiento RGPD y antispam) y luego ofrece seguir por WhatsApp.
- **Panel** en `/admin`: leads con estados y notas, clientes y tarjetas NFC.
- **Tarjetas NFC** que apuntan a `/r/<slug>`: miden los usos y permiten cambiar el destino sin reprogramarlas.

Arquitectura, esquema de base de datos y API: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Puesta en marcha

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
| WhatsApp, email y dominio | variables de entorno (`.env.example`) |
| Colores y tipografías | `public/css/site.css` → `:root` |
| Fotos del equipo | `public/img/equipo/` y la ruta `/assets/img/equipo/nombre.jpg` en `site.js` |

## Producción

```bash
docker build -t alcance-isleno .
docker run -d -p 3000:3000 -v alcance-data:/app/data \
  -e PUBLIC_BASE_URL=https://tudominio.es -e WHATSAPP_NUMBER=34600000000 \
  -e CONTACT_EMAIL=hola@tudominio.es -e TRUST_PROXY=true alcance-isleno
```

Pon un proxy con HTTPS delante (Caddy o el de tu plataforma) y configura copias de seguridad del volumen `/app/data` (recomendado: Litestream). Detalles en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#8-despliegue).
