/* =========================================================
   NSD — Mapa que se carga al pulsar. Copia maestra: se reparte
   con sincronizar.js a las tres webs.

   La página trae una ficha estática (.mapa-diferido) con la
   dirección y el enlace «Cómo llegar». Google Maps solo entra
   cuando alguien pulsa «Cargar mapa interactivo»: hasta entonces
   no se conecta con Google ni se instala ninguna cookie suya.
   No se recuerda la elección: cada visita decide de nuevo.
   ========================================================= */
(function () {
  'use strict';
  document.querySelectorAll('.mapa-diferido[data-mapa-src]').forEach(function (caja) {
    var boton = caja.querySelector('.mapa-diferido__cargar');
    var ir = caja.querySelector('.mapa-diferido__botones a');
    if (!boton) return;
    boton.hidden = false;
    boton.addEventListener('click', function () {
      var marco = document.createElement('iframe');
      marco.src = caja.getAttribute('data-mapa-src');
      marco.title = caja.getAttribute('data-mapa-titulo') || 'Mapa';
      marco.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      marco.setAttribute('allowfullscreen', '');
      var ficha = caja.querySelector('.mapa-diferido__ficha');
      if (ficha) ficha.remove();
      caja.classList.add('is-cargado');
      caja.appendChild(marco);
      if (ir) {
        var flota = ir.cloneNode(true);
        flota.className = 'mapa-diferido__flota';
        caja.appendChild(flota);
      }
      marco.focus();
    });
  });
})();
