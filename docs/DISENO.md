# Diseño: Tu escaparate digital

Notas de diseño para mantener la web coherente en futuros cambios.

## Idea

La portada es una **mesa de cafetería canaria** (terrazo) con los tres objetos que vende Alcance Isleño: el móvil con la **carta digital funcionando** (pestañas reales), el expositor con QR y un barraquito. Es el único elemento llamativo de la página; todo lo demás es sobrio y legible.

Eslogan: **"Tu escaparate digital"**, que engloba todos los sectores (hostelería, barberías y salones de belleza). La mesa de la portada sigue siendo la imagen principal. Justo después, **"¿Qué tipo de negocio tienes?"** separa la oferta en dos pestañas: *Bares, restaurantes y cafeterías* y *Negocios con cita previa* (barberías, peluquerías, estética, uñas, tatuajes, fisio…). Cada pestaña tiene su móvil de ejemplo, su pack y su WhatsApp. Los enlaces `…/#hosteleria` y `…/#cita-previa` abren directamente la pestaña; sin JavaScript se ven los dos paneles seguidos. El material para mesas (expositores y pegatinas) solo aparece como opción dentro de la pestaña de hostelería, y el recorrido del cliente ("Mira tu carta o tus servicios") vale para los dos tipos de negocio.

Público: dueños de bares, restaurantes, cafeterías, barberías y salones de belleza de Tenerife, poco técnicos, que la ven en el móvil. Objetivo: que pidan el diagnóstico gratuito por WhatsApp.

## Tokens (`public/css/site.css` → `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--tinta` | `#0E2A47` | Marino de la marca: texto, móvil, fondos oscuros |
| `--atlantico` | `#1B62C9` | Enlaces y detalles (no forma parte del logo) |
| `--sol` | `#FFC93C` | Solo lo que está "encendido": la puerta del logo y la acción principal (botones de WhatsApp/diagnóstico) |
| `--terrazo` | `#E3E7EB` + `img/terrazo.svg` | Superficie de la mesa |
| `--niebla` | `#F3F5F7` | Fondo alterno de secciones |
| `--gris` | `#4F5D70` | Texto secundario (contraste AA) |

Tipografía: **Familjen Grotesk** (una sola familia, OFL, alojada en `public/fonts/`). Escala 1.25 sobre 17 px. El titular de portada usa el tipo como elemento gráfico: muy grande, interlineado 0,88 y tracking negativo.

El **QR del expositor es real**: se genera al construir la web (librería `qrcode`) y abre WhatsApp con el mensaje de `demoMenu.qrWhatsappText`. También es un enlace, porque desde el móvil no se puede escanear la propia pantalla. Si cambia el número o el mensaje, basta con volver a construir.

## Logotipo

Una fachada marino con una puerta en arco encendida en amarillo y una tilde encima: la puerta del local de nuestros clientes, que a la vez forma la **ñ** de *isleño*. El nombre va en minúsculas en Familjen Grotesk (peso 620), con la tilde de la ñ redibujada con la misma onda que la del símbolo.

- Construcción sobre una retícula de 100: puerta de radio 23 (46 de ancho) que llega al borde inferior, tilde de 42 de ancho con trazo 7,5, esquinas con radio 5. Por debajo de 24 px se usa la versión pequeña (tilde con trazo 10, esquinas 12): `favicon.svg`.
- Todas las versiones en `docs/marca/`: a color, invertida, una tinta, apilada, símbolo y sello (gris y blanco). En las versiones de una tinta la tilde va calada, para grabado láser o impresión 3D.
- **Sello** "Web hecha por alcance isleño" en las webs y expositores de clientes: mínimo 14 px en pantalla, 12 mm en impresión 3D y 6 mm en papel. A color solo si la web del cliente es neutra; si no, en gris (`sello-gris.svg`).
- No se usa nunca sin la tilde: sin ella el símbolo es un arco genérico.

## Recursos propios del sector

- **Precios como una carta**: puntos guía entre concepto e importe, doble filete de carta impresa, y el pack destacado como un "menú del día".
- **Servicios como recorrido del cliente**: te busca en Google → mira tu carta → te deja una reseña. La numeración existe porque es una secuencia real.

## Qué evitar (lo que hace que una web parezca plantilla)

- Etiquetas en mayúsculas o "píldoras" encima de cada título.
- Tarjetas idénticas con la misma sombra; la sombra solo se usa en los objetos físicos de la mesa.
- Separadores con punto medio ("A · B · C"), flechas "→" en botones.
- Animaciones al hacer scroll o efectos al pasar el ratón por cada tarjeta.
- Fondo crema con acento terracota.

## Pendiente

- Sustituir la maqueta del expositor por la foto real (`public/img/productos/`) y quitar `caption` en `site.js`.
- Buscar marcas parecidas en la OEPM y la EUIPO (clases 35 y 42) y registrar la marca antes de imprimir tarjetas o expositores.
