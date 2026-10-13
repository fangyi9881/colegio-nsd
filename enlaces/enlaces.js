/* =========================================================
   Enlaces NSD — tarjetas apiladas al deslizar
   ---------------------------------------------------------
   Cada .panel se queda fijo arriba (position: sticky) y el
   siguiente sube y se coloca encima. Aquí solo se calcula:
   1. --top: dónde se fija cada tarjeta. Si es más alta que la
      pantalla, se fija más arriba para que se vea entera antes
      de que la siguiente la tape.
   2. --p (0 a 1): cuánto la tapa la siguiente. El CSS lo usa
      para encogerla y oscurecerla (solo transform y opacity).
   Sin este archivo la página se ve en columna, sin apilar.
   ========================================================= */
(function () {
  'use strict';

  var pila = document.querySelector('.pila');
  if (!pila || !('CSS' in window) || !CSS.supports('position', 'sticky')) return;

  var paneles = Array.prototype.slice.call(pila.querySelectorAll('.panel'));
  if (paneles.length < 2) return;

  var escritorio = window.matchMedia('(min-width: 960px)');
  var SEPARACION = 14; // lo que asoma cada tarjeta por encima de la siguiente
  var pendiente = false;

  function medir() {
    var base = escritorio.matches ? 48 : 16;
    var alto = window.innerHeight;
    paneles.forEach(function (panel, i) {
      var top = base + i * SEPARACION;
      var cabe = alto - panel.offsetHeight - 16;
      panel.style.setProperty('--top', Math.min(top, cabe) + 'px');
    });
    pintar();
  }

  function pintar() {
    pendiente = false;
    for (var i = 0; i < paneles.length; i++) {
      var p = 0;
      var siguiente = paneles[i + 1];
      if (siguiente) {
        var a = paneles[i];
        var arriba = a.getBoundingClientRect().top;
        var solape = arriba + a.offsetHeight - siguiente.getBoundingClientRect().top;
        p = Math.max(0, Math.min(1, solape / a.offsetHeight));
      }
      paneles[i].style.setProperty('--p', p.toFixed(3));
    }
  }

  function alDeslizar() {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(pintar);
  }

  document.documentElement.classList.add('pila-viva');
  medir();

  window.addEventListener('scroll', alDeslizar, { passive: true });
  window.addEventListener('resize', medir);
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(medir);
    paneles.forEach(function (panel) { ro.observe(panel); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
})();
