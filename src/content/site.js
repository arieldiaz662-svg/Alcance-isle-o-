// CONTENIDO EDITABLE DE LA WEB.
// Cambia aquí textos, precios, contacto y equipo.

export const site = {
  name: 'Alcance Isleño',
  title: 'Alcance Isleño | Tu escaparate digital: presencia digital para negocios de Tenerife',
  description:
    'Ficha de Google Business, reseñas, web con carta digital y hosting para cafeterías, bares, restaurantes, barberías y salones de belleza de Tenerife. Todo conectado y listo en 10 días laborables.',
  region: 'Tenerife',

  // Contacto. Las variables de entorno WHATSAPP_NUMBER y CONTACT_EMAIL, si existen, tienen prioridad.
  whatsappNumber: '34623243294', // con prefijo de país, solo dígitos
  phoneDisplay: '+34 623 24 32 94',
  email: '', // p. ej. 'hola@alcanceisleno.es' cuando tengáis dominio propio
  whatsappGreeting: 'Hola, quiero información sobre Alcance Isleño',

  // PORTADA
  hero: {
    title: 'Tu escaparate digital',
    lead: 'Presencia digital para negocios locales de Tenerife. Tu ficha de Google, tus reseñas y tu web, conectadas entre sí y listas en 10 días laborables. Sin tecnicismos ni presupuestos de agencia.',
    cta: 'Pide tu diagnóstico gratuito',
    ctaWhatsappText: 'Hola, me gustaría pedir el diagnóstico gratuito para mi negocio',
    note: 'Equipo local de Tenerife. Diagnóstico gratuito y sin compromiso.',
  },

  // CARTA DE DEMOSTRACIÓN que aparece en el móvil de la portada (negocio ficticio).
  demoMenu: {
    business: 'Bar/Restaurante Isleño',
    table: 'Mesa 4',
    caption: 'Ejemplo de carta digital: toca las pestañas. El QR abre nuestro WhatsApp.',
    // El QR del expositor es real: abre WhatsApp con este mensaje ya escrito.
    qrWhatsappText: 'Hola, quiero mi escaparate digital',
    qrCaption: 'Escanéame',
    qrLabel: 'Código QR: escríbenos por WhatsApp',
    sections: [
      {
        name: 'Cafés',
        items: [
          ['Barraquito', '1,80 €'],
          ['Cortado leche y leche', '1,40 €'],
          ['Café con leche', '1,50 €'],
          ['Zumo de naranja natural', '2,50 €'],
          ['Leche y leche', '1,40 €'],
          ['Infusión', '1,30 €'],
        ],
      },
      {
        name: 'Desayunos',
        items: [
          ['Tostada con tomate y aceite', '2,20 €'],
          ['Bocadillo de pata asada', '4,50 €'],
          ['Sándwich mixto', '3,00 €'],
          ['Zumo + café + tostada', '5,50 €'],
          ['Tortilla española', '3,50 €'],
          ['Huevos con papas', '5,00 €'],
        ],
      },
      {
        name: 'Dulces',
        items: [
          ['Quesadilla herreña', '2,50 €'],
          ['Bizcochón', '2,00 €'],
          ['Tarta de gofio', '3,20 €'],
          ['Rapadura', '1,50 €'],
          ['Bienmesabe', '3,00 €'],
          ['Príncipe Alberto', '3,20 €'],
        ],
      },
    ],
  },

  // BARBERÍAS Y SALONES DE BELLEZA: pack de precio fijo (web + tarjeta NFC) y tarjetas de visita opcionales.
  beauty: {
    navLabel: 'Barberías y belleza',
    title: 'Para barberías y salones de belleza',
    intro: 'Tu web con tus servicios y precios, citas por WhatsApp y una tarjeta en el mostrador para que cada cliente contento te deje su reseña en Google.',
    // Lo que incluye el pack (sin precio por separado).
    offers: [
      {
        name: 'Landing page con tus servicios',
        text: 'Servicios y precios, fotos de tus trabajos, horarios, ubicación y un botón para pedir cita por WhatsApp.',
      },
      {
        name: 'Tarjeta NFC de reseñas',
        text: 'En el mostrador o junto al espejo: al pagar, tu cliente acerca el móvil y deja su reseña en Google en segundos. También funciona con QR.',
      },
    ],
    pack: { name: 'Pack barberías y salones de belleza', label: 'Web + tarjeta NFC de reseñas', price: '225 €' },
    // Opción de imprenta, aparte del pack.
    option: {
      name: 'Tarjetas de visita personalizadas',
      text: 'Impresas con tu marca, a juego con tu web y tu tarjeta de reseñas.',
      price: '50 € / 100 uds.',
    },
    cta: 'Pide información para tu negocio',
    whatsappText: 'Hola, tengo una barbería o salón de belleza y quiero información sobre el pack de web y tarjeta de reseñas',
    // Web de ejemplo que aparece en el móvil (negocio ficticio).
    demo: {
      business: 'Barbería Isleña',
      label: 'Servicios',
      items: [
        ['Corte de pelo', '12 €'],
        ['Corte + barba', '18 €'],
        ['Arreglo de barba', '8 €'],
        ['Corte infantil', '10 €'],
        ['Lavado y peinado', '15 €'],
      ],
      button: 'Pedir cita por WhatsApp',
      card: 'Acerca tu móvil y déjanos tu reseña',
      caption: 'Ejemplo de web y tarjeta de reseñas para una barbería.',
    },
  },

  // RECORRIDO DEL CLIENTE: cada paso muestra el servicio que lo resuelve (por su "id").
  journey: {
    title: 'Así llega un cliente a tu negocio',
    steps: [
      { moment: 'Te busca en Google', service: 'gbp' },
      { moment: 'Mira tu carta', service: 'landing' },
      { moment: 'Te deja una reseña', service: 'nfc' },
    ],
    note: 'Y para que todo siga funcionando, alojamos tu web con tu dominio por 90 € al año. Los cambios de la carta solo los pagas cuando los necesitas.',
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
      text: 'Alojamos tu web con tu propio dominio y la mantenemos siempre online. Los cambios (precios, platos, horarios o fotos) solo los pagas cuando los necesitas, sin cuotas de mantenimiento.',
      benefit: 'Tu web siempre online, y al día cuando tú lo decidas.',
      // Varias filas de precio para un mismo servicio.
      prices: [
        { label: 'Hosting y dominio (12 meses)', price: '90 € / año' },
        { label: 'Cambio puntual de contenido (precios, horarios, fotos, un plato…)', price: '15 € / cambio' },
        { label: 'Actualización completa de la carta', price: '40 €' },
      ],
    },
  ],

  // PACK COMPLETO (se muestra destacado en precios). Pon "pack: null" para ocultarlo.
  pack: {
    name: 'Pack completo para hostelería',
    text: 'Ficha de Google Business + landing page con carta digital + hosting y dominio el primer año. La placa de reseñas QR + NFC, de regalo.',
    price: '390 €',
    was: '415 €',
  },
  pricesNote: 'Precios sin IGIC. Otros trabajos de imprenta y la fotografía profesional se presupuestan aparte.',

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
        name: 'Placa de reseñas QR + NFC',
        text: 'Tus clientes escanean el QR o acercan el móvil y dejan su reseña en Google o Tripadvisor en segundos, sin buscar nada.',
        price: '25 €',
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
