/* =========================================================
   Organigrama · búsqueda, desplegables y saltos
   ---------------------------------------------------------
   Todo es opcional: sin este script el organigrama se lee igual
   (los departamentos son <details>). Se vuelve a aplicar solo si
   departamentos.js repinta el árbol con lo publicado en el panel.
   ========================================================= */
(function () {
  'use strict';
  const herr = document.querySelector('[data-org-herr]');
  const cont = document.querySelector('[data-organigrama]');
  if (!herr || !cont) return;

  const campo = herr.querySelector('#org-q');
  const limpiar = herr.querySelector('[data-org-limpiar]');
  const estado = herr.querySelector('[data-org-estado]');
  const ancho = window.matchMedia('(min-width: 761px)');
  let consulta = '';
  let aplicando = false;

  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const todos = () => Array.from(cont.querySelectorAll('.org-dep__d'));

  // Estado de partida: en escritorio hay sitio para todo; en móvil, cerrado.
  function abrirPorDefecto() { todos().forEach((d) => { d.open = ancho.matches; }); }

  function filtrar() {
    if (aplicando) return;
    aplicando = true;
    const q = norm(consulta);
    const terminos = q.split(' ').filter(Boolean);
    const coincide = (texto) => terminos.every((t) => texto.indexOf(t) >= 0);
    let hallados = 0;

    // Cúpula: dirección, gestión y coordinaciones
    cont.querySelectorAll('.org-nivel').forEach((nivel) => {
      let visibles = 0;
      nivel.querySelectorAll('.persona-item').forEach((li) => {
        const ok = !q || coincide(norm(li.textContent));
        li.hidden = !ok;
        if (ok) visibles++;
      });
      nivel.hidden = !!q && visibles === 0;
      if (q) hallados += visibles;
    });
    cont.querySelectorAll('.org-linea').forEach((l) => { l.hidden = !!q; });

    // Departamentos: si coincide el nombre, entra todo el equipo
    cont.querySelectorAll('.org-dep').forEach((dep) => {
      const nombre = norm(dep.getAttribute('data-org-nombre'));
      const det = dep.querySelector('.org-dep__d');
      const gente = Array.from(dep.querySelectorAll('.persona-item'));
      const porNombre = !!q && coincide(nombre);
      let visibles = 0;
      gente.forEach((li) => {
        const ok = !q || porNombre || coincide(norm(li.textContent + ' ' + nombre));
        li.hidden = !ok;
        if (ok) visibles++;
      });
      dep.querySelectorAll('.personas-grupo').forEach((g) => {
        g.hidden = !!q && !g.querySelector('.persona-item:not([hidden])');
      });
      const visible = !q || porNombre || visibles > 0;
      dep.hidden = !visible;
      if (q && visible && det) det.open = true;
      if (q) hallados += porNombre && !visibles ? 1 : visibles;
    });

    cont.querySelectorAll('.org-bloque').forEach((b) => {
      b.hidden = !!q && !b.querySelector('.org-dep:not([hidden])');
    });

    if (limpiar) limpiar.hidden = !q;
    if (!q) {
      estado.textContent = '';
      estado.classList.remove('is-vacio');
      abrirPorDefecto();
    } else if (hallados === 0) {
      estado.textContent = 'No encontramos nada con «' + consulta.trim() + '». Prueba con un apellido o con el nombre de la etapa.';
      estado.classList.add('is-vacio');
    } else {
      estado.textContent = hallados === 1 ? 'Un resultado.' : hallados + ' resultados.';
      estado.classList.remove('is-vacio');
    }
    aplicando = false;
  }

  let t = 0;
  campo.addEventListener('input', () => {
    consulta = campo.value;
    clearTimeout(t);
    t = setTimeout(filtrar, 90);
  });
  campo.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && campo.value) { e.preventDefault(); campo.value = ''; consulta = ''; filtrar(); }
  });
  if (limpiar) limpiar.addEventListener('click', () => { campo.value = ''; consulta = ''; filtrar(); campo.focus(); });

  herr.addEventListener('click', (e) => {
    const abrir = e.target.closest('[data-org-abrir]');
    const cerrar = e.target.closest('[data-org-cerrar]');
    if (abrir) todos().forEach((d) => { if (!d.closest('.org-dep').hidden) d.open = true; });
    if (cerrar) todos().forEach((d) => { d.open = false; });
  });

  // ── Saltos: la parte en pantalla queda marcada ──
  const enlaces = Array.from(document.querySelectorAll('.org-saltos a'));
  const destinos = enlaces.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
  function marcar(id) {
    enlaces.forEach((a) => {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    const visibles = new Map();
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) visibles.set(en.target.id, en.boundingClientRect.top); else visibles.delete(en.target.id); });
      if (!visibles.size) return;
      const primero = Array.from(visibles.entries()).sort((a, b) => a[1] - b[1])[0][0];
      marcar(primero);
    }, { rootMargin: '-20% 0px -65% 0px' });
    const observar = () => destinos.forEach((d) => { if (d) io.observe(d); });
    observar();
    // Si el árbol se repinta, los destinos son nodos nuevos
    window.__orgObservar = () => { io.disconnect(); visibles.clear(); destinos.forEach((_, i) => { destinos[i] = document.getElementById(enlaces[i].getAttribute('href').slice(1)); }); observar(); };
  }
  // Una etapa o departamento que se pide por la dirección se abre
  function abrirHash() {
    const el = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    const det = el && el.querySelector ? el.querySelector('.org-dep__d') : null;
    if (det) det.open = true;
  }
  window.addEventListener('hashchange', abrirHash);

  ancho.addEventListener('change', () => { if (!norm(consulta)) abrirPorDefecto(); });

  // departamentos.js sustituye el contenido al llegar lo del panel
  new MutationObserver(() => {
    if (aplicando) return;
    abrirPorDefecto();
    if (norm(consulta)) filtrar();
    if (window.__orgObservar) window.__orgObservar();
    if (window.NSD_PERSONAS && window.NSD_PERSONAS.hidratar) { /* ya lo hace departamentos.js */ }
  }).observe(cont, { childList: true });

  abrirPorDefecto();
  abrirHash();
})();
