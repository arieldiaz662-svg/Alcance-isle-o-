import { esc, layout } from './html.js';

// PLANTILLAS ORIENTATIVAS. Deben revisarse con un profesional antes de publicar la web.

function page({ site, config, path, title, sections }) {
  const { legal } = site;
  const body = `<main class="pagina-simple legal"><div class="wrap">
  <h1>${esc(title)}</h1>
  <p class="suave">Última actualización: ${esc(legal.lastUpdated)}</p>
  ${sections.map(([heading, text]) => `<h2>${esc(heading)}</h2>\n  ${text}`).join('\n  ')}
</div></main>`;
  return layout({ site, config, title: `${title} | ${site.name}`, description: `${title} de ${site.name}.`, path, body });
}

export function renderLegalNotice({ site, config }) {
  const { legal } = site;
  return page({
    site, config, path: '/aviso-legal', title: 'Aviso legal',
    sections: [
      ['Titular del sitio web', `<p>En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que este sitio web es titularidad de <strong>${esc(legal.owner)}</strong>, con NIF/CIF ${esc(legal.taxId)} y domicilio en ${esc(legal.address)}. ${esc(legal.registry)}.</p>
  <p>Contacto: ${config.contactEmail ? `<a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a>` : '[EMAIL DE CONTACTO]'}.</p>`],
      ['Objeto', `<p>Este sitio web ofrece información sobre los servicios de ${esc(site.name)}: tarjetas NFC de reseñas, configuración de fichas de Google Business Profile y creación de landing pages para negocios locales.</p>`],
      ['Propiedad intelectual', '<p>Los textos, diseños y logotipos de este sitio web son propiedad de su titular o se usan con autorización. No se permite su reproducción sin consentimiento previo.</p>'],
      ['Responsabilidad', '<p>El titular no se hace responsable del uso que terceros hagan de la información publicada ni de los contenidos de sitios web externos enlazados.</p>'],
      ['Legislación aplicable', '<p>Este aviso legal se rige por la legislación española.</p>'],
    ],
  });
}

export function renderPrivacy({ site, config }) {
  const { legal } = site;
  const email = config.contactEmail ? esc(config.contactEmail) : '[EMAIL DE CONTACTO]';
  return page({
    site, config, path: '/privacidad', title: 'Política de privacidad',
    sections: [
      ['Responsable del tratamiento', `<p>${esc(legal.owner)} (NIF/CIF ${esc(legal.taxId)}), ${esc(legal.address)}. Email: ${email}.</p>`],
      ['Qué datos tratamos', '<p>Los que nos facilitas en el formulario de contacto: nombre, teléfono, email (opcional), tipo de negocio y el mensaje que escribas. También la fecha en la que aceptas esta política.</p>'],
      ['Para qué los usamos', '<p>Únicamente para responder a tu solicitud y, en su caso, preparar y gestionar el presupuesto o servicio que nos pidas. No enviamos publicidad ni tomamos decisiones automatizadas.</p>'],
      ['Base legal', '<p>Tu consentimiento al enviar el formulario (art. 6.1.a RGPD) y, si contratas, la ejecución del contrato (art. 6.1.b RGPD).</p>'],
      ['Cuánto tiempo los guardamos', '<p>Si no llegas a contratar, eliminamos tus datos en un plazo máximo de 12 meses. Si contratas, durante la relación comercial y los plazos legales de conservación.</p>'],
      ['Con quién los compartimos', '<p>No cedemos tus datos a terceros salvo obligación legal. Usamos un proveedor de alojamiento web que actúa como encargado del tratamiento. Si decides escribirnos por WhatsApp, se aplicarán además las condiciones de WhatsApp.</p>'],
      ['Tarjetas NFC', '<p>Cuando alguien usa una tarjeta NFC de reseñas, registramos solo la fecha y el tipo de navegador para ofrecer estadísticas de uso al negocio. No guardamos la dirección IP ni datos que identifiquen a la persona.</p>'],
      ['Tus derechos', `<p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${email}. Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>).</p>`],
    ],
  });
}

export function renderCookies({ site, config }) {
  return page({
    site, config, path: '/cookies', title: 'Política de cookies',
    sections: [
      ['Qué cookies usamos', `<p>La web pública de ${esc(site.name)} no utiliza cookies de analítica ni de publicidad. Por eso no te mostramos un aviso de cookies.</p>`],
      ['Cookies técnicas', '<p>Solo el panel interno de administración usa una cookie técnica de sesión (<code>ai_session</code>) para mantener iniciada la sesión del equipo. Es estrictamente necesaria y está exenta de consentimiento.</p>'],
      ['Servicios de terceros', '<p>Las tipografías se cargan desde Google Fonts, que puede recibir tu dirección IP al descargarlas. Si añadimos otras herramientas en el futuro, actualizaremos esta política.</p>'],
    ],
  });
}
