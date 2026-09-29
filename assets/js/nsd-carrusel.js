/* =========================================================
   NSD — Galería deslizable y aparición de imágenes
   · Botones anterior/siguiente de cada .carrusel (se desactivan
     en los extremos) y deslizamiento con el dedo nativo.
   · .carrusel__item y .baldosa reciben .is-visible al entrar en
     pantalla (la imagen se asienta desde un leve zoom).
   Copia maestra: se reparte con _DISENO/sincronizar.js.
   ========================================================= */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.carrusel').forEach((c) => {
    const pista = c.querySelector('.carrusel__pista');
    const ant = c.querySelector('[data-carrusel="ant"]');
    const sig = c.querySelector('[data-carrusel="sig"]');
    if (!pista) return;
    const paso = () => {
      const item = pista.querySelector('.carrusel__item');
      return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(pista).columnGap || 20) : pista.clientWidth * 0.8;
    };
    const estado = () => {
      const max = pista.scrollWidth - pista.clientWidth - 2;
      if (ant) ant.disabled = pista.scrollLeft <= 2;
      if (sig) sig.disabled = pista.scrollLeft >= max;
    };
    const mover = (dir) => pista.scrollBy({ left: dir * paso(), behavior: reduce ? 'auto' : 'smooth' });
    if (ant) ant.addEventListener('click', () => mover(-1));
    if (sig) sig.addEventListener('click', () => mover(1));
    pista.addEventListener('scroll', estado, { passive: true });
    // Flechas del teclado cuando el foco está dentro de la galería
    pista.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
    });
    estado();
    window.addEventListener('resize', estado, { passive: true });
  });

  const piezas = document.querySelectorAll('.carrusel__item, .baldosa');
  if (reduce || !('IntersectionObserver' in window)) { piezas.forEach((p) => p.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  piezas.forEach((p) => io.observe(p));
})();
