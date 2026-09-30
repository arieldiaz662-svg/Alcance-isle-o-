import { esc, layout, whatsappUrl } from './html.js';

export function renderLanding({ site, config }) {
  const wa = whatsappUrl(config.whatsappNumber, site.whatsappGreeting);
  const team = site.team.filter((person) => person.name && person.name.trim());

  const nav = [
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

  const prices = site.services.map((service) => `
      <div class="precio-fila"><span>${esc(service.priceLabel || service.name)}</span><span class="importe">${esc(service.price)}</span></div>`).join('');

  const serviceOptions = site.services
    .map((service) => `<option value="${esc(service.id)}">${esc(service.name)}</option>`).join('');

  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const teamSection = team.length ? `
<section class="equipo" id="equipo">
  <div class="wrap">
    <h2>Quiénes somos</h2>
    <p>Tres personas, dos miradas: entender a las personas y hacer que el negocio funcione.</p>
    <div class="equipo-grid">${team.map((person) => `
      <div class="persona">
        <div class="foto">${person.photo
          ? `<img src="${esc(person.photo)}" alt="${esc(person.name)}" loading="lazy" width="400" height="400">`
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
      <p class="lead">En ${esc(site.name)} ayudamos a pequeños negocios de ${esc(site.region)} a mejorar su presencia digital: más reseñas, una ficha de Google cuidada y una web sencilla que trabaja por ti.</p>
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
    <h2>Tres formas de poner tu escaparate a punto</h2>
    <p class="suave">Puedes contratar cada servicio por separado o combinarlos.</p>
    <div class="serv-grid">${services}
    </div>
  </div>
</section>

<section id="como">
  <div class="wrap">
    <h2>Así de fácil</h2>
    <ol class="pasos">
      <li><strong>Hablamos</strong>Nos cuentas cómo funciona tu negocio y qué necesitas.</li>
      <li><strong>Lo preparamos</strong>Nos encargamos de la parte técnica: ficha, tarjeta y web.</li>
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
      <p class="suave">Trabajamos en ${esc(site.region)}.${config.contactEmail ? `<br>
      Email: <a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a>` : ''}</p>
    </div>

    <form id="formulario" novalidate data-whatsapp="${esc(config.whatsappNumber)}">
      <div id="form-campos">
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
          <span>He leído la <a href="/privacidad" target="_blank">política de privacidad</a> y acepto que usen mis datos para responder a mi solicitud. *</span>
        </label>
        <p class="form-error" id="form-error" role="alert" hidden></p>
        <button class="btn btn-sol btn-full" type="submit">Enviar solicitud</button>
      </div>
      <div id="form-ok" class="form-ok" hidden tabindex="-1">
        <h3>¡Recibido!</h3>
        <p>Te contactaremos en menos de 24 horas. Si lo prefieres, puedes adelantarlo por WhatsApp:</p>
        <a class="btn btn-sol btn-full" id="form-ok-whatsapp" href="${esc(wa)}" rel="noopener" target="_blank">Continuar en WhatsApp</a>
      </div>
      <noscript><p class="form-error">Para enviar el formulario necesitas JavaScript. También puedes escribirnos por <a href="${esc(wa)}">WhatsApp</a>.</p></noscript>
    </form>
  </div>
</section>

</main>`;

  return layout({
    site, config, title: site.title, description: site.description, path: '/', nav, body,
    scripts: ['/assets/js/site.js'],
  });
}
