// CONTENIDO EDITABLE DE LA WEB.
// Cambia aquí textos, precios, contacto y equipo.

export const site = {
  name: 'Alcance Isleño',
  title: 'Alcance Isleño | Escaparate digital para negocios de Tenerife',
  description:
    'Reseñas en Google, ficha de negocio optimizada y landing pages para pequeños negocios de Tenerife. Tu escaparate digital, sin tecnicismos.',
  region: 'Tenerife',

  // Contacto. Las variables de entorno WHATSAPP_NUMBER y CONTACT_EMAIL, si existen, tienen prioridad.
  whatsappNumber: '34623243294', // con prefijo de país, solo dígitos
  phoneDisplay: '+34 623 24 32 94',
  email: '', // p. ej. 'hola@alcanceisleno.es' cuando tengáis dominio propio
  whatsappGreeting: 'Hola, quiero información sobre Alcance Isleño',

  // SERVICIOS PRINCIPALES: lo que hacemos nosotros (software).
  // El "id" se usa en el formulario y en los leads guardados: no lo cambies en producción.
  services: [
    {
      id: 'landing',
      name: 'Landing page con carta digital',
      priceLabel: 'Landing page con carta digital',
      text: 'Una página profesional, rápida y adaptada a móvil con tu carta digital, tus servicios, tu ubicación y contacto directo por WhatsApp. Tus clientes abren la carta desde el QR de la mesa, sin descargar nada.',
      benefit: 'Tu web y tu carta, siempre a mano.',
      price: 'desde 200 €',
    },
    {
      id: 'gbp',
      name: 'Ficha de Google Business',
      priceLabel: 'Creación u optimización de la ficha de Google Business',
      text: 'Creamos tu ficha o reclamamos y optimizamos la que ya tienes: horarios, fotos, categorías, descripción, enlace a tu carta y datos de contacto.',
      benefit: 'Que Google muestre tu negocio como merece.',
      price: '100 €',
    },
  ],

  // COMPLEMENTOS FÍSICOS: llevan a tus clientes desde la mesa a tu carta, tu web o tus reseñas.
  extras: {
    title: 'Lleva tu carta y tus reseñas a la mesa',
    text: 'Para que tus clientes lleguen a tu carta digital o a tus reseñas de Google en un segundo, te ofrecemos el material para tu local, personalizado con tu marca.',
    image: {
      src: 'img/productos/expositor-mesa-800', // sin extensión: hay versiones .webp y .jpg de 480 y 800 px
      small: 'img/productos/expositor-mesa-480',
      alt: 'Expositor de mesa personalizado con logo, número de mesa y código QR de la carta',
      caption: 'Imagen de muestra', // quitar cuando se sustituya por la foto real
    },
    whatsappText: 'Hola, quiero información sobre los expositores y el material para mesas',
    items: [
      {
        id: 'mesa',
        name: 'Expositor de mesa personalizado',
        text: 'Impreso en 3D en Tenerife con tu logo, el número de mesa y un QR. Con chip NFC opcional: basta con acercar el móvil.',
        price: '10 € / unidad',
      },
      {
        id: 'pegatinas',
        name: 'Pegatinas QR para mesa',
        text: 'La opción más sencilla y económica para llevar a tus clientes a la carta.',
        price: '50 € / 10 uds.',
      },
      {
        id: 'nfc',
        name: 'Tarjeta NFC de reseñas',
        text: 'Tus clientes acercan el móvil y dejan su reseña en Google en segundos, sin buscar nada.',
        price: 'desde 25 €',
      },
    ],
  },

  // Rellena "name" (y opcionalmente "role" y "photo": guarda la foto en public/img/equipo/ y pon "img/equipo/ana.jpg").
  // Si ninguna persona tiene nombre, la sección "Quiénes somos" no se muestra.
  team: [
    { name: '', role: '', photo: '' },
    { name: '', role: '', photo: '' },
    { name: '', role: '', photo: '' },
  ],

  // Datos del titular para el aviso legal (LSSI-CE). Mientras "owner" esté vacío, la página
  // "Aviso legal" y su enlace no se publican. Rellenadlo en cuanto el negocio esté formalizado.
  legal: {
    owner: '', // nombre o razón social
    taxId: '', // NIF/CIF
    address: '', // dirección postal
    registry: '', // datos registrales, si es sociedad
    lastUpdated: '30 de septiembre de 2026',
  },
};
