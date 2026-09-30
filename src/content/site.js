// CONTENIDO EDITABLE DE LA WEB.
// Cambia aquí textos, precios y equipo. El número de WhatsApp y el email van en las variables de entorno.

export const site = {
  name: 'Alcance Isleño',
  title: 'Alcance Isleño | Escaparate digital para negocios de Tenerife',
  description:
    'Reseñas en Google, ficha de negocio optimizada y landing pages para pequeños negocios de Tenerife. Tu escaparate digital, sin tecnicismos.',
  region: 'Tenerife',
  whatsappGreeting: 'Hola, quiero información sobre Alcance Isleño',

  // El "id" se usa en el formulario y en los leads guardados. No lo cambies una vez en producción.
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
      // REVISAR: "desde 4 €" parece un error tipográfico y resta credibilidad al servicio.
      price: 'desde 4 €',
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

  // Rellena "name" (y opcionalmente "role" y "photo", p. ej. "/assets/img/equipo/ana.jpg").
  // Si ninguna persona tiene nombre, la sección "Quiénes somos" no se muestra.
  team: [
    { name: '', role: '', photo: '' },
    { name: '', role: '', photo: '' },
    { name: '', role: '', photo: '' },
  ],

  // Datos del titular para los textos legales (LSSI-CE y RGPD). Obligatorio rellenarlos antes de publicar.
  legal: {
    owner: '[NOMBRE O RAZÓN SOCIAL]',
    taxId: '[NIF/CIF]',
    address: '[DIRECCIÓN POSTAL], Tenerife',
    registry: '[DATOS REGISTRALES, si es sociedad]',
    lastUpdated: '30 de septiembre de 2026',
  },
};
