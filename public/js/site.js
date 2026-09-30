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
