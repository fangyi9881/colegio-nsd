/* =========================================================
   Ficha de un departamento o etapa
   ---------------------------------------------------------
   Un solo pintor para dos sitios:
   · scripts/generar-departamentos.mjs lo usa para escribir el HTML
     de cada página con los datos de serie (así la ficha se ve y se
     indexa aunque no cargue el JavaScript);
   · en el navegador vuelve a pintar la ficha con lo que el
     departamento haya publicado desde el panel.
   Todo el texto pasa por esc(); los enlaces, por urlSegura().
   ========================================================= */
(function (raiz) {
  'use strict';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function urlSegura(u) {
    const s = String(u || '').trim();
    if (/^(https:\/\/|mailto:|tel:)/i.test(s)) return s;
    if (/^\/(?!\/)/.test(s)) return s;
    return '';
  }
  const externo = (u) => /^https:\/\//i.test(u);
  const aEnlace = (texto, url) => {
    const u = urlSegura(url);
    if (!u) return esc(texto);
    return `<a href="${esc(u)}"${externo(u) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(texto)}</a>`;
  };
  // [texto](url) y **negrita** dentro de una línea ya escapada a trozos
  function enLinea(texto) {
    const re = /\[([^\]]{1,200})\]\(([^)\s]{1,500})\)|\*\*([^*]{1,300})\*\*/g;
    let out = '', ultimo = 0, m;
    const t = String(texto || '');
    while ((m = re.exec(t))) {
      out += esc(t.slice(ultimo, m.index));
      out += m[1] != null ? aEnlace(m[1], m[2]) : `<strong>${esc(m[3])}</strong>`;
      ultimo = re.lastIndex;
    }
    return out + esc(t.slice(ultimo));
  }
  function parrafos(texto) {
    return String(texto || '').replace(/\r/g, '').split(/\n\s*\n/).map((b) => {
      const l = b.split('\n').map((x) => x.trim()).filter(Boolean);
      if (!l.length) return '';
      if (l.every((x) => /^[-•*]\s+/.test(x))) return `<ul>${l.map((x) => `<li>${enLinea(x.replace(/^[-•*]\s+/, ''))}</li>`).join('')}</ul>`;
      return `<p>${enLinea(l.join(' '))}</p>`;
    }).join('');
  }
  const lista = (a, clase) => `<ul${clase ? ` class="${clase}"` : ''}>${(a || []).filter(Boolean).map((x) => `<li>${enLinea(x)}</li>`).join('')}</ul>`;
  const enlaces = (a) => `<ul class="cms-enlaces">${(a || []).filter((x) => x && x.texto).map((x) => `<li>${aEnlace(x.texto, x.url)}</li>`).join('')}</ul>`;
  const documentos = (a) => `<ul class="cms-docs">${(a || []).filter((d) => d && urlSegura(d.url)).map((d) =>
    `<li><a class="cms-doc" href="${esc(urlSegura(d.url))}" target="_blank" rel="noopener"><i class="bi bi-file-earmark-pdf" aria-hidden="true"></i><span class="cms-doc__titulo">${esc(d.titulo || 'Documento')}</span><span class="cms-doc__tipo">PDF</span></a></li>`).join('')}</ul>`;
  const filas = (datos, cols) => `<div class="tabla-marco cms-tabla"><table><thead><tr>${cols.map((c) => `<th scope="col">${esc(c.etiqueta)}</th>`).join('')}</tr></thead><tbody>${
    (datos || []).map((f) => `<tr>${cols.map((c, i) => {
      const v = f ? f[c.clave] : '';
      const celda = c.tipo === 'url' ? (urlSegura(v) ? aEnlace('Abrir', v) : '') : enLinea(v);
      return i === 0 ? `<th scope="row">${celda}</th>` : `<td>${celda}</td>`;
    }).join('')}</tr>`).join('')}</tbody></table></div>`;

  const vacio = (v) => v == null || v === '' || (Array.isArray(v) && !v.filter(Boolean).length)
    || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);

  function cursoEscolar(fecha) {
    const d = fecha || new Date();
    const a = d.getFullYear();
    return d.getMonth() >= 7 ? `${a}-${a + 1}` : `${a - 1}-${a}`;
  }

  // En la columna lateral, no en el cuerpo
  const LATERALES = ['cursos', 'areas'];
  const ANCLAS = { presentacion: 'presentacion' };

  function valorDe(campo, valor) {
    switch (campo.tipo) {
      case 'parrafos': return parrafos(valor);
      case 'lista': return lista(valor);
      case 'enlaces': return enlaces(valor);
      case 'documentos': return documentos(valor);
      case 'filas': return filas(valor, campo.columnas || []);
      default: return `<p>${enLinea(valor)}</p>`;
    }
  }

  // Un solo aviso arriba con lo que falta; en cada apartado, una marca corta.
  function avisoPendiente(curso, faltan) {
    return `<div class="dep-pendiente" role="note"><i class="bi bi-hourglass-split" aria-hidden="true"></i><span>Pendiente de publicar para el curso ${esc(curso)}: ${esc(faltan.join(', ').toLowerCase())}. Mientras tanto, se puede pedir en secretaría: <a href="tel:+34914719959">91&nbsp;471&nbsp;99&nbsp;59</a> o <a href="mailto:secretaria@colegionsdolores.es">secretaria@colegionsdolores.es</a>.</span></div>`;
  }
  const marcaPendiente = '<p class="dep-pendiente-corto"><i class="bi bi-hourglass-split" aria-hidden="true"></i>Pendiente de publicar por el departamento.</p>';

  function fechaLarga(iso) {
    try { return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; }
  }

  /**
   * dep: entrada de NSD_DEPARTAMENTOS; esquema: lista de campos;
   * publicado: { clave: valor, __fechas: { clave: iso } } (del panel)
   */
  function htmlFicha(dep, esquema, publicado, opciones) {
    const pub = publicado || {};
    const curso = (opciones && opciones.curso) || cursoEscolar();
    const v = (k) => (!vacio(pub[k]) ? pub[k] : (dep.defecto || {})[k]);
    const cuerpo = [];
    const indice = [];
    const faltan = [];

    esquema.forEach((campo) => {
      if (LATERALES.indexOf(campo.clave) >= 0) return;
      const valor = v(campo.clave);
      const id = ANCLAS[campo.clave] || campo.clave.replace(/_/g, '-');
      if (campo.clave === 'presentacion') {
        if (!vacio(valor)) cuerpo.push(`<div class="dep-intro prose" id="${id}">${parrafos(valor)}</div>`);
        return;
      }
      if (vacio(valor) && !campo.obligatorio) return;
      if (vacio(valor)) faltan.push(campo.etiqueta.replace(/ \(PDF\)$/, ''));
      indice.push(`<li><a href="#${id}">${esc(campo.etiqueta)}</a></li>`);
      cuerpo.push(`<section class="dep-bloque" id="${id}" aria-labelledby="${id}-t">
          <h2 id="${id}-t">${esc(campo.etiqueta)}</h2>
          <div class="dep-bloque__cuerpo prose">${vacio(valor) ? marcaPendiente : valorDe(campo, valor)}</div>
        </section>`);
    });

    const lateral = LATERALES.map((k) => {
      const campo = esquema.find((c) => c.clave === k);
      const valor = campo && v(k);
      return campo && !vacio(valor) ? `<div class="dep-lado__grupo"><h2 class="dep-lado__titulo">${esc(campo.etiqueta)}</h2>${lista(valor, 'dep-lado__lista')}</div>` : '';
    }).join('');

    const fechas = Object.values(pub.__fechas || {}).sort();
    const ultima = fechas.length ? fechas[fechas.length - 1] : null;

    if (faltan.length) cuerpo.splice(cuerpo[0] && cuerpo[0].indexOf('dep-intro') >= 0 ? 1 : 0, 0, avisoPendiente(curso, faltan));

    return `<div class="dep-ficha" data-faltan="${faltan.length}">
      <div class="dep-ficha__cuerpo">
        ${cuerpo.join('\n')}
      </div>
      <aside class="dep-lado" aria-label="Resumen del departamento">
        ${indice.length ? `<nav class="dep-lado__grupo dep-indice" aria-label="En esta página"><h2 class="dep-lado__titulo">En esta página</h2><ul>${indice.join('')}</ul></nav>` : ''}
        ${lateral}
        <div class="dep-lado__grupo dep-lado__nota">
          <p><i class="bi bi-calendar-check" aria-hidden="true"></i>Curso ${esc(curso)}${ultima ? ` · actualizado el ${esc(fechaLarga(ultima))}` : ''}</p>
          <p><i class="bi bi-clipboard-check" aria-hidden="true"></i><a href="/familias/evaluacion">Evaluación, promoción y reclamaciones</a></p>
          <p><i class="bi bi-grid" aria-hidden="true"></i><a href="/centro/departamentos">Todos los departamentos</a></p>
        </div>
      </aside>
    </div>`;
  }

  const api = { htmlFicha, cursoEscolar, esc, urlSegura, parrafos, vacio };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  raiz.NSD_FICHA = api;

  // ── En el navegador: repintar con lo publicado en el panel ──
  const caja = document.querySelector('[data-dep]');
  if (!caja || !raiz.NSD_DEPARTAMENTOS || !raiz.NSD_ESQUEMA || !raiz.NSD_CMS) return;
  const dep = raiz.NSD_DEPARTAMENTOS.DEPARTAMENTOS.find((d) => d.id === caja.getAttribute('data-dep'));
  if (!dep) return;
  const esquema = raiz.NSD_ESQUEMA.ESQUEMAS[dep.esquema] || [];
  // Con o sin panel, se repinta: así el curso escolar es el de hoy y
  // no el del día en que se generó la página.
  const pintar = (pub) => { caja.innerHTML = htmlFicha(dep, esquema, pub); };
  if (!raiz.NSD_CMS.activo) { pintar({}); return; }
  raiz.NSD_CMS.leer([dep.id]).then((d) => pintar(d[dep.id] || {})).then(() => raiz.NSD_CMS.leerEntradas({ ambito: dep.id, limite: 4 })).then((lista) => {
    // Lo último que el departamento ha publicado en el blog
    const cuerpo = caja.querySelector('.dep-ficha__cuerpo');
    if (!cuerpo || !lista || !lista.length) return;
    const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const items = lista.map((e) => {
      const [a, m, dd] = String(e.fecha).split('-').map(Number);
      return `<li><a href="${raiz.NSD_CMS.urlEntrada(e.slug)}">${esc(e.titulo)}</a><time datetime="${esc(e.fecha)}">${dd} ${MES[m - 1]} ${a}</time></li>`;
    }).join('');
    cuerpo.insertAdjacentHTML('beforeend', `<section class="dep-bloque dep-blog" id="blog" aria-labelledby="blog-t">
      <h2 id="blog-t">En el blog</h2>
      <ul class="dep-blog__lista">${items}</ul>
      <p><a href="/blog?q=${encodeURIComponent(dep.nombre)}">Ver todas sus entradas <i class="bi bi-arrow-right" aria-hidden="true"></i></a></p>
    </section>`);
  });
})(typeof window !== 'undefined' ? window : globalThis);
