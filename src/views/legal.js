import { contact, esc, layout } from './html.js';

// PLANTILLAS ORIENTATIVAS. Deben revisarse con un profesional antes de publicar la web.

// Cómo contactar al titular: email si existe; si no, teléfono.
function contactLine(site, config) {
  const { email, phoneDisplay, whatsapp } = contact(site, config);
  if (email) return `<a href="mailto:${esc(email)}">${esc(email)}</a>`;
  if (phoneDisplay) return `<a href="tel:+${esc(whatsapp)}">${esc(phoneDisplay)}</a> (teléfono y WhatsApp)`;
  return '[EMAIL DE CONTACTO]';
}

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
  <p>Contacto: ${contactLine(site, config)}.</p>`],
      ['Objeto', `<p>Este sitio web ofrece información sobre los servicios de ${esc(site.name)}: tarjetas NFC de reseñas, configuración de fichas de Google Business Profile y creación de landing pages para negocios locales.</p>`],
      ['Propiedad intelectual', '<p>Los textos, diseños y logotipos de este sitio web son propiedad de su titular o se usan con autorización. No se permite su reproducción sin consentimiento previo.</p>'],
      ['Responsabilidad', '<p>El titular no se hace responsable del uso que terceros hagan de la información publicada ni de los contenidos de sitios web externos enlazados.</p>'],
      ['Legislación aplicable', '<p>Este aviso legal se rige por la legislación española.</p>'],
    ],
  });
}

export function renderPrivacy({ site, config }) {
  const { legal } = site;
  const reach = contactLine(site, config);
  const sections = [
    ['Responsable del tratamiento', legal.owner
      ? `<p>${esc(legal.owner)} (NIF/CIF ${esc(legal.taxId)}), ${esc(legal.address)}. Contacto: ${reach}.</p>`
      : `<p>${esc(site.name)}, ${esc(site.region)}. Contacto: ${reach}.</p>`],
  ];

  sections.push(
    ['Qué datos tratamos', '<p>Esta web no guarda ningún dato. El formulario de contacto solo prepara un mensaje de WhatsApp en tu dispositivo: nos llega únicamente si tú decides enviarlo. En ese caso tratamos tu nombre, tu número de teléfono y lo que nos escribas.</p>'],
    ['Para qué los usamos', '<p>Únicamente para responder a tu consulta y, si te interesa, preparar un presupuesto. No enviamos publicidad ni tomamos decisiones automatizadas.</p>'],
    ['Base legal', '<p>Tu consentimiento al escribirnos (art. 6.1.a RGPD) y, si contratas, la ejecución del contrato (art. 6.1.b RGPD).</p>'],
    ['Cuánto tiempo los guardamos', '<p>Si no llegas a contratar, borramos la conversación en un plazo máximo de 12 meses. Si contratas, durante la relación comercial y los plazos legales de conservación.</p>'],
    ['Con quién los compartimos', '<p>No cedemos tus datos a terceros salvo obligación legal. Al usar WhatsApp se aplican además las condiciones y la política de privacidad de WhatsApp (Meta).</p>'],
  );

  sections.push(['Tus derechos', `<p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiéndonos a ${reach}. Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>).</p>`]);

  return page({ site, config, path: '/privacidad', title: 'Política de privacidad', sections });
}

export function renderCookies({ site, config }) {
  const sections = [
    ['Qué cookies usamos', `<p>La web de ${esc(site.name)} no utiliza cookies de ningún tipo, y las tipografías se sirven desde nuestro propio alojamiento. Por eso no te mostramos un aviso de cookies.</p>`],
    ['Enlaces externos', '<p>Al pulsar los botones de WhatsApp sales de esta web; desde ese momento se aplica la política de cookies de WhatsApp.</p>'],
  ];
  return page({ site, config, path: '/cookies', title: 'Política de cookies', sections });
}
