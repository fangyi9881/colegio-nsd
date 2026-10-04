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
    // http:// solo para enlaces externos antiguos (recursos de los departamentos)
    if (/^(https?:\/\/|mailto:|tel:)/i.test(s)) return s;
    if (/^\/(?!\/)/.test(s)) return s;
    return '';
  }
  const externo = (u) => /^https?:\/\//i.test(u);
  const aEnlace = (texto, url) => {
    const u = urlSegura(url);
    if (!u) return esc(texto);
    return `<a href="${esc(u)}"${externo(u) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(texto)}</a>`;
  };
  // [texto](url) y **negrita** dentro de una línea ya escapada a trozos
  // Cifras que conviene ver de un vistazo: «65 %», «11 horas», «B2»…
  const DATO = /(\d+(?:[.,]\d+)?\s?%|\b\d+ horas(?: a la semana)?\b|\b(?:A1|A2|B1|B2|C1|C2)\b)/g;
  const realzar = (html) => html.replace(DATO, '<strong class="dato">$1</strong>');
  function enLinea(texto, realce) {
    const re = /\[([^\]]{1,200})\]\(([^)\s]{1,500})\)|\*\*([^*]{1,300})\*\*/g;
    let out = '', ultimo = 0, m;
    const t = String(texto || '');
    const plano = (x) => (realce ? realzar(esc(x)) : esc(x));
    while ((m = re.exec(t))) {
      out += plano(t.slice(ultimo, m.index));
      out += m[1] != null ? aEnlace(m[1], m[2]) : `<strong>${esc(m[3])}</strong>`;
      ultimo = re.lastIndex;
    }
    return out + plano(t.slice(ultimo));
  }
  function parrafos(texto) {
    return String(texto || '').replace(/\r/g, '').split(/\n\s*\n/).map((b) => {
      const l = b.split('\n').map((x) => x.trim()).filter(Boolean);
      if (!l.length) return '';
      // «## Subtítulo»: dentro de la ficha va como h3
      const t = /^#{2,3}\s+(.+)$/.exec(l[0]);
      if (t) return `<h3>${enLinea(t[1])}</h3>` + (l.length > 1 ? parrafos(l.slice(1).join('\n')) : '');
      if (l.every((x) => /^[-•*]\s+/.test(x))) return `<ul>${l.map((x) => `<li>${enLinea(x.replace(/^[-•*]\s+/, ''))}</li>`).join('')}</ul>`;
      return `<p>${enLinea(l.join(' '))}</p>`;
    }).join('');
  }
  // ── Texto con estructura ──
  // Un párrafo largo abre con su primera frase en negrita: se puede leer
  // la ficha solo por esas frases y entrar en el detalle donde interese.
  function parrafoRico(linea) {
    const t = String(linea);
    if (t.length > 260 && t.indexOf('[') < 0 && t.indexOf('**') < 0) {
      const m = /^(.{40,240}?[.:])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/.exec(t);
      if (m) return `<p><strong class="arranque">${realzar(esc(m[1]))}</strong> ${enLinea(t.slice(m[0].length), true)}</p>`;
    }
    return `<p>${enLinea(t, true)}</p>`;
  }
  const bloquesDe = (texto) => String(texto || '').replace(/\r/g, '').split(/\n\s*\n/)
    .map((b) => b.split('\n').map((x) => x.trim()).filter(Boolean)).filter((l) => l.length);
  function bloqueRico(l) {
    if (l.every((x) => /^[-•*]\s+/.test(x))) return `<ul class="dep-checks">${l.map((x) => `<li>${enLinea(x.replace(/^[-•*]\s+/, ''), true)}</li>`).join('')}</ul>`;
    return parrafoRico(l.join(' '));
  }
  // Texto del panel en tarjetas: lo que va antes del primer «##» es la
  // entrada (primer párrafo destacado, el resto en un recuadro) y cada
  // «## Subtítulo» es una tarjeta propia.
  function textoRico(texto, conEntrada) {
    const secciones = [{ titulo: null, bloques: [] }];
    bloquesDe(texto).forEach((l) => {
      const t = /^#{2,3}\s+(.+)$/.exec(l[0]);
      if (t) { secciones.push({ titulo: t[1], bloques: l.length > 1 ? [l.slice(1)] : [] }); return; }
      secciones[secciones.length - 1].bloques.push(l);
    });
    let html = '';
    const intro = secciones[0].bloques;
    if (intro.length) {
      let resto = intro;
      if (conEntrada && !intro[0].every((x) => /^[-•*]\s+/.test(x))) {
        html += `<p class="dep-entrada">${enLinea(intro[0].join(' '), true)}</p>`;
        resto = intro.slice(1);
      }
      if (resto.length) html += `<div class="dep-recuadro">${resto.map(bloqueRico).join('')}</div>`;
    }
    const tarjetas = secciones.slice(1);
    if (tarjetas.length) {
      html += `<div class="dep-tarjetas${tarjetas.length === 1 ? ' dep-tarjetas--una' : ''}">${tarjetas.map((sec) => `<section class="dep-tarjeta"><h3>${enLinea(sec.titulo)}</h3>${sec.bloques.map(bloqueRico).join('')}</section>`).join('')}</div>`;
    }
    return html;
  }

  // ── Personas ──
  // Formatos admitidos en el campo Profesorado:
  //   «Nombre Apellidos · cargo o materia»
  //   «Grupo · Nombre Apellidos (cargo)»  (Primaria, ESO, Auxiliares…)
  // Mismo «slug» que public._slug_persona() en Supabase: la misma persona
  // es la misma ficha en todas las páginas, lleve o no tildes su nombre.
  const slugPersona = (n) => String(n || '').toLowerCase()
    .replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u').replace(/ñ/g, 'n').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');
  const urlPersona = (slug) => '/centro/persona?p=' + encodeURIComponent(slug);
  const GRUPO_PERSONA = /^(infantil|primaria|eso|e\.s\.o\.|secundaria|bachillerato|auxiliar(es)?( de conversación)?)$/i;
  function persona(linea) {
    let t = String(linea || '').replace(/\s+/g, ' ').trim();
    let grupo = '';
    let partes = t.split(/\s+·\s+/);
    if (partes.length > 1 && GRUPO_PERSONA.test(partes[0])) { grupo = partes.shift(); t = partes.join(' · '); partes = t.split(/\s+·\s+/); }
    let nombre = partes[0];
    let cargo = partes.slice(1).join(' · ');
    const par = /^(.+?)\s*\(([^)]+)\)$/.exec(nombre);
    if (par) { nombre = par[1]; cargo = cargo || par[2]; }
    cargo = cargo ? cargo.charAt(0).toUpperCase() + cargo.slice(1) : '';
    const responsable = /\b(jef[ea]|coordinador|coordinadora|director|directora)\b/i.test(cargo);
    const NEXOS = ['de', 'del', 'la', 'las', 'los', 'y'];
    const iniciales = nombre.split(/\s+/).filter((x) => x && NEXOS.indexOf(x.toLowerCase()) < 0)
      .map((x) => x.charAt(0)).slice(0, 2).join('').toUpperCase();
    return { nombre, cargo, grupo, responsable, iniciales, slug: slugPersona(nombre) };
  }
  const tarjetaPersona = (p, porDefecto) => `<li class="persona-item${p.responsable ? ' persona-item--responsable' : ''}"><a class="persona${p.responsable ? ' persona--responsable' : ''}" href="${urlPersona(p.slug)}" data-persona="${esc(p.slug)}">
      <span class="persona__avatar" aria-hidden="true">${esc(p.iniciales)}</span>
      <span class="persona__txt"><span class="persona__nombre">${esc(p.nombre)}</span><span class="persona__cargo">${esc(p.cargo || (/auxiliar/i.test(p.grupo) ? 'Auxiliar de conversación' : porDefecto))}</span></span>
    </a></li>`;
  function htmlPersonas(lineas, porDefecto) {
    const ps = (lineas || []).filter(Boolean).map(persona);
    if (!ps.length) return '';
    const grupos = [];
    ps.forEach((p) => {
      let g = grupos.find((x) => x.nombre === p.grupo);
      if (!g) { g = { nombre: p.grupo, ps: [] }; grupos.push(g); }
      g.ps.push(p);
    });
    const lista = (arr) => `<ul class="personas">${arr.slice().sort((a, b) => b.responsable - a.responsable).map((p) => tarjetaPersona(p, porDefecto)).join('')}</ul>`;
    return grupos.map((g) => g.nombre ? `<div class="personas-grupo"><h3 class="personas-grupo__t">${esc(g.nombre)}</h3>${lista(g.ps)}</div>` : lista(g.ps)).join('');
  }

  const lista = (a, clase) => `<ul${clase ? ` class="${clase}"` : ''}>${(a || []).filter(Boolean).map((x) => `<li>${enLinea(x, clase === 'dep-checks')}</li>`).join('')}</ul>`;
  // Enlaces. «Grupo · Texto» los agrupa: con muchos, cada grupo va en un
  // desplegable (por ejemplo, los recursos de Francés por curso).
  function enlaces(a) {
    const items = (a || []).filter((x) => x && x.texto);
    const li = (t, u) => `<li>${aEnlace(t, u)}</li>`;
    const grupos = [];
    const sueltos = [];
    items.forEach((x) => {
      const m = /^(.{2,60}?)\s+·\s+(.+)$/.exec(x.texto);
      if (!m) { sueltos.push(x); return; }
      let g = grupos.find((y) => y.nombre === m[1]);
      if (!g) { g = { nombre: m[1], items: [] }; grupos.push(g); }
      g.items.push({ texto: m[2], url: x.url });
    });
    const plegar = items.length > 8;
    const simples = plegar ? sueltos : items;
    let html = simples.length ? `<ul class="cms-enlaces">${simples.map((x) => li(x.texto, x.url)).join('')}</ul>` : '';
    if (plegar) {
      html += grupos.map((g) => `<details class="pliegue dep-recursos"><summary class="pliegue__cab"><h3>${esc(g.nombre)} <span class="dep-recursos__n">${g.items.length}</span></h3><i class="bi bi-chevron-down pliegue__ico" aria-hidden="true"></i></summary><div class="pliegue__cuerpo"><ul class="cms-enlaces">${g.items.map((x) => li(x.texto, x.url)).join('')}</ul></div></details>`).join('');
    }
    return html;
  }
  // Tipo del documento según dónde está: PDF, documento o carpeta de Google…
  const tipoDoc = (u) => (/\.pdf(\?|#|$)/i.test(u) || /\/storage\/v1\/object\//.test(u) ? ['bi-file-earmark-pdf', 'PDF']
    : /drive\.google\.com\/drive\/folders/.test(u) ? ['bi-folder2-open', 'Carpeta']
    : /docs\.google\.com\/(document|spreadsheets|presentation)/.test(u) ? ['bi-file-earmark-text', 'Documento']
    : ['bi-file-earmark', 'Archivo']);
  const documentos = (a) => `<ul class="cms-docs">${(a || []).filter((d) => d && urlSegura(d.url)).map((d) => {
    const [ico, tipo] = tipoDoc(d.url);
    return `<li><a class="cms-doc" href="${esc(urlSegura(d.url))}" target="_blank" rel="noopener"><i class="bi ${ico}" aria-hidden="true"></i><span class="cms-doc__titulo">${esc(d.titulo || 'Documento')}</span><span class="cms-doc__tipo">${tipo}</span><span class="sr-only"> (se abre en otra pestaña)</span></a></li>`;
  }).join('')}</ul>`;
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
      case 'parrafos': return textoRico(valor, false);
      case 'lista': return lista(valor, 'dep-checks');
      case 'enlaces': return enlaces(valor);
      case 'documentos': return documentos(valor);
      case 'filas': return filas(valor, campo.columnas || []);
      default: return `<p>${enLinea(valor)}</p>`;
    }
  }

  // Un solo aviso arriba con lo que falta; en cada apartado, una marca corta.
  function avisoPendiente(curso, faltan) {
    return `<div class="dep-pendiente" role="note"><i class="bi bi-hourglass-split" aria-hidden="true"></i><div>
      <p class="dep-pendiente__t">Pendiente de publicar para el curso ${esc(curso)}</p>
      <ul class="dep-pendiente__lista">${faltan.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <p>Mientras tanto, se puede pedir en secretaría: <a href="tel:+34914719959">91&nbsp;471&nbsp;99&nbsp;59</a> o <a href="mailto:secretaria@colegionsdolores.es">secretaria@colegionsdolores.es</a>.</p>
    </div></div>`;
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

    // Quién forma el equipo, lo primero: responsables delante y en tarjetas
    const campoEquipo = esquema.find((c) => c.clave === 'profesorado');
    const equipo = campoEquipo ? v('profesorado') : null;
    if (campoEquipo && !vacio(equipo)) {
      indice.push(`<li><a href="#equipo">${esc(campoEquipo.etiqueta)}</a></li>`);
      cuerpo.push(`<section class="dep-equipo" id="equipo" aria-labelledby="equipo-t">
          <h2 id="equipo-t">${esc(campoEquipo.etiqueta)}</h2>
          ${htmlPersonas(equipo, dep.esquema === 'etapa' ? 'Profesorado de la etapa' : 'Profesorado del departamento')}
        </section>`);
    }

    esquema.forEach((campo) => {
      if (LATERALES.indexOf(campo.clave) >= 0 || campo.clave === 'profesorado') return;
      const valor = v(campo.clave);
      const id = ANCLAS[campo.clave] || campo.clave.replace(/_/g, '-');
      if (campo.clave === 'presentacion') {
        if (!vacio(valor)) cuerpo.push(`<div class="dep-intro" id="${id}">${textoRico(valor, true)}</div>`);
        return;
      }
      if (vacio(valor) && !campo.obligatorio) return;
      // Lo obligatorio que falta no ocupa un apartado vacío cada uno:
      // va junto en el aviso de arriba.
      if (vacio(valor)) { faltan.push(campo.etiqueta.replace(/ \(PDF\)$/, '')); return; }
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

    if (faltan.length) {
      const tras = cuerpo.findIndex((c) => c.indexOf('class="dep-intro"') >= 0);
      cuerpo.splice(tras + 1, 0, avisoPendiente(curso, faltan));
    }

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

  // ── Organigrama del centro ──
  // dir: DIRECCION de departamentos-datos.js; deps: DEPARTAMENTOS;
  // equipoDe(dep): lista de Profesorado (la publicada o la de serie).
  function htmlOrganigrama(dir, deps, equipoDe) {
    const cargo = (x) => `<li class="persona-item"><a class="persona persona--responsable persona--grande" href="${urlPersona(slugPersona(x.nombre))}" data-persona="${esc(slugPersona(x.nombre))}">
        <span class="persona__avatar" aria-hidden="true">${esc(persona(x.nombre).iniciales)}</span>
        <span class="persona__txt"><span class="persona__nombre">${esc(x.nombre)}</span><span class="persona__cargo">${esc(x.cargo)}</span><span class="persona__ambito">${esc(x.ambito)}</span></span>
      </a></li>`;
    const nivel = (titulo, icono, gente, mod) => `<div class="org-nivel${mod ? ' org-nivel--' + mod : ''}">
        <p class="org-nivel__t"><i class="bi ${icono}" aria-hidden="true"></i>${esc(titulo)}</p>
        <ul class="personas personas--centro">${gente.join('')}</ul>
      </div>`;
    // Coordinaciones: los responsables de etapas y programas
    const coordinaciones = [];
    deps.forEach((d) => {
      if (d.esquema === 'departamento') return;
      (equipoDe(d) || []).map(persona).filter((p) => p.responsable).forEach((p) => {
        coordinaciones.push({ nombre: p.nombre, cargo: p.cargo, ambito: p.grupo ? `${d.nombre} · ${p.grupo}` : d.nombre });
      });
    });
    (dir.otros || []).forEach((x) => coordinaciones.push(x));
    const tarjetasDep = deps.map((d) => {
      const gente = (equipoDe(d) || []).filter(Boolean);
      return `<li class="org-dep${gente.length > 7 ? ' org-dep--ancho' : ''}">
          <a class="org-dep__cab" href="/centro/departamentos/${esc(d.slug)}">
            <span class="org-dep__ico" aria-hidden="true"><i class="bi ${esc(d.icono)}"></i></span>
            <span class="org-dep__nombre">${esc(d.nombre)}</span>
            <span class="org-dep__n">${gente.length ? gente.length + (gente.length === 1 ? ' persona' : ' personas') : 'Equipo por publicar'}</span>
          </a>
          ${gente.length ? htmlPersonas(gente, d.esquema === 'etapa' ? 'Profesorado de la etapa' : 'Profesorado') : ''}
        </li>`;
    });
    const porGrupo = (g) => deps.map((d, i) => (d.grupo === g ? tarjetasDep[i] : '')).join('');
    return `<div class="org">
        <div class="org-cupula">
          ${nivel('Dirección', 'bi-diagram-2', dir.direccion.map(cargo), 'direccion')}
          <span class="org-linea" aria-hidden="true"></span>
          ${nivel('Equipo de gestión', 'bi-diagram-3', dir.gestion.map(cargo))}
          <span class="org-linea" aria-hidden="true"></span>
          ${nivel('Coordinaciones', 'bi-bezier2', coordinaciones.map(cargo), 'coord')}
        </div>
        <section class="org-bloque" aria-labelledby="org-etapas"><h2 id="org-etapas">Etapas, orientación y bilingüismo</h2>
          <ul class="org-deps">${deps.filter((d) => d.esquema !== 'departamento').map((d) => tarjetasDep[deps.indexOf(d)]).join('')}</ul>
        </section>
        <section class="org-bloque" aria-labelledby="org-eso"><h2 id="org-eso">Departamentos de la ESO</h2>
          <ul class="org-deps">${porGrupo('ESO')}</ul>
        </section>
      </div>`;
  }

  const api = { htmlFicha, htmlOrganigrama, htmlPersonas, cursoEscolar, esc, urlSegura, parrafos, vacio, persona, slugPersona, urlPersona };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  raiz.NSD_FICHA = api;

  // ── En el navegador: repintar con lo publicado en el panel ──
  const org = document.querySelector('[data-organigrama]');
  if (org && raiz.NSD_DEPARTAMENTOS && raiz.NSD_CMS && raiz.NSD_CMS.activo) {
    const D = raiz.NSD_DEPARTAMENTOS;
    raiz.NSD_CMS.leer(D.DEPARTAMENTOS.map((d) => d.id)).then((pub) => {
      const de = (d) => { const x = (pub[d.id] || {}).profesorado; return !vacio(x) ? x : (d.defecto || {}).profesorado; };
      org.innerHTML = htmlOrganigrama(D.DIRECCION, D.DEPARTAMENTOS, de);
      if (raiz.NSD_PERSONAS) raiz.NSD_PERSONAS.hidratar(org);
    }).catch(() => {});
  }
  const caja = document.querySelector('[data-dep]');
  if (!caja || !raiz.NSD_DEPARTAMENTOS || !raiz.NSD_ESQUEMA || !raiz.NSD_CMS) return;
  const dep = raiz.NSD_DEPARTAMENTOS.DEPARTAMENTOS.find((d) => d.id === caja.getAttribute('data-dep'));
  if (!dep) return;
  const esquema = raiz.NSD_ESQUEMA.ESQUEMAS[dep.esquema] || [];
  // Con o sin panel, se repinta: así el curso escolar es el de hoy y
  // no el del día en que se generó la página.
  const pintar = (pub) => { caja.innerHTML = htmlFicha(dep, esquema, pub); if (raiz.NSD_PERSONAS) raiz.NSD_PERSONAS.hidratar(caja); };
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
