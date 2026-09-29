/* Fichas que se abren y se cierran al pulsarlas.
   Lo usan el equipo directivo y los departamentos. */
(function () {
  'use strict';
  document.querySelectorAll('[data-equipo], [data-acordeon]').forEach((lista) => {
    lista.querySelectorAll('button[aria-expanded]').forEach((boton) => {
      const detalle = boton.nextElementSibling;
      if (!detalle) return;
      boton.addEventListener('click', () => {
        const abierto = boton.getAttribute('aria-expanded') === 'true';
        // Solo una abierta a la vez: la lista no se dispara a lo largo
        lista.querySelectorAll('button[aria-expanded="true"]').forEach((otro) => {
          if (otro === boton) return;
          otro.setAttribute('aria-expanded', 'false');
          if (otro.nextElementSibling) otro.nextElementSibling.hidden = true;
        });
        boton.setAttribute('aria-expanded', String(!abierto));
        detalle.hidden = abierto;
      });
    });
  });
})();
