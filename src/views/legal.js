import { contact, esc, escPhone, layout } from './html.js';

// PLANTILLAS ORIENTATIVAS. Deben revisarse con un profesional antes de publicar la web.

// Cómo contactar al titular: email si existe; si no, teléfono.
function contactLine(site, config) {
  const { email, phoneDisplay, whatsapp } = contact(site, config);
  if (email) return `<a href="mailto:${esc(email)}">${esc(email)}</a>`;
  if (phoneDisplay) return `<a href="tel:+${esc(whatsapp)}">${escPhone(phoneDisplay)}</a> (teléfono y WhatsApp)`;
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
      ['Objeto', `<p>Este sitio web ofrece información sobre los servicios de ${esc(site.name)}: tarjetas de reseñas QR + NFC, configuración de fichas de Google Business Profile y creación de landing pages para negocios locales.</p>`],
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
    ['Qué datos tratamos', '<p>Esta web no guarda ningún dato por su cuenta: no tiene formularios que almacenen información, ni cuentas de usuario, ni analítica, ni publicidad. El formulario de contacto solo prepara un mensaje de WhatsApp en tu dispositivo: nos llega únicamente si tú decides enviarlo. En ese caso tratamos los datos que nos facilites: tu nombre, tu número de teléfono y lo que nos escribas, y los datos del negocio que nos pases si pides información o un presupuesto.</p>'],
    ['Datos técnicos de la visita', '<p>Para servir la web, el proveedor de alojamiento (Cloudflare, Inc.) recibe de forma automática datos técnicos de tu conexión, como la dirección IP, el navegador y la fecha y hora de la visita. Los usa para entregar la página y garantizar su seguridad; nosotros no accedemos a un registro individual de visitantes ni lo usamos para identificarte. Cloudflare puede tratar estos datos fuera del Espacio Económico Europeo con las garantías previstas en el RGPD (cláusulas contractuales tipo o decisión de adecuación).</p>'],
    ['Para qué los usamos', '<p>Únicamente para responder a tu consulta, preparar un presupuesto y, si contratas, prestar el servicio y facturarlo. No enviamos publicidad que no hayas pedido, no elaboramos perfiles y no tomamos decisiones automatizadas.</p>'],
    ['Base legal', '<p>Tu consentimiento al escribirnos (art. 6.1.a RGPD); la aplicación de medidas precontractuales a petición tuya y, si contratas, la ejecución del contrato (art. 6.1.b RGPD); el cumplimiento de obligaciones legales, como las fiscales y contables (art. 6.1.c RGPD); y, para los datos técnicos de la visita, el interés legítimo en el funcionamiento y la seguridad de la web (art. 6.1.f RGPD).</p>'],
    ['Cuánto tiempo los guardamos', '<p>Si no llegas a contratar, borramos la conversación en un plazo máximo de 12 meses. Si contratas, durante la relación comercial y después, bloqueados, durante los plazos legales de conservación (en general, hasta 6 años para la documentación mercantil y contable).</p>'],
    ['Con quién los compartimos', '<p>No vendemos ni cedemos tus datos a terceros salvo obligación legal. Intervienen como proveedores (encargados del tratamiento): Cloudflare, para el alojamiento de la web, y WhatsApp (Meta Platforms Ireland Ltd.), que es el canal que eliges para escribirnos y cuyas condiciones y política de privacidad se aplican además a esa conversación. Si contratas, podemos necesitar acceder a tu ficha de Google Business para configurarla, siempre con tu autorización y solo para ese fin.</p>'],
    ['Menores', '<p>Esta web se dirige a profesionales y titulares de negocios. No recogemos conscientemente datos de menores de 14 años.</p>'],
  );

  sections.push(
    ['Tus derechos', `<p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, y retirar tu consentimiento en cualquier momento, escribiéndonos a ${reach}. Responderemos en el plazo de un mes. Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>).</p>`],
    ['Cambios en esta política', `<p>Si cambiamos la forma de tratar tus datos, actualizaremos esta página y su fecha. Última revisión: ${esc(site.legal.lastUpdated)}.</p>`],
  );

  return page({ site, config, path: '/privacidad', title: 'Política de privacidad', sections });
}

export function renderCookies({ site, config }) {
  const sections = [
    ['Qué son las cookies', '<p>Las cookies son pequeños archivos que una web guarda en tu dispositivo para recordarte o medir tu actividad. También existen tecnologías parecidas, como el almacenamiento local del navegador.</p>'],
    ['Qué cookies usamos', `<p>La web de ${esc(site.name)} <strong>no utiliza cookies ni tecnologías similares</strong> en tu dispositivo: ni propias ni de terceros, ni técnicas, de análisis o de publicidad. No guardamos nada en tu navegador. Las tipografías se sirven desde nuestro propio alojamiento y no cargamos recursos de terceros.</p>
  <p>Por eso, conforme al artículo 22.2 de la LSSI-CE, no te mostramos un aviso de cookies ni te pedimos que las aceptes.</p>`],
    ['Enlaces externos', '<p>Al pulsar los botones de WhatsApp o los enlaces a otras webs sales de este sitio; desde ese momento se aplican la política de cookies y de privacidad de cada servicio.</p>'],
    ['Si esto cambia', '<p>Si en el futuro añadimos algún servicio que use cookies (por ejemplo, estadísticas), te lo pediremos antes con un aviso que puedas aceptar o rechazar, y actualizaremos esta página.</p>'],
    ['Cómo gestionar las cookies', '<p>Aunque esta web no las usa, puedes bloquear o borrar las de otros sitios desde la configuración de tu navegador.</p>'],
  ];
  return page({ site, config, path: '/cookies', title: 'Política de cookies', sections });
}
