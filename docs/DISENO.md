# Diseño: Tu escaparate digital

Notas de diseño para mantener la web coherente en futuros cambios.

## Idea

Una **carta de restaurante bien impresa**: titulares con serifa clásica, filetes finos, precios con puntos guía y botones rectos. Es el lenguaje de nuestros clientes de hostelería y transmite oficio sin parecer una agencia. Nada dibujado: solo tipografía, líneas y, cuando las haya, fotos reales de negocios de la isla.

La portada lleva la **carta de ejemplo funcionando** (pestañas reales) en plano, con doble filete, y su expositor con el QR real. Eslogan: **"Tu escaparate digital"**. Justo después, **"¿Qué tipo de negocio tienes?"** muestra los dos tipos de negocio a la vista, uno junto al otro y sin pestañas: *Bares, restaurantes y cafeterías* y *Negocios con cita previa*. Cada uno conserva su id (`…/#hosteleria`, `…/#cita-previa`) para enlazarlo directamente.

Público: dueños de bares, restaurantes, cafeterías, barberías y salones de belleza de Tenerife, poco técnicos, que nos conocen sobre todo por recomendación y nos miran en el móvil. Objetivo: que pidan el diagnóstico gratuito por WhatsApp.

## Tokens (`public/css/site.css` → `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--tinta` | `#0E2A47` | Marino de la marca: texto, filetes y fondos oscuros |
| `--sol` | `#FFC93C` | Solo lo que está "encendido": la puerta del logo y la acción principal (botones de WhatsApp/diagnóstico) |
| `--niebla` | `#F3F5F7` | Fondo alterno de secciones y de la muestra de la portada |
| `--gris` | `#4F5D70` | Texto secundario (contraste AA) |
| `--linea` | `#C9D2DC` | Filetes finos |

Tipografía (todas OFL, alojadas en `public/fonts/`):
- **Libre Caslon Display** para titulares (`h1`, `h2`, títulos de cada tipo de negocio y precios grandes), siempre a peso normal.
- **Libre Caslon Text cursiva** para los encabezados de la carta de precios, el "menú del día" y los números romanos.
- **Familjen Grotesk** para todo lo demás: texto, botones, listas. Escala 1.25 sobre 17 px.

El **QR del expositor es real**: se genera al construir la web (librería `qrcode`) y abre WhatsApp con el mensaje de `demoMenu.qrWhatsappText`. También es un enlace, porque desde el móvil no se puede escanear la propia pantalla. Si cambia el número o el mensaje, basta con volver a construir.

## Logotipo

Una fachada marino con una puerta en arco encendida en amarillo y una tilde encima: la puerta del local de nuestros clientes, que a la vez forma la **ñ** de *isleño*. El nombre va en minúsculas en Familjen Grotesk (peso 540), con la tilde de la ñ redibujada con la misma onda que la del símbolo.

- Construcción sobre una retícula de 100: puerta de radio 23 (46 de ancho) que llega al borde inferior, tilde de 42 de ancho con trazo 6,5 y esquinas rectas. Nombre a peso 540. Por debajo de 24 px se usa la versión pequeña (tilde con trazo 9): `favicon.svg`.
- Todas las versiones en `docs/marca/`: a color, invertida, una tinta, apilada, símbolo y sello (gris y blanco). En las versiones de una tinta la tilde va calada, para grabado láser o impresión 3D.
- **Sello** "Web hecha por alcance isleño" en las webs y expositores de clientes: mínimo 14 px en pantalla, 12 mm en impresión 3D y 6 mm en papel. A color solo si la web del cliente es neutra; si no, en gris (`sello-gris.svg`).
- No se usa nunca sin la tilde: sin ella el símbolo es un arco genérico.

## Recursos propios del sector

- **Precios como una carta**: puntos guía entre concepto e importe, doble filete de carta impresa, encabezados en cursiva y el pack destacado como un "menú del día" recuadrado.
- **Servicios como recorrido del cliente**: te busca en Google → mira tu carta → te deja una reseña. La numeración existe porque es una secuencia real.

## Qué evitar

- Objetos dibujados con CSS (móviles con borde, vasos, tarjetas) y cualquier cosa inclinada: hacen que la web parezca de dibujos animados. Un test lo comprueba.
- Botones en forma de píldora, sombras y esquinas muy redondeadas: los botones son rectos (2 px de radio).
- Etiquetas en mayúsculas o "píldoras" encima de cada título.
- Iconos en la franja de canales y logotipos de terceros: las marcas se nombran en texto.
- Titulares en negrita gruesa: la serifa va siempre a peso normal.
- Fotos de banco de imágenes: si no son de negocios de Tenerife, mejor ninguna.
- Fondo crema con acento terracota.

## Pendiente

- Fotos reales: una sesión con dos o tres clientes (barra o terraza, sillón de barbería, expositor en una mesa). Cuando las haya, van en la muestra de la portada y encabezando cada tipo de negocio.
- Sustituir la maqueta del expositor por la foto real (`public/img/productos/`) y quitar `caption` en `site.js`.
- Buscar marcas parecidas en la OEPM y la EUIPO (clases 35 y 42) y registrar la marca antes de imprimir tarjetas o expositores.
