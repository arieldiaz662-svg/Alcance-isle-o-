import QRCode from 'qrcode';

import { contact, esc, layout, links, whatsappUrl } from './html.js';

// Código QR real en SVG, generado al construir la página (sin JavaScript en el navegador).
// Nivel de corrección M: aguanta bien la rotación y el brillo de una pantalla.
function qrSvg(text) {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const { size, data } = modules;
  let path = '';
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (data[y * size + x]) path += `M${x} ${y}h1v1h-1z`;
    }
  }
  return `<svg class="qr" viewBox="-1 -1 ${size + 2} ${size + 2}" shape-rendering="crispEdges" aria-hidden="true"><path d="${path}"/></svg>`;
}

export function renderLanding({ site, config }) {
  const { whatsapp, phoneDisplay, email } = contact(site, config);
  const to = links(config);
  const wa = whatsappUrl(whatsapp, site.whatsappGreeting);
  const team = site.team.filter((person) => person.name && person.name.trim());
  const { extras, pack, demoMenu, journey, hero } = site;

  const nav = [
    { id: 'servicios', label: 'Servicios' },
    { id: 'por-que', label: 'Por qué elegirnos' },
    { id: 'precios', label: 'Precios' },
    ...(team.length ? [{ id: 'equipo', label: 'Equipo' }] : []),
  ];

  const allServices = [...site.services, ...(extras ? extras.items : [])];
  const serviceById = Object.fromEntries(allServices.map((service) => [service.id, service]));
  const priceOf = (service) => service.price || (service.prices && service.prices[0].price) || '';

  const serviceOptions = allServices
    .map((service) => `<option value="${esc(service.id)}">${esc(service.name)}</option>`).join('');

  // ---------- Portada: la mesa ----------
  const qrUrl = whatsappUrl(whatsapp, demoMenu.qrWhatsappText);
  const menuTabs = demoMenu.sections.map((section, i) => `
            <button type="button" role="tab" id="carta-tab-${i}" aria-controls="carta-panel-${i}" aria-selected="${i === 0}"${i === 0 ? '' : ' tabindex="-1"'}>${esc(section.name)}</button>`).join('');
  const menuPanels = demoMenu.sections.map((section, i) => `
          <ul class="carta-lista" role="tabpanel" id="carta-panel-${i}" aria-labelledby="carta-tab-${i}"${i === 0 ? '' : ' hidden'}>${section.items.map(([name, price]) => `
            <li><span>${esc(name)}</span><span class="guia" aria-hidden="true"></span><span>${esc(price)}</span></li>`).join('')}
          </ul>`).join('');

  const heroSection = `
<div class="mesa" id="inicio">
  <div class="wrap mesa-grid">
    <div class="mesa-texto">
      <h1>${esc(hero.title)}</h1>
      <p class="lead">${esc(hero.lead)}</p>
      <div class="acciones">
        <a class="btn btn-sol" href="${esc(whatsappUrl(whatsapp, hero.ctaWhatsappText))}" rel="noopener" target="_blank">${esc(hero.cta)}</a>
        <a class="btn btn-linea" href="#precios">Ver precios</a>
      </div>
      <p class="mesa-nota">${esc(hero.note)}</p>
    </div>

    <figure class="bodegon">
      <div class="movil">
        <div class="carta" role="group" aria-label="Ejemplo de carta digital de ${esc(demoMenu.business)}">
          <div class="carta-cab">
            <strong>${esc(demoMenu.business)}</strong>
            <span>${esc(demoMenu.table)}</span>
          </div>
          <div class="carta-tabs" role="tablist" aria-label="Secciones de la carta">${menuTabs}
          </div>${menuPanels}
          <div class="carta-pie">
            <span class="carta-boton">Dejar una reseña</span>
            <span class="carta-boton carta-boton-wa">Pedir por WhatsApp</span>
          </div>
        </div>
      </div>
      <a class="expositor" href="${esc(qrUrl)}" rel="noopener" target="_blank" aria-label="${esc(demoMenu.qrLabel)}">
        ${qrSvg(qrUrl)}
        <span>${esc(demoMenu.qrCaption)}</span>
      </a>
      <div class="barraquito" aria-hidden="true"><div class="vaso"><i></i><i></i><i></i><i></i><i></i></div></div>
      <figcaption>${esc(demoMenu.caption)}</figcaption>
    </figure>
  </div>
</div>`;

  // ---------- Recorrido del cliente (servicios) ----------
  const journeySection = `
<section class="recorrido" id="servicios">
  <div class="wrap">
    <h2>${esc(journey.title)}</h2>
    <ol class="recorrido-pasos">${journey.steps.map((step) => {
      const service = serviceById[step.service];
      return `
      <li>
        <h3>${esc(step.moment)}</h3>
        <p class="recorrido-servicio">${esc(service.name)} <span>${esc(priceOf(service))}</span></p>
        <p>${esc(service.text)}</p>
      </li>`;
    }).join('')}
    </ol>
    <p class="recorrido-nota">${esc(journey.note)}</p>
  </div>
</section>`;

  // ---------- Para tu local ----------
  const img = extras && extras.image;
  const extrasSection = extras ? `
<section class="local" id="local">
  <div class="wrap local-grid">
    <figure class="local-foto">
      <picture>
        <source type="image/webp" srcset="${esc(to.asset(`${img.small}.webp`))} 480w, ${esc(to.asset(`${img.src}.webp`))} 800w" sizes="(max-width: 860px) 100vw, 420px">
        <img src="${esc(to.asset(`${img.src}.jpg`))}" srcset="${esc(to.asset(`${img.small}.jpg`))} 480w, ${esc(to.asset(`${img.src}.jpg`))} 800w" sizes="(max-width: 860px) 100vw, 420px" alt="${esc(img.alt)}" width="800" height="800" loading="lazy" decoding="async">
      </picture>
      ${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ''}
    </figure>
    <div>
      <h2>${esc(extras.title)}</h2>
      <p>${esc(extras.text)}</p>
      <ul class="local-lista">${extras.items.map((item) => `
        <li>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.text)}</p>
          <span class="local-precio">${esc(item.price)}</span>
        </li>`).join('')}
      </ul>
      <a class="btn btn-linea" href="${esc(whatsappUrl(whatsapp, extras.whatsappText))}" rel="noopener" target="_blank">Pregúntanos por WhatsApp</a>
    </div>
  </div>
</section>` : '';

  // ---------- Por qué elegirnos ----------
  const whySection = `
<section class="porque" id="por-que">
  <div class="wrap porque-grid">
    <div>
      <h2>${esc(site.whyUs.title)}</h2>
      <p class="porque-intro">${esc(site.whyUs.intro)}</p>
      <p class="suave">${esc(site.whyUs.team)}</p>
    </div>
    <dl class="motivos">${site.whyUs.reasons.map((reason) => `
      <div>
        <dt>${esc(reason.title)}</dt>
        <dd>${esc(reason.text)}</dd>
      </div>`).join('')}
    </dl>
  </div>
</section>`;

  // ---------- Cómo trabajamos ----------
  const stepsSection = `
<section class="como" id="como">
  <div class="wrap">
    <h2>Así trabajamos</h2>
    <ol class="pasos">${site.steps.map((step) => `
      <li><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></li>`).join('')}
    </ol>
    <p class="suave">${esc(site.stepsNote)}</p>
  </div>
</section>`;

  // ---------- Precios: como la carta de una cafetería ----------
  const priceRow = (label, price) => `
          <li><span>${esc(label)}</span><span class="guia" aria-hidden="true"></span><span class="importe">${esc(price)}</span></li>`;
  const priceGroups = [
    { title: 'Servicios digitales', rows: site.services.flatMap((s) => s.prices || [{ label: s.priceLabel || s.name, price: s.price }]) },
    ...(extras ? [{ title: 'Para tu local', rows: extras.items.map((i) => ({ label: i.name, price: i.price })) }] : []),
  ];
  const pricesSection = `
<section class="precios" id="precios">
  <div class="wrap">
    <h2>Precios</h2>
    <p class="suave">Contrata cada servicio por separado o todo junto.</p>
    <div class="carta-precios">${pack ? `
      <div class="pack">
        <h3>${esc(pack.name)}</h3>
        <p>${esc(pack.text)}</p>
        <p class="pack-precio">${pack.was ? `<s>${esc(pack.was)}</s> ` : ''}<strong>${esc(pack.price)}</strong></p>
      </div>` : ''}${priceGroups.map((group) => `
      <div class="carta-grupo">
        <h3>${esc(group.title)}</h3>
        <ul>${group.rows.map((row) => priceRow(row.label, row.price)).join('')}
        </ul>
      </div>`).join('')}
      <p class="precios-nota">${esc(site.pricesNote)}</p>
    </div>
  </div>
</section>`;

  // ---------- Equipo ----------
  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const teamSection = team.length ? `
<section class="equipo" id="equipo">
  <div class="wrap">
    <h2>Quiénes somos</h2>
    <div class="equipo-grid">${team.map((person) => `
      <div class="persona">
        <div class="foto">${person.photo
          ? `<img src="${esc(to.asset(person.photo))}" alt="${esc(person.name)}" loading="lazy" width="400" height="400">`
          : esc(initials(person.name))}</div>
        <strong>${esc(person.name)}</strong>
        ${person.role ? `<span class="suave">${esc(person.role)}</span>` : ''}
      </div>`).join('')}
    </div>
  </div>
</section>` : '';

  const body = `<main>
${heroSection}
${journeySection}
${extrasSection}
${whySection}
${stepsSection}
${pricesSection}
${teamSection}
<section class="contacto" id="contacto">
  <div class="wrap contacto-grid">
    <div>
      <h2>¿Hablamos?</h2>
      <p>Cuéntanos qué necesitas y te respondemos en menos de 24 horas.</p>
      <p><a class="btn btn-sol" href="${esc(wa)}" rel="noopener" target="_blank">Escribir por WhatsApp</a></p>
      <p class="contacto-datos">Trabajamos en ${esc(site.region)}.${phoneDisplay ? `<br>
      Teléfono: <a href="tel:+${esc(whatsapp)}">${esc(phoneDisplay)}</a>` : ''}${email ? `<br>
      Email: <a href="mailto:${esc(email)}">${esc(email)}</a>` : ''}</p>
    </div>

    <form id="formulario" novalidate data-whatsapp="${esc(whatsapp)}" data-mode="${config.static ? 'whatsapp' : 'api'}">
      ${config.static ? whatsappFormFields(to) : apiFormFields(to, serviceOptions, wa)}
      <noscript><p class="form-error">Para enviar el formulario necesitas JavaScript. También puedes escribirnos por <a href="${esc(wa)}">WhatsApp</a>.</p></noscript>
    </form>
  </div>
</section>

</main>`;

  return layout({
    site, config, title: site.title, description: site.description, path: '/', nav, body,
    scripts: ['js/site.js'],
  });
}

// Versión estática: sin servidor, el formulario compone el mensaje y abre WhatsApp.
function whatsappFormFields(to) {
  return `<label>Nombre *
        <input type="text" name="name" autocomplete="name" required maxlength="80">
      </label>
      <label>Tipo de negocio
        <input type="text" name="business_type" maxlength="80" placeholder="Peluquería, restaurante, tienda...">
      </label>
      <label>¿Qué necesitas?
        <textarea name="message" maxlength="1000" placeholder="Cuéntanos en pocas palabras"></textarea>
      </label>
      <p class="form-error" id="form-error" role="alert" hidden></p>
      <p class="legal-form">Al enviar se abrirá WhatsApp con tu mensaje ya escrito; tú decides si lo mandas. Usaremos tus datos solo para responderte. Más información en la <a href="${to.privacy}">política de privacidad</a>.</p>
      <button class="btn btn-sol btn-full" type="submit">Enviar por WhatsApp</button>`;
}

// Versión con servidor: guarda el lead en la base de datos y después ofrece seguir por WhatsApp.
function apiFormFields(to, serviceOptions, wa) {
  return `<div id="form-campos">
        <label>Nombre *
          <input type="text" name="name" autocomplete="name" required minlength="2" maxlength="80">
        </label>
        <label>Teléfono / WhatsApp *
          <input type="tel" name="phone" autocomplete="tel" inputmode="tel" required maxlength="30" placeholder="600 000 000">
        </label>
        <label>Email (opcional)
          <input type="email" name="email" autocomplete="email" maxlength="120">
        </label>
        <label>Tipo de negocio
          <input type="text" name="business_type" maxlength="80" placeholder="Peluquería, restaurante, tienda...">
        </label>
        <label>¿Qué te interesa?
          <select name="service">
            <option value="">Elige una opción</option>
            ${serviceOptions}
            <option value="varios">Varios servicios</option>
            <option value="no-se">Aún no lo sé</option>
          </select>
        </label>
        <label>¿Qué necesitas?
          <textarea name="message" maxlength="1000" placeholder="Cuéntanos en pocas palabras"></textarea>
        </label>
        <label class="trampa" aria-hidden="true">No rellenar
          <input type="text" name="website" tabindex="-1" autocomplete="off">
        </label>
        <label class="consentimiento">
          <input type="checkbox" name="consent" required>
          <span>He leído la <a href="${to.privacy}" target="_blank">política de privacidad</a> y acepto que usen mis datos para responder a mi solicitud. *</span>
        </label>
        <p class="form-error" id="form-error" role="alert" hidden></p>
        <button class="btn btn-sol btn-full" type="submit">Enviar solicitud</button>
      </div>
      <div id="form-ok" class="form-ok" hidden tabindex="-1">
        <h3>¡Recibido!</h3>
        <p>Te contactaremos en menos de 24 horas. Si lo prefieres, puedes adelantarlo por WhatsApp:</p>
        <a class="btn btn-sol btn-full" id="form-ok-whatsapp" href="${esc(wa)}" rel="noopener" target="_blank">Continuar en WhatsApp</a>
      </div>`;
}
