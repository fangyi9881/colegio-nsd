// =========================================================
// NSD — Visor de imágenes
// ---------------------------------------------------------
// Al pulsar una imagen se abre centrada en una ventana flotante, sin
// salir de la página. Se cierra pulsando fuera, con la X o con Esc; se
// amplía con el botón, con la rueda o con doble pulsación, y estando
// ampliada se arrastra.
//
// Se marca así:
//   <a href="/img/cartel.jpg" data-visor>…</a>
//   <img src="…" data-visor>
//   <div data-visor-grupo> … </div>   (todas las imágenes de dentro)
//
// ⚠ Copia maestra en _DISENO: se edita aquí y se reparte con
// `node _DISENO/sincronizar.js`.
// =========================================================
(function () {
  'use strict';

  // ── Qué se puede abrir ──
  const sueltos = [...document.querySelectorAll('[data-visor]')];
  const enGrupos = [...document.querySelectorAll('[data-visor-grupo]')]
    .flatMap((g) => [...g.querySelectorAll('img')].map((i) => i.closest('a') || i));
  const disparadores = [...new Set([...sueltos, ...enGrupos])];
  if (!disparadores.length) return;

  // La imagen grande de un disparador: el href si apunta a una imagen,
  // y si no la propia imagen que se ve.
  function fuente(el) {
    const img = el.tagName === 'IMG' ? el : el.querySelector('img');
    const href = el.getAttribute && el.getAttribute('href');
    const grande = href && /\.(jpe?g|png|webp|avif|gif|svg)(\?|$)/i.test(href) ? href : null;
    return {
      url: grande || (img ? (img.currentSrc || img.src) : null),
      alt: (img && img.alt) || el.getAttribute('data-visor-alt') || '',
      pie: el.getAttribute('data-visor-pie') || '',
    };
  }

  let capa = null, imagen = null, devolverFoco = null;
  let escala = 1, x = 0, y = 0, arrastrando = false, x0 = 0, y0 = 0;
  // Muelle de apertura/cierre: nace en el punto donde se pulsó (origen
  // espacial) y es interrumpible — cerrar a media apertura no deja nada
  // colgado, simplemente invierte el mismo muelle.
  let muelleCaja = null;

  function aplicar() {
    imagen.style.transform = `translate(${x}px, ${y}px) scale(${escala})`;
    imagen.style.cursor = escala > 1 ? (arrastrando ? 'grabbing' : 'grab') : 'zoom-in';
    capa.querySelector('[data-menos]').disabled = escala <= 1;
    capa.querySelector('[data-mas]').disabled = escala >= 4;
  }

  function zoom(nueva, centro) {
    const antes = escala;
    escala = Math.min(4, Math.max(1, nueva));
    if (escala === 1) { x = 0; y = 0; }
    else if (centro) {
      // Se amplía hacia donde apunta el ratón, no hacia el centro
      const r = imagen.getBoundingClientRect();
      const dx = centro.x - (r.left + r.width / 2);
      const dy = centro.y - (r.top + r.height / 2);
      x -= dx * (escala / antes - 1);
      y -= dy * (escala / antes - 1);
    }
    aplicar();
  }

  function cerrar() {
    if (!capa) return;
    const capaQueCierra = capa;
    capa = null; // ya no es la capa activa: un abrir() posterior no choca con esto
    document.documentElement.classList.remove('con-visor');
    const fondo = capaQueCierra.querySelector('.visor__fondo');
    if (fondo) fondo.style.opacity = '0';
    const caja = capaQueCierra.querySelector('.visor__caja');
    const fin = () => capaQueCierra.remove();
    if (window.NSDSpring && caja && !window.NSDSpring.reduceMotion()) {
      if (muelleCaja) muelleCaja.stop();
      muelleCaja = new window.NSDSpring.Spring(1, {
        ...window.NSDSpring.PRESETS.hoja,
        onUpdate: (v) => { caja.style.opacity = String(v); caja.style.transform = `scale(${0.94 + v * 0.06})`; },
        onSettle: fin,
      }).to(0);
    } else {
      if (caja) caja.style.opacity = '0';
      setTimeout(fin, 180);
    }
    if (devolverFoco) devolverFoco.focus();
  }

  function abrir(el) {
    const { url, alt, pie } = fuente(el);
    if (!url) return;
    devolverFoco = el;
    escala = 1; x = 0; y = 0;

    capa = document.createElement('div');
    capa.className = 'visor';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-modal', 'true');
    capa.setAttribute('aria-label', alt || 'Imagen ampliada');
    capa.innerHTML = `
      <div class="visor__fondo" data-cerrar></div>
      <div class="visor__caja">
        <img class="visor__img" src="${url}" alt="${alt.replace(/"/g, '&quot;')}" />
        ${pie ? `<p class="visor__pie">${pie}</p>` : ''}
      </div>
      <div class="visor__mandos">
        <button type="button" class="visor__boton" data-menos disabled><i class="bi bi-zoom-out" aria-hidden="true"></i><span class="sr-only">Alejar</span></button>
        <button type="button" class="visor__boton" data-mas><i class="bi bi-zoom-in" aria-hidden="true"></i><span class="sr-only">Ampliar</span></button>
        <button type="button" class="visor__boton visor__boton--cerrar" data-cerrar><i class="bi bi-x-lg" aria-hidden="true"></i><span class="sr-only">Cerrar</span></button>
      </div>`;
    document.body.appendChild(capa);
    document.documentElement.classList.add('con-visor');
    imagen = capa.querySelector('.visor__img');
    const caja = capa.querySelector('.visor__caja');
    const fondo = capa.querySelector('.visor__fondo');
    // Ancla la caja al elemento pulsado: crece desde ahí, no desde el centro.
    const origen = el.getBoundingClientRect();
    const oX = ((origen.left + origen.width / 2) / window.innerWidth) * 100;
    const oY = ((origen.top + origen.height / 2) / window.innerHeight) * 100;
    if (caja) caja.style.transformOrigin = `${oX}% ${oY}%`;
    if (window.NSDSpring && caja && !window.NSDSpring.reduceMotion()) {
      caja.style.opacity = '0';
      caja.style.transform = 'scale(.94)';
      if (fondo) fondo.style.opacity = '0';
      requestAnimationFrame(() => {
        capa.classList.add('is-abierto');
        if (fondo) fondo.style.opacity = '1';
        if (muelleCaja) muelleCaja.stop();
        muelleCaja = new window.NSDSpring.Spring(0, {
          ...window.NSDSpring.PRESETS.hoja,
          onUpdate: (v) => { caja.style.opacity = String(v); caja.style.transform = `scale(${0.94 + v * 0.06})`; },
        }).to(1);
      });
    } else {
      requestAnimationFrame(() => capa.classList.add('is-abierto'));
    }
    capa.querySelector('.visor__boton--cerrar').focus();
    aplicar();

    capa.addEventListener('click', (e) => {
      if (e.target.closest('[data-cerrar]')) { cerrar(); return; }
      if (e.target.closest('[data-mas]')) { zoom(escala + 0.5); return; }
      if (e.target.closest('[data-menos]')) { zoom(escala - 0.5); return; }
      // Pulsar fuera de la imagen también cierra
      if (!e.target.closest('.visor__caja')) cerrar();
    });
    imagen.addEventListener('click', (e) => { e.stopPropagation(); if (escala === 1) zoom(2, { x: e.clientX, y: e.clientY }); });
    imagen.addEventListener('dblclick', (e) => { e.preventDefault(); zoom(escala > 1 ? 1 : 2.5, { x: e.clientX, y: e.clientY }); });
    capa.addEventListener('wheel', (e) => { e.preventDefault(); zoom(escala + (e.deltaY < 0 ? 0.3 : -0.3), { x: e.clientX, y: e.clientY }); }, { passive: false });

    imagen.addEventListener('pointerdown', (e) => {
      if (escala <= 1) return;
      arrastrando = true; x0 = e.clientX - x; y0 = e.clientY - y;
      imagen.setPointerCapture(e.pointerId);
      aplicar();
    });
    imagen.addEventListener('pointermove', (e) => { if (arrastrando) { x = e.clientX - x0; y = e.clientY - y0; aplicar(); } });
    ['pointerup', 'pointercancel'].forEach((ev) => imagen.addEventListener(ev, () => { arrastrando = false; aplicar(); }));

    capa.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
      if (e.key === '+' || e.key === '=') zoom(escala + 0.5);
      if (e.key === '-') zoom(escala - 0.5);
      // El foco no sale de la ventana mientras está abierta
      if (e.key === 'Tab') {
        const focos = capa.querySelectorAll('button');
        const primero = focos[0], ultimo = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    });
  }

  disparadores.forEach((el) => {
    el.classList.add('con-lupa');
    if (el.tagName !== 'A' && !el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
    }
    el.addEventListener('click', (e) => { e.preventDefault(); abrir(el); });
    el.addEventListener('keydown', (e) => {
      if (el.tagName === 'A') return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(el); }
    });
  });
})();
