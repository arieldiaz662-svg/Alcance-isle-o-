// Pestañas accesibles (clic, flechas del teclado, Inicio/Fin) para la carta de la portada y
// el selector de packs. Sin JavaScript, el selector muestra los dos paneles seguidos.
(function () {
  function initTabs(tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var panelOf = function (tab) { return document.getElementById(tab.getAttribute('aria-controls')); };

    function select(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        panelOf(t).hidden = !selected;
      });
    }

    tablist.addEventListener('click', function (event) {
      var tab = event.target.closest('[role="tab"]');
      if (tab) select(tab);
    });
    tablist.addEventListener('keydown', function (event) {
      var index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      var next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      var tab = tabs[(next + tabs.length) % tabs.length];
      select(tab);
      tab.focus();
    });

    // Enlaces directos a un panel (p. ej. .../#cita-previa) abren su pestaña. El panel tiene
    // scroll-margin-top en el CSS para que, al saltar a él, se vean también las pestañas.
    function fromHash() {
      var id = location.hash.slice(1);
      var tab = id && tabs.filter(function (t) { return t.getAttribute('aria-controls') === id; })[0];
      if (!tab) return false;
      select(tab);
      panelOf(tab).scrollIntoView();
      return true;
    }
    window.addEventListener('hashchange', fromHash);

    tablist.hidden = false;
    if (!fromHash()) select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
  }

  Array.prototype.forEach.call(document.querySelectorAll('[role="tablist"]'), initTabs);
})();

// Formulario de contacto.
// - Modo "whatsapp" (web estática): abre WhatsApp con el mensaje ya escrito.
// - Modo "api" (con servidor): guarda el lead y después ofrece continuar por WhatsApp. Ahí el enlace
//   se muestra como botón (no con window.open) para que los bloqueadores de ventanas emergentes
//   no lo corten tras la petición asíncrona.
(function () {
  var form = document.getElementById('formulario');
  if (!form) return;

  var whatsapp = form.dataset.whatsapp;
  var errorBox = document.getElementById('form-error');

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function whatsappText(data) {
    return 'Hola, soy ' + data.name +
      (data.business_type ? ' y tengo un negocio de tipo: ' + data.business_type : '') + '.' +
      (data.message ? ' ' + data.message : ' Me gustaría recibir información sobre Alcance Isleño.');
  }

  function whatsappLink(data) {
    return 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(whatsappText(data));
  }

  // Versión estática (sin servidor): abre WhatsApp con el mensaje ya escrito.
  // Se abre dentro del propio evento submit para que el navegador no lo trate como ventana emergente.
  if (form.dataset.mode === 'whatsapp') {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      errorBox.hidden = true;
      var el = form.elements;
      var data = {
        name: el.name.value.trim(),
        business_type: el.business_type.value.trim(),
        message: el.message.value.trim(),
      };
      if (!data.name) { el.name.focus(); return showError('Escribe tu nombre.'); }
      var url = whatsappLink(data);
      // Con "noopener" window.open siempre devuelve null, así que se corta el opener a mano.
      var win = window.open(url, '_blank');
      if (win) win.opener = null;
      else location.href = url; // si el navegador bloquea la pestaña nueva, se abre en la misma
    });
    return;
  }

  var fields = document.getElementById('form-campos');
  var okBox = document.getElementById('form-ok');
  var okWhatsapp = document.getElementById('form-ok-whatsapp');
  var button = form.querySelector('button[type="submit"]');

  function utm(name) {
    try { return new URLSearchParams(location.search).get(name) || undefined; } catch (e) { return undefined; }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    errorBox.hidden = true;

    var el = form.elements;
    var data = {
      name: el.name.value.trim(),
      phone: el.phone.value.trim(),
      email: el.email.value.trim(),
      business_type: el.business_type.value.trim(),
      service: el.service.value,
      message: el.message.value.trim(),
      consent: el.consent.checked,
      website: el.website.value,
      utm_source: utm('utm_source'),
      utm_medium: utm('utm_medium'),
      utm_campaign: utm('utm_campaign'),
    };

    if (data.name.length < 2) { el.name.focus(); return showError('Escribe tu nombre.'); }
    if (!/^[+0-9 ()-]{6,30}$/.test(data.phone)) { el.phone.focus(); return showError('Escribe un teléfono válido.'); }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { el.email.focus(); return showError('Revisa el email o déjalo en blanco.'); }
    if (!data.consent) { el.consent.focus(); return showError('Necesitamos que aceptes la política de privacidad para poder responderte.'); }

    button.disabled = true;
    button.textContent = 'Enviando…';

    fetch('/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (response) {
        if (response.status === 201) {
          okWhatsapp.href = whatsappLink(data);
          fields.hidden = true;
          okBox.hidden = false;
          okBox.focus();
          return;
        }
        if (response.status === 429) throw new Error('Has enviado varias solicitudes seguidas. Espera unos minutos o escríbenos por WhatsApp.');
        throw new Error('Revisa los datos del formulario e inténtalo de nuevo.');
      })
      .catch(function (err) {
        var message = err instanceof TypeError
          ? 'No hemos podido enviar el formulario. Revisa tu conexión o escríbenos por WhatsApp.'
          : err.message;
        showError(message);
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = 'Enviar solicitud';
      });
  });
})();
