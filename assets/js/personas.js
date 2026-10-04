/* =========================================================
   Personas del colegio
   ---------------------------------------------------------
   · Pone la foto de cada persona en todas sus tarjetas
     ([data-persona="slug"]), sea la página que sea.
   · Al pulsar una tarjeta abre su ficha flotante: foto, cargos
     (todos los que tiene, en cualquier departamento), frase,
     biografía, formación, desde cuándo está en el centro, correo
     del colegio y sus últimas entradas del blog.
   · En /centro/persona?p=slug pinta la misma ficha como página,
     para quien abre el enlace en otra pestaña o lo comparte.

   Los cargos salen de los datos de la web (departamentos y equipo
   directivo) y de lo que cada departamento publique en el panel.
   Lo personal (foto, biografía…) sale de la tabla «fichas», que
   solo edita cada persona o la dirección (supabase/05_personas.sql).
   ========================================================= */
(function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CMS = () => window.NSD_CMS || null;
  const reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Hojas y scripts que hacen falta (por si la página no los trae) ──
  function hoja(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l);
  }
  function script(src, listo) {
    if (listo()) return Promise.resolve();
    const ya = document.querySelector(`script[src="${src}"]`);
    return new Promise((ok) => {
      if (ya) { ya.addEventListener('load', () => ok(), { once: true }); setTimeout(ok, 3000); return; }
      const s = document.createElement('script'); s.src = src; s.onload = () => ok(); s.onerror = () => ok(); document.head.appendChild(s);
    });
  }
  hoja('/assets/css/personas.css');
  const datosListos = () => script('/assets/js/departamentos-datos.js', () => !!window.NSD_DEPARTAMENTOS)
    .then(() => script('/assets/js/departamentos.js', () => !!window.NSD_FICHA));

  // ── Fichas (Supabase) ──
  let fichas = null;
  function leerFichas() {
    if (fichas) return fichas;
    const cms = CMS();
    fichas = (cms && cms.activo && cms.leerFichas ? cms.leerFichas() : Promise.resolve([]))
      .then((l) => { const m = new Map(); (l || []).forEach((f) => m.set(f.slug, f)); return m; })
      .catch(() => new Map());
    return fichas;
  }

  // ── Cargos de cada persona en toda la web ──
  let cargos = null;
  function leerCargos() {
    if (cargos) return cargos;
    cargos = datosListos().then(() => {
      const D = window.NSD_DEPARTAMENTOS; const F = window.NSD_FICHA;
      const m = new Map();
      if (!D || !F) return m;
      const poner = (nombre, c) => {
        const slug = F.slugPersona(nombre);
        if (!m.has(slug)) m.set(slug, { nombre, cargos: [] });
        const e = m.get(slug);
        if (!e.cargos.some((x) => x.cargo === c.cargo && x.donde === c.donde)) e.cargos.push(c);
      };
      const dir = D.DIRECCION || { direccion: [], gestion: [], otros: [] };
      [...dir.direccion, ...dir.gestion].forEach((x) => poner(x.nombre, { cargo: x.cargo, donde: x.ambito, url: '/centro/equipo-directivo', responsable: true }));
      (dir.otros || []).forEach((x) => poner(x.nombre, { cargo: x.cargo, donde: x.ambito, url: '', responsable: true }));
      const cms = CMS();
      const publicado = cms && cms.activo ? cms.leer(D.DEPARTAMENTOS.map((d) => d.id)).catch(() => ({})) : Promise.resolve({});
      return publicado.then((pub) => {
        D.DEPARTAMENTOS.forEach((d) => {
          const p = (pub && pub[d.id]) || {};
          const lineas = (Array.isArray(p.profesorado) && p.profesorado.length) ? p.profesorado : ((d.defecto || {}).profesorado || []);
          lineas.filter(Boolean).forEach((l) => {
            const x = F.persona(l);
            const cargo = x.cargo || (/auxiliar/i.test(x.grupo) ? 'Auxiliar de conversación' : 'Profesorado');
            poner(x.nombre, { cargo, donde: d.nombre + (x.grupo ? ' · ' + x.grupo : ''), url: '/centro/departamentos/' + d.slug, responsable: x.responsable });
          });
        });
        return m;
      });
    }).catch(() => new Map());
    return cargos;
  }

  const iniciales = (n) => String(n || '').split(/\s+/).filter((x) => x && ['de', 'del', 'la', 'las', 'los', 'y'].indexOf(x.toLowerCase()) < 0)
    .map((x) => x.charAt(0)).slice(0, 2).join('').toUpperCase();
  const fotoValida = (u) => /^https:\/\/[^\s"'<>]+$/.test(u || '');

  // ── Fotos en las tarjetas ──
  function hidratar(raiz) {
    const nodos = [...(raiz || document).querySelectorAll('[data-persona]')];
    if (!nodos.length) return Promise.resolve();
    return leerFichas().then((m) => {
      nodos.forEach((n) => {
        const f = m.get(n.getAttribute('data-persona'));
        if (!f || !fotoValida(f.foto)) return;
        const hueco = n.querySelector('.persona__avatar, .hueco, [data-persona-foto]');
        if (!hueco || hueco.querySelector('img')) return;
        const img = new Image();
        img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.src = f.foto;
        img.onload = () => hueco.classList.add('con-foto');
        img.onerror = () => img.remove();
        hueco.appendChild(img);
      });
    });
  }

  // ── Contenido de la ficha ──
  function parrafos(t) {
    return String(t || '').replace(/\r/g, '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
      .map((b) => `<p>${esc(b).replace(/\n/g, '<br>')}</p>`).join('');
  }
  function htmlContenido(slug, datos, f, enPagina) {
    const nombre = (f && f.nombre) || (datos && datos.nombre) || '';
    const lista = (datos && datos.cargos) || [];
    const lideres = lista.filter((c) => c.responsable);
    const principal = (lideres[0] || lista[0] || {}).cargo || '';
    const foto = f && fotoValida(f.foto) ? `<img src="${esc(f.foto)}" alt="Foto de ${esc(nombre)}" />` : '';
    const anios = f && f.desde ? new Date().getFullYear() - f.desde : 0;
    const datosRapidos = [
      f && f.desde ? `<li><span class="ficha-dato__n">${anios > 0 ? anios : '1'}</span><span class="ficha-dato__t">${anios === 1 || anios <= 0 ? 'año' : 'años'} en el colegio<br><small>desde ${esc(f.desde)}</small></span></li>` : '',
      lista.length ? `<li><span class="ficha-dato__n">${lista.length}</span><span class="ficha-dato__t">${lista.length === 1 ? 'cargo o equipo' : 'cargos y equipos'}</span></li>` : ''
    ].join('');
    const titulo = enPagina ? 'h1' : 'h2';
    const tonoDe = (c) => { const m = /\/centro\/departamentos\/([a-z0-9-]+)/.exec((c && c.url) || ''); return m ? m[1] : ''; };
    const tono = tonoDe(lideres[0] || lista[0]);
    return `<span class="ficha-tono" data-tono-ficha="${esc(tono)}" hidden></span><header class="ficha-cab">
        <span class="ficha-foto${foto ? ' con-foto' : ''}" aria-hidden="${foto ? 'false' : 'true'}">${foto || esc(iniciales(nombre))}</span>
        <div class="ficha-cab__txt">
          <${titulo} class="ficha-nombre" id="ficha-nombre">${esc(nombre)}</${titulo}>
          ${principal ? `<p class="ficha-principal">${esc(principal)}</p>` : ''}
          ${f && f.frase ? `<p class="ficha-frase">«${esc(f.frase)}»</p>` : ''}
        </div>
      </header>
      ${datosRapidos ? `<ul class="ficha-datos">${datosRapidos}</ul>` : ''}
      ${lista.length ? `<section class="ficha-bloque"><h3>En el colegio</h3><ul class="ficha-cargos">${lista.map((c) => `<li class="${c.responsable ? 'es-responsable' : ''}"${tonoDe(c) ? ` data-tono="${esc(tonoDe(c))}"` : ''}>${c.url ? `<a href="${esc(c.url)}">` : '<span>'}<strong>${esc(c.cargo)}</strong><small>${esc(c.donde)}</small>${c.url ? '<i class="bi bi-arrow-right" aria-hidden="true"></i></a>' : '</span>'}</li>`).join('')}</ul></section>` : ''}
      ${f && f.bio ? `<section class="ficha-bloque"><h3>Sobre ${esc(nombre.split(' ')[0])}</h3><div class="ficha-bio">${parrafos(f.bio)}</div></section>` : ''}
      ${f && f.formacion ? `<section class="ficha-bloque"><h3>Formación</h3><p class="ficha-formacion">${esc(f.formacion)}</p></section>` : ''}
      <section class="ficha-bloque" data-ficha-blog hidden><h3>En el blog</h3><ul class="ficha-blog"></ul></section>
      <footer class="ficha-pie">
        ${f && f.correo ? `<a class="btn btn--primary btn--sm" href="mailto:${esc(f.correo)}"><i class="bi bi-envelope" aria-hidden="true"></i> Escribir</a>` : `<a class="btn btn--ghost btn--sm" href="/contacto"><i class="bi bi-envelope" aria-hidden="true"></i> Contactar con secretaría</a>`}
        ${enPagina ? '<a class="btn btn--ghost btn--sm" href="/centro/organigrama"><i class="bi bi-diagram-3" aria-hidden="true"></i> Organigrama</a>' : `<a class="btn btn--ghost btn--sm" href="/centro/persona?p=${encodeURIComponent(slug)}"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Abrir como página</a>`}
      </footer>
      ${!f || (!f.bio && !f.foto) ? '<p class="ficha-nota">Esta ficha aún no está completa. Cada persona del colegio puede añadir su foto y su presentación desde el <a href="/acceso">portal del profesorado</a>.</p>' : ''}`;
  }
  function blogDe(slug, raiz) {
    const cms = CMS();
    if (!cms || !cms.entradasDeFicha) return;
    cms.entradasDeFicha(slug, 4).then((l) => {
      const caja = raiz.querySelector('[data-ficha-blog]');
      if (!caja || !l || !l.length) return;
      const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      caja.querySelector('ul').innerHTML = l.map((e) => {
        const [a, m, d] = String(e.fecha).split('-').map(Number);
        return `<li><a href="${esc(cms.urlEntrada(e.slug))}">${esc(e.titulo)}</a><time datetime="${esc(e.fecha)}">${d} ${MES[m - 1]} ${a}</time></li>`;
      }).join('');
      caja.hidden = false;
    });
  }

  // El color de la ficha es el de su departamento principal
  function ponerTono(caja) {
    const m = caja && caja.querySelector('[data-tono-ficha]');
    if (!caja) return;
    if (m && m.getAttribute('data-tono-ficha')) caja.setAttribute('data-tono', m.getAttribute('data-tono-ficha'));
    else caja.setAttribute('data-tono', 'centro');
  }

  // ── Ventana flotante ──
  let dialogo = null;
  let origen = null;
  function crearDialogo() {
    if (dialogo) return dialogo;
    dialogo = document.createElement('dialog');
    dialogo.className = 'ficha-ventana';
    dialogo.setAttribute('aria-labelledby', 'ficha-nombre');
    dialogo.innerHTML = '<div class="ficha-ventana__caja"><button type="button" class="ficha-cerrar" data-ficha-cerrar aria-label="Cerrar ficha"><i class="bi bi-x-lg" aria-hidden="true"></i></button><div class="ficha" data-ficha-cuerpo></div></div>';
    document.body.appendChild(dialogo);
    dialogo.addEventListener('click', (e) => {
      if (e.target === dialogo || e.target.closest('[data-ficha-cerrar]')) cerrar();
    });
    dialogo.addEventListener('cancel', (e) => { e.preventDefault(); cerrar(); });
    return dialogo;
  }
  function cerrar() {
    if (!dialogo || !dialogo.open) return;
    const fin = () => { dialogo.classList.remove('saliendo'); dialogo.close(); document.documentElement.classList.remove('ficha-abierta'); if (origen) origen.focus(); };
    if (reducir) { fin(); return; }
    dialogo.classList.add('saliendo');
    setTimeout(fin, 180);
  }
  function abrir(slug, desde) {
    origen = desde || document.activeElement;
    const d = crearDialogo();
    const cuerpo = d.querySelector('[data-ficha-cuerpo]');
    cuerpo.innerHTML = '<p class="ficha-cargando">Cargando la ficha…</p>';
    if (!d.open) { d.showModal(); document.documentElement.classList.add('ficha-abierta'); }
    Promise.all([leerCargos(), leerFichas()]).then(([c, f]) => {
      cuerpo.innerHTML = htmlContenido(slug, c.get(slug), f.get(slug), false);
      ponerTono(cuerpo);
      blogDe(slug, cuerpo);
      const x = d.querySelector('[data-ficha-cerrar]'); if (x) x.focus();
    });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-persona]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (typeof HTMLDialogElement === 'undefined') return;   // navegador sin <dialog>: va a la página
    e.preventDefault();
    abrir(a.getAttribute('data-persona'), a);
  });

  // ── Tarjeta para otras páginas (autor de una entrada) ──
  function tarjeta(slug) {
    return Promise.all([leerCargos(), leerFichas()]).then(([c, f]) => {
      const datos = c.get(slug); const fi = f.get(slug);
      const nombre = (fi && fi.nombre) || (datos && datos.nombre);
      if (!nombre) return '';
      const cargo = datos && datos.cargos.length ? `${datos.cargos[0].cargo} · ${datos.cargos[0].donde}` : 'Colegio NSD';
      return `<a class="persona" href="/centro/persona?p=${encodeURIComponent(slug)}" data-persona="${esc(slug)}">
          <span class="persona__avatar" aria-hidden="true">${esc(iniciales(nombre))}</span>
          <span class="persona__txt"><span class="persona__nombre">${esc(nombre)}</span><span class="persona__cargo">${esc(cargo)}</span></span>
        </a>`;
    });
  }

  // ── /centro/persona?p=slug ──
  const pagina = document.querySelector('[data-persona-pagina]');
  if (pagina) {
    const slug = new URLSearchParams(location.search).get('p') || '';
    Promise.all([leerCargos(), leerFichas()]).then(([c, f]) => {
      const datos = c.get(slug); const fi = f.get(slug);
      if (!/^[a-z0-9-]{3,80}$/.test(slug) || (!datos && !fi)) {
        pagina.innerHTML = '<div class="ficha ficha--vacia"><h1 class="ficha-nombre">No encontramos esta ficha</h1><p>Puede que el enlace esté mal copiado. Todo el equipo está en el <a href="/centro/organigrama">organigrama</a>.</p></div>';
        return;
      }
      const nombre = (fi && fi.nombre) || datos.nombre;
      document.title = `${nombre} · Colegio NSD`;
      const miga = document.querySelector('[data-persona-miga]'); if (miga) miga.textContent = nombre;
      pagina.innerHTML = `<article class="ficha ficha--pagina">${htmlContenido(slug, datos, fi, true)}</article>`;
      ponerTono(pagina.querySelector('.ficha'));
      blogDe(slug, pagina);
    });
  }

  hidratar();
  window.NSD_PERSONAS = { abrir, hidratar, tarjeta };
})();
