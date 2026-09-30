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

  // PRODUCTO ESTRELLA: se muestra en una sección destacada justo después de la portada
  // y encabeza la lista de precios.
  featured: {
    id: 'mesa', // se usa en el formulario y en los leads guardados
    badge: 'Nuestro producto estrella',
    name: 'Expositores de mesa personalizados',
    text: 'Diseñamos e imprimimos en 3D, bajo pedido, expositores para las mesas de tu local con tu logo, el número de mesa y un código QR que lleva a tu carta, a tus reseñas de Google o a tu WhatsApp.',
    points: [
      'Diseño a medida con tu marca y el número de cada mesa',
      'Funciona con QR y, si quieres, con chip NFC integrado: basta con acercar el móvil',
      'Impresión 3D resistente, hecha en Tenerife',
    ],
    image: {
      src: 'img/productos/expositor-mesa-800', // sin extensión: hay versiones .webp y .jpg de 480 y 800 px
      small: 'img/productos/expositor-mesa-480',
      alt: 'Expositor de mesa impreso en 3D con logo, número de mesa y código QR de la carta',
    },
    whatsappText: 'Hola, quiero información sobre los expositores de mesa personalizados',
    prices: [
      { label: 'Expositor de mesa personalizado (impresión 3D)', price: '10 € / unidad' },
      { label: 'Pegatinas QR para mesa (opción económica)', price: '50 € / 10 uds.' },
    ],
  },

  // Resto de servicios. El "id" se usa en el formulario y en los leads guardados: no lo cambies en producción.
  services: [
    {
      id: 'nfc',
      name: 'Tarjeta NFC de reseñas',
      text: 'Tus clientes acercan el móvil a la tarjeta y dejan su reseña en Google en segundos, sin buscar nada.',
      benefit: 'Más reseñas con menos esfuerzo.',
      price: 'desde 25 €',
    },
    {
      id: 'gbp',
      name: 'Ficha de Google Business',
      priceLabel: 'Configuración de Google Business Profile',
      text: 'Reclamamos, verificamos y optimizamos tu ficha: horarios, fotos, categorías, descripción y datos de contacto.',
      benefit: 'Que Google muestre tu negocio como merece.',
      price: '100 €',
    },
    {
      id: 'landing',
      name: 'Landing page',
      priceLabel: 'Landing page completa',
      text: 'Una página profesional, rápida y adaptada a móvil, con tus servicios, ubicación y contacto directo por WhatsApp.',
      benefit: 'Una web propia sin complicaciones.',
      price: 'desde 200 €',
    },
  ],

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
