/* =========================================================
   Colegio NSD · Panel de edición (/panel)
   ---------------------------------------------------------
   Vistas (por el #hash de la dirección):
     #contenidos              lo que puedo editar
     #contenidos/<ámbito>     editor de un ámbito
     #blog                    entradas del blog que puedo editar
     #blog/nueva · #blog/<id> editor de una entrada
     #cumplimiento            qué falta por publicar (dirección)
     #solicitudes             cuentas pendientes de aprobar (dirección)
     #cuentas                 cuentas y permisos (dirección)
     #historial               cambios recientes
     #canal                   canal interno (solo quien lo gestiona)
     #cuenta                  mis datos y contraseña
   Todo lo que viene de la base de datos se escapa con esc()
   antes de entrar en el HTML.
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const vista = $('[data-vista]');
  if (!vista) return;

  const ESQ = (window.NSD_ESQUEMA || {}).ESQUEMAS || {};
  const DEPS = ((window.NSD_DEPARTAMENTOS || {}).DEPARTAMENTOS) || [];
  const CATS = window.NSD_CATEGORIAS || {};
  const ROLES = { admin: 'Administración', directiva: 'Dirección', editor: 'Editor' };
  const ESTADOS = { pendiente: 'Pendiente', aprobado: 'Activa', rechazado: 'Rechazada', suspendido: 'Suspendida' };
  const CANAL_EST = { recibida: 'Recibida', acusada: 'Acuse enviado', en_tramite: 'En trámite', cerrada: 'Cerrada' };
  const CANAL_CAT = { laboral: 'Laboral', 'proteccion-datos': 'Protección de datos', 'fraude-economico': 'Fraude o irregularidad económica', 'seguridad-salud': 'Seguridad y salud', acoso: 'Acoso', otra: 'Otra' };
  const PAGINA_DE = {
    noticias: '/blog', secretaria: '/familias', formularios: '/familias/formularios',
    'informacion-familias': '/familias/informacion', evaluacion: '/familias/evaluacion', legal: '/aviso-legal'
  };
  DEPS.forEach((d) => { PAGINA_DE[d.id] = '/centro/departamentos/' + d.slug; });

  const api = window.NSD_PANEL_API && window.NSD_PANEL_API.obtener();
  let yo = null, ambitos = [], contenidos = {}, usuarios = null;

  // ── Utilidades ──
  const fecha = (iso, conHora) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) + (conHora ? ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '');
  };
  const diasDesde = (iso) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  const vacio = (v) => v == null || v === '' || (Array.isArray(v) && !v.filter(Boolean).length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
  function urlValida(u) {
    const s = String(u || '').trim();
    return /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+|\/(?!\/)[^\s]*)$/i.test(s);
  }
  const ambito = (id) => ambitos.find((a) => a.id === id);
  const puedeEditar = (id) => {
    const a = ambito(id);
    if (!a || a.tipo === 'especial' || !yo) return false;
    return yo.es_directiva || (yo.ambitos || []).indexOf(id) >= 0;
  };
  // Lo que se ve «de serie» en la web mientras nadie lo publique desde el
  // panel: lo de departamentos-datos.js y lo que ya está escrito en las
  // páginas (data-cms). Así el panel no da por pendiente lo que la web ya
  // enseña. Lo marcado data-cms-provisional o con «pendiente» no cuenta.
  const DEF_HTML = {};
  const defectoDe = (id) => Object.assign({}, DEF_HTML[id] || {}, ((DEPS.find((d) => d.id === id) || {}).defecto) || {});
  const PAGINAS_CON_CMS = ['/familias/informacion', '/familias/evaluacion', '/familias', '/admision', '/aviso-legal', '/privacidad', '/proteccion-infancia', '/canal-informante'];

  function textoEnLinea(nodo) {
    let out = '';
    nodo.childNodes.forEach((n) => {
      if (n.nodeType === 3) out += n.textContent;
      else if (n.nodeType === 1) {
        const t = n.tagName;
        if (t === 'A') out += `[${n.textContent.trim()}](${n.getAttribute('href') || ''})`;
        else if (t === 'STRONG' || t === 'B') out += `**${n.textContent.trim()}**`;
        else if (t === 'BR') out += ' ';
        else if (!n.matches('[aria-hidden="true"], .sr-only, script, style')) out += textoEnLinea(n);
      }
    });
    return out.replace(/\s+/g, ' ').trim();
  }
  function valorDeHtml(nodo) {
    const tipo = nodo.getAttribute('data-cms-tipo') || 'texto';
    if (tipo === 'texto' || tipo === 'email') return nodo.textContent.replace(/\s+/g, ' ').trim();
    if (tipo === 'url') { const a = nodo.querySelector('a[href]'); return a ? a.getAttribute('href') : ''; }
    if (tipo === 'lista') return [...nodo.querySelectorAll('li')].map(textoEnLinea).filter(Boolean);
    if (tipo === 'parrafos') {
      const bloques = [];
      [...nodo.children].forEach((h) => {
        if (/^H[2-4]$/.test(h.tagName)) bloques.push((h.tagName === 'H2' ? '## ' : '### ') + h.textContent.trim());
        else if (h.tagName === 'UL' || h.tagName === 'OL') bloques.push([...h.children].map((li) => '- ' + textoEnLinea(li)).join('\n'));
        else if (h.tagName === 'P') bloques.push(textoEnLinea(h));
      });
      return bloques.filter(Boolean).join('\n\n');
    }
    if (tipo === 'filas') {
      const cols = (nodo.getAttribute('data-cms-columnas') || '').split('|').filter(Boolean).map((x) => x.split(':'));
      return [...nodo.querySelectorAll('tbody tr')].map((tr) => {
        const celdas = [...tr.children];
        const f = {};
        cols.forEach(([clave, , t], i) => {
          const c = celdas[i];
          if (!c) return;
          const a = c.querySelector('a[href]');
          f[clave] = t === 'url' ? (a ? a.getAttribute('href') : '') : textoEnLinea(c);
        });
        return f;
      }).filter((f) => Object.values(f).some(Boolean));
    }
    return '';
  }
  async function cargarDefectosHtml() {
    const curso = (() => { const d = new Date(); const a = d.getFullYear(); return d.getMonth() >= 7 ? `${a}-${a + 1}` : `${a - 1}-${a}`; })();
    const leerPagina = (ruta) => fetch(ruta, { credentials: 'same-origin' }).then((r) => (r.ok ? r.text() : '')).catch(() => '');
    const paginas = await Promise.race([Promise.all(PAGINAS_CON_CMS.map(leerPagina)), new Promise((r) => setTimeout(() => r([]), 6000))]);
    paginas.forEach((html) => {
      if (!html) return;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('[data-cms]').forEach((nodo) => {
        const [amb, clave] = nodo.getAttribute('data-cms').split(':');
        if (!amb || !clave || nodo.hasAttribute('data-cms-provisional') || nodo.querySelector('.dep-pendiente')) return;
        const v = nodo.hasAttribute('data-curso-actual') ? curso : valorDeHtml(nodo);
        if (vacio(v)) return;
        DEF_HTML[amb] = DEF_HTML[amb] || {};
        if (vacio(DEF_HTML[amb][clave])) DEF_HTML[amb][clave] = v;
      });
    });
  }

  let temporizador;
  function aviso(texto, tipo) {
    const t = $('[data-toast]');
    t.textContent = texto;
    t.className = 'pnl-toast is-visible' + (tipo ? ' pnl-toast--' + tipo : '');
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { t.className = 'pnl-toast'; }, tipo === 'error' ? 7000 : 3500);
  }

  function pintar(html, titulo) {
    vista.innerHTML = html;
    document.title = (titulo ? titulo + ' · ' : '') + 'Panel · Colegio NSD';
    const h = vista.querySelector('h1');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
  }

  // Botón que pide una segunda pulsación antes de una acción delicada
  function confirmarDosVeces(boton, texto) {
    if (boton.dataset.confirmando === '1') { boton.dataset.confirmando = ''; return true; }
    boton.dataset.confirmando = '1';
    boton.dataset.textoOriginal = boton.textContent;
    boton.textContent = texto || '¿Seguro? Pulsa otra vez';
    setTimeout(() => { if (boton.dataset.confirmando === '1') { boton.dataset.confirmando = ''; boton.textContent = boton.dataset.textoOriginal; } }, 4000);
    return false;
  }

  // ── Arranque ──
  async function iniciar() {
    if (!api) {
      pintar(`<div class="pnl-vacio"><h1>El panel aún no está conectado</h1>
        <p>Falta enlazar la web con su base de datos (Supabase). Quien administra la web tiene que seguir los pasos de <code>docs/PANEL.md</code> y rellenar <code>assets/js/cms-config.js</code>.</p>
        <p><a class="btn btn--ghost" href="/">Volver a la web</a></p></div>`, 'Sin conectar');
      return;
    }
    let sesion;
    try { sesion = await api.sesion(); } catch (e) { sesion = null; }
    if (!sesion) { location.replace('/acceso'); return; }
    api.alCambiarSesion((evento) => { if (evento === 'SIGNED_OUT') location.replace('/acceso'); });

    try { yo = await api.miPerfil(); } catch (e) { pintar(`<div class="pnl-vacio"><h1>No se ha podido cargar tu cuenta</h1><p>${esc(e.message)}</p></div>`); return; }
    if (!yo) { pintar('<div class="pnl-vacio"><h1>No se encuentra tu cuenta</h1><p>Sal y vuelve a entrar. Si sigue pasando, avisa a quien administra la web.</p></div>'); mostrarUsuario(); return; }
    mostrarUsuario();

    if (yo.estado !== 'aprobado') {
      const msg = {
        pendiente: ['Tu solicitud está pendiente', 'La dirección del colegio tiene que revisarla y darte acceso. Cuando lo haga, al entrar verás aquí lo que puedes editar.'],
        rechazado: ['Tu solicitud no se ha aprobado', 'Si crees que es un error, habla con la dirección del colegio.'],
        suspendido: ['Tu cuenta está suspendida', 'Ahora mismo no puedes editar la web. Habla con la dirección del colegio si necesitas recuperar el acceso.']
      }[yo.estado] || ['Cuenta sin acceso', ''];
      pintar(`<div class="pnl-vacio"><span class="pnl-vacio__ico" aria-hidden="true"><i class="bi bi-hourglass-split"></i></span><h1>${esc(msg[0])}</h1><p>${esc(msg[1])}</p>
        <dl class="pnl-datos"><dt>Cuenta</dt><dd>${esc(yo.email)}</dd><dt>Has pedido editar</dt><dd>${esc(yo.ambito_solicitado ? (ambito(yo.ambito_solicitado) || {}).nombre || yo.ambito_solicitado : '—')}</dd></dl></div>`, msg[0]);
      try { ambitos = await api.ambitos(); } catch (e) { /* solo para el nombre del ámbito */ }
      return;
    }

    try {
      const [amb, , ] = await Promise.all([api.ambitos(), cargarDefectosHtml()]);
      ambitos = amb;
      const ids = yo.es_directiva ? null : yo.ambitos;
      contenidos = await api.contenidos(ids);
    } catch (e) { aviso(e.message, 'error'); }
    construirMenu();
    window.addEventListener('hashchange', enrutar);
    enrutar();
  }

  function mostrarUsuario() {
    const caja = $('[data-usuario]');
    caja.hidden = false;
    $('[data-nombre]', caja).textContent = yo ? yo.nombre : '';
    $('[data-rol]', caja).textContent = yo ? (yo.estado === 'aprobado' ? ROLES[yo.rol] : ESTADOS[yo.estado]) : '';
    $('[data-salir]', caja).addEventListener('click', async () => { await api.salir(); location.replace('/acceso'); });
  }

  async function construirMenu() {
    const items = [['contenidos', 'bi-pencil-square', yo.es_directiva ? 'Contenido de la web' : 'Mis contenidos']];
    if (ambitos.some((a) => puedeEditar(a.id))) items.push(['blog', 'bi-journal-richtext', 'Blog']);
    if (yo.es_directiva) {
      items.push(['cumplimiento', 'bi-clipboard-check', 'Qué falta publicar']);
      items.push(['solicitudes', 'bi-person-plus', 'Solicitudes']);
      items.push(['cuentas', 'bi-people', 'Cuentas y permisos']);
    }
    items.push(['historial', 'bi-clock-history', 'Historial']);
    if (yo.gestiona_canal) items.push(['canal', 'bi-shield-lock', 'Canal interno']);
    items.push(['cuenta', 'bi-person-circle', 'Mi cuenta']);
    const nav = $('[data-nav]');
    nav.innerHTML = `<ul>${items.map(([id, ico, t]) => `<li><a href="#${id}" data-ruta="${id}"><i class="bi ${ico}" aria-hidden="true"></i><span>${esc(t)}</span><span class="pnl-contador" data-contador="${id}" hidden></span></a></li>`).join('')}</ul>`;
    nav.hidden = false;
    if (yo.es_directiva) {
      try {
        usuarios = await api.usuarios();
        const n = usuarios.filter((u) => u.estado === 'pendiente').length;
        const c = $('[data-contador="solicitudes"]');
        if (n) { c.hidden = false; c.textContent = n; c.setAttribute('aria-label', n + ' pendientes'); }
      } catch (e) { /* se reintenta al abrir la vista */ }
    }
    if (yo.gestiona_canal) {
      try {
        const lista = await api.canalListar();
        const n = lista.filter((x) => x.estado === 'recibida').length;
        const c = $('[data-contador="canal"]');
        if (n) { c.hidden = false; c.textContent = n; c.setAttribute('aria-label', n + ' sin acuse'); }
      } catch (e) { /* idem */ }
    }
  }

  function enrutar() {
    const [ruta, arg] = (location.hash.slice(1) || 'contenidos').split('/');
    $$('[data-ruta]').forEach((a) => { if (a.dataset.ruta === ruta) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const vistas = { contenidos: () => (arg ? vistaEditor(decodeURIComponent(arg)) : vistaContenidos()), blog: () => (arg ? vistaEntrada(decodeURIComponent(arg)) : vistaBlog()), cumplimiento: vistaCumplimiento, solicitudes: vistaSolicitudes, cuentas: vistaCuentas, historial: vistaHistorial, canal: vistaCanal, cuenta: vistaCuenta };
    (vistas[ruta] || vistaContenidos)();
  }

  // ── Estado de cada ámbito: obligatorios cumplidos ──
  function estadoAmbito(a) {
    const campos = ESQ[a.esquema] || [];
    const obl = campos.filter((c) => c.obligatorio);
    const datos = contenidos[a.id] || {};
    const def = defectoDe(a.id);
    const hechos = obl.filter((c) => !vacio((datos[c.clave] || {}).valor) || !vacio(def[c.clave]));
    const fechas = Object.values(datos).map((x) => x.fecha).sort();
    return { total: obl.length, hechos: hechos.length, faltan: obl.filter((c) => hechos.indexOf(c) < 0).map((c) => c.etiqueta), ultima: fechas[fechas.length - 1] };
  }

  // ── Vista: lo que puedo editar ──
  function vistaContenidos() {
    const mios = ambitos.filter((a) => puedeEditar(a.id));
    if (!mios.length) {
      pintar(`<div class="pnl-vacio"><h1>Aún no tienes nada asignado</h1><p>Tu cuenta está activa, pero la dirección todavía no te ha dado permiso sobre ningún departamento o sección.</p></div>`, 'Contenidos');
      return;
    }
    const grupos = {};
    mios.forEach((a) => { (grupos[a.grupo || 'Otros'] = grupos[a.grupo || 'Otros'] || []).push(a); });
    pintar(`<header class="pnl-titular"><h1>${yo.es_directiva ? 'Contenido de la web' : 'Mis contenidos'}</h1>
      <p>Elige qué quieres editar. Lo que guardes se publica en la web al momento y queda en el historial.</p></header>
      ${Object.keys(grupos).map((g) => `<section class="pnl-grupo"><h2>${esc(g)}</h2><ul class="pnl-tarjetas">${grupos[g].map((a) => {
        const e = estadoAmbito(a);
        const completo = e.hechos === e.total;
        return `<li><a class="pnl-tarjeta" href="#contenidos/${encodeURIComponent(a.id)}">
          <strong>${esc(a.nombre)}</strong>
          ${e.total ? `<span class="pnl-insignia ${completo ? 'pnl-insignia--ok' : 'pnl-insignia--falta'}">${completo ? 'Obligatorio completo' : `Faltan ${e.total - e.hechos} de ${e.total} obligatorios`}</span>` : ''}
          <small>${e.ultima ? 'Última edición: ' + esc(fecha(e.ultima)) : 'Sin editar todavía'}</small>
        </a></li>`;
      }).join('')}</ul></section>`).join('')}`, 'Contenidos');
  }

  // ── Editor de un ámbito ──
  function campoHtml(c, valor, def) {
    const id = 'f-' + c.clave;
    const ayuda = c.ayuda ? `<p class="pnl-ayuda" id="${id}-ayuda">${esc(c.ayuda)}</p>` : '';
    const descr = c.ayuda ? ` aria-describedby="${id}-ayuda"` : '';
    const obligatorio = c.obligatorio ? '<span class="pnl-oblig">Obligatorio</span>' : '';
    const deSerie = vacio(valor) && !vacio(def) ? '<span class="pnl-serie">Ahora se ve el texto de serie</span>' : '';
    const v = !vacio(valor) ? valor : def;
    let control = '';
    switch (c.tipo) {
      case 'texto': case 'email': case 'url':
        control = `<input id="${id}" type="${c.tipo === 'texto' ? 'text' : c.tipo}" value="${esc(v || '')}"${descr} maxlength="500" />`; break;
      case 'parrafos':
        control = `<textarea id="${id}" rows="7"${descr}>${esc(v || '')}</textarea><p class="pnl-formato">Línea en blanco = párrafo nuevo · «- » al principio = lista · [texto](https://enlace) = enlace · **texto** = negrita</p>`; break;
      case 'lista':
        control = `<textarea id="${id}" rows="6"${descr}>${esc((v || []).join('\n'))}</textarea><p class="pnl-formato">Una entrada por línea.</p>`; break;
      case 'enlaces':
        control = `<textarea id="${id}" rows="5"${descr} placeholder="Página de la Comunidad | https://www.comunidad.madrid/">${esc((v || []).map((x) => `${x.texto} | ${x.url}`).join('\n'))}</textarea><p class="pnl-formato">Una línea por enlace: Texto | https://enlace</p>`; break;
      case 'filas':
        control = filasHtml(c, v || []); break;
      case 'documentos':
        control = documentosHtml(c, v || []); break;
      case 'noticias':
        control = noticiasHtml(v || []); break;
      default:
        control = `<p>Tipo de campo no soportado: ${esc(c.tipo)}</p>`;
    }
    const etiqueta = ['filas', 'documentos', 'noticias'].indexOf(c.tipo) >= 0
      ? `<span class="pnl-campo__etiqueta" id="${id}-et">${esc(c.etiqueta)} ${obligatorio}${deSerie}</span>`
      : `<label class="pnl-campo__etiqueta" for="${id}">${esc(c.etiqueta)} ${obligatorio}${deSerie}</label>`;
    return `<div class="pnl-campo" data-clave="${esc(c.clave)}" data-tipo="${esc(c.tipo)}"${['filas', 'documentos', 'noticias'].indexOf(c.tipo) >= 0 ? ` role="group" aria-labelledby="${id}-et"` : ''}>${etiqueta}${ayuda}${control}<p class="pnl-error" data-error hidden></p></div>`;
  }

  function filaHtml(c, f) {
    return `<tr>${c.columnas.map((col) => `<td><input type="${col.tipo === 'url' ? 'url' : 'text'}" data-col="${esc(col.clave)}" value="${esc((f || {})[col.clave] || '')}" aria-label="${esc(col.etiqueta)}" /></td>`).join('')}
      <td class="pnl-tabla__acc"><button type="button" class="pnl-ico" data-subir-fila aria-label="Subir fila"><i class="bi bi-arrow-up" aria-hidden="true"></i></button><button type="button" class="pnl-ico" data-bajar-fila aria-label="Bajar fila"><i class="bi bi-arrow-down" aria-hidden="true"></i></button><button type="button" class="pnl-ico pnl-ico--peligro" data-quitar-fila aria-label="Quitar fila"><i class="bi bi-trash" aria-hidden="true"></i></button></td></tr>`;
  }
  function filasHtml(c, filas) {
    return `<div class="pnl-tabla" data-columnas='${esc(JSON.stringify(c.columnas))}'><table><thead><tr>${c.columnas.map((col) => `<th scope="col">${esc(col.etiqueta)}</th>`).join('')}<th scope="col"><span class="sr-only">Acciones</span></th></tr></thead>
      <tbody>${(filas.length ? filas : [{}]).map((f) => filaHtml(c, f)).join('')}</tbody></table>
      <button type="button" class="btn btn--ghost btn--sm" data-anadir-fila><i class="bi bi-plus-lg" aria-hidden="true"></i> Añadir fila</button></div>`;
  }
  function docHtml(d) {
    return `<li class="pnl-doc"><i class="bi bi-file-earmark-pdf" aria-hidden="true"></i>
      <input type="text" data-doc-titulo value="${esc(d.titulo || '')}" aria-label="Título del documento" placeholder="Título del documento" />
      <a href="${esc(d.url)}" target="_blank" rel="noopener" data-doc-url="${esc(d.url)}">Ver</a>
      <button type="button" class="pnl-ico pnl-ico--peligro" data-quitar-doc aria-label="Quitar documento"><i class="bi bi-trash" aria-hidden="true"></i></button></li>`;
  }
  function documentosHtml(c, docs) {
    return `<div class="pnl-docs"><ul data-lista-docs>${docs.map(docHtml).join('')}</ul>
      <div class="pnl-docs__subir">
        <label class="btn btn--ghost btn--sm pnl-subir"><i class="bi bi-upload" aria-hidden="true"></i> Subir PDF<input type="file" accept="application/pdf" data-subir-pdf class="sr-only" /></label>
        <button type="button" class="btn btn--ghost btn--sm" data-enlace-doc><i class="bi bi-link-45deg" aria-hidden="true"></i> Añadir por enlace</button>
      </div></div>`;
  }
  function noticiaHtml(n) {
    const hoy = new Date().toISOString().slice(0, 10);
    return `<li class="pnl-noticia">
      <div class="pnl-noticia__fila">
        <label>Fecha<input type="date" data-n="fecha" value="${esc(n.fecha || hoy)}" required /></label>
        <label>Sección<select data-n="categoria">${Object.keys(CATS).map((k) => `<option value="${esc(k)}"${(n.categoria || 'comunicados') === k ? ' selected' : ''}>${esc(CATS[k].nombre)}</option>`).join('')}</select></label>
        <label class="pnl-check"><input type="checkbox" data-n="publicado"${n.publicado === false ? '' : ' checked'} /> Publicado</label>
      </div>
      <label>Titular<input type="text" data-n="titulo" value="${esc(n.titulo || '')}" maxlength="160" required /></label>
      <label>Resumen<textarea data-n="resumen" rows="2" maxlength="400">${esc(n.resumen || '')}</textarea></label>
      <label>Texto completo (opcional)<textarea data-n="texto" rows="4" maxlength="4000">${esc(n.texto || '')}</textarea></label>
      <label>Enlace (opcional: circular en PDF, formulario…)<input type="url" data-n="url" value="${esc(n.url || '')}" /></label>
      <button type="button" class="btn btn--ghost btn--sm pnl-peligro" data-quitar-noticia><i class="bi bi-trash" aria-hidden="true"></i> Quitar este comunicado</button>
    </li>`;
  }
  function noticiasHtml(lista) {
    const orden = lista.slice().sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    return `<div class="pnl-noticias"><button type="button" class="btn btn--primary btn--sm" data-anadir-noticia><i class="bi bi-plus-lg" aria-hidden="true"></i> Nuevo comunicado</button>
      <ul data-lista-noticias>${orden.map(noticiaHtml).join('')}</ul></div>`;
  }

  // Lee el valor de un campo del formulario. Lanza Error con el problema.
  function leerCampo(caja) {
    const tipo = caja.dataset.tipo;
    const q = (s) => caja.querySelector(s);
    switch (tipo) {
      case 'texto': return q('input').value.trim();
      case 'email': {
        const v = q('input').value.trim();
        if (v && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v)) throw new Error('No parece un correo válido.');
        return v;
      }
      case 'url': {
        const v = q('input').value.trim();
        if (v && !urlValida(v)) throw new Error('El enlace tiene que empezar por https:// (o ser una ruta de la web que empiece por /).');
        return v;
      }
      case 'parrafos': return q('textarea').value.replace(/\r/g, '').trim();
      case 'lista': return q('textarea').value.split('\n').map((l) => l.trim()).filter(Boolean);
      case 'enlaces': {
        const malas = [];
        const out = q('textarea').value.split('\n').map((l, i) => {
          const t = l.trim();
          if (!t) return null;
          const p = t.split('|');
          const texto = p[0].trim(), url = (p[1] || '').trim();
          if (!texto || !urlValida(url)) { malas.push(i + 1); return null; }
          return { texto, url };
        }).filter(Boolean);
        if (malas.length) throw new Error(`Revisa la línea ${malas.join(', ')}: tiene que ser «Texto | https://enlace».`);
        return out;
      }
      case 'filas': {
        const cols = JSON.parse(q('[data-columnas]').getAttribute('data-columnas'));
        const filas = $$('tbody tr', caja).map((tr) => {
          const f = {};
          cols.forEach((c) => { f[c.clave] = tr.querySelector(`[data-col="${c.clave}"]`).value.trim(); });
          return f;
        }).filter((f) => Object.values(f).some(Boolean));
        cols.filter((c) => c.tipo === 'url').forEach((c) => {
          const mal = filas.findIndex((f) => f[c.clave] && !urlValida(f[c.clave]));
          if (mal >= 0) throw new Error(`Fila ${mal + 1}: el enlace tiene que empezar por https://`);
        });
        return filas;
      }
      case 'documentos':
        return $$('.pnl-doc', caja).map((li) => ({ titulo: li.querySelector('[data-doc-titulo]').value.trim() || 'Documento', url: li.querySelector('[data-doc-url]').getAttribute('data-doc-url') }));
      case 'noticias':
        return $$('.pnl-noticia', caja).map((li, i) => {
          const g = (k) => li.querySelector(`[data-n="${k}"]`);
          const n = { fecha: g('fecha').value, categoria: g('categoria').value, titulo: g('titulo').value.trim(), resumen: g('resumen').value.trim(), texto: g('texto').value.trim(), url: g('url').value.trim(), publicado: g('publicado').checked };
          if (!/^\d{4}-\d{2}-\d{2}$/.test(n.fecha)) throw new Error(`Comunicado ${i + 1}: falta la fecha.`);
          if (!n.titulo) throw new Error(`Comunicado ${i + 1}: falta el titular.`);
          if (n.url && !urlValida(n.url)) throw new Error(`Comunicado ${i + 1}: el enlace tiene que empezar por https://`);
          if (!n.url) delete n.url;
          return n;
        });
      default: return null;
    }
  }

  function vistaEditor(id) {
    const a = ambito(id);
    if (!a || !puedeEditar(id)) { pintar('<div class="pnl-vacio"><h1>No puedes editar esto</h1><p><a href="#contenidos">Volver a tus contenidos</a></p></div>', 'Sin permiso'); return; }
    const campos = ESQ[a.esquema] || [];
    const datos = contenidos[id] || {};
    const def = defectoDe(id);
    const e = estadoAmbito(a);
    pintar(`<nav class="pnl-migas" aria-label="Migas de pan"><a href="#contenidos">${yo.es_directiva ? 'Contenido de la web' : 'Mis contenidos'}</a> <i class="bi bi-chevron-right" aria-hidden="true"></i> <span>${esc(a.nombre)}</span></nav>
      <header class="pnl-titular pnl-titular--fila"><div><h1>${esc(a.nombre)}</h1>
        <p>${e.total ? (e.hechos === e.total ? 'Todo lo obligatorio está publicado.' : `Falta por publicar: ${esc(e.faltan.join(', ').toLowerCase())}.`) : 'Sección de la web.'}</p></div>
        ${PAGINA_DE[id] ? `<a class="btn btn--ghost btn--sm" href="${esc(PAGINA_DE[id])}" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Ver en la web</a>` : ''}</header>
      <form class="pnl-form" data-editor="${esc(id)}" novalidate>
        ${campos.map((c) => campoHtml(c, (datos[c.clave] || {}).valor, def[c.clave])).join('')}
        <div class="pnl-guardar"><p class="pnl-guardar__estado" data-estado-guardar>Sin cambios.</p>
          <button type="submit" class="btn btn--primary"><i class="bi bi-cloud-check" aria-hidden="true"></i> Guardar y publicar</button></div>
      </form>`, a.nombre);
    const form = $('[data-editor]');
    const originales = {};
    $$('.pnl-campo', form).forEach((caja) => { try { originales[caja.dataset.clave] = JSON.stringify(leerCampo(caja)); } catch (er) { originales[caja.dataset.clave] = null; } });
    // Lo que se ve de serie cuenta como «sin guardar» solo si se toca.
    const deSerie = new Set(campos.filter((c) => vacio((datos[c.clave] || {}).valor) && !vacio(def[c.clave])).map((c) => c.clave));
    const estadoGuardar = $('[data-estado-guardar]', form);
    const marcarSucio = () => { estadoGuardar.textContent = 'Hay cambios sin guardar.'; form.classList.add('is-sucio'); };
    form.addEventListener('input', marcarSucio);
    form.addEventListener('change', marcarSucio);
    window.onbeforeunload = () => (form.isConnected && form.classList.contains('is-sucio') ? true : undefined);

    form.addEventListener('click', async (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      const caja = b.closest('.pnl-campo');
      if (b.matches('[data-anadir-fila]')) {
        const cols = JSON.parse(caja.querySelector('[data-columnas]').getAttribute('data-columnas'));
        caja.querySelector('tbody').insertAdjacentHTML('beforeend', filaHtml({ columnas: cols }, {}));
        caja.querySelector('tbody tr:last-child input').focus(); marcarSucio();
      } else if (b.matches('[data-quitar-fila]')) { b.closest('tr').remove(); marcarSucio(); }
      else if (b.matches('[data-subir-fila]')) { const tr = b.closest('tr'); if (tr.previousElementSibling) { tr.parentNode.insertBefore(tr, tr.previousElementSibling); b.focus(); marcarSucio(); } }
      else if (b.matches('[data-bajar-fila]')) { const tr = b.closest('tr'); if (tr.nextElementSibling) { tr.parentNode.insertBefore(tr.nextElementSibling, tr); b.focus(); marcarSucio(); } }
      else if (b.matches('[data-quitar-doc]')) { b.closest('li').remove(); marcarSucio(); }
      else if (b.matches('[data-enlace-doc]')) {
        const fila = document.createElement('div');
        fila.className = 'pnl-doc-nuevo';
        fila.innerHTML = '<label>Enlace al PDF<input type="url" placeholder="https://…" data-nuevo-url /></label><label>Título<input type="text" data-nuevo-titulo /></label><button type="button" class="btn btn--primary btn--sm" data-confirmar-enlace>Añadir</button>';
        b.closest('.pnl-docs__subir').after(fila); fila.querySelector('input').focus();
      } else if (b.matches('[data-confirmar-enlace]')) {
        const f = b.closest('.pnl-doc-nuevo');
        const url = f.querySelector('[data-nuevo-url]').value.trim();
        if (!urlValida(url)) { aviso('El enlace tiene que empezar por https://', 'error'); return; }
        caja.querySelector('[data-lista-docs]').insertAdjacentHTML('beforeend', docHtml({ url, titulo: f.querySelector('[data-nuevo-titulo]').value.trim() }));
        f.remove(); marcarSucio();
      } else if (b.matches('[data-anadir-noticia]')) {
        caja.querySelector('[data-lista-noticias]').insertAdjacentHTML('afterbegin', noticiaHtml({}));
        caja.querySelector('[data-lista-noticias] [data-n="titulo"]').focus(); marcarSucio();
      } else if (b.matches('[data-quitar-noticia]')) {
        if (!confirmarDosVeces(b, '¿Quitarlo? Pulsa otra vez')) return;
        b.closest('li').remove(); marcarSucio();
      }
    });

    form.addEventListener('change', async (ev) => {
      const inp = ev.target;
      if (!inp.matches('[data-subir-pdf]') || !inp.files[0]) return;
      const caja = inp.closest('.pnl-campo');
      const archivo = inp.files[0];
      aviso('Subiendo ' + archivo.name + '…');
      try {
        const url = await api.subirPdf(id, archivo);
        caja.querySelector('[data-lista-docs]').insertAdjacentHTML('beforeend', docHtml({ url, titulo: archivo.name.replace(/\.pdf$/i, '') }));
        marcarSucio();
        aviso('PDF subido. Ponle un título claro y pulsa «Guardar y publicar».', 'ok');
      } catch (er) { aviso(er.message, 'error'); }
      inp.value = '';
    });

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const cambios = {};
      let errores = 0;
      $$('.pnl-campo', form).forEach((caja) => {
        const err = caja.querySelector('[data-error]');
        err.hidden = true; caja.classList.remove('is-error');
        try {
          const v = leerCampo(caja);
          const k = caja.dataset.clave;
          const json = JSON.stringify(v);
          if (json !== originales[k]) cambios[k] = vacio(v) ? null : v;
          else if (deSerie.has(k)) { /* sin tocar: sigue siendo el de serie */ }
        } catch (er) {
          errores++; err.textContent = er.message; err.hidden = false; caja.classList.add('is-error');
        }
      });
      if (errores) { const p = form.querySelector('.is-error input, .is-error textarea'); if (p) p.focus(); aviso('Revisa los campos marcados.', 'error'); return; }
      if (!Object.keys(cambios).length) { aviso('No hay cambios que guardar.'); return; }
      const boton = form.querySelector('[type="submit"]');
      boton.disabled = true;
      try {
        await api.guardar(id, cambios);
        contenidos = Object.assign(contenidos, await api.contenidos([id]));
        Object.keys(cambios).forEach((k) => { originales[k] = JSON.stringify(cambios[k] === null ? leerCampo(form.querySelector(`[data-clave="${k}"]`)) : cambios[k]); deSerie.delete(k); });
        form.classList.remove('is-sucio');
        estadoGuardar.textContent = 'Guardado y publicado a las ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + '.';
        const e2 = estadoAmbito(a);
        const resumen = vista.querySelector('.pnl-titular p');
        if (resumen && e2.total) resumen.textContent = e2.hechos === e2.total ? 'Todo lo obligatorio está publicado.' : `Falta por publicar: ${e2.faltan.join(', ').toLowerCase()}.`;
        aviso('Guardado. Ya se ve en la web.', 'ok');
      } catch (er) { aviso(er.message, 'error'); }
      boton.disabled = false;
    });
  }

  // ── Blog: entradas que publica cada departamento o sección ──
  // La clasificación la decide la base de datos (supabase/03_blog.sql):
  // dirección y secretaría la eligen; el resto lleva la de su ámbito.
  const hoyIso = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const estadoEntrada = (e) => (!e.publicado ? ['Borrador', ''] : e.fecha > hoyIso() ? ['Programada · ' + fecha(e.fecha + 'T12:00'), ''] : ['Publicada', 'pnl-insignia--ok']);
  const urlEntrada = (slug) => '/blog/entrada?e=' + encodeURIComponent(slug);
  const nombreCat = (k) => (CATS[k] || {}).nombre || k;

  async function vistaBlog() {
    const mios = ambitos.filter((a) => puedeEditar(a.id));
    if (!mios.length) return vistaContenidos();
    pintar('<p class="pnl-cargando">Cargando entradas…</p>', 'Blog');
    let lista;
    try { lista = await api.entradas(); } catch (e) { pintar(`<div class="pnl-vacio"><h1>No se han podido cargar las entradas</h1><p>${esc(e.message)}</p><p class="pnl-ayuda">Si acabáis de estrenar el blog, quien administra la web tiene que ejecutar <code>supabase/03_blog.sql</code> en Supabase.</p></div>`, 'Blog'); return; }
    const visibles = yo.es_directiva ? lista : lista.filter((e) => puedeEditar(e.ambito_id));
    pintar(`<header class="pnl-titular pnl-titular--fila"><div><h1>Blog</h1>
        <p>${yo.es_directiva ? 'Todas las entradas del blog. Puedes publicar en nombre de cualquier departamento o sección y elegir su categoría.' : 'Las entradas de ' + esc(mios.map((a) => a.nombre).join(', ')) + '. La categoría y las etiquetas se ponen solas según tu departamento.'}</p></div>
        <a class="btn btn--primary" href="#blog/nueva"><i class="bi bi-plus-lg" aria-hidden="true"></i> Nueva entrada</a></header>
      ${visibles.length ? `<ul class="pnl-entradas">${visibles.map((e) => {
        const [est, cls] = estadoEntrada(e);
        return `<li class="pnl-entrada">
          ${e.imagen ? `<img src="${esc(e.imagen)}" alt="" loading="lazy" width="96" height="64" />` : '<span class="pnl-entrada__sinfoto" aria-hidden="true"><i class="bi bi-image"></i></span>'}
          <div class="pnl-entrada__txt"><a href="#blog/${encodeURIComponent(e.id)}"><strong>${esc(e.titulo)}</strong></a>
            <small>${esc(fecha(e.fecha + 'T12:00'))} · ${esc(e.firma || '')} · ${esc(nombreCat(e.categoria))}${(e.etiquetas || []).length ? ' · ' + esc(e.etiquetas.join(', ')) : ''}</small></div>
          <span class="pnl-insignia ${cls}">${esc(est)}</span>
          <div class="pnl-entrada__acc"><a class="btn btn--ghost btn--sm" href="#blog/${encodeURIComponent(e.id)}">Editar</a>
          ${e.publicado && e.fecha <= hoyIso() ? `<a class="btn btn--ghost btn--sm" href="${esc(urlEntrada(e.slug))}" target="_blank" rel="noopener">Ver<span class="sr-only"> en la web (se abre en otra pestaña)</span></a>` : ''}</div>
        </li>`;
      }).join('')}</ul>` : '<div class="pnl-vacio pnl-vacio--suave"><p>Todavía no hay entradas. Pulsa «Nueva entrada» para escribir la primera.</p></div>'}`, 'Blog');
  }

  async function vistaEntrada(id) {
    const mios = ambitos.filter((a) => puedeEditar(a.id));
    if (!mios.length) return vistaContenidos();
    let e = { titulo: '', resumen: '', cuerpo: '', fecha: hoyIso(), publicado: true, etiquetas: [], ambito_id: mios[0].id, categoria: '', imagen: '', imagen_alt: '', documento: null };
    const nueva = id === 'nueva';
    if (!nueva) {
      pintar('<p class="pnl-cargando">Cargando la entrada…</p>', 'Blog');
      try { e = await api.entrada(id); } catch (er) { e = null; aviso(er.message, 'error'); }
      if (!e || !puedeEditar(e.ambito_id)) { pintar('<div class="pnl-vacio"><h1>No puedes editar esta entrada</h1><p><a href="#blog">Volver al blog</a></p></div>', 'Sin permiso'); return; }
    }
    const elige = yo.es_directiva || (yo.ambitos || []).indexOf('secretaria') >= 0;
    const opcionesFirma = mios.map((a) => `<option value="${esc(a.id)}"${a.id === e.ambito_id ? ' selected' : ''}>${esc(a.nombre)}</option>`).join('');
    const doc = e.documento && e.documento.url ? e.documento : null;
    pintar(`<nav class="pnl-migas" aria-label="Migas de pan"><a href="#blog">Blog</a> <i class="bi bi-chevron-right" aria-hidden="true"></i> <span>${nueva ? 'Nueva entrada' : esc(e.titulo)}</span></nav>
      <header class="pnl-titular pnl-titular--fila"><div><h1>${nueva ? 'Nueva entrada' : 'Editar entrada'}</h1>
        <p>Sale en el blog y en la portada, mezclada por fecha con el resto de noticias.</p></div>
        ${!nueva && e.publicado ? `<a class="btn btn--ghost btn--sm" href="${esc(urlEntrada(e.slug))}" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Ver en la web</a>` : ''}</header>
      <form class="pnl-form pnl-form--entrada" data-entrada-form novalidate>
        <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="eTitulo">Titular <span class="pnl-oblig">Obligatorio</span></label>
          <input id="eTitulo" name="titulo" value="${esc(e.titulo)}" maxlength="160" required /><p class="pnl-error" data-error hidden></p></div>
        <div class="pnl-fila">
          <div class="pnl-campo">${mios.length > 1
            ? `<label class="pnl-campo__etiqueta" for="eFirma">Publica</label><select id="eFirma" name="ambito">${opcionesFirma}</select>`
            : `<span class="pnl-campo__etiqueta">Publica</span><input name="ambito" type="hidden" value="${esc(mios[0].id)}" /><p class="pnl-fijo">${esc(mios[0].nombre)}</p>`}</div>
          <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="eFecha">Fecha</label>
            <input id="eFecha" name="fecha" type="date" value="${esc(e.fecha)}" required aria-describedby="eFechaAyuda" /><p class="pnl-ayuda" id="eFechaAyuda">Con una fecha futura, la entrada aparece ese día.</p></div>
        </div>
        <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="eResumen">Resumen</label>
          <textarea id="eResumen" name="resumen" rows="2" maxlength="400" aria-describedby="eResumenAyuda">${esc(e.resumen)}</textarea><p class="pnl-ayuda" id="eResumenAyuda">Una o dos frases. Es lo que se lee en la tarjeta de la portada y del blog.</p></div>
        <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="eCuerpo">Texto</label>
          <textarea id="eCuerpo" name="cuerpo" rows="14" maxlength="40000">${esc(e.cuerpo)}</textarea>
          <p class="pnl-formato">Línea en blanco = párrafo nuevo · «## » al principio = subtítulo · «- » = lista · [texto](https://enlace) = enlace · **texto** = negrita</p></div>
        <fieldset class="pnl-campo pnl-foto"><legend class="pnl-campo__etiqueta">Foto de portada</legend>
          <div class="pnl-foto__vista" data-foto-vista>${e.imagen ? `<img src="${esc(e.imagen)}" alt="" />` : '<span><i class="bi bi-image" aria-hidden="true"></i> Sin foto: se usará el color de la categoría.</span>'}</div>
          <input type="hidden" name="imagen" value="${esc(e.imagen || '')}" />
          <div class="pnl-acciones">
            <label class="btn btn--ghost btn--sm pnl-subir"><i class="bi bi-upload" aria-hidden="true"></i> ${e.imagen ? 'Cambiar foto' : 'Subir foto'}<input type="file" accept="image/*" data-subir-foto class="sr-only" /></label>
            <button type="button" class="btn btn--ghost btn--sm pnl-peligro" data-quitar-foto${e.imagen ? '' : ' hidden'}>Quitar foto</button>
          </div>
          <label class="pnl-campo__etiqueta pnl-campo__etiqueta--sub" for="eAlt">Qué se ve en la foto</label>
          <input id="eAlt" name="imagen_alt" value="${esc(e.imagen_alt || '')}" maxlength="200" aria-describedby="eAltAyuda" />
          <p class="pnl-ayuda" id="eAltAyuda">Una frase para quien no puede ver la imagen. Ejemplo: «Alumnos de 2.º de ESO en el laboratorio». Evitad fotos donde se reconozca a alumnos sin autorización de imagen.</p>
          <p class="pnl-error" data-error hidden></p>
        </fieldset>
        <fieldset class="pnl-campo"><legend class="pnl-campo__etiqueta">Documento adjunto (opcional)</legend>
          <div data-doc-entrada>${doc ? `<p class="pnl-fijo"><i class="bi bi-file-earmark-pdf" aria-hidden="true"></i> <a href="${esc(doc.url)}" target="_blank" rel="noopener">${esc(doc.titulo || 'Documento')}</a></p>` : ''}</div>
          <input type="hidden" name="doc_url" value="${esc(doc ? doc.url : '')}" />
          <label class="pnl-campo__etiqueta pnl-campo__etiqueta--sub" for="eDocTitulo">Título del documento</label>
          <input id="eDocTitulo" name="doc_titulo" value="${esc(doc ? doc.titulo || '' : '')}" maxlength="120" placeholder="Circular, autorización, programa…" />
          <div class="pnl-acciones">
            <label class="btn btn--ghost btn--sm pnl-subir"><i class="bi bi-upload" aria-hidden="true"></i> Subir PDF<input type="file" accept="application/pdf" data-subir-doc class="sr-only" /></label>
            <button type="button" class="btn btn--ghost btn--sm pnl-peligro" data-quitar-doc-entrada${doc ? '' : ' hidden'}>Quitar documento</button>
          </div>
        </fieldset>
        <fieldset class="pnl-campo pnl-clasif" data-clasif><legend class="pnl-campo__etiqueta">Categoría y etiquetas</legend>
          ${elige ? `<p class="pnl-ayuda">Puedes elegirlas. Si dejas las etiquetas vacías, se ponen solas.</p>
            <div class="pnl-fila">
              <div><label class="pnl-campo__etiqueta pnl-campo__etiqueta--sub" for="eCat">Categoría</label>
                <select id="eCat" name="categoria">${Object.keys(CATS).map((k) => `<option value="${esc(k)}"${k === e.categoria ? ' selected' : ''}>${esc(CATS[k].nombre)}</option>`).join('')}</select></div>
              <div><label class="pnl-campo__etiqueta pnl-campo__etiqueta--sub" for="eEtq">Etiquetas</label>
                <input id="eEtq" name="etiquetas" value="${esc((e.etiquetas || []).join(', '))}" maxlength="300" aria-describedby="eEtqAyuda" /></div>
            </div>
            <p class="pnl-ayuda" id="eEtqAyuda">Separadas por comas, hasta 8. Sugeridas: <span data-sugeridas>…</span> <button type="button" class="pnl-enlace" data-usar-sugeridas>Usar estas</button></p>`
          : `<p class="pnl-ayuda">Se ponen solas según quién publica y lo que dice el texto.</p><p class="pnl-fijo" data-sugeridas aria-live="polite">…</p>`}
        </fieldset>
        <div class="pnl-campo"><label class="pnl-check"><input type="checkbox" name="publicado"${e.publicado ? ' checked' : ''} /> Publicada (si la desmarcas, queda como borrador y solo la ve quien puede editarla)</label></div>
        <div class="pnl-guardar"><p class="pnl-guardar__estado" data-estado-guardar>${nueva ? 'Sin guardar.' : 'Sin cambios.'}</p>
          ${nueva ? '' : '<button type="button" class="btn btn--ghost pnl-peligro" data-borrar-entrada><i class="bi bi-trash" aria-hidden="true"></i> Borrar</button>'}
          <button type="submit" class="btn btn--primary"><i class="bi bi-cloud-check" aria-hidden="true"></i> ${nueva ? 'Publicar' : 'Guardar cambios'}</button></div>
      </form>`, nueva ? 'Nueva entrada' : e.titulo);

    const form = $('[data-entrada-form]');
    const estado = $('[data-estado-guardar]', form);
    let sucio = false;
    const marcarSucio = () => { sucio = true; estado.textContent = 'Hay cambios sin guardar.'; form.classList.add('is-sucio'); };
    window.onbeforeunload = () => (form.isConnected && sucio ? true : undefined);
    const ambitoActual = () => form.ambito.value;
    const separar = (t) => t.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 8);

    // Clasificación que pondrá la base de datos, a la vista mientras se escribe
    let sugeridas = [];
    let tSug;
    const actualizarSugerencia = () => {
      clearTimeout(tSug);
      tSug = setTimeout(async () => {
        try {
          const r = await api.clasificacion(ambitoActual(), form.titulo.value, form.resumen.value, form.cuerpo.value);
          sugeridas = r.etiquetas || [];
          const caja = $('[data-sugeridas]', form);
          if (elige) caja.textContent = sugeridas.length ? sugeridas.join(', ') : 'ninguna';
          else caja.textContent = `${nombreCat(r.categoria)}${sugeridas.length ? ' · ' + sugeridas.join(', ') : ''}`;
          if (elige && nueva && !form.dataset.catTocada) form.categoria.value = r.categoria;
        } catch (er) { const caja = $('[data-sugeridas]', form); if (caja) caja.textContent = '—'; }
      }, 400);
    };
    actualizarSugerencia();

    form.addEventListener('input', (ev) => {
      marcarSucio();
      if (/^(titulo|resumen|cuerpo)$/.test(ev.target.name)) actualizarSugerencia();
    });
    form.addEventListener('change', async (ev) => {
      const t = ev.target;
      marcarSucio();
      if (t.name === 'ambito') actualizarSugerencia();
      if (t.name === 'categoria') form.dataset.catTocada = '1';
      if (t.matches('[data-subir-foto]') && t.files[0]) {
        aviso('Preparando la foto…');
        try {
          const r = await api.subirImagen(ambitoActual(), t.files[0]);
          form.imagen.value = r.url;
          $('[data-foto-vista]', form).innerHTML = `<img src="${esc(r.url)}" alt="" />`;
          $('[data-quitar-foto]', form).hidden = false;
          if (!form.imagen_alt.value.trim()) form.imagen_alt.focus();
          aviso('Foto subida. Escribe qué se ve en ella y guarda la entrada.', 'ok');
        } catch (er) { aviso(er.message, 'error'); }
        t.value = '';
      }
      if (t.matches('[data-subir-doc]') && t.files[0]) {
        aviso('Subiendo ' + t.files[0].name + '…');
        try {
          const url = await api.subirPdf(ambitoActual(), t.files[0]);
          form.doc_url.value = url;
          if (!form.doc_titulo.value.trim()) form.doc_titulo.value = t.files[0].name.replace(/\.pdf$/i, '');
          $('[data-doc-entrada]', form).innerHTML = `<p class="pnl-fijo"><i class="bi bi-file-earmark-pdf" aria-hidden="true"></i> <a href="${esc(url)}" target="_blank" rel="noopener">${esc(form.doc_titulo.value)}</a></p>`;
          $('[data-quitar-doc-entrada]', form).hidden = false;
          aviso('PDF subido. Guarda la entrada para publicarlo.', 'ok');
        } catch (er) { aviso(er.message, 'error'); }
        t.value = '';
      }
    });
    form.addEventListener('click', async (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.matches('[data-quitar-foto]')) {
        form.imagen.value = ''; form.imagen_alt.value = '';
        $('[data-foto-vista]', form).innerHTML = '<span><i class="bi bi-image" aria-hidden="true"></i> Sin foto: se usará el color de la categoría.</span>';
        b.hidden = true; marcarSucio();
      } else if (b.matches('[data-quitar-doc-entrada]')) {
        form.doc_url.value = ''; form.doc_titulo.value = ''; $('[data-doc-entrada]', form).innerHTML = ''; b.hidden = true; marcarSucio();
      } else if (b.matches('[data-usar-sugeridas]')) {
        form.etiquetas.value = sugeridas.join(', '); marcarSucio();
      } else if (b.matches('[data-borrar-entrada]')) {
        if (!confirmarDosVeces(b, '¿Borrarla? Pulsa otra vez')) return;
        try { await api.borrarEntrada(id); sucio = false; aviso('Entrada borrada.', 'ok'); location.hash = '#blog'; }
        catch (er) { aviso(er.message, 'error'); }
      }
    });
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const errores = [];
      const marcarError = (campo, msg) => {
        const caja = campo.closest('.pnl-campo');
        const p = caja.querySelector('[data-error]');
        if (p) { p.textContent = msg; p.hidden = false; }
        caja.classList.add('is-error');
        errores.push(campo);
      };
      $$('.is-error', form).forEach((c) => { c.classList.remove('is-error'); const p = c.querySelector('[data-error]'); if (p) p.hidden = true; });
      const titulo = form.titulo.value.trim();
      if (titulo.length < 3) marcarError(form.titulo, 'Escribe un titular (al menos 3 letras).');
      if (form.imagen.value && !form.imagen_alt.value.trim()) marcarError(form.imagen_alt, 'Describe la foto en una frase.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fecha.value)) { aviso('Pon la fecha de la entrada.', 'error'); return; }
      if (errores.length) { errores[0].focus(); aviso('Revisa los campos marcados.', 'error'); return; }
      const datos = {
        ambito_id: ambitoActual(), titulo, resumen: form.resumen.value.trim(), cuerpo: form.cuerpo.value.replace(/\r/g, '').trim(),
        fecha: form.fecha.value, publicado: form.publicado.checked,
        imagen: form.imagen.value || null, imagen_alt: form.imagen.value ? form.imagen_alt.value.trim() : null,
        documento: form.doc_url.value ? { url: form.doc_url.value, titulo: form.doc_titulo.value.trim() || 'Documento' } : null
      };
      if (elige) { datos.categoria = form.categoria.value; datos.etiquetas = separar(form.etiquetas.value); }
      const boton = form.querySelector('[type="submit"]');
      boton.disabled = true;
      try {
        const r = await api.guardarEntrada(nueva ? null : id, datos);
        sucio = false; form.classList.remove('is-sucio');
        aviso(datos.publicado ? (datos.fecha > hoyIso() ? 'Guardada. Se publicará el ' + fecha(datos.fecha + 'T12:00') + '.' : 'Publicada. Ya se ve en el blog.') : 'Guardada como borrador.', 'ok');
        if (nueva) { location.hash = '#blog/' + encodeURIComponent(r.id); return; }
        estado.textContent = `Guardado a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · ${nombreCat(r.categoria)}${(r.etiquetas || []).length ? ' · ' + r.etiquetas.join(', ') : ''}.`;
      } catch (er) { aviso(er.message, 'error'); }
      boton.disabled = false;
    });
  }

  // ── Vista: qué falta (dirección) ──
  // Separado por quién tiene que aportarlo: los datos del centro los da la
  // dirección; lo de cada departamento, el propio departamento desde su
  // cuenta. Para estos últimos se dice si ya hay alguien con acceso.
  async function vistaCumplimiento() {
    if (!yo.es_directiva) return vistaContenidos();
    if (!usuarios) { try { await cargarUsuarios(); } catch (e) { usuarios = []; } }
    const lista = ambitos.filter((a) => a.tipo !== 'especial' && (ESQ[a.esquema] || []).some((c) => c.obligatorio));
    const filas = lista.map((a) => ({ a, e: estadoAmbito(a) }));
    const responsables = (id) => usuarios.filter((u) => u.estado === 'aprobado' && u.rol === 'editor' && (u.ambitos || []).indexOf(id) >= 0).map((u) => u.nombre);
    const GRUPOS = [
      { titulo: 'Datos del centro', texto: 'Los aporta la dirección (o secretaría). Son pocos datos y algunos los exige la ley a todos los centros.', filtro: (a) => a.tipo === 'seccion', quien: false },
      { titulo: 'Departamentos y etapas', texto: 'Los escribe cada departamento desde su cuenta: objetivos, criterios de evaluación y calificación, instrumentos y programaciones. Mientras falten, su página lo indica y remite a secretaría.', filtro: (a) => a.tipo !== 'seccion', quien: true }
    ];
    const completos = filas.filter((f) => f.e.hechos === f.e.total).length;
    const tabla = (g) => {
      const fg = filas.filter((f) => g.filtro(f.a));
      if (!fg.length) return '';
      const hechos = fg.filter((f) => f.e.hechos === f.e.total).length;
      return `<section class="pnl-grupo"><h2>${esc(g.titulo)} <span class="pnl-insignia ${hechos === fg.length ? 'pnl-insignia--ok' : ''}">${hechos} de ${fg.length} completos</span></h2><p class="pnl-ayuda">${esc(g.texto)}</p>
        <div class="pnl-tabla-lista"><table><thead><tr><th scope="col">Apartado</th><th scope="col">Estado</th><th scope="col">Falta</th>${g.quien ? '<th scope="col">Quién lo rellena</th>' : ''}<th scope="col">Última edición</th></tr></thead><tbody>
        ${fg.map(({ a, e }) => {
          const r = responsables(a.id);
          return `<tr><th scope="row"><a href="#contenidos/${encodeURIComponent(a.id)}">${esc(a.nombre)}</a></th>
          <td><span class="pnl-insignia ${e.hechos === e.total ? 'pnl-insignia--ok' : 'pnl-insignia--falta'}">${e.hechos}/${e.total}</span></td>
          <td>${e.faltan.length ? esc(e.faltan.join(', ')) : '—'}</td>
          ${g.quien ? `<td>${r.length ? esc(r.join(', ')) : '<em>Nadie todavía</em>'}</td>` : ''}
          <td>${e.ultima ? esc(fecha(e.ultima)) : '—'}</td></tr>`;
        }).join('')}
        </tbody></table></div></section>`;
    };
    const sinNadie = filas.filter((f) => f.a.tipo !== 'seccion' && f.e.hechos < f.e.total && !responsables(f.a.id).length).length;
    pintar(`<header class="pnl-titular"><h1>Qué falta publicar</h1>
      <p>La normativa obliga a publicar los criterios de evaluación y calificación de cada etapa y materia, la información a las familias y los datos legales del centro. <strong>${completos} de ${filas.length}</strong> apartados están completos. Lo que la web ya enseña de serie cuenta como publicado.</p>
      ${sinNadie ? `<p class="pnl-nota">${sinNadie} ${sinNadie === 1 ? 'departamento no tiene' : 'departamentos no tienen'} todavía a nadie con cuenta para rellenarlo. Cuando el profesorado pida su cuenta en <a href="/acceso">/acceso</a>, apruébala en <a href="#solicitudes">Solicitudes</a> con su departamento; o rellénalo tú desde aquí si te pasan los textos.</p>` : ''}</header>
      ${GRUPOS.map(tabla).join('')}`, 'Qué falta publicar');
  }

  // ── Selector de ámbitos (aprobar y gestionar cuentas) ──
  function selectorAmbitos(nombre, marcados) {
    const grupos = {};
    ambitos.filter((a) => a.tipo !== 'especial' || yo.es_admin).forEach((a) => { (grupos[a.grupo || 'Otros'] = grupos[a.grupo || 'Otros'] || []).push(a); });
    return `<fieldset class="pnl-ambitos"><legend>Qué puede editar</legend><p class="pnl-ayuda">Con rol de dirección puede editar todo; estos permisos cuentan para los editores${yo.es_admin ? ' y para el acceso al canal interno' : ''}.</p>
      ${Object.keys(grupos).map((g) => `<div class="pnl-ambitos__grupo"><span>${esc(g)}</span>${grupos[g].map((a) => `<label class="pnl-check"><input type="checkbox" name="${esc(nombre)}" value="${esc(a.id)}"${marcados.indexOf(a.id) >= 0 ? ' checked' : ''} /> ${esc(a.nombre)}</label>`).join('')}</div>`).join('')}</fieldset>`;
  }
  const opcionesRol = (actual) => Object.keys(ROLES).filter((r) => r !== 'admin' || yo.es_admin).map((r) => `<option value="${r}"${r === actual ? ' selected' : ''}>${esc(ROLES[r])}</option>`).join('');

  async function cargarUsuarios() {
    usuarios = await api.usuarios();
    const n = usuarios.filter((u) => u.estado === 'pendiente').length;
    const c = $('[data-contador="solicitudes"]');
    if (c) { c.hidden = !n; c.textContent = n || ''; }
    return usuarios;
  }

  // ── Vista: solicitudes pendientes ──
  async function vistaSolicitudes() {
    if (!yo.es_directiva) return vistaContenidos();
    pintar('<p class="pnl-cargando">Cargando solicitudes…</p>');
    try { await cargarUsuarios(); } catch (e) { pintar(`<div class="pnl-vacio"><h1>No se han podido cargar</h1><p>${esc(e.message)}</p></div>`); return; }
    const pend = usuarios.filter((u) => u.estado === 'pendiente');
    pintar(`<header class="pnl-titular"><h1>Solicitudes de cuenta</h1>
      <p>Aprueba solo a personas del colegio que conozcas. Comprueba que el correo es suyo antes de darle acceso.</p></header>
      ${pend.length ? `<ul class="pnl-solicitudes">${pend.map((u) => `<li class="pnl-solicitud" data-usuario-id="${esc(u.id)}">
        <div class="pnl-solicitud__cab"><div><h2>${esc(u.nombre)}</h2><p>${esc(u.email)}${u.email_confirmado ? ' <span class="pnl-insignia pnl-insignia--ok">correo confirmado</span>' : ' <span class="pnl-insignia pnl-insignia--falta">correo sin confirmar</span>'}</p></div><small>Pedida el ${esc(fecha(u.creado_en, true))}</small></div>
        <dl class="pnl-datos"><dt>Cargo</dt><dd>${esc(u.cargo || '—')}</dd><dt>Quiere editar</dt><dd>${esc(u.ambito_solicitado ? (ambito(u.ambito_solicitado) || {}).nombre || u.ambito_solicitado : '—')}</dd><dt>Motivo</dt><dd>${esc(u.motivo || '—')}</dd></dl>
        <form data-aprobar>
          <label class="pnl-campo__etiqueta" for="rol-${esc(u.id)}">Rol</label>
          <select id="rol-${esc(u.id)}" name="rol">${opcionesRol('editor')}</select>
          ${selectorAmbitos('ambitos', u.ambito_solicitado ? [u.ambito_solicitado] : [])}
          <div class="pnl-acciones"><button type="submit" class="btn btn--primary"><i class="bi bi-check2" aria-hidden="true"></i> Aprobar</button>
          <button type="button" class="btn btn--ghost pnl-peligro" data-rechazar><i class="bi bi-x-lg" aria-hidden="true"></i> Rechazar</button></div>
        </form></li>`).join('')}</ul>` : '<div class="pnl-vacio pnl-vacio--suave"><p>No hay solicitudes pendientes.</p></div>'}`, 'Solicitudes');
    vista.onsubmit = async (ev) => {
      const f = ev.target.closest('[data-aprobar]'); if (!f) return;
      ev.preventDefault();
      const id = f.closest('[data-usuario-id]').dataset.usuarioId;
      const marc = $$('input[name="ambitos"]:checked', f).map((x) => x.value);
      if (f.rol.value === 'editor' && !marc.length) { aviso('Marca al menos un ámbito, o elige el rol de dirección.', 'error'); return; }
      try { await api.aprobar(id, f.rol.value, marc); aviso('Cuenta aprobada. Ya puede entrar.', 'ok'); vistaSolicitudes(); }
      catch (e) { aviso(e.message, 'error'); }
    };
    vista.onclick = async (ev) => {
      const b = ev.target.closest('[data-rechazar]'); if (!b) return;
      if (!confirmarDosVeces(b, '¿Rechazar? Pulsa otra vez')) return;
      try { await api.rechazar(b.closest('[data-usuario-id]').dataset.usuarioId); aviso('Solicitud rechazada.', 'ok'); vistaSolicitudes(); }
      catch (e) { aviso(e.message, 'error'); }
    };
  }

  // ── Vista: cuentas y permisos ──
  async function vistaCuentas() {
    if (!yo.es_directiva) return vistaContenidos();
    pintar('<p class="pnl-cargando">Cargando cuentas…</p>');
    try { await cargarUsuarios(); } catch (e) { pintar(`<div class="pnl-vacio"><h1>No se han podido cargar</h1><p>${esc(e.message)}</p></div>`); return; }
    const lista = usuarios.filter((u) => u.estado !== 'pendiente');
    const nombreAmb = (id) => (ambito(id) || {}).nombre || id;
    pintar(`<header class="pnl-titular"><h1>Cuentas y permisos</h1><p>Cambia el rol o lo que puede editar cada persona. Suspender una cuenta le quita el acceso al momento, sin borrar nada.</p></header>
      <ul class="pnl-cuentas">${lista.map((u) => {
        const soyYo = u.id === yo.id;
        const intocable = soyYo || (u.rol === 'admin' && !yo.es_admin);
        return `<li class="pnl-cuenta" data-usuario-id="${esc(u.id)}">
          <div class="pnl-cuenta__resumen">
            <div><strong>${esc(u.nombre)}${soyYo ? ' <span class="pnl-insignia">tú</span>' : ''}</strong><small>${esc(u.email)}${u.cargo ? ' · ' + esc(u.cargo) : ''}</small></div>
            <span class="pnl-insignia">${esc(ROLES[u.rol])}</span>
            <span class="pnl-insignia ${u.estado === 'aprobado' ? 'pnl-insignia--ok' : 'pnl-insignia--falta'}">${esc(ESTADOS[u.estado])}</span>
            <small>Último acceso: ${esc(fecha(u.ultimo_acceso))}</small>
            ${intocable ? '' : `<button type="button" class="btn btn--ghost btn--sm" data-gestionar aria-expanded="false">Gestionar</button>`}
          </div>
          <p class="pnl-cuenta__ambitos">${u.rol === 'editor' ? (u.ambitos.length ? u.ambitos.map((a) => `<span class="pnl-chip">${esc(nombreAmb(a))}</span>`).join('') : '<em>Sin ámbitos asignados</em>') : '<em>Edita toda la web</em>'}${u.rol !== 'editor' && u.ambitos.indexOf('canal-gestion') >= 0 ? ' <span class="pnl-chip">Canal interno</span>' : ''}</p>
          ${intocable ? '' : `<form class="pnl-cuenta__editar" data-editar-cuenta hidden>
            <label class="pnl-campo__etiqueta" for="r-${esc(u.id)}">Rol</label><select id="r-${esc(u.id)}" name="rol">${opcionesRol(u.rol)}</select>
            ${selectorAmbitos('ambitos', u.ambitos)}
            <div class="pnl-acciones"><button type="submit" class="btn btn--primary btn--sm">Guardar cambios</button>
            ${u.estado === 'suspendido' ? '<button type="button" class="btn btn--ghost btn--sm" data-estado="aprobado">Reactivar cuenta</button>' : u.estado === 'aprobado' ? '<button type="button" class="btn btn--ghost btn--sm pnl-peligro" data-estado="suspendido">Suspender cuenta</button>' : ''}</div>
          </form>`}
        </li>`;
      }).join('')}</ul>
      <p class="pnl-nota">Para borrar una cuenta del todo (por ejemplo, alguien que ya no trabaja en el colegio), suspéndela aquí y pide a quien administra la web que la elimine en Supabase.</p>`, 'Cuentas');
    vista.onclick = async (ev) => {
      const g = ev.target.closest('[data-gestionar]');
      if (g) {
        const f = g.closest('li').querySelector('[data-editar-cuenta]');
        f.hidden = !f.hidden; g.setAttribute('aria-expanded', String(!f.hidden));
        if (!f.hidden) f.querySelector('select').focus();
        return;
      }
      const e = ev.target.closest('[data-estado]');
      if (e) {
        if (e.dataset.estado === 'suspendido' && !confirmarDosVeces(e, '¿Suspender? Pulsa otra vez')) return;
        try { await api.cambiarEstado(e.closest('[data-usuario-id]').dataset.usuarioId, e.dataset.estado); aviso('Hecho.', 'ok'); vistaCuentas(); }
        catch (er) { aviso(er.message, 'error'); }
      }
    };
    vista.onsubmit = async (ev) => {
      const f = ev.target.closest('[data-editar-cuenta]'); if (!f) return;
      ev.preventDefault();
      const id = f.closest('[data-usuario-id]').dataset.usuarioId;
      const u = usuarios.find((x) => x.id === id);
      const marc = $$('input[name="ambitos"]:checked', f).map((x) => x.value);
      try {
        if (f.rol.value !== u.rol) await api.cambiarRol(id, f.rol.value);
        if (JSON.stringify(marc.slice().sort()) !== JSON.stringify(u.ambitos.slice().sort())) await api.fijarPermisos(id, marc);
        aviso('Cambios guardados.', 'ok'); vistaCuentas();
      } catch (er) { aviso(er.message, 'error'); }
    };
  }

  // ── Vista: historial ──
  async function vistaHistorial() {
    pintar('<p class="pnl-cargando">Cargando historial…</p>');
    let filas;
    try { filas = await api.historial(150); } catch (e) { pintar(`<div class="pnl-vacio"><h1>No se ha podido cargar</h1><p>${esc(e.message)}</p></div>`); return; }
    const ACC = { insert: 'Publicó', update: 'Cambió', borrar: 'Vació', 'blog-publicar': 'Escribió la entrada', 'blog-cambiar': 'Cambió la entrada', 'blog-borrar': 'Borró la entrada', solicitud: 'Solicitó cuenta', aprobar: 'Aprobó', rechazar: 'Rechazó', suspender: 'Suspendió', reactivar: 'Reactivó', 'cambiar rol': 'Cambió el rol', permisos: 'Cambió permisos' };
    const etiquetaCampo = (amb, clave) => { const a = ambito(amb); const c = a && (ESQ[a.esquema] || []).find((x) => x.clave === clave); return c ? c.etiqueta : clave; };
    pintar(`<header class="pnl-titular"><h1>Historial</h1><p>${yo.es_directiva ? 'Todos los cambios de la web y de las cuentas.' : 'Los cambios en lo que puedes editar.'} Si algo se ha cambiado por error, puedes recuperar el valor anterior.</p></header>
      ${filas.length ? `<div class="pnl-tabla-lista"><table><thead><tr><th scope="col">Cuándo</th><th scope="col">Quién</th><th scope="col">Qué</th><th scope="col"><span class="sr-only">Acciones</span></th></tr></thead><tbody>
      ${filas.map((h) => `<tr><td>${esc(fecha(h.fecha, true))}</td><td>${esc(h.autor_email || '—')}</td>
        <td>${esc(ACC[h.accion] || h.accion)} ${h.clave === 'blog' ? `<strong>«${esc(h.detalle || '')}»</strong> de ${esc((ambito(h.ambito_id) || {}).nombre || h.ambito_id)}` : h.ambito_id ? `<strong>${esc(etiquetaCampo(h.ambito_id, h.clave))}</strong> en ${esc((ambito(h.ambito_id) || {}).nombre || h.ambito_id)}` : esc(h.detalle || '')}</td>
        <td>${h.ambito_id && h.valor_anterior != null && puedeEditar(h.ambito_id) ? `<button type="button" class="btn btn--ghost btn--sm" data-restaurar="${esc(h.id)}">Recuperar lo anterior</button>` : ''}</td></tr>`).join('')}
      </tbody></table></div>` : '<div class="pnl-vacio pnl-vacio--suave"><p>Todavía no hay cambios.</p></div>'}`, 'Historial');
    vista.onclick = async (ev) => {
      const b = ev.target.closest('[data-restaurar]'); if (!b) return;
      const h = filas.find((x) => String(x.id) === b.dataset.restaurar);
      if (!confirmarDosVeces(b, '¿Recuperar? Pulsa otra vez')) return;
      try { await api.guardar(h.ambito_id, { [h.clave]: h.valor_anterior }); contenidos = Object.assign(contenidos, await api.contenidos([h.ambito_id])); aviso('Valor anterior recuperado y publicado.', 'ok'); vistaHistorial(); }
      catch (er) { aviso(er.message, 'error'); }
    };
  }

  // ── Vista: canal interno ──
  async function vistaCanal() {
    if (!yo.gestiona_canal) return vistaContenidos();
    pintar('<p class="pnl-cargando">Cargando comunicaciones…</p>');
    let lista;
    try { lista = await api.canalListar(); } catch (e) { pintar(`<div class="pnl-vacio"><h1>No se ha podido cargar</h1><p>${esc(e.message)}</p></div>`); return; }
    const plazo = (c) => {
      if (c.estado === 'recibida') { const d = diasDesde(c.creado_en); return d >= 7 ? `<span class="pnl-insignia pnl-insignia--falta">Acuse fuera de plazo (${d} días)</span>` : `<span class="pnl-insignia">Acuse: quedan ${7 - d} días</span>`; }
      if (c.estado !== 'cerrada') { const d = diasDesde(c.acuse_en || c.creado_en); return d > 90 ? '<span class="pnl-insignia pnl-insignia--falta">Respuesta fuera de plazo</span>' : `<span class="pnl-insignia">Respuesta: quedan ${90 - d} días</span>`; }
      return '';
    };
    pintar(`<header class="pnl-titular"><h1>Canal interno de información</h1>
      <p>Ley 2/2023. Plazos: acuse de recibo en 7 días naturales; respuesta en 3 meses como máximo. Lo que escribas en «Respuesta» lo ve quien informó al consultar su código. Las notas internas no las ve nadie más.</p></header>
      ${lista.length ? `<ul class="pnl-canal">${lista.map((c) => `<li class="pnl-comunicacion" data-canal-id="${esc(c.id)}">
        <div class="pnl-cuenta__resumen"><div><strong>${esc(CANAL_CAT[c.categoria] || c.categoria)}</strong><small>Recibida el ${esc(fecha(c.creado_en, true))}</small></div>
          <span class="pnl-insignia ${c.estado === 'cerrada' ? 'pnl-insignia--ok' : ''}">${esc(CANAL_EST[c.estado])}</span>${plazo(c)}</div>
        <details><summary>Ver y gestionar</summary>
          <dl class="pnl-datos"><dt>Identidad</dt><dd>${c.anonima ? 'Anónima' : esc((c.nombre || '—') + (c.contacto ? ' · ' + c.contacto : ''))}</dd></dl>
          <p class="pnl-relato">${esc(c.relato)}</p>
          <form data-canal-form>
            <label class="pnl-campo__etiqueta" for="ce-${esc(c.id)}">Estado</label>
            <select id="ce-${esc(c.id)}" name="estado">${Object.keys(CANAL_EST).map((k) => `<option value="${k}"${k === c.estado ? ' selected' : ''}>${esc(CANAL_EST[k])}</option>`).join('')}</select>
            <label class="pnl-campo__etiqueta" for="cr-${esc(c.id)}">Respuesta a quien informa</label>
            <textarea id="cr-${esc(c.id)}" name="respuesta" rows="4">${esc(c.respuesta || '')}</textarea>
            <label class="pnl-campo__etiqueta" for="cn-${esc(c.id)}">Notas internas</label>
            <textarea id="cn-${esc(c.id)}" name="notas" rows="3">${esc(c.notas_internas || '')}</textarea>
            <div class="pnl-acciones"><button type="submit" class="btn btn--primary btn--sm">Guardar</button></div>
          </form></details></li>`).join('')}</ul>` : '<div class="pnl-vacio pnl-vacio--suave"><p>No hay comunicaciones.</p></div>'}`, 'Canal interno');
    vista.onsubmit = async (ev) => {
      const f = ev.target.closest('[data-canal-form]'); if (!f) return;
      ev.preventDefault();
      try { await api.canalActualizar(f.closest('[data-canal-id]').dataset.canalId, f.estado.value, f.respuesta.value, f.notas.value); aviso('Guardado.', 'ok'); vistaCanal(); }
      catch (er) { aviso(er.message, 'error'); }
    };
  }

  // ── Vista: mi cuenta ──
  function vistaCuenta() {
    pintar(`<header class="pnl-titular"><h1>Mi cuenta</h1><p>${esc(yo.email)} · ${esc(ROLES[yo.rol])}</p></header>
      <div class="pnl-dos">
        <form class="pnl-form" data-mis-datos><h2>Tus datos</h2>
          <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="mNombre">Nombre</label><input id="mNombre" name="nombre" value="${esc(yo.nombre)}" required maxlength="120" autocomplete="name" /></div>
          <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="mCargo">Cargo</label><input id="mCargo" name="cargo" value="${esc(yo.cargo || '')}" maxlength="120" /></div>
          <button type="submit" class="btn btn--primary btn--sm">Guardar</button></form>
        <form class="pnl-form" data-mi-clave><h2>Cambiar contraseña</h2>
          <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="mClave">Contraseña nueva</label><input id="mClave" name="clave" type="password" minlength="10" required autocomplete="new-password" aria-describedby="mClaveAyuda" /><p class="pnl-ayuda" id="mClaveAyuda">Al menos 10 caracteres. Mejor una frase que una palabra.</p></div>
          <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="mClave2">Repítela</label><input id="mClave2" name="clave2" type="password" required autocomplete="new-password" /></div>
          <button type="submit" class="btn btn--primary btn--sm">Cambiar contraseña</button></form>
      </div>`, 'Mi cuenta');
    vista.onsubmit = async (ev) => {
      ev.preventDefault();
      const f = ev.target;
      try {
        if (f.matches('[data-mis-datos]')) {
          await api.actualizarMiPerfil(f.nombre.value, f.cargo.value);
          yo.nombre = f.nombre.value.trim(); yo.cargo = f.cargo.value.trim();
          $('[data-nombre]').textContent = yo.nombre; aviso('Datos guardados.', 'ok');
        } else if (f.matches('[data-mi-clave]')) {
          if (f.clave.value.length < 10) throw new Error('La contraseña tiene que tener al menos 10 caracteres.');
          if (f.clave.value !== f.clave2.value) throw new Error('Las dos contraseñas no coinciden.');
          await api.cambiarClave(f.clave.value); f.reset(); aviso('Contraseña cambiada.', 'ok');
        }
      } catch (er) { aviso(er.message, 'error'); }
    };
  }

  // Cada vista pone sus propios manejadores: se limpian al cambiar de vista
  window.addEventListener('hashchange', () => { vista.onclick = null; vista.onsubmit = null; window.onbeforeunload = null; }, true);

  iniciar();
})();
