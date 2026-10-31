// CONTENIDO EDITABLE DE LA WEB.
// Cambia aquí textos, precios, contacto y equipo.

// OFERTA DE LANZAMIENTO: 50 % de descuento en los dos packs para los primeros clientes.
// "spots" son las plazas que QUEDAN (empezó con 5; ya hay 1 cliente, quedan 4). El cupo no se descuenta solo:
// cada vez que entre un cliente, baja "spots" en 1 y vuelve a publicar (regenera la imagen para compartir con
// npm run build && npm run og-image). Para terminarla: pon active en false; los packs vuelven a su precio normal
// y a incluir el primer año de mantenimiento.
// regularMonths: meses de mantenimiento que incluye el pack a precio normal (el precio tachado).
const launch = { active: true, percent: 50, spots: 4, months: 3, regularMonths: 12 };
const spotsLabel = launch.spots === 1 ? 'queda 1 plaza' : `quedan ${launch.spots} plazas`;
const euros = (n) => `${n} €`;
// Precio de un pack: con la oferta, la mitad; "regularPrice" (precio normal) solo existe mientras dura.
const packPrice = (regular) => (launch.active ? euros(regular * (100 - launch.percent) / 100) : euros(regular));
const regularPrice = (regular) => (launch.active ? { regularPrice: euros(regular) } : {});
const maintenanceName = launch.active ? `Plan de mantenimiento los ${launch.months} primeros meses` : 'Plan de mantenimiento el primer año';
const maintenanceText = launch.active
  ? `En la oferta de lanzamiento: hosting, dominio y hasta 2 cambios al mes (carta, precios, horarios, fotos) durante ${launch.months} meses.`
  : 'Hosting, dominio y hasta 2 cambios al mes (carta, precios, horarios, fotos).';
const maintenanceInPack = launch.active ? `${launch.months} primeros meses de mantenimiento` : 'primer año de mantenimiento';

// TRABAJOS (galería): se muestran solo con el visto bueno y el pago del cliente. Memphis Belle, pendiente: ver "works" más abajo.
const TRABAJOS_AUTORIZADOS = false;
const TRABAJOS_MEMPHIS_BELLE = [
      {
        img: 'img/trabajos/memphis-belle-portada', width: 1200, height: 565, fit: 'contain',
        alt: 'Portada de la web de Memphis Belle Coctelería: «Coctelería de autor», aviso de horario «Cerrado, abrimos hoy a las 18:00» y botones «Ver la carta» y «Cómo llegar».',
        title: 'Memphis Belle · Portada de la web',
        description: 'Primera pantalla de la web: el título «Coctelería de autor», una foto con el neón del bar y un aviso que indica si el local está abierto o a qué hora abre. Dos botones llevan directos a la carta y a cómo llegar, y un interruptor cambia entre español e inglés.',
      },
      {
        img: 'img/trabajos/memphis-belle-bar', width: 1200, height: 404, fit: 'contain',
        alt: 'Sección «El bar» de la web de Memphis Belle: «Cócteles de autor, sin prisa», sobre una estantería de rones y whiskies.',
        title: 'Memphis Belle · Sección «El bar»',
        description: 'Presenta el estilo del local con una frase corta, «Cócteles de autor, sin prisa», sobre una fotografía de su estantería de rones y whiskies. Mantiene el menú siempre a mano y el botón «Cómo llegar» para que el cliente pueda decidir sin salir de la página.',
      },
      {
        img: 'img/trabajos/memphis-belle-carta', width: 800, height: 1000, fit: 'contain',
        alt: 'Carta de Memphis Belle Coctelería en dos columnas, «Refrescantes» y «Ácidos y sour», con el nombre, los ingredientes y el precio de cada cóctel.',
        title: 'Memphis Belle · Carta de cócteles',
        description: 'Carta en dos columnas, «Refrescantes» y «Ácidos y sour», con el nombre de cada cóctel, sus ingredientes y su precio. Usa la paleta verde y dorada de la marca, indica que los precios llevan IGIC incluido y recuerda el consumo responsable.',
      },
      {
        img: 'img/trabajos/memphis-belle-tarjeta', width: 1000, height: 645, fit: 'cover',
        alt: 'Tarjeta de visita de Memphis Belle Coctelería: dibujo de una coctelera, dos cucharas y una copa sobre el nombre en blanco y dorado, con fondo verde oliva.',
        title: 'Memphis Belle · Tarjeta de visita',
        description: 'Tarjeta con el emblema del bar (una coctelera, dos cucharas cruzadas y una copa) sobre el nombre en blanco y dorado y el verde oliva de la marca. Comparte tipografía y colores con la web y la carta, para que todo se reconozca como el mismo negocio.',
      },
];

export const site = {
  launch: {
    ...launch,
    badge: `Oferta de lanzamiento: -${launch.percent} %`,
    // Aclara qué incluye el pack tachado: el precio normal lleva el primer año; el de lanzamiento, solo unos meses.
    regularNote: `El precio tachado es el del pack normal, que incluye ${launch.regularMonths} meses de mantenimiento; el pack de lanzamiento incluye ${launch.months}.`,
    spotsLabel,
    title: `-${launch.percent} % en los packs: ${spotsLabel}`,
    text: `${launch.spots === 1 ? 'Para el próximo negocio' : `Para los ${launch.spots} próximos negocios`} que contraten un pack. Incluye la tarjeta de reseñas QR + NFC y ${launch.months} meses de mantenimiento.`,
    terms: `Precios sin IGIC. Después, plan de mantenimiento a {plan}. No acumulable con otras promociones ni aplicable a servicios sueltos, extras o externalizados, que van a su precio normal.`,
    cta: 'Reserva tu plaza',
    whatsappText: `Hola, quiero aprovechar la oferta de lanzamiento del ${launch.percent} % en el pack`,
  },
  name: 'Alcance Isleño',
  title: 'Alcance Isleño | Tu escaparate digital: presencia digital para negocios de Tenerife',
  description:
    'Ficha de Google Business, reseñas, web con carta digital y hosting para cafeterías, bares, restaurantes, barberías y salones de belleza de Tenerife. Todo conectado y sin tecnicismos.',
  region: 'Tenerife',
  // Imagen de vista previa al compartir el enlace (WhatsApp, redes). 1200×630, en public/img/.
  // Se regenera con: npm run og-image (tras cambios visibles en la portada).
  ogImage: 'img/og.jpg',
  // Logo que lee Google en los datos estructurados (PNG cuadrado de 512 px, generado desde docs/marca/simbolo.svg).
  logo: 'img/logo.png',
  ogImageAlt: 'Alcance Isleño: tu escaparate digital. Carta digital en el móvil sobre una mesa de bar.',

  // Contacto. Las variables de entorno WHATSAPP_NUMBER y CONTACT_EMAIL, si existen, tienen prioridad.
  whatsappNumber: '34623243294', // con prefijo de país, solo dígitos
  phoneDisplay: '+34 623 24 32 94',
  email: 'info@alcanceisleno.com',
  instagram: 'alcanceisleno', // usuario de Instagram, sin @ (vacío para ocultarlo)
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
        { name: maintenanceName, text: maintenanceText },
        { name: 'Tarjeta de reseñas QR + NFC', text: 'Tus clientes dejan su reseña en Google o Tripadvisor en segundos.' },
      ],
      pack: 'main',
      // Opción (no se usa ahora): bloque "Servicios extra" bajo el pack, con { name, text, items }, donde
      // "items" son ids de extras.items. Si un sector no la define, el bloque no se muestra.
      cta: 'Pide información para tu local',
      whatsappText: 'Hola, tengo un bar, restaurante o cafetería y quiero información sobre el pack completo',
      demo: {
        business: 'Bar/Restaurante Isleño',
        label: 'Carta',
        items: [
          ['Papas con mojo', '4,50 €'],
          ['Queso asado', '6,00 €'],
          ['Carne de cabra', '12,00 €'],
          ['Vieja sancochada', '14,00 €'],
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
        { name: maintenanceName, text: maintenanceText },
      ],
      pack: { name: 'Pack negocios con cita previa', label: `Web, tarjeta de reseñas QR + NFC y ${maintenanceInPack}`, price: packPrice(420), ...regularPrice(420) },
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
      // "icon": dibujo propio de cada paso (JOURNEY_ICONS en src/views/landing.js), animado al entrar en pantalla.
      { moment: 'Te busca en Google', service: 'gbp', icon: 'google' },
      { moment: 'Mira tu carta o tus servicios', service: 'landing', icon: 'web' },
      { moment: 'Te deja una reseña', service: 'nfc', icon: 'nfc' },
    ],
    // {plan} se sustituye por los precios del plan de mantenimiento ("12 € al mes o 120 € al año").
    note: 'Y para que todo siga al día, nuestro plan de mantenimiento incluye hosting, dominio y hasta 2 cambios al mes (carta, servicios, precios, horarios o fotos) por {plan}. ' + (launch.active
      ? `Los packs de lanzamiento incluyen los ${launch.months} primeros meses.`
      : 'El primer año va incluido en los packs.'),
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
  stepsNote: 'Pagas el 50 % al empezar y el 50 % restante a la entrega.',


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
    price: packPrice(520),
    ...regularPrice(520),
  },
  pricesNote: 'Precios sin IGIC. Otros trabajos de imprenta y la fotografía profesional se presupuestan aparte.',

  // SERVICIOS EXTRA: fuera de la oferta de lanzamiento. Se muestran aparte del pack,
  // en cada pestaña y en la lista de precios.
  extrasTitle: 'Servicios extra',
  extrasNote: 'Se contratan aparte del pack.',
  extrasNoteLaunch: `No están incluidos en el pack ni en el descuento del ${launch.percent} %: se contratan aparte a su precio normal.`,

  // COMPLEMENTOS: aparecen en la lista de precios y, si un sector define "option", bajo su pack. Todo lo que no es digital se presupuesta aparte (outsourced).
  extras: {
    items: [
      {
        id: 'nfc',
        name: 'Tarjeta de reseñas QR + NFC',
        text: 'Tus clientes escanean el QR o acercan el móvil y dejan su reseña en Google o Tripadvisor en segundos, sin buscar nada.',
        price: '25 € / unidad',
      },
    ],
  },

  // SERVICIOS EXTERNALIZADOS: no son nuestro servicio principal (que es digital). Los gestionamos con
  // proveedores externos y se presupuestan a medida. Salen en las dos pestañas, fuera de la oferta.
  outsourced: {
    title: 'Servicios externalizados',
    note: 'Los gestionamos con proveedores externos y se presupuestan a medida.',
    quoteLabel: 'Pide presupuesto',
    quoteCta: 'Pedir presupuesto',
    items: [
      {
        id: 'diseno-tarjetas',
        name: 'Diseño personalizado de tarjetas de visita',
        text: 'Tus tarjetas con tu marca y a juego con tu web. Cuéntanos qué necesitas y te pasamos presupuesto sin compromiso.',
        whatsappText: 'Hola, quiero pedir presupuesto para el diseño personalizado de tarjetas de visita',
      },
      {
        id: 'pegatinas-qr',
        name: 'Pegatinas QR para mesas',
        text: 'Llevan a tus clientes a tu carta digital desde cada mesa. Dinos cuántas necesitas y te pasamos presupuesto sin compromiso.',
        whatsappText: 'Hola, quiero pedir presupuesto para pegatinas QR para las mesas de mi local',
        sectors: ['hosteleria'], // sin "sectors", sale en todas las pestañas
      },
    ],
  },

  // CON QUÉ TRABAJAMOS: plataformas y lenguajes con los que se monta la web, el hosting y el dominio.
  // "icon" elige el logotipo oficial (TECH_ICONS en src/views/landing.js; los dibujos están en src/views/logos.js).
  tech: {
    title: 'Con qué trabajamos',
    intro: 'Herramientas profesionales y abiertas para que tu web sea rápida, segura y siempre tuya.',
    items: [
      {
        icon: 'cloud', name: 'Cloudflare', role: 'Hosting y dominio',
        text: 'Alojamos tu web en la red de Cloudflare: carga rápido en cualquier móvil y con HTTPS. Allí también se configura tu dominio.',
      },
      {
        icon: 'git', name: 'GitHub', role: 'Código y publicación',
        text: 'Guardamos el código de tu web con todo su historial. Cada cambio se prueba y se publica de forma automática, y siempre se puede volver atrás.',
      },
    ],
    note: 'Cloudflare, GitHub, HTML5, CSS3 y JavaScript, y sus logotipos, son marcas de sus respectivos propietarios. Se muestran solo para indicar las tecnologías que utilizamos.',
    languages: {
      name: 'Lenguajes', role: 'Cómo está construida',
      text: 'Una web ligera hecha con los lenguajes estándar de la web: sin plantillas pesadas ni plugins que se queden obsoletos.',
      items: [
        { icon: 'html', label: 'HTML' },
        { icon: 'css', label: 'CSS' },
        { icon: 'js', label: 'JavaScript' },
      ],
    },
  },

  // TRABAJOS: galería de webs, cartas y tarjetas ya hechas. Sin elementos, la sección no se muestra ni sale en el menú.
  // Guarda cada imagen en public/img/trabajos/ en dos versiones, NOMBRE.webp y NOMBRE.jpg, y añade
  // { img: 'img/trabajos/NOMBRE', width, height, fit, alt, title, description } (img sin extensión; width y height son los
  // píxeles reales). Todas se muestran en un marco del mismo tamaño: fit 'contain' (entera, con bandas) o 'cover' (rellena el marco).
  // Solo con trabajos reales y con permiso del cliente.
  //
  // PENDIENTE: la galería de Memphis Belle Coctelería está OCULTA hasta que el cliente dé el visto bueno y pague el trabajo.
  // Las imágenes esperan en docs/trabajos-pendientes/memphis-belle/ (fuera de public/, así no se publican). Para mostrarla:
  //   1. git mv docs/trabajos-pendientes/memphis-belle/* public/img/trabajos/
  //   2. poner TRABAJOS_AUTORIZADOS en true (justo debajo de esta sección) y publicar.
  works: {
    title: 'Trabajos',
    intro: 'Webs, cartas y tarjetas que ya funcionan en negocios de la isla. Ejemplo: Memphis Belle Coctelería, en Santa Cruz de Tenerife.',
    items: TRABAJOS_AUTORIZADOS ? TRABAJOS_MEMPHIS_BELLE : [],
  },

  // LLAMADA FINAL tras "Así trabajamos": para quien ya ha leído cómo se trabaja y está listo para escribir.
  closing: {
    title: '¿Empezamos con tu diagnóstico?',
    text: 'Cuéntanos tu negocio por WhatsApp y te decimos qué necesitas. Sin compromiso y con respuesta en menos de 24 horas.',
    cta: 'Pide tu diagnóstico gratuito',
    whatsappText: 'Hola, me gustaría pedir el diagnóstico gratuito para mi negocio',
  },
  // Botón fijo de WhatsApp en móvil, siempre al alcance del pulgar.
  floatingCta: 'Escribir por WhatsApp',

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
    lastUpdated: '8 de octubre de 2026',
  },
};
