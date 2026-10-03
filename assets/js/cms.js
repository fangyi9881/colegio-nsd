/* =========================================================
   Colegio NSD · Contenido editable en la web pública
   ---------------------------------------------------------
   Lee lo que se publica desde el panel (/panel) y lo pinta en la
   página. Sin librerías: una sola petición a la API de Supabase
   por página, con la clave pública.

   Uso en el HTML:
     <p data-cms="secretaria:aviso">Texto de serie</p>
     <div data-cms="legal:dpd_email" data-cms-tipo="email">…</div>
     <div data-cms="informacion-familias:precios" data-cms-tipo="filas"
          data-cms-columnas="concepto:Actividad o servicio|precio:Precio"></div>
     data-cms-ocultar-vacio  → si no hay contenido, oculta el
                               elemento con ese atributo
                               (data-cms-bloque="secretaria:aviso").

   Todo se pinta creando nodos (textContent), nunca con innerHTML
   de lo que llega: aunque alguien escribiera HTML en el panel, aquí
   se vería como texto.
   ========================================================= */
(function () {
  'use strict';

  const C = window.NSD_CMS_CONFIG || {};
  const ACTIVO = !!(C.url && C.anonKey);
  const URL_API = ACTIVO ? C.url.replace(/\/+$/, '') : '';

  // ── Enlaces seguros: solo https, correo, teléfono o rutas de la web ──
  function urlSegura(u) {
    const s = String(u || '').trim();
    if (/^(https:\/\/|mailto:|tel:)/i.test(s)) return s;
    if (/^\/(?!\/)/.test(s)) return s;
    return '';
  }
  const esExterna = (u) => /^https:\/\//i.test(u) && !u.startsWith(location.origin);

  function el(tag, clase, texto) {
    const e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function enlace(texto, url) {
    const u = urlSegura(url);
    if (!u) return document.createTextNode(texto);
    const a = el('a', null, texto);
    a.href = u;
    if (esExterna(u)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  }

  // Texto de una línea con [enlaces](https://…) y **negritas**
  function enLinea(destino, texto) {
    const re = /\[([^\]]{1,200})\]\(([^)\s]{1,500})\)|\*\*([^*]{1,300})\*\*/g;
    let ultimo = 0, m;
    while ((m = re.exec(texto))) {
      if (m.index > ultimo) destino.appendChild(document.createTextNode(texto.slice(ultimo, m.index)));
      if (m[1] != null) destino.appendChild(enlace(m[1], m[2]));
      else destino.appendChild(el('strong', null, m[3]));
      ultimo = re.lastIndex;
    }
    if (ultimo < texto.length) destino.appendChild(document.createTextNode(texto.slice(ultimo)));
    return destino;
  }

  // Párrafos: línea en blanco separa; líneas que empiezan por "- " son lista
  function parrafos(texto) {
    const f = document.createDocumentFragment();
    String(texto || '').replace(/\r/g, '').split(/\n\s*\n/).forEach((bloque) => {
      const lineas = bloque.split('\n').map((l) => l.trim()).filter(Boolean);
      if (!lineas.length) return;
      if (lineas.every((l) => /^[-•*]\s+/.test(l))) {
        const ul = el('ul');
        lineas.forEach((l) => ul.appendChild(enLinea(el('li'), l.replace(/^[-•*]\s+/, ''))));
        f.appendChild(ul);
      } else {
        f.appendChild(enLinea(el('p'), lineas.join(' ')));
      }
    });
    return f;
  }

  function lista(items, clase) {
    const ul = el('ul', clase || null);
    (Array.isArray(items) ? items : []).filter(Boolean).forEach((t) => ul.appendChild(enLinea(el('li'), String(t))));
    return ul;
  }

  function enlaces(items) {
    const ul = el('ul', 'cms-enlaces');
    (Array.isArray(items) ? items : []).forEach((x) => {
      if (!x || !x.texto) return;
      const li = el('li');
      li.appendChild(enlace(x.texto, x.url));
      ul.appendChild(li);
    });
    return ul;
  }

  function documentos(items) {
    const ul = el('ul', 'cms-docs');
    (Array.isArray(items) ? items : []).forEach((d) => {
      const u = urlSegura(d && d.url);
      if (!u) return;
      const li = el('li');
      const a = el('a', 'cms-doc');
      a.href = u; a.target = '_blank'; a.rel = 'noopener';
      const ico = el('i', 'bi bi-file-earmark-pdf'); ico.setAttribute('aria-hidden', 'true');
      a.appendChild(ico);
      a.appendChild(el('span', 'cms-doc__titulo', d.titulo || 'Documento'));
      a.appendChild(el('span', 'cms-doc__tipo', 'PDF'));
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul;
  }

  // columnas: [{clave, etiqueta, tipo}]
  function filas(datos, columnas) {
    const marco = el('div', 'tabla-marco cms-tabla');
    const t = el('table');
    const thead = el('thead'); const tr = el('tr');
    columnas.forEach((c) => { const th = el('th', null, c.etiqueta); th.scope = 'col'; tr.appendChild(th); });
    thead.appendChild(tr); t.appendChild(thead);
    const tb = el('tbody');
    (Array.isArray(datos) ? datos : []).forEach((f) => {
      const r = el('tr');
      columnas.forEach((c, i) => {
        const td = el(i === 0 ? 'th' : 'td');
        if (i === 0) td.scope = 'row';
        const v = f ? f[c.clave] : '';
        if (c.tipo === 'url') { if (urlSegura(v)) td.appendChild(enlace('Abrir', v)); }
        else enLinea(td, String(v == null ? '' : v));
        r.appendChild(td);
      });
      tb.appendChild(r);
    });
    t.appendChild(tb); marco.appendChild(t);
    return marco;
  }

  const vacio = (v) => v == null || v === '' || (Array.isArray(v) && !v.filter(Boolean).length)
    || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);

  // ── Lectura ──
  const cache = {};
  function leer(ambitos) {
    if (!ACTIVO) return Promise.resolve({});
    const ids = [...new Set(ambitos)].filter((a) => /^[a-z0-9-]+$/.test(a));
    if (!ids.length) return Promise.resolve({});
    const clave = ids.sort().join(',');
    if (cache[clave]) return cache[clave];
    const ctrl = window.AbortController ? new AbortController() : null;
    const t = setTimeout(() => ctrl && ctrl.abort(), 5000);
    cache[clave] = fetch(`${URL_API}/rest/v1/contenidos?select=ambito_id,clave,valor,actualizado_en&ambito_id=in.(${ids.join(',')})`, {
      headers: { apikey: C.anonKey, Authorization: `Bearer ${C.anonKey}` },
      signal: ctrl ? ctrl.signal : undefined
    }).then((r) => (r.ok ? r.json() : [])).then((filasLeidas) => {
      const out = {};
      filasLeidas.forEach((f) => {
        (out[f.ambito_id] = out[f.ambito_id] || {})[f.clave] = f.valor;
        (out[f.ambito_id].__fechas = out[f.ambito_id].__fechas || {})[f.clave] = f.actualizado_en;
      });
      return out;
    }).catch(() => ({})).finally(() => clearTimeout(t));
    return cache[clave];
  }

  // ── Pintar los [data-cms] de la página ──
  function columnasDe(nodo) {
    return (nodo.getAttribute('data-cms-columnas') || '').split('|').filter(Boolean).map((p) => {
      const [clave, etiqueta, tipo] = p.split(':');
      return { clave, etiqueta: etiqueta || clave, tipo };
    });
  }

  function aplicar(nodo, valor) {
    const tipo = nodo.getAttribute('data-cms-tipo') || 'texto';
    const ref = nodo.getAttribute('data-cms');
    const bloque = document.querySelector(`[data-cms-bloque="${ref}"]`);
    if (vacio(valor)) {
      if (nodo.hasAttribute('data-cms-ocultar-vacio') && bloque) bloque.hidden = true;
      return;
    }
    if (bloque) bloque.hidden = false;
    nodo.textContent = '';
    if (tipo === 'texto') nodo.textContent = String(valor);
    else if (tipo === 'email') {
      const e = String(valor).trim();
      if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(e)) nodo.appendChild(enlace(e, 'mailto:' + e));
      else nodo.textContent = e;
    } else if (tipo === 'url') { const a = enlace(nodo.getAttribute('data-cms-texto') || 'Abrir', valor); nodo.appendChild(a); }
    else if (tipo === 'parrafos') nodo.appendChild(parrafos(valor));
    else if (tipo === 'lista') nodo.appendChild(lista(valor));
    else if (tipo === 'enlaces') nodo.appendChild(enlaces(valor));
    else if (tipo === 'documentos') nodo.appendChild(documentos(valor));
    else if (tipo === 'filas') nodo.appendChild(filas(valor, columnasDe(nodo)));
    nodo.classList.add('cms-publicado');
  }

  function pintarPagina(raiz) {
    const nodos = [...(raiz || document).querySelectorAll('[data-cms]')];
    if (!nodos.length || !ACTIVO) return Promise.resolve();
    const ambitos = nodos.map((n) => n.getAttribute('data-cms').split(':')[0]);
    return leer(ambitos).then((datos) => {
      nodos.forEach((n) => {
        const [a, k] = n.getAttribute('data-cms').split(':');
        if (datos[a] && k in datos[a]) aplicar(n, datos[a][k]);
      });
    });
  }

  // ── Comunicados breves del panel → lista de noticias de la web ──
  // home-noticias.js y noticias.js esperan a esta promesa (como mucho
  // unos segundos) antes de pintar, así salen ya mezcladas por fecha.
  if (window.NSD_NOTICIAS) {
    window.NSD_CMS_NOTICIAS = !ACTIVO ? Promise.resolve() : Promise.race([
      leer(['noticias']).then((d) => {
        const breves = (d.noticias && d.noticias.breves) || [];
        const cats = window.NSD_CATEGORIAS || {};
        breves.forEach((b) => {
          if (!b || !/^\d{4}-\d{2}-\d{2}$/.test(b.fecha || '') || !b.titulo) return;
          if (b.publicado === false) return;
          window.NSD_NOTICIAS.push({
            fecha: b.fecha, titulo: String(b.titulo).slice(0, 160),
            categoria: cats[b.categoria] ? b.categoria : 'comunicados',
            tipo: urlSegura(b.url) ? 'comunicado' : 'breve',
            resumen: String(b.resumen || '').slice(0, 400), texto: String(b.texto || '').slice(0, 4000),
            url: urlSegura(b.url) || undefined, webs: ['colegio'], delPanel: true
          });
        });
      }),
      new Promise((r) => setTimeout(r, 2500))
    ]).catch(() => {});
  }

  window.NSD_CMS = { activo: ACTIVO, leer, pintarPagina, aplicar, urlSegura, render: { parrafos, lista, enlaces, documentos, filas, enLinea, el }, vacio };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => pintarPagina());
  else pintarPagina();
})();
