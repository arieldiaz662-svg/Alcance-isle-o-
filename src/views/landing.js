import { contact, esc, layout, links, whatsappUrl } from './html.js';

export function renderLanding({ site, config }) {
  const { whatsapp, phoneDisplay, email } = contact(site, config);
  const to = links(config);
  const wa = whatsappUrl(whatsapp, site.whatsappGreeting);
  const team = site.team.filter((person) => person.name && person.name.trim());

  const { featured } = site;
  const nav = [
    ...(featured ? [{ id: 'expositores', label: 'Expositores' }] : []),
    { id: 'servicios', label: 'Servicios' },
    { id: 'como', label: 'Cómo trabajamos' },
    { id: 'precios', label: 'Precios' },
    ...(team.length ? [{ id: 'equipo', label: 'Equipo' }] : []),
  ];

  const services = site.services.map((service) => `
      <article class="serv">
        <h3>${esc(service.name)}</h3>
        <p>${esc(service.text)}</p>
        <p class="beneficio">${esc(service.benefit)}</p>
      </article>`).join('');

  const prices = [...(featured ? [featured] : []), ...site.services]
    .flatMap((service) => service.prices || [{ label: service.priceLabel || service.name, price: service.price }])
    .map((row) => `
      <div class="precio-fila"><span>${esc(row.label)}</span><span class="importe">${esc(row.price)}</span></div>`).join('');

  const COUNT_WORDS = ['Una', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis'];
  const count = site.services.length;
  let servicesHeading = count === 1
    ? 'Una forma de poner tu escaparate a punto'
    : `${COUNT_WORDS[count - 1] || count} formas de poner tu escaparate a punto`;
  if (featured) servicesHeading = 'Y además, tu escaparate en Google y en internet';
  // Con 2 o 4 servicios, rejilla de 2 columnas para que no quede una tarjeta suelta.
  const gridClass = count % 3 !== 0 && count % 2 === 0 ? 'serv-grid serv-grid-2' : 'serv-grid';

  const serviceOptions = [...(featured ? [featured] : []), ...site.services]
    .map((service) => `<option value="${esc(service.id)}">${esc(service.name)}</option>`).join('');

  const featuredSection = featured ? `
<section class="estrella" id="expositores">
  <div class="wrap estrella-grid">
    <picture class="estrella-foto">
      <source type="image/webp" srcset="${esc(to.asset(`${featured.image.small}.webp`))} 480w, ${esc(to.asset(`${featured.image.src}.webp`))} 800w" sizes="(max-width: 860px) 100vw, 480px">
      <img src="${esc(to.asset(`${featured.image.src}.jpg`))}" srcset="${esc(to.asset(`${featured.image.small}.jpg`))} 480w, ${esc(to.asset(`${featured.image.src}.jpg`))} 800w" sizes="(max-width: 860px) 100vw, 480px" alt="${esc(featured.image.alt)}" width="800" height="800" loading="lazy" decoding="async">
    </picture>
    <div>
      <span class="lema">${esc(featured.badge)}</span>
      <h2>${esc(featured.name)}</h2>
      <p>${esc(featured.text)}</p>
      <ul class="ventajas">${featured.points.map((point) => `
        <li>${esc(point)}</li>`).join('')}
      </ul>
      <div class="opciones">${featured.prices.map((row) => `
        <div class="opcion"><span>${esc(row.label)}</span><strong>${esc(row.price)}</strong></div>`).join('')}
      </div>
      <div class="acciones">
        <a class="btn btn-sol" href="${esc(whatsappUrl(whatsapp, featured.whatsappText))}" rel="noopener" target="_blank">Pide el tuyo por WhatsApp</a>
        <a class="btn btn-linea" href="#precios">Ver precios</a>
      </div>
    </div>
  </div>
</section>
` : '';

  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const teamSection = team.length ? `
<section class="equipo" id="equipo">
  <div class="wrap">
    <h2>Quiénes somos</h2>
    <p>Tres personas, dos miradas: entender a las personas y hacer que el negocio funcione.</p>
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

  const body = `<main id="inicio">

<div class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="lema">Tu escaparate digital</span>
      <h1>Que tu negocio se vea y se encuentre en Google</h1>
      <p class="lead">En ${esc(site.name)} ayudamos a pequeños negocios de ${esc(site.region)} a mejorar su presencia digital: expositores de mesa con QR y NFC, más reseñas, una ficha de Google cuidada y una web sencilla que trabaja por ti.</p>
      <div class="acciones">
        <a class="btn btn-sol" href="${esc(wa)}" rel="noopener" target="_blank">Escríbenos por WhatsApp</a>
        <a class="btn btn-linea" href="#servicios">Ver servicios</a>
      </div>
    </div>

    <div class="ventana" role="img" aria-label="Ejemplo de ficha de un negocio en Google con reseñas">
      <div class="etiqueta">Así puede verse tu negocio en Google (ejemplo)</div>
      <div class="ficha-cab">
        <div class="ficha-icono">P</div>
        <div>
          <strong>Peluquería Marisol</strong>
          <span class="estrellas">★★★★★</span> <span class="suave">4,9 · 128 reseñas</span>
        </div>
      </div>
      <div class="ficha-datos"><b>Abierto ahora</b> · Cierra a las 20:00 · La Laguna</div>
      <div class="ficha-botones"><span>Llamar</span><span>Cómo llegar</span><span>Web</span></div>
      <div class="resena">“Trato excelente y muy fácil pedir cita.”</div>
    </div>
  </div>
</div>

${featuredSection}
<section class="problema">
  <div class="wrap">
    <h2>Tu negocio es bueno, pero ¿te encuentran?</h2>
    <p>Hoy, antes de entrar a un local, casi todo el mundo lo busca en Google. Si tu ficha está incompleta, tienes pocas reseñas o no tienes web, los clientes acaban en otro sitio, aunque tu negocio sea mejor.</p>
    <div class="items">
      <div class="item">Ficha de Google sin reclamar o desactualizada</div>
      <div class="item">Pocas reseñas, o ninguna</div>
      <div class="item">Sin una web a la que dirigir a los clientes</div>
    </div>
  </div>
</section>

<section class="servicios" id="servicios">
  <div class="wrap">
    <h2>${servicesHeading}</h2>
    <p class="suave">Puedes contratar cada servicio por separado o combinarlos.</p>
    <div class="${gridClass}">${services}
    </div>
  </div>
</section>

<section id="como">
  <div class="wrap">
    <h2>Así de fácil</h2>
    <ol class="pasos">
      <li><strong>Hablamos</strong>Nos cuentas cómo funciona tu negocio y qué necesitas.</li>
      <li><strong>Lo preparamos</strong>Nos encargamos de todo: ficha, tarjeta, web y material para tus mesas.</li>
      <li><strong>Empiezas a notarlo</strong>Más visibilidad, más reseñas y más contactos.</li>
    </ol>
    <p class="cierre">Sin tecnicismos. Nosotros nos encargamos.</p>
  </div>
</section>

<section class="porque">
  <div class="wrap cols">
    <div>
      <h2>Entendemos tu negocio, no solo la tecnología</h2>
      <p>Somos un equipo joven e interdisciplinar de antropología social y administración de empresas. Observamos cómo funciona cada negocio local, cómo se relaciona con su barrio y con sus clientes, y a partir de ahí diseñamos soluciones a medida. Sin plantillas genéricas.</p>
    </div>
    <ul>
      <li>Trato cercano y en persona en ${esc(site.region)}</li>
      <li>Soluciones adaptadas a cada negocio</li>
      <li>Precios claros, sin sorpresas</li>
    </ul>
  </div>
</section>

<section id="precios">
  <div class="wrap">
    <h2>Precios claros</h2>
    <p class="suave">Pídenos un presupuesto sin compromiso.</p>
    <div class="precios-lista">${prices}
    </div>
  </div>
</section>
${teamSection}
<section class="contacto" id="contacto">
  <div class="wrap cols">
    <div>
      <h2>¿Hablamos?</h2>
      <p>Cuéntanos qué necesitas y te respondemos en menos de 24 horas.</p>
      <p><a class="btn btn-sol" href="${esc(wa)}" rel="noopener" target="_blank">Escribir por WhatsApp</a></p>
      <p class="suave">Trabajamos en ${esc(site.region)}.${phoneDisplay ? `<br>
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
