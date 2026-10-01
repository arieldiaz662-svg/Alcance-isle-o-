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
  // A partir de aquí, cambiar de pestaña lleva un fundido corto (ver .tabs-listas en site.css).
  requestAnimationFrame(function () { document.documentElement.classList.add('tabs-listas'); });
})();

// Formulario de contacto: compone el mensaje y abre WhatsApp (la web no guarda ningún dato).
// Se abre dentro del propio evento submit para que el navegador no lo trate como ventana emergente.
(function () {
  var form = document.getElementById('formulario');
  if (!form) return;
  var errorBox = document.getElementById('form-error');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    errorBox.hidden = true;
    var el = form.elements;
    var name = el.name.value.trim();
    var business = el.business_type.value.trim();
    var message = el.message.value.trim();
    if (!name) {
      el.name.focus();
      errorBox.textContent = 'Escribe tu nombre.';
      errorBox.hidden = false;
      return;
    }
    var text = 'Hola, soy ' + name +
      (business ? ' y tengo un negocio de tipo: ' + business : '') + '.' +
      (message ? ' ' + message : ' Me gustaría recibir información sobre Alcance Isleño.');
    var url = 'https://wa.me/' + form.dataset.whatsapp + '?text=' + encodeURIComponent(text);
    // Con "noopener" window.open siempre devuelve null, así que se corta el opener a mano.
    var win = window.open(url, '_blank');
    if (win) win.opener = null;
    else location.href = url; // si el navegador bloquea la pestaña nueva, se abre en la misma
  });
})();
