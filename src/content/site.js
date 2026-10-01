// CONTENIDO EDITABLE DE LA WEB.
// Cambia aquí textos, precios, contacto y equipo.

export const site = {
  name: 'Alcance Isleño',
  title: 'Alcance Isleño | Tu escaparate digital: presencia digital para negocios de Tenerife',
  description:
    'Ficha de Google Business, reseñas, web con carta digital y hosting para cafeterías, bares, restaurantes, barberías y salones de belleza de Tenerife. Todo conectado y sin tecnicismos.',
  region: 'Tenerife',
  // Imagen de vista previa al compartir el enlace (WhatsApp, redes). 1200×630, en public/img/.
  // Se regenera con: npm run og-image (tras cambios visibles en la portada).
  ogImage: 'img/og.jpg',
  ogImageAlt: 'Alcance Isleño: tu escaparate digital. Carta digital en el móvil sobre una mesa de bar.',

  // Contacto. Las variables de entorno WHATSAPP_NUMBER y CONTACT_EMAIL, si existen, tienen prioridad.
  whatsappNumber: '34623243294', // con prefijo de país, solo dígitos
  phoneDisplay: '+34 623 24 32 94',
  email: '', // p. ej. 'hola@alcanceisleno.es' cuando tengáis dominio propio
  whatsappGreeting: 'Hola, quiero información sobre Alcance Isleño',

  // Datos de negocio local para Google (datos estructurados de la portada). Deben coincidir con la
  // ficha de Google Business: zona de servicio (site.region), horario y enlace a la ficha.
  business: {
    address: { region: 'Canarias', country: 'ES' }, // sin calle: trabajamos en toda la isla, sin local
    hours: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
    googleBusinessUrl: '', // enlace a la ficha en Google Maps, cuando esté verificada
  },

  // PORTADA
  hero: {
    title: 'Tu escaparate digital',
    lead: 'Presencia digital para negocios locales de Tenerife. Tu ficha de Google, tus reseñas y tu web, conectadas entre sí. Sin tecnicismos ni presupuestos de agencia.',
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

  // FRANJA "DÓNDE TE ENCUENTRAN", bajo la portada. Los iconos son dibujos propios (src/views/landing.js →
  // CHANNEL_ICONS), no logotipos oficiales: las marcas se nombran solo en el texto.
  channels: {
    title: 'Tu negocio, donde te buscan tus clientes',
    items: [
      { icon: 'buscar', label: 'Búsqueda de Google' },
      { icon: 'mapa', label: 'Google Maps' },
      { icon: 'chat', label: 'WhatsApp' },
      { icon: 'resena', label: 'Reseñas en Google y Tripadvisor' },
    ],
  },

  // PACKS POR TIPO DE NEGOCIO: sección con pestañas justo después de la portada.
  // pack: 'main' usa el "Pack completo" definido más abajo (pack), para no repetir precios.
  sectorsTitle: '¿Qué tipo de negocio tienes?',
  sectors: [
    {
      id: 'hosteleria',
      tab: 'Bares, restaurantes y cafeterías',
      title: 'Bares, restaurantes y cafeterías',
      intro: 'Tu carta en el móvil de tus clientes, tu ficha de Google al día y reseñas desde la mesa.',
      includes: [
        { name: 'Landing page con carta digital', text: 'Tu carta con precios, horario, ubicación y contacto por WhatsApp. Se abre desde el QR de la mesa, sin descargar nada.' },
        { name: 'Ficha de Google Business', text: 'La creamos o optimizamos: horarios, fotos, enlace a tu carta y acceso directo a tus reseñas.' },
        { name: 'Plan de mantenimiento el primer año', text: 'Hosting, dominio y hasta 2 cambios al mes (carta, precios, horarios, fotos).' },
        { name: 'Tarjeta de reseñas QR + NFC', text: 'Tus clientes dejan su reseña en Google o Tripadvisor en segundos.' },
      ],
      pack: 'main',
      // Opción: material para las mesas. "items" son ids de extras.items; se muestran con la imagen de extras.
      option: {
        name: 'Para tus mesas',
        text: 'Lleva tu carta digital a cada mesa, personalizada con tu marca.',
        items: ['mesa', 'pegatinas'],
      },
      cta: 'Pide información para tu local',
      whatsappText: 'Hola, tengo un bar, restaurante o cafetería y quiero información sobre el pack completo',
      demo: {
        business: 'Bar/Restaurante Isleño',
        label: 'Carta',
        items: [
          ['Papas con mojo', '4,50 €'],
          ['Queso asado', '6,00 €'],
          ['Carne de cabra', '12 €'],
          ['Vieja sancochada', '14 €'],
          ['Postre casero', '3,50 €'],
        ],
        button: 'Reservar por WhatsApp',
        card: 'Acerca tu móvil y déjanos tu reseña',
        caption: 'Ejemplo de carta digital y tarjeta de reseñas QR + NFC para un restaurante.',
      },
    },
    {
      id: 'cita-previa',
      tab: 'Negocios con cita previa',
      title: 'Negocios con cita previa',
      intro: 'Barberías, peluquerías, estética, uñas, tatuajes, fisioterapia… Tu web con tus servicios y precios, citas por WhatsApp y una tarjeta de reseñas QR + NFC en el mostrador para que cada cliente contento te deje su reseña en Google.',
      includes: [
        { name: 'Landing page con tus servicios', text: 'Servicios y precios, fotos de tus trabajos, horarios, ubicación y un botón para pedir cita por WhatsApp.' },
        { name: 'Tarjeta de reseñas QR + NFC', text: 'En el mostrador o junto al espejo: al pagar, tu cliente acerca el móvil y deja su reseña en Google en segundos. También funciona con QR.' },
        { name: 'Plan de mantenimiento el primer año', text: 'Hosting, dominio y hasta 2 cambios al mes (carta, precios, horarios, fotos).' },
      ],
      pack: { name: 'Pack negocios con cita previa', label: 'Web, tarjeta de reseñas QR + NFC y primer año de mantenimiento', price: '350 €' },
      option: {
        name: 'Tarjetas de visita personalizadas',
        text: 'Impresas con tu marca, a juego con tu web y tu tarjeta de reseñas QR + NFC.',
        price: '50 € / 100 uds.',
      },
      cta: 'Pide información para tu negocio',
      whatsappText: 'Hola, tengo un negocio con cita previa y quiero información sobre el pack de web y tarjeta de reseñas QR + NFC',
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
        caption: 'Ejemplo de web y tarjeta de reseñas QR + NFC para una barbería.',
      },
    },
  ],

  // RECORRIDO DEL CLIENTE: cada paso muestra el servicio que lo resuelve (por su "id").
  journey: {
    title: 'Así llega un cliente a tu negocio',
    steps: [
      { moment: 'Te busca en Google', service: 'gbp' },
      { moment: 'Mira tu carta o tus servicios', service: 'landing' },
      { moment: 'Te deja una reseña', service: 'nfc' },
    ],
    // {plan} se sustituye por los precios del plan de mantenimiento ("12 € al mes o 120 € al año").
    note: 'Y para que todo siga al día, nuestro plan de mantenimiento incluye hosting, dominio y hasta 2 cambios al mes (carta, servicios, precios, horarios o fotos) por {plan}. El primer año va incluido en los packs.',
  },

  // POR QUÉ ELEGIRNOS
  whyUs: {
    title: 'Por qué elegirnos',
    intro: 'Google Business, reseñas, landing y hosting, coordinados entre sí. Sin depender de una agencia grande ni de presupuestos complicados.',
    team: 'Somos un equipo interdisciplinar: observamos cómo funciona cada negocio local y cómo se relaciona con sus clientes, y a partir de ahí diseñamos soluciones a medida.',
    reasons: [
      { title: 'Equipo local', text: 'Especializados en proyectos digitales personalizados para negocios de la isla. Trato cercano y en persona.' },
      { title: 'Puesta en marcha ágil', text: 'Estudio, diagnóstico y puesta en marcha rápidos desde que recibimos tu material.' },
      { title: 'Todo conectado, no piezas sueltas', text: 'Tu ficha de Google, tu web, tus reseñas y tus redes se enlazan entre sí para que tu cliente pase de una a otra con un solo toque.' },
      { title: 'Te enseñamos a manejarlo', text: 'Formación básica para que puedas hacerlo tú mismo, sin depender de nosotros.' },
      { title: 'Diagnóstico gratuito', text: 'Analizamos tu presencia en internet sin coste y sin compromiso.' },
    ],
  },

  // CÓMO TRABAJAMOS
  steps: [
    { title: 'Diagnóstico gratuito', text: 'Vemos cómo aparece hoy tu negocio en internet y qué necesitas, sin compromiso.' },
    { title: 'Lo preparamos', text: 'Ficha de Google, web con tu carta o tus servicios, tarjeta de reseñas QR + NFC y hosting, a partir del material que nos envíes.' },
    { title: 'Entrega y formación', text: 'Revisamos el diseño contigo (2 rondas de cambios), lo publicamos y te enseñamos a usarlo.' },
  ],
  stepsNote: 'Pagas el 50% al empezar y el 50% restante a la entrega.',


  // SERVICIOS PRINCIPALES: lo que hacemos nosotros (software).
  // El "id" enlaza cada servicio con el recorrido y los packs.
  services: [
    {
      id: 'landing',
      name: 'Landing page',
      priceLabel: 'Landing page con carta digital o servicios',
      text: 'Una página rápida y adaptada a móvil con tu carta o tus servicios y precios, tu ubicación y un botón de WhatsApp para reservar mesa o pedir cita.',
      price: '300 €',
    },
    {
      id: 'gbp',
      name: 'Ficha de Google Business',
      priceLabel: 'Creación u optimización de la ficha de Google Business',
      text: 'Creamos tu ficha o reclamamos y optimizamos la que ya tienes: horarios, fotos, categorías, descripción, WhatsApp, Google Maps y acceso directo a tus reseñas.',
      price: '100 €',
    },
    {
      id: 'hosting',
      name: 'Plan de mantenimiento',
      // Varias filas de precio para un mismo servicio. Las dos primeras son el plan (mensual y anual):
      // la anual cuenta en el valor de los packs, que incluyen el primer año.
      prices: [
        { label: 'Plan de mantenimiento: hosting, dominio y hasta 2 cambios al mes (carta, precios, horarios, fotos)', price: '12 € / mes' },
        { label: 'Plan de mantenimiento, pago anual', price: '120 € / año' },
        { label: 'Cambio puntual sin plan de mantenimiento', price: '15 € / cambio' },
        { label: 'Actualización completa de la carta', price: '40 €' },
      ],
    },
  ],

  // PACK COMPLETO (se muestra destacado en precios y en la pestaña de hostelería).
  // Lo que incluye se toma de sectors[0].includes. No se muestra precio "antes" ni ahorro; un test
  // comprueba que el pack sigue siendo más barato que sus servicios sueltos. Pon "pack: null" para ocultarlo.
  pack: {
    name: 'Pack completo para hostelería',
    price: '525 €',
  },
  pricesNote: 'Precios sin IGIC. Otros trabajos de imprenta y la fotografía profesional se presupuestan aparte.',

  // COMPLEMENTOS FÍSICOS: se ofrecen como opción dentro de la pestaña de hostelería (sectors[0].option)
  // y aparecen en la lista de precios.
  extras: {
    image: {
      small: 'img/productos/expositor-mesa-480', // sin extensión: hay versión .webp y .jpg
      alt: 'Expositor de mesa personalizado con logo, número de mesa y código QR de la carta',
      caption: 'Imagen de muestra', // quitar cuando se sustituya por la foto real
    },
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
        name: 'Tarjeta de reseñas QR + NFC',
        text: 'Tus clientes escanean el QR o acercan el móvil y dejan su reseña en Google o Tripadvisor en segundos, sin buscar nada.',
        price: '25 € / unidad',
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
