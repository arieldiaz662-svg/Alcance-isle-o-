// CONTENIDO EDITABLE DE LA WEB.
// Cambia aquí textos, precios, contacto y equipo.

export const site = {
  name: 'Alcance Isleño',
  title: 'Alcance Isleño | Tu mesa digital: presencia digital para negocios de Tenerife',
  description:
    'Ficha de Google Business, reseñas, web con carta digital y hosting para cafeterías, bares y pequeños negocios de Tenerife. Todo conectado y listo en 10 días laborables.',
  region: 'Tenerife',

  // Contacto. Las variables de entorno WHATSAPP_NUMBER y CONTACT_EMAIL, si existen, tienen prioridad.
  whatsappNumber: '34623243294', // con prefijo de país, solo dígitos
  phoneDisplay: '+34 623 24 32 94',
  email: '', // p. ej. 'hola@alcanceisleno.es' cuando tengáis dominio propio
  whatsappGreeting: 'Hola, quiero información sobre Alcance Isleño',

  // PORTADA
  hero: {
    badge: 'Presencia digital para negocios de Tenerife',
    title: 'Tu mesa digital',
    lead: 'Que quien te busque en internet, te encuentre. Tu ficha de Google, tus reseñas, tu web y tu carta, conectadas entre sí y listas en 10 días laborables. Sin tecnicismos ni presupuestos de agencia.',
    cta: 'Pide tu diagnóstico gratuito',
    ctaWhatsappText: 'Hola, me gustaría pedir el diagnóstico gratuito para mi negocio',
  },

  // POR QUÉ ELEGIRNOS
  whyUs: {
    title: 'Por qué elegirnos',
    intro: 'Google Business, reseñas, landing y hosting, coordinados entre sí y listos en menos de dos semanas. Sin depender de una agencia grande ni de presupuestos complicados.',
    team: 'Somos un equipo joven e interdisciplinar de antropología social y administración de empresas: observamos cómo funciona cada negocio local y cómo se relaciona con sus clientes, y a partir de ahí diseñamos soluciones a medida.',
    reasons: [
      { title: 'Equipo local', text: 'Especializados en proyectos digitales personalizados para negocios de la isla. Trato cercano y en persona.' },
      { title: 'Listo en 10 días laborables', text: 'Estudio, diagnóstico y puesta en marcha rápidos desde que recibimos tu material.' },
      { title: 'Todo conectado, no piezas sueltas', text: 'Tu ficha de Google, tu web, tus reseñas y tus redes se enlazan entre sí para que tu cliente pase de una a otra con un solo toque.' },
      { title: 'Te enseñamos a manejarlo', text: 'Formación básica para que puedas hacerlo tú mismo, sin depender de nosotros.' },
      { title: 'Diagnóstico gratuito', text: 'Analizamos tu presencia en internet sin coste y sin compromiso.' },
    ],
  },

  // CÓMO TRABAJAMOS
  steps: [
    { title: 'Diagnóstico gratuito', text: 'Vemos cómo aparece hoy tu negocio en internet y qué necesitas, sin compromiso.' },
    { title: 'Lo preparamos', text: 'Ficha de Google, web con tu carta, placa de reseñas y hosting, en 10 días laborables desde que recibimos tu material.' },
    { title: 'Entrega y formación', text: 'Revisamos el diseño contigo (2 rondas de cambios), lo publicamos y te enseñamos a usarlo.' },
  ],
  stepsNote: 'Pagas el 50% al empezar y el 50% restante a la entrega.',

  // Título de la sección de servicios
  servicesTitle: 'Todo lo que necesita tu mesa digital',


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
      text: 'Creamos tu ficha o reclamamos y optimizamos la que ya tienes: horarios, fotos, categorías, descripción, WhatsApp, Google Maps y acceso directo a tus reseñas.',
      benefit: 'Que Google muestre tu negocio como merece.',
      price: '100 €',
    },
    {
      id: 'hosting',
      name: 'Hosting y mantenimiento',
      priceLabel: 'Hosting, dominio y mantenimiento (12 meses)',
      text: 'Alojamiento y dominio de tu web, mantenimiento, pequeños cambios de contenido (como actualizar la carta) y soporte cuando lo necesites.',
      benefit: 'Tu web siempre online y al día.',
      price: '300 € / año',
    },
  ],

  // PACK COMPLETO (se muestra destacado en precios). Pon "pack: null" para ocultarlo.
  pack: {
    name: 'Pack completo',
    text: 'Ficha de Google Business + landing page con carta digital + hosting y mantenimiento 12 meses. La placa QR de reseñas, de regalo.',
    price: '600 €',
    was: '625 €',
  },
  pricesNote: 'Precios sin IGIC. Imprenta y fotografía profesional se presupuestan aparte.',

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
