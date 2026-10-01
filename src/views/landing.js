import QRCode from 'qrcode';

import { contact, esc, layout, links, whatsappUrl } from './html.js';
import { structuredData } from './schema.js';

// Código QR real en SVG, generado al construir la página (sin JavaScript en el navegador).
// Nivel de corrección M: aguanta bien la rotación y el brillo de una pantalla.
// Cada tramo de módulos seguidos de una fila es un solo rectángulo, un poco solapado con sus vecinos
// (QR_SOLAPE): así, aunque el expositor esté girado y cada módulo mida 2-3 px, el navegador lo dibuja
// suavizado, con módulos iguales y sin rayas claras entre filas. Con shape-rendering="crispEdges" cada
// módulo se redondeaba a píxeles enteros por separado y el QR salía escalonado en el móvil.
export const QR_SOLAPE = 0.04;
export function qrSvg(text) {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const { size, data } = modules;
  let path = '';
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!data[y * size + x]) continue;
      let run = 1;
      while (x + run < size && data[y * size + x + run]) run += 1;
      path += `M${x - QR_SOLAPE} ${y - QR_SOLAPE}h${run + 2 * QR_SOLAPE}v${1 + 2 * QR_SOLAPE}h${-(run + 2 * QR_SOLAPE)}z`;
      x += run - 1;
    }
  }
  return `<svg class="qr" viewBox="-1 -1 ${size + 2} ${size + 2}" aria-hidden="true"><path d="${path}"/></svg>`;
}

// Lista de precios por grupos (sin el pack principal, que se muestra destacado). La usan la sección de
// precios y los datos estructurados para Google, así que siempre coinciden.
export function priceList(site) {
  const { extras, sectors } = site;
  return [
    { title: 'Servicios digitales', rows: site.services.flatMap((s) => s.prices || [{ label: s.priceLabel || s.name, price: s.price }]) },
    ...(extras ? [{ title: 'Material para tu local', rows: extras.items.map((i) => ({ label: i.name, price: i.price })) }] : []),
    // Packs propios de cada tipo de negocio (el de hostelería ya aparece destacado arriba).
    ...(sectors || []).filter((sector) => sector.pack !== 'main').map((sector) => ({
      title: sector.title,
      rows: [
        { label: `${sector.pack.name} (${sector.pack.label.charAt(0).toLowerCase()}${sector.pack.label.slice(1)}${sector.hostingNote ? '; hosting aparte' : ''})`, price: sector.pack.price },
        ...(sector.option ? [{ label: `${sector.option.name} (opcional)`, price: sector.option.price }] : []),
      ],
    })),
  ];
}

export function renderLanding({ site, config }) {
  const { whatsapp, phoneDisplay, email } = contact(site, config);
  const to = links(config);
  const wa = whatsappUrl(whatsapp, site.whatsappGreeting);
  const team = site.team.filter((person) => person.name && person.name.trim());
  const { extras, pack, demoMenu, journey, hero, sectors } = site;

  const nav = [ // mismo orden que las secciones de la página
    ...(sectors ? [{ id: 'packs', label: 'Packs' }] : []),
    { id: 'servicios', label: 'Servicios' },
    { id: 'por-que', label: 'Por qué elegirnos' },
    { id: 'precios', label: 'Precios' },
    ...(team.length ? [{ id: 'equipo', label: 'Equipo' }] : []),
  ];

  const allServices = [...site.services, ...(extras ? extras.items : [])];
  const serviceById = Object.fromEntries(allServices.map((service) => [service.id, service]));
  const priceOf = (service) => service.price || (service.prices && service.prices[0].price) || '';

  // Tarifa anual de hosting (primera fila de precios del servicio "hosting").
  const hostingRow = serviceById.hosting && serviceById.hosting.prices ? serviceById.hosting.prices[0] : null;
  // Lo que incluye el pack completo se describe a partir de la pestaña que lo usa (sin repetir textos).
  const mainSector = (sectors || []).find((sector) => sector.pack === 'main');
  const packText = mainSector
    ? `${mainSector.includes.filter((i) => !i.badge).map((i, n) => (n ? i.name.charAt(0).toLowerCase() + i.name.slice(1) : i.name)).join(' + ')}.${mainSector.includes.filter((i) => i.badge)
      .map((i) => ` ${i.name}: ${i.badge.toLowerCase()}.`).join('')}`
    : '';

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
    <p class="recorrido-nota">${esc(journey.note.replace('{hosting}', hostingRow ? hostingRow.price.replace(' / año', ' al año') : ''))}</p>
  </div>
</section>`;

  // Imagen del material para mesas (se muestra en la opción de la pestaña de hostelería).
  const img = extras && extras.image;
  const extraById = Object.fromEntries((extras ? extras.items : []).map((item) => [item.id, item]));

  // ---------- Packs por tipo de negocio (pestañas) ----------
  const packOf = (sector) => (sector.pack === 'main' ? pack : sector.pack);
  const nfcIcon = `<svg class="nfc" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 7.5a6 6 0 0 1 0 9M12 5a9.5 9.5 0 0 1 0 14M15.5 2.5a13 13 0 0 1 0 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="5" cy="12" r="1.8" fill="currentColor"/></svg>`;

  const sectorPanel = (sector, i) => {
    const sectorPack = packOf(sector);
    return `
    <div class="sector-panel" role="tabpanel" id="${esc(sector.id)}" aria-labelledby="tab-${esc(sector.id)}">
      <figure class="mostrador">
        <div class="movil movil-suelto" aria-hidden="true">
          <div class="carta">
            <div class="carta-cab">
              <strong>${esc(sector.demo.business)}</strong>
              <span>${esc(sector.demo.label)}</span>
            </div>
            <ul class="carta-lista">${sector.demo.items.map(([name, price]) => `
              <li><span>${esc(name)}</span><span class="guia"></span><span>${esc(price)}</span></li>`).join('')}
            </ul>
            <div class="carta-pie">
              <span class="carta-boton carta-boton-wa">${esc(sector.demo.button)}</span>
            </div>
          </div>
        </div>
        <div class="tarjeta-nfc" aria-hidden="true">
          ${nfcIcon}
          <span class="estrellas">★★★★★</span>
          <strong>${esc(sector.demo.card)}</strong>
        </div>
        <figcaption>${esc(sector.demo.caption)}</figcaption>
      </figure>
      <div>
        <h3 class="sector-titulo">${esc(sector.title)}</h3>
        <p class="sector-intro">${esc(sector.intro)}</p>
        <ul class="local-lista">${sector.includes.map((item) => `
          <li>
            <h4>${esc(item.name)}</h4>
            <p>${esc(item.text)}</p>
            <span class="local-precio incluido">${esc(item.badge || 'Incluido')}</span>
          </li>`).join('')}
          <li class="pack-total">
            <h4>${esc(sectorPack.label || sectorPack.name)}</h4>
            <span class="local-precio">${sectorPack.was ? `<s>${esc(sectorPack.was)}</s> ` : ''}${esc(sectorPack.price)}</span>
          </li>${sector.hostingNote && hostingRow ? `
          <li class="pack-hosting">
            <h4>${esc(hostingRow.label)}</h4>
            <p>${esc(sector.hostingNote)}</p>
            <span class="local-precio">${esc(hostingRow.price)}</span>
          </li>` : ''}
        </ul>${sector.option && sector.option.items ? `
        <div class="pack-opcion pack-opcion-lista">
          ${img ? `<figure class="opcion-foto">
            <picture>
              <source type="image/webp" srcset="${esc(to.asset(`${img.small}.webp`))}">
              <img src="${esc(to.asset(`${img.small}.jpg`))}" alt="${esc(img.alt)}" width="480" height="480" loading="lazy" decoding="async">
            </picture>
            ${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ''}
          </figure>` : ''}
          <div>
            <h4>Opcional: ${esc(sector.option.name)}</h4>
            <p>${esc(sector.option.text)}</p>
            <ul>${sector.option.items.map((id) => extraById[id]).filter(Boolean).map((item) => `
              <li>
                <h5>${esc(item.name)}</h5>
                <p>${esc(item.text)}</p>
                <span class="local-precio">${esc(item.price)}</span>
              </li>`).join('')}
            </ul>
          </div>
        </div>` : sector.option ? `
        <div class="pack-opcion">
          <h4>Opcional: ${esc(sector.option.name)}</h4>
          <p>${esc(sector.option.text)}</p>
          <span class="local-precio">${esc(sector.option.price)}</span>
        </div>` : ''}
        <a class="btn btn-sol" href="${esc(whatsappUrl(whatsapp, sector.whatsappText))}" rel="noopener" target="_blank">${esc(sector.cta)}</a>
      </div>
    </div>`;
  };

  // Sin JavaScript se ven los dos paneles seguidos; site.js activa las pestañas.
  const sectorsSection = sectors ? `
<section class="packs" id="packs">
  <div class="wrap">
    <h2>${esc(site.sectorsTitle)}</h2>
    <div class="sector-tabs" role="tablist" aria-label="${esc(site.sectorsTitle)}" hidden>${sectors.map((sector, i) => `
      <button type="button" role="tab" id="tab-${esc(sector.id)}" aria-controls="${esc(sector.id)}" aria-selected="${i === 0}"${i === 0 ? '' : ' tabindex="-1"'}>${esc(sector.tab)}</button>`).join('')}
    </div>${sectors.map(sectorPanel).join('')}
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
  const priceGroups = priceList(site);
  const pricesSection = `
<section class="precios" id="precios">
  <div class="wrap">
    <h2>Precios</h2>
    <p class="suave">Contrata cada servicio por separado o todo junto.</p>
    <div class="carta-precios">${pack ? `
      <div class="pack">
        <h3>${esc(pack.name)}</h3>
        <p>${esc(packText)}</p>
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
${sectorsSection}
${journeySection}
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

    <form id="formulario" novalidate data-whatsapp="${esc(whatsapp)}">
      ${formFields(to)}
      <noscript><p class="form-error">Para enviar el formulario necesitas JavaScript. También puedes escribirnos por <a href="${esc(wa)}">WhatsApp</a>.</p></noscript>
    </form>
  </div>
</section>

</main>`;

  return layout({
    site, config, title: site.title, description: site.description, path: '/', nav, body,
    scripts: ['js/site.js'], head: structuredData({ site, config, priceGroups }),
  });
}

// Formulario de contacto: no envía datos a ningún servidor; compone el mensaje y abre WhatsApp.
function formFields(to) {
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
