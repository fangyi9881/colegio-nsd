// =========================================================
// «Actualidad» de la portada
// ---------------------------------------------------------
// Sale de la misma lista que el blog (noticias-datos.js): lo que se
// publique allí aparece aquí solo, sin tocar el HTML. Carrusel con
// buscador y filtro por sección; cada tarjeta lleva a su ficha (que
// se abre en la ventana emergente del blog si tiene página propia).
//
//   <div data-actualidad></div>
// =========================================================
(function () {
  'use strict';
  // Espera (unos segundos como mucho) a los comunicados del panel, para
  // pintarlos ya mezclados por fecha con el resto (ver cms.js).
  function iniciar() {
  const caja = document.querySelector('[data-actualidad]');
  const N = window.NSD_NOTICIAS;
  const CATS = window.NSD_CATEGORIAS;
  if (!caja || !N || !N.length) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const normalizar = (s) => (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  const fecha = (f) => { const [a, m, d] = f.split('-').map(Number); return `${d} ${MESES[m - 1]} ${a}`; };
  const TIPOS = { reportaje: 'Reportaje', comunicado: 'Comunicado', breve: 'Breve' };

  // Una noticia sin página propia se lee en el blog, en su fecha
  const destino = (n) => n.url || `/blog#${n.fecha}`;

  const ordenadas = N.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const categoriasConNoticias = Object.keys(CATS).filter((k) => ordenadas.some((n) => n.categoria === k));

  let consulta = '';
  let categoria = 'todas';
  let indice = 0;

  const filtrar = () => {
    const q = normalizar(consulta).trim();
    return ordenadas.filter((n) => {
      if (categoria !== 'todas' && n.categoria !== categoria) return false;
      if (!q) return true;
      const texto = normalizar([n.titulo, n.resumen, (CATS[n.categoria] || {}).nombre].join(' '));
      return q.split(/\s+/).every((p) => texto.includes(p));
    });
  };

  function tarjeta(n, i) {
    const c = CATS[n.categoria] || {};
    return `<article class="act-card" data-reveal data-reveal-delay="${Math.min(i + 1, 8)}">
      <div class="act-card__foto">
        ${window.NSD_PORTADA(n, '')}
        <div class="act-card__insignias">
          <span class="act-card__cat"><i class="bi ${c.icono || 'bi-tag'}" aria-hidden="true"></i>${esc(c.nombre || n.categoria)}</span>
          ${i === 0 ? '<span class="act-card__nuevo">Nuevo</span>' : ''}
        </div>
      </div>
      <div class="act-card__cuerpo">
        <p class="act-card__meta">
          <span><i class="bi bi-calendar-event" aria-hidden="true"></i> ${fecha(n.fecha)}</span>
          <span><i class="bi bi-journal-richtext" aria-hidden="true"></i> ${TIPOS[n.tipo] || ''}</span>
        </p>
        <h3 class="act-card__titulo">${esc(n.titulo)}</h3>
        <p class="act-card__resumen">${esc(n.resumen)}</p>
        <p class="act-card__pie">
          ${n.documento ? '<span class="act-card__doc"><i class="bi bi-paperclip" aria-hidden="true"></i>PDF</span>' : '<span></span>'}
          <a class="act-card__link" href="${esc(destino(n))}">Leer más <i class="bi bi-arrow-right" aria-hidden="true"></i><span class="sr-only">: ${esc(n.titulo)}</span></a>
        </p>
      </div>
    </article>`;
  }

  const pista = () => caja.querySelector('[data-act-pista]');

  function anchoTarjeta() {
    const p = pista();
    const primera = p && p.querySelector('.act-card');
    if (!primera) return 350;
    const estilo = getComputedStyle(p);
    return primera.getBoundingClientRect().width + parseFloat(estilo.columnGap || estilo.gap || 24);
  }

  function irA(i, lista) {
    const p = pista();
    if (!p) return;
    const max = lista.length - 1;
    indice = Math.max(0, Math.min(i, max));
    p.scrollTo({ left: indice * anchoTarjeta(), behavior: reduceMotion ? 'auto' : 'smooth' });
    marcarPuntos();
  }

  function marcarPuntos() {
    caja.querySelectorAll('[data-act-punto]').forEach((b, i) => b.setAttribute('aria-current', String(i === indice)));
  }

  function revelar(raiz) {
    const piezas = raiz.querySelectorAll('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      piezas.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach((el) => io.observe(el));
  }

  function pintar() {
    const lista = filtrar();
    indice = 0;
    const p = pista();

    caja.querySelector('[data-act-pistabox]').innerHTML = lista.length
      ? `<div class="act-pista" data-act-pista tabindex="0" role="region" aria-label="Noticias del colegio, desplazamiento horizontal">${lista.map(tarjeta).join('')}</div>`
      : '<p class="act-card__vacio">No hay noticias en esta sección todavía.</p>';

    caja.querySelector('[data-act-puntos]').innerHTML = lista.length > 1
      ? lista.map((_, i) => `<button type="button" class="act-punto" data-act-punto aria-current="${i === 0}" aria-label="Ir a la noticia ${i + 1}"><span></span></button>`).join('')
      : '';

    const nav = caja.querySelector('[data-act-nav]');
    if (nav) nav.hidden = lista.length < 2;

    revelar(caja.querySelector('[data-act-pistabox]'));
    if (pista()) pista().addEventListener('scroll', onScrollPista, { passive: true });
  }

  let scrollTimer;
  function onScrollPista() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const p = pista();
      if (!p) return;
      const i = Math.round(p.scrollLeft / anchoTarjeta());
      if (i !== indice) { indice = i; marcarPuntos(); }
    }, 80);
  }

  caja.innerHTML = `
    <div class="act-toolbar">
      <div class="act-toolbar__filtros" role="group" aria-label="Filtrar las noticias por sección">
        <button type="button" class="act-filtro is-activo" data-cat="todas" aria-pressed="true">Todo <span>${ordenadas.length}</span></button>
        ${categoriasConNoticias.map((k) => `<button type="button" class="act-filtro" data-cat="${k}" aria-pressed="false"><i class="bi ${CATS[k].icono}" aria-hidden="true"></i>${esc(CATS[k].nombre)} <span>${ordenadas.filter((n) => n.categoria === k).length}</span></button>`).join('')}
      </div>
      <div class="act-toolbar__derecha">
        <div class="act-search">
          <i class="bi bi-search" aria-hidden="true"></i>
          <label for="actBuscar" class="sr-only">Buscar en las noticias del colegio</label>
          <input type="search" id="actBuscar" placeholder="Buscar…" autocomplete="off" enterkeyhint="search">
        </div>
        <div class="act-nav" data-act-nav hidden>
          <button type="button" class="act-nav__btn" data-act-prev aria-label="Noticia anterior"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
          <button type="button" class="act-nav__btn" data-act-next aria-label="Noticia siguiente"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
        </div>
      </div>
    </div>
    <div class="act-pistabox" data-act-pistabox></div>
    <div class="act-puntos" data-act-puntos></div>
    <p class="act-pie"><a class="btn btn--ghost" href="/blog">Ver el blog y todas las noticias <i class="bi bi-arrow-right" aria-hidden="true"></i></a></p>`;

  caja.querySelector('.act-toolbar__filtros').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    categoria = b.dataset.cat;
    caja.querySelectorAll('[data-cat]').forEach((x) => { const si = x === b; x.classList.toggle('is-activo', si); x.setAttribute('aria-pressed', String(si)); });
    pintar();
  });
  caja.querySelector('#actBuscar').addEventListener('input', (e) => { consulta = e.target.value; pintar(); });
  caja.addEventListener('click', (e) => {
    if (e.target.closest('[data-act-prev]')) irA(indice - 1, filtrar());
    if (e.target.closest('[data-act-next]')) irA(indice + 1, filtrar());
    const punto = e.target.closest('[data-act-punto]');
    if (punto) irA([...caja.querySelectorAll('[data-act-punto]')].indexOf(punto), filtrar());
  });

  pintar();
  }
  (window.NSD_CMS_NOTICIAS || Promise.resolve()).then(iniciar, iniciar);
})();
