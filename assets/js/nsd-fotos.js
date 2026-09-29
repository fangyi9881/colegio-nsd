// =========================================================
// NSD — Recuadros de fotos que se van cambiando solos
// ---------------------------------------------------------
// Cada recuadro enseña una imagen y, cada pocos segundos, la
// siguiente entra deslizándose de derecha a izquierda. También se
// puede arrastrar con el dedo o el ratón, saltar con los puntos y
// pararlo con el botón (que es lo que exige la norma para el
// contenido que se mueve solo).
//
//   <div class="rotafotos" data-rotafotos data-intervalo="6000">
//     <ul class="rotafotos__pista">
//       <li class="rotafotos__lam">…</li>
//       …
//     </ul>
//   </div>
//
// ⚠ Copia maestra en _DISENO: se edita aquí y se reparte con
// `node _DISENO/sincronizar.js`.
// =========================================================
(function () {
  'use strict';
  const cajas = document.querySelectorAll('[data-rotafotos]');
  if (!cajas.length) return;
  const lento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  cajas.forEach((caja, orden) => {
    const pista = caja.querySelector('.rotafotos__pista');
    if (!pista) return;
    const lams = [...pista.children];
    if (lams.length < 2) { lams.forEach((l) => l.classList.add('is-activa')); return; }

    const intervalo = Number(caja.dataset.intervalo) || 6000;
    let actual = 0, temporizador = null, parado = lento, aLaVista = true;

    lams.forEach((l, i) => {
      l.classList.toggle('is-activa', i === 0);
      // aria-hidden solo lo esconde del lector; inert ademas saca del
      // tabulador lo que haya dentro (el visor pone las fotos enfocables).
      if (i !== 0) { l.setAttribute('aria-hidden', 'true'); l.setAttribute('inert', ''); }
    });

    // ── Mandos: puntos + pausa ──
    const mandos = document.createElement('div');
    mandos.className = 'rotafotos__mandos';
    mandos.innerHTML = `
      <button type="button" class="rotafotos__pausa" aria-pressed="false">
        <i class="bi bi-pause-fill" aria-hidden="true"></i><span class="sr-only">Parar el pase de fotos</span>
      </button>
      <div class="rotafotos__puntos" role="group" aria-label="Elegir foto">
        ${lams.map((l, i) => `<button type="button" class="rotafotos__punto${i === 0 ? ' is-activo' : ''}" data-i="${i}"${i === 0 ? ' aria-current="true"' : ''} aria-label="Foto ${i + 1} de ${lams.length}"></button>`).join('')}
      </div>`;
    caja.appendChild(mandos);
    const puntos = [...mandos.querySelectorAll('.rotafotos__punto')];
    const pausa = mandos.querySelector('.rotafotos__pausa');

    function ir(sig, haciaAtras) {
      if (sig === actual) return;
      const sale = lams[actual];
      const entra = lams[sig];
      const atras = haciaAtras === undefined ? sig < actual : haciaAtras;
      sale.classList.remove('is-activa');
      sale.classList.add(atras ? 'se-va-derecha' : 'se-va-izquierda');
      sale.setAttribute('aria-hidden', 'true');
      sale.setAttribute('inert', '');
      entra.classList.add('is-activa');
      entra.classList.toggle('viene-de-izquierda', atras);
      entra.removeAttribute('aria-hidden');
      entra.removeAttribute('inert');
      // Quitar la clase en el siguiente fotograma dispara la transición
      requestAnimationFrame(() => requestAnimationFrame(() => entra.classList.remove('viene-de-izquierda')));
      setTimeout(() => sale.classList.remove('se-va-izquierda', 'se-va-derecha'), 800);
      puntos.forEach((p, i) => { p.classList.toggle('is-activo', i === sig); if (i === sig) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current'); });
      actual = sig;
    }
    const siguiente = () => ir((actual + 1) % lams.length, false);

    const arrancar = () => { if (!parado && aLaVista && !temporizador) temporizador = setInterval(siguiente, intervalo); };
    const frenar = () => { clearInterval(temporizador); temporizador = null; };

    pausa.addEventListener('click', () => {
      parado = !parado;
      pausa.setAttribute('aria-pressed', String(parado));
      pausa.innerHTML = `<i class="bi ${parado ? 'bi-play-fill' : 'bi-pause-fill'}" aria-hidden="true"></i><span class="sr-only">${parado ? 'Seguir con el pase de fotos' : 'Parar el pase de fotos'}</span>`;
      parado ? frenar() : arrancar();
    });
    puntos.forEach((p) => p.addEventListener('click', () => ir(Number(p.dataset.i))));

    // Mientras se mira o se lee, quieto
    caja.addEventListener('mouseenter', frenar);
    caja.addEventListener('mouseleave', arrancar);
    caja.addEventListener('focusin', frenar);
    caja.addEventListener('focusout', arrancar);
    document.addEventListener('visibilitychange', () => (document.hidden ? frenar() : arrancar()));

    // Arrastrar con el dedo o el ratón
    let x0 = null;
    pista.addEventListener('pointerdown', (e) => { x0 = e.clientX; frenar(); });
    pista.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const d = e.clientX - x0;
      x0 = null;
      if (Math.abs(d) > 40) ir((actual + (d < 0 ? 1 : lams.length - 1)) % lams.length, d > 0);
      arrancar();
    });
    pista.addEventListener('pointercancel', () => { x0 = null; arrancar(); });

    // Con las flechas del teclado, cuando el foco está dentro
    caja.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); ir((actual + 1) % lams.length, false); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); ir((actual + lams.length - 1) % lams.length, true); }
    });

    // Solo gira lo que se está viendo: ni gasta ni distrae
    if (window.IntersectionObserver) {
      new IntersectionObserver((es) => {
        aLaVista = es[0].isIntersecting;
        aLaVista ? arrancar() : frenar();
      }, { threshold: .25 }).observe(caja);
    }
    // Un desfase por recuadro para que no cambien todos a la vez
    setTimeout(arrancar, orden * 900);
  });
})();
