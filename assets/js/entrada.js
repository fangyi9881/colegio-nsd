/* =========================================================
   Colegio NSD · Una entrada del blog publicada desde el panel
   ---------------------------------------------------------
   /blog/entrada?e=<slug>. Pide la entrada a Supabase (solo
   devuelve lo publicado) y la pinta con los mismos estilos que
   los artículos escritos a mano. Todo el texto entra con
   textContent o con el render de cms.js: nunca HTML de la base
   de datos.
   ========================================================= */
(function () {
  'use strict';
  const main = document.querySelector('[data-entrada]');
  const CMS = window.NSD_CMS;
  if (!main || !CMS) return;

  const $ = (s) => main.querySelector(s);
  const R = CMS.render;
  const el = R.el;
  const CATS = window.NSD_CATEGORIAS || {};
  const TONOS = window.NSD_TONOS || {};
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fechaLarga = (f) => { const [a, m, d] = f.split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${a}`; };
  const slug = new URLSearchParams(location.search).get('e') || '';

  function icono(clase) {
    const i = el('i', 'bi ' + clase);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }
  function meta(clase, texto) {
    const s = el('span', 'meta');
    s.appendChild(icono(clase));
    s.appendChild(document.createTextNode(' ' + texto));
    return s;
  }
  function avisarVentana() {
    if (document.documentElement.classList.contains('en-ventana')) {
      window.parent.postMessage({ nsdPost: true, accion: 'lista', titulo: document.title }, location.origin);
    }
  }
  function listo() { main.removeAttribute('aria-busy'); }
  // partials.js rehace las migas de pan al cargar: el último paso es el actual
  const miga = (texto) => {
    const m = main.querySelector('[data-entrada-miga]') || main.querySelector('.crumbs [aria-current="page"]') || main.querySelector('.crumbs > span:last-child');
    if (m) m.textContent = texto;
  };

  function noEncontrada() {
    document.title = 'Entrada no encontrada · Blog · Colegio NSD';
    $('[data-entrada-titulo]').textContent = 'No encontramos esta entrada';
    $('[data-entrada-resumen]').textContent = 'Puede que se haya retirado o que el enlace esté incompleto.';
    miga('No encontrada');
    const cuerpo = $('[data-entrada-cuerpo]');
    cuerpo.textContent = '';
    const p = el('p');
    const a = el('a', 'btn btn--primary', 'Ver todas las noticias');
    a.href = '/blog';
    p.appendChild(a);
    cuerpo.appendChild(p);
    const robots = document.createElement('meta');
    robots.name = 'robots'; robots.content = 'noindex';
    document.head.appendChild(robots);
    listo(); avisarVentana();
  }

  function pintar(e) {
    const n = CMS.comoNoticia(e);
    const cat = CATS[n.categoria] || { nombre: 'Colegio', icono: 'bi-newspaper' };
    const url = location.origin + CMS.urlEntrada(e.slug);

    // Cabecera de la página y datos para compartir
    document.title = `${n.titulo} · Blog · Colegio NSD`;
    const canon = document.querySelector('[data-entrada-canonica]');
    if (canon) canon.href = url;
    const ponerMeta = (prop, valor, atr) => {
      let m = document.head.querySelector(`meta[${atr || 'property'}="${prop}"]`);
      if (!m) { m = document.createElement('meta'); m.setAttribute(atr || 'property', prop); document.head.appendChild(m); }
      m.setAttribute('content', valor);
    };
    ponerMeta('description', n.resumen || n.titulo, 'name');
    ponerMeta('og:title', `${n.titulo} · Colegio NSD`);
    ponerMeta('og:description', n.resumen || n.titulo);
    ponerMeta('og:url', url);
    ponerMeta('article:published_time', n.fecha);
    if (n.imagen) ponerMeta('og:image', n.imagen);

    // Portada: la foto de la entrada bajo un velo del color de su categoría
    const t = TONOS[n.categoria] || ['#10572C', '#5EBF78'];
    const hero = $('[data-entrada-hero]');
    hero.style.setProperty('--t1', t[0]);
    hero.style.setProperty('--t2', t[1]);
    if (n.imagen) { hero.style.setProperty('--foto', `url("${n.imagen.replace(/["\\]/g, '')}")`); hero.classList.add('entrada-hero--foto'); }

    miga(n.titulo.length > 48 ? n.titulo.slice(0, 46) + '…' : n.titulo);
    $('[data-entrada-titulo]').textContent = n.titulo;
    $('[data-entrada-resumen]').textContent = n.resumen;
    const m = $('[data-entrada-meta]');
    m.textContent = '';
    const fecha = meta('bi-calendar-event', '');
    const time = el('time', null, fechaLarga(n.fecha));
    time.dateTime = n.fecha;
    fecha.appendChild(time);
    m.appendChild(fecha);
    const enlaceCat = el('a', 'meta meta--enlace');
    enlaceCat.href = '/blog?cat=' + encodeURIComponent(n.categoria);
    enlaceCat.appendChild(icono(cat.icono));
    enlaceCat.appendChild(document.createTextNode(' ' + cat.nombre));
    m.appendChild(enlaceCat);
    if (n.firma) m.appendChild(meta('bi-person-badge', n.firma));

    // Cuerpo
    const cuerpo = $('[data-entrada-cuerpo]');
    cuerpo.textContent = '';
    if (n.imagen) {
      const fig = el('figure', 'entrada-foto');
      const img = document.createElement('img');
      img.src = n.imagen; img.alt = n.imagenAlt || ''; img.decoding = 'async';
      img.width = 1600; img.height = 1000;
      fig.appendChild(img);
      if (n.imagenAlt) fig.appendChild(el('figcaption', null, n.imagenAlt));
      cuerpo.appendChild(fig);
    }
    if (e.cuerpo) cuerpo.appendChild(R.parrafos(e.cuerpo));
    else if (!n.imagen) cuerpo.appendChild(el('p', 'lead', n.resumen));

    if (n.documento) {
      const caja = el('p', 'entrada-documento');
      const a = el('a', 'btn btn--primary');
      a.href = n.documento.url; a.target = '_blank'; a.rel = 'noopener';
      a.appendChild(icono('bi-file-earmark-pdf'));
      a.appendChild(document.createTextNode(' ' + n.documento.titulo));
      a.appendChild(el('span', 'sr-only', ' (PDF, se abre en otra pestaña)'));
      caja.appendChild(a);
      cuerpo.appendChild(caja);
    }

    // Pie: etiquetas, volver y compartir
    const pie = el('div', 'article-footer');
    if (n.etiquetas.length) {
      const etq = el('ul', 'entrada-etiquetas');
      etq.setAttribute('aria-label', 'Etiquetas');
      n.etiquetas.forEach((x) => {
        const li = el('li');
        const a = el('a', null, x);
        a.href = '/blog?q=' + encodeURIComponent(x);
        li.appendChild(a);
        etq.appendChild(li);
      });
      cuerpo.appendChild(etq);
    }
    const volver = el('a', 'btn btn--ghost');
    volver.href = '/blog';
    volver.appendChild(icono('bi-arrow-left'));
    volver.appendChild(document.createTextNode(' Volver al blog'));
    pie.appendChild(volver);
    const compartir = el('div', 'article-share');
    compartir.appendChild(el('span', null, 'Compartir:'));
    const wa = el('a');
    wa.href = 'https://wa.me/?text=' + encodeURIComponent(`${n.titulo} · Colegio NSD ${url}`);
    wa.target = '_blank'; wa.rel = 'noopener noreferrer';
    wa.setAttribute('aria-label', 'Compartir por WhatsApp (se abre en otra pestaña)');
    wa.appendChild(icono('bi-whatsapp'));
    compartir.appendChild(wa);
    const copiar = el('button', 'entrada-copiar');
    copiar.type = 'button';
    copiar.setAttribute('aria-label', 'Copiar el enlace');
    copiar.appendChild(icono('bi-link-45deg'));
    copiar.addEventListener('click', () => {
      const hecho = () => { copiar.setAttribute('aria-label', 'Enlace copiado'); copiar.classList.add('is-copiado'); setTimeout(() => { copiar.classList.remove('is-copiado'); copiar.setAttribute('aria-label', 'Copiar el enlace'); }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(hecho, () => {});
    });
    compartir.appendChild(copiar);
    pie.appendChild(compartir);
    cuerpo.appendChild(pie);

    listo(); avisarVentana();
    pintarLateral(e);
  }

  // Lateral: más entradas del mismo ámbito y lo último del blog
  function pintarLateral(e) {
    const lateral = main.querySelector('[data-entrada-lateral]');
    (window.NSD_CMS_NOTICIAS || Promise.resolve()).then(() => {
      const todas = (window.NSD_NOTICIAS || []).filter((x) => x.url !== CMS.urlEntrada(e.slug))
        .sort((a, b) => b.fecha.localeCompare(a.fecha));
      const mismas = todas.filter((x) => x.firma && x.firma === e.firma).slice(0, 3);
      const ultimas = todas.filter((x) => mismas.indexOf(x) < 0 && x.url).slice(0, 3);
      const tarjeta = (titulo, lista) => {
        const c = el('div', 'aside__card');
        c.appendChild(el('h3', null, titulo));
        const ul = el('ul');
        lista.forEach((x) => {
          const li = el('li');
          const a = el('a', null, x.titulo + ' ');
          a.href = x.url;
          if (/^https?:/.test(x.url)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
          a.appendChild(icono('bi-arrow-right'));
          li.appendChild(a);
          ul.appendChild(li);
        });
        c.appendChild(ul);
        return c;
      };
      lateral.textContent = '';
      if (mismas.length) lateral.appendChild(tarjeta('Más de ' + e.firma, mismas));
      if (ultimas.length) lateral.appendChild(tarjeta('Lo último del colegio', ultimas));
      lateral.hidden = !lateral.children.length;
      pintarAutor(e, lateral);
    });
  }

  // Tarjeta de quien la ha escrito (si tiene ficha): arriba del lateral.
  // Al pulsarla se abre su ficha flotante (personas.js).
  function pintarAutor(e, lateral) {
    const P = window.NSD_PERSONAS;
    if (!P || !CMS.fichaDeEntrada) return;
    CMS.fichaDeEntrada(e.slug).then((ficha) => (ficha ? P.tarjeta(ficha) : '')).then((html) => {
      if (!html) return;
      const c = el('div', 'aside__card entrada-autor');
      c.appendChild(el('p', 'entrada-autor__t', 'Escrito por'));
      c.insertAdjacentHTML('beforeend', html);
      lateral.insertBefore(c, lateral.firstChild);
      lateral.hidden = false;
      P.hidratar(c);
    });
  }

  if (!slug || !CMS.activo) { noEncontrada(); return; }
  CMS.leerEntrada(slug).then((e) => (e ? pintar(e) : noEncontrada()), noEncontrada);
})();
