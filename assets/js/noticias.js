// =========================================================
// Diario del colegio: pinta las noticias de noticias-datos.js
//   · [data-diario]            el blog completo (portada, filtros, línea por curso)
//   · [data-noticias-ultimas]  las N más recientes, en formato compacto
// =========================================================
(function () {
  'use strict';
  // Espera (unos segundos como mucho) a los comunicados del panel, para
  // pintarlos ya mezclados por fecha con el resto (ver cms.js).
  function iniciar() {
  const NOTICIAS = (window.NSD_NOTICIAS || []).slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
  const CATS = window.NSD_CATEGORIAS || {};
  if (!NOTICIAS.length) return;

  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const TIPOS = {
    reportaje:  { nombre: 'Reportaje',  icono: 'bi-journal-richtext' },
    comunicado: { nombre: 'Comunicado', icono: 'bi-megaphone' },
    breve:      { nombre: 'Breve',      icono: 'bi-lightning-charge' }
  };

  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const normalizar = (s) => (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}\s]/gu, ' ');
  const partes = (f) => { const [a, m, d] = f.split('-').map(Number); return { a, m, d }; };
  const fechaLarga = (f) => { const { a, m, d } = partes(f); return `${d} de ${MESES_LARGOS[m - 1]} de ${a}`; };
  // El curso empieza en septiembre: marzo de 2025 es del curso 2024-25
  const cursoDe = (f) => { const { a, m } = partes(f); return m >= 9 ? `${a}–${String(a + 1).slice(2)}` : `${a - 1}–${String(a).slice(2)}`; };
  const externo = (u) => /^https?:/.test(u || '');
  const enlace = (n, texto, clase = '') => n.url
    ? `<a class="${clase}" href="${esc(n.url)}"${externo(n.url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${texto}${externo(n.url) ? '<span class="sr-only"> (se abre en otra pestaña)</span>' : ''}</a>`
    : texto;
  const chipCat = (n) => {
    const c = CATS[n.categoria] || { nombre: n.categoria, icono: 'bi-tag' };
    return `<span class="diario-cat"><i class="bi ${c.icono}" aria-hidden="true"></i>${esc(c.nombre)}</span>`;
  };
  const chipTipo = (n) => {
    const t = TIPOS[n.tipo] || TIPOS.breve;
    return `<span class="diario-tipo diario-tipo--${n.tipo}"><i class="bi ${t.icono}" aria-hidden="true"></i>${t.nombre}</span>`;
  };
  const chipDoc = (n) => n.documento ? '<span class="diario-doc"><i class="bi bi-paperclip" aria-hidden="true"></i>PDF</span>' : '';

  // El diario se repinta entero con cada filtro: main.js ya barrió la
  // pagina al cargar y nunca vio este contenido, asi que cada tarjeta se
  // anima aqui, la primera vez que aparece y tambien tras cada filtro.
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revelar = (raiz) => {
    const piezas = raiz.querySelectorAll('[data-reveal]');
    if (reduceMotion() || !('IntersectionObserver' in window)) {
      piezas.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach((el) => io.observe(el));
  };

  // ── Versión compacta (página de Comunidad) ─────────────────────────────
  document.querySelectorAll('[data-noticias-ultimas]').forEach((caja) => {
    const n = parseInt(caja.dataset.noticiasUltimas, 10) || 3;
    caja.innerHTML = `<ol class="diario-mini">${NOTICIAS.slice(0, n).map((x, i) => {
      const { d, m } = partes(x.fecha);
      return `<li data-reveal data-reveal-delay="${Math.min(i + 1, 8)}">
        <a class="diario-mini__portada" href="${x.url || '/blog#' + x.fecha}" tabindex="-1" aria-hidden="true">${window.NSD_PORTADA ? window.NSD_PORTADA(x, 'portada-noticia--mini') : ''}</a>
        <time class="diario-fecha" datetime="${x.fecha}"><b>${d}</b><span>${MESES[m - 1]}</span></time>
        <div><div class="diario-chips">${chipCat(x)}${chipTipo(x)}</div>
        <h3>${x.url ? enlace(x, esc(x.titulo)) : `<a href="/blog#${x.fecha}">${esc(x.titulo)}</a>`}</h3>
        <p>${esc(x.resumen)}</p></div>
      </li>`;
    }).join('')}</ol>`;
    revelar(caja);
  });

  // ── Blog completo ─────────────────────────────────────────────────────
  const raiz = document.querySelector('[data-diario]');
  if (!raiz) return;

  const $ = (id) => document.getElementById(id);
  const buscador = $('diarioBuscar');
  const chipsCat = $('diarioCats');
  const chipsTipo = $('diarioTipos');
  const portada = $('diarioPortada');
  const linea = $('diarioLinea');
  const vacio = $('diarioVacio');
  const cuenta = $('diarioCuenta');

  let consulta = '';
  let categoria = 'todas';
  let tipo = 'todos';
  let webActiva = 'todas';

  // Las noticias se escriben aqui y cada web del grupo coge las suyas. En el
  // colegio salen todas y se pueden filtrar por web.
  const WEBS = {
    colegio: { nombre: 'Colegio', icono: 'bi-mortarboard' },
    infantil: { nombre: 'Escuela Infantil', icono: 'bi-balloon-heart' },
    campamento: { nombre: 'Campamento', icono: 'bi-sun' },
    dragons: { nombre: 'Dolores Dragons', icono: 'bi-dribbble' },
    dragonsden: { nombre: 'Dragons Den', icono: 'bi-trophy' },
  };
  const websDe = (n) => n.webs || ['colegio'];

  // Filtros con recuento real (antes eran enlaces "#" que no hacían nada)
  const contar = (clave, valor) => NOTICIAS.filter((n) => n[clave] === valor).length;
  chipsCat.innerHTML = [`<button type="button" class="diario-filtro" data-cat="todas" aria-pressed="true">Todo <span>${NOTICIAS.length}</span></button>`]
    .concat(Object.keys(CATS).filter((k) => contar('categoria', k)).map((k) =>
      `<button type="button" class="diario-filtro" data-cat="${k}" aria-pressed="false"><i class="bi ${CATS[k].icono}" aria-hidden="true"></i>${esc(CATS[k].nombre)} <span>${contar('categoria', k)}</span></button>`)).join('');
  const contarWeb = (k) => NOTICIAS.filter((n) => websDe(n).indexOf(k) >= 0).length;
  const chipsWeb = $('diarioWebs');
  if (chipsWeb) {
    chipsWeb.innerHTML = [`<button type="button" class="diario-filtro" data-web="todas" aria-pressed="true">Todas las webs <span>${NOTICIAS.length}</span></button>`]
      .concat(Object.keys(WEBS).filter(contarWeb).map((k) =>
        `<button type="button" class="diario-filtro" data-web="${k}" aria-pressed="false"><i class="bi ${WEBS[k].icono}" aria-hidden="true"></i>${esc(WEBS[k].nombre)} <span>${contarWeb(k)}</span></button>`)).join('');
  }

  chipsTipo.innerHTML = [`<button type="button" class="diario-seg" data-tipo="todos" aria-pressed="true">Todo</button>`]
    .concat(Object.keys(TIPOS).filter((k) => contar('tipo', k)).map((k) =>
      `<button type="button" class="diario-seg" data-tipo="${k}" aria-pressed="false">${TIPOS[k].nombre}s</button>`)).join('');

  const filtrar = () => {
    const q = normalizar(consulta).trim();
    return NOTICIAS.filter((n) => {
      if (categoria !== 'todas' && n.categoria !== categoria) return false;
      if (webActiva !== 'todas' && websDe(n).indexOf(webActiva) < 0) return false;
      if (tipo !== 'todos' && n.tipo !== tipo) return false;
      if (!q) return true;
      const texto = normalizar([n.titulo, n.resumen, n.texto, (CATS[n.categoria] || {}).nombre, n.firma, (n.etiquetas || []).join(' ')].join(' '));
      return q.split(/\s+/).every((p) => texto.includes(p));
    });
  };

  const portadaDe = (n, clase) => (window.NSD_PORTADA ? window.NSD_PORTADA(n, clase) : '');

  const entrada = (n, i) => {
    const { d, m, a } = partes(n.fecha);
    const cuerpoBreve = n.tipo === 'breve'
      ? (n.texto ? `<details class="diario-breve"><summary>Leer el breve</summary><p>${esc(n.texto)}${n.url ? ` ${enlace(n, 'Más información')}` : ''}</p></details>` : '')
      : `<p class="diario-ir">${enlace(n, `${n.tipo === 'reportaje' ? 'Leer el reportaje' : 'Ver el comunicado'} <i class="bi ${externo(n.url) ? 'bi-box-arrow-up-right' : 'bi-arrow-right'}" aria-hidden="true"></i>`)}</p>`;
    // El id es la fecha (enlaces #AAAA-MM-DD); si coinciden dos, la segunda lleva sufijo
    const id = idsUsados[n.fecha] ? `${n.fecha}-${++idsUsados[n.fecha]}` : (idsUsados[n.fecha] = 1, n.fecha);
    return `<li class="diario-entrada diario-entrada--${n.tipo}" id="${id}" data-reveal data-reveal-delay="${(i % 8) + 1}">
      <time class="diario-fecha" datetime="${n.fecha}" title="${fechaLarga(n.fecha)}"><b>${d}</b><span>${MESES[m - 1]} ${String(a).slice(2)}</span></time>
      <article>
        <a class="diario-entrada__portada" href="${n.url || '#' + n.fecha}" tabindex="-1" aria-hidden="true">${portadaDe(n, 'portada-noticia--mini')}</a>
        <div class="diario-chips">${chipCat(n)}${chipTipo(n)}${chipDoc(n)}</div>
        <h3>${n.url && n.tipo !== 'breve' ? enlace(n, esc(n.titulo)) : esc(n.titulo)}</h3>
        <p>${esc(n.resumen)}</p>
        ${cuerpoBreve}
      </article>
    </li>`;
  };

  // Junto a la principal, las dos siguientes que tienen página propia
  const acompanan = (lista, destacada) => lista.filter((n) => n !== destacada && n.url && n.tipo !== 'breve').slice(0, 2);

  const pintarPortada = (lista) => {
    // En portada va lo último con página propia; sin filtros activos
    const hayFiltro = consulta || categoria !== 'todas' || tipo !== 'todos';
    const destacada = !hayFiltro && lista.find((n) => n.url && !externo(n.url));
    portada.hidden = !destacada;
    if (!destacada) return null;
    const siguientes = acompanan(lista, destacada);
    portada.innerHTML = `
      <article class="diario-portada__principal" data-reveal="zoom">
        <a class="diario-portada__foto" href="${destacada.url}" tabindex="-1" aria-hidden="true">${portadaDe(destacada)}</a>
        <div class="diario-chips">${chipCat(destacada)}${chipTipo(destacada)}${chipDoc(destacada)}</div>
        <h2>${enlace(destacada, esc(destacada.titulo))}</h2>
        <p>${esc(destacada.resumen)}</p>
        <p class="diario-portada__pie"><time datetime="${destacada.fecha}">${fechaLarga(destacada.fecha)}</time>
          ${enlace(destacada, `${destacada.tipo === 'reportaje' ? 'Leer el reportaje' : 'Leerlo entero'} <i class="bi bi-arrow-right" aria-hidden="true"></i>`, 'btn btn--gold')}</p>
      </article>
      <div class="diario-portada__lateral">
        <h2 class="diario-portada__rotulo">Más para leer</h2>
        ${siguientes.map((n, i) => `<article data-reveal="right" data-reveal-delay="${i + 2}"><a class="diario-portada__mini" href="${n.url || '#' + n.fecha}" tabindex="-1" aria-hidden="true">${portadaDe(n, 'portada-noticia--mini')}</a><div class="diario-chips">${chipCat(n)}</div><h3>${n.url && n.tipo !== 'breve' ? enlace(n, esc(n.titulo)) : `<a href="#${n.fecha}">${esc(n.titulo)}</a>`}</h3><time datetime="${n.fecha}">${fechaLarga(n.fecha)}</time></article>`).join('')}
      </div>`;
    revelar(portada);
    return destacada;
  };

  let idsUsados = {};
  const pintar = () => {
    idsUsados = {};
    const lista = filtrar();
    const destacada = pintarPortada(lista);
    // Lo que ya sale en la portada no se repite en la línea de tiempo
    const enPortada = destacada ? [destacada, ...acompanan(lista, destacada)] : [];
    const resto = lista.filter((n) => !enPortada.includes(n));
    // Agrupar por curso escolar, del más reciente al más antiguo
    const cursos = [];
    resto.forEach((n) => {
      const c = cursoDe(n.fecha);
      let g = cursos.find((x) => x.curso === c);
      if (!g) { g = { curso: c, items: [] }; cursos.push(g); }
      g.items.push(n);
    });
    linea.innerHTML = cursos.map((g) => `
      <section class="diario-curso" aria-labelledby="curso-${g.curso}">
        <h2 class="diario-curso__titulo" id="curso-${g.curso}"><span>Curso</span> ${g.curso}</h2>
        <ol class="diario-curso__lista">${g.items.map((n, i) => entrada(n, i)).join('')}</ol>
      </section>`).join('');
    revelar(linea);
    vacio.hidden = lista.length > 0;
    cuenta.textContent = lista.length === NOTICIAS.length
      ? `${lista.length} publicaciones`
      : `${lista.length} de ${NOTICIAS.length} publicaciones`;
  };

  const marcar = (cont, attr, valor) => cont.querySelectorAll(`[data-${attr}]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[attr] === valor)));
  chipsCat.addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (!b) return; categoria = b.dataset.cat; marcar(chipsCat, 'cat', categoria); pintar(); });
  chipsTipo.addEventListener('click', (e) => { const b = e.target.closest('[data-tipo]'); if (!b) return; tipo = b.dataset.tipo; marcar(chipsTipo, 'tipo', tipo); pintar(); });
  if (chipsWeb) chipsWeb.addEventListener('click', (e) => { const b = e.target.closest('[data-web]'); if (!b) return; webActiva = b.dataset.web; marcar(chipsWeb, 'web', webActiva); pintar(); });
  buscador.addEventListener('input', () => { consulta = buscador.value; pintar(); });
  const limpiar = $('diarioLimpiar');
  if (limpiar) limpiar.addEventListener('click', () => {
    consulta = ''; buscador.value = ''; categoria = 'todas'; tipo = 'todos';
    marcar(chipsCat, 'cat', categoria); marcar(chipsTipo, 'tipo', tipo); pintar(); buscador.focus();
  });

  // Filtros desde la dirección: /blog?q=Matemáticas o /blog?cat=eso
  // (los usan las etiquetas de cada entrada)
  const params = new URLSearchParams(location.search);
  if (params.get('q')) { consulta = params.get('q').slice(0, 80); buscador.value = consulta; }
  if (params.get('cat') && chipsCat.querySelector(`[data-cat="${CSS.escape(params.get('cat'))}"]`)) { categoria = params.get('cat'); marcar(chipsCat, 'cat', categoria); }

  raiz.classList.add('is-listo');
  pintar();
  // Enlace directo a una entrada (#AAAA-MM-DD): abrir su breve si lo tiene
  if (location.hash) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) { const det = el.querySelector('details'); if (det) det.open = true; el.scrollIntoView({ block: 'center' }); el.classList.add('is-destacada'); }
  }
  }
  (window.NSD_CMS_NOTICIAS || Promise.resolve()).then(iniciar, iniciar);
})();
