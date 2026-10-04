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
     #ficha                   mi ficha pública (foto, presentación…)
     #fichas · #fichas/<slug> fichas de todo el personal (dirección)
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
    items.push(['ficha', 'bi-person-vcard', 'Mi ficha']);
    if (yo.es_directiva) items.push(['fichas', 'bi-people-fill', 'Fichas del personal']);
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
    const vistas = { contenidos: () => (arg ? vistaEditor(decodeURIComponent(arg)) : vistaContenidos()), blog: () => (arg ? vistaEntrada(decodeURIComponent(arg)) : vistaBlog()), cumplimiento: vistaCumplimiento, solicitudes: vistaSolicitudes, cuentas: vistaCuentas, historial: vistaHistorial, canal: vistaCanal, cuenta: vistaCuenta, ficha: () => vistaFicha(null), fichas: () => (arg ? vistaFicha(decodeURIComponent(arg)) : vistaFichas()) };
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
        control = `${barraHtml(c)}<textarea id="${id}" rows="9"${descr}${c.ejemplo ? ` placeholder="${esc(c.ejemplo)}"` : ''}>${esc(v || '')}</textarea>
          <div class="pnl-recuadro" data-recuadro hidden></div>
          <p class="pnl-formato">Escribe normal. Línea en blanco = párrafo nuevo. Usa la barra para subtítulos, listas, enlaces, botones, archivos e imágenes.</p>`; break;
      case 'lista':
        control = `<textarea id="${id}" rows="6"${descr}${c.ejemplo ? ` placeholder="${esc(c.ejemplo)}"` : ''}>${esc((v || []).join('\n'))}</textarea><p class="pnl-formato">Una entrada por línea.</p>`; break;
      case 'enlaces':
        control = enlacesHtml(c, v || []); break;
      case 'imagenes':
        control = imagenesHtml(c, v || []); break;
      case 'filas':
        control = filasHtml(c, v || []); break;
      case 'documentos':
        control = documentosHtml(c, v || []); break;
      case 'noticias':
        control = noticiasHtml(v || []); break;
      default:
        control = `<p>Tipo de campo no soportado: ${esc(c.tipo)}</p>`;
    }
    const GRUPO = ['filas', 'documentos', 'noticias', 'enlaces', 'imagenes'];
    const etiqueta = GRUPO.indexOf(c.tipo) >= 0
      ? `<span class="pnl-campo__etiqueta" id="${id}-et">${esc(c.etiqueta)} ${obligatorio}${deSerie}</span>`
      : `<label class="pnl-campo__etiqueta" for="${id}">${esc(c.etiqueta)} ${obligatorio}${deSerie}</label>`;
    return `<div class="pnl-campo" id="campo-${esc(c.clave)}" data-clave="${esc(c.clave)}" data-tipo="${esc(c.tipo)}"${GRUPO.indexOf(c.tipo) >= 0 ? ` role="group" aria-labelledby="${id}-et"` : ''}>${etiqueta}${ayuda}${control}<p class="pnl-error" data-error hidden></p><ul class="pnl-revision-campo" data-revision-campo hidden></ul></div>`;
  }

  // Barra de formato de los textos largos. Lo que pide datos (enlace,
  // botón, archivo, imagen) abre un recuadro debajo con sus casillas.
  function barraHtml(c) {
    const b = (fmt, ico, txt) => `<button type="button" class="pnl-barra__b" data-fmt="${fmt}"><i class="bi ${ico}" aria-hidden="true"></i><span>${txt}</span></button>`;
    return `<div class="pnl-barra" role="toolbar" aria-label="Formato de ${esc(c.etiqueta)}">
      ${b('sub', 'bi-type-h2', 'Subtítulo')}${b('neg', 'bi-type-bold', 'Negrita')}${b('lista', 'bi-list-ul', 'Lista')}
      <span class="pnl-barra__sep" aria-hidden="true"></span>
      ${b('enlace', 'bi-link-45deg', 'Enlace')}${b('boton', 'bi-hand-index-thumb', 'Botón')}${b('archivo', 'bi-paperclip', 'Archivo')}${b('imagen', 'bi-image', 'Imagen')}
    </div>`;
  }
  const RECUADROS = {
    enlace: { titulo: 'Enlace dentro del texto', campos: [['texto', 'Texto que se lee', 'text', 'el calendario escolar'], ['url', 'Dirección (https://…)', 'url', 'https://']] },
    boton: { titulo: 'Botón', campos: [['texto', 'Texto del botón', 'text', 'Ver la programación'], ['url', 'Adónde lleva (https://…)', 'url', 'https://']] },
    archivo: { titulo: 'Botón para descargar un archivo', campos: [['texto', 'Texto del botón', 'text', 'Descargar la programación de 2.º'], ['archivo', 'Archivo (PDF, Word, Excel, PowerPoint o foto, hasta 15 MB)', 'file', '']] },
    imagen: { titulo: 'Imagen', campos: [['archivo', 'Foto', 'file-img', ''], ['texto', 'Qué se ve en la foto (obligatorio)', 'text', 'Alumnos de 3.º en el huerto del colegio']] }
  };
  function recuadroHtml(tipo) {
    const r = RECUADROS[tipo];
    let n = 0;
    return `<p class="pnl-recuadro__t">${esc(r.titulo)}</p><div class="pnl-recuadro__campos">${r.campos.map(([k, et, t, ph]) => {
      const rid = 'rq-' + tipo + '-' + (n++);
      if (t === 'file' || t === 'file-img') return `<label class="pnl-recuadro__c" for="${rid}">${esc(et)}<input id="${rid}" type="file" data-rq="${k}"${t === 'file-img' ? ' accept="image/*"' : ' accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.jpg,.jpeg,.png,.webp"'} /></label>`;
      return `<label class="pnl-recuadro__c" for="${rid}">${esc(et)}<input id="${rid}" type="${t}" data-rq="${k}" placeholder="${esc(ph)}" maxlength="${k === 'texto' ? 80 : 500}" /></label>`;
    }).join('')}</div>
      <div class="pnl-acciones"><button type="button" class="btn btn--primary btn--sm" data-rq-insertar="${tipo}">Insertar</button><button type="button" class="btn btn--ghost btn--sm" data-rq-cancelar>Cancelar</button></div>`;
  }

  // Recursos y enlaces: una fila por botón
  function enlaceFilaHtml(x) {
    const m = /^(.{2,60}?)\s+·\s+(.+)$/.exec((x && x.texto) || '');
    const grupo = m ? m[1] : '';
    const texto = m ? m[2] : ((x && x.texto) || '');
    return `<li class="pnl-enlace">
      <label>Grupo <small>(opcional)</small><input type="text" data-e="grupo" value="${esc(grupo)}" maxlength="60" list="grupos-enlace" placeholder="1.º ESO" /></label>
      <label>Texto del botón<input type="text" data-e="texto" value="${esc(texto)}" maxlength="80" placeholder="Libro digital" /></label>
      <label>Enlace<input type="url" data-e="url" value="${esc((x && x.url) || '')}" placeholder="https://… o sube un archivo" /></label>
      <div class="pnl-enlace__acc">
        <label class="btn btn--ghost btn--sm pnl-subir" title="Subir un archivo en lugar de poner el enlace"><i class="bi bi-upload" aria-hidden="true"></i><span>Archivo</span><input type="file" data-subir-enlace class="sr-only" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.jpg,.jpeg,.png,.webp" /></label>
        <button type="button" class="pnl-ico" data-subir-fila aria-label="Subir"><i class="bi bi-arrow-up" aria-hidden="true"></i></button>
        <button type="button" class="pnl-ico" data-bajar-fila aria-label="Bajar"><i class="bi bi-arrow-down" aria-hidden="true"></i></button>
        <button type="button" class="pnl-ico pnl-ico--peligro" data-quitar-fila aria-label="Quitar"><i class="bi bi-trash" aria-hidden="true"></i></button>
      </div></li>`;
  }
  function enlacesHtml(c, lista) {
    const grupos = [...new Set(lista.map((x) => (/^(.{2,60}?)\s+·\s+/.exec(x.texto || '') || [])[1]).filter(Boolean))];
    return `<div class="pnl-enlaces"><datalist id="grupos-enlace">${grupos.map((g) => `<option value="${esc(g)}"></option>`).join('')}</datalist>
      <ol class="pnl-enlaces__lista" data-filas-enlace>${(lista.length ? lista : [{}]).map(enlaceFilaHtml).join('')}</ol>
      <button type="button" class="btn btn--ghost btn--sm" data-anadir-enlace><i class="bi bi-plus-lg" aria-hidden="true"></i> Añadir botón</button></div>`;
  }
  // Fotos: miniatura, descripción obligatoria y orden
  function imagenItemHtml(f) {
    return `<li class="pnl-imagen"><img src="${esc(f.url)}" alt="" data-img-url="${esc(f.url)}" />
      <label>Qué se ve<input type="text" data-img-alt value="${esc(f.alt || '')}" maxlength="200" placeholder="Alumnos de 1.º en la salida al museo" /></label>
      <div class="pnl-enlace__acc">
        <button type="button" class="pnl-ico" data-subir-fila aria-label="Antes"><i class="bi bi-arrow-up" aria-hidden="true"></i></button>
        <button type="button" class="pnl-ico" data-bajar-fila aria-label="Después"><i class="bi bi-arrow-down" aria-hidden="true"></i></button>
        <button type="button" class="pnl-ico pnl-ico--peligro" data-quitar-fila aria-label="Quitar foto"><i class="bi bi-trash" aria-hidden="true"></i></button>
      </div></li>`;
  }
  function imagenesHtml(c, lista) {
    return `<div class="pnl-imagenes"><ul class="pnl-imagenes__lista" data-lista-imagenes>${lista.map(imagenItemHtml).join('')}</ul>
      <label class="btn btn--ghost btn--sm pnl-subir"><i class="bi bi-images" aria-hidden="true"></i> Añadir fotos<input type="file" accept="image/*" multiple data-subir-galeria class="sr-only" /></label></div>`;
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
        <label class="btn btn--ghost btn--sm pnl-subir"><i class="bi bi-upload" aria-hidden="true"></i> Subir archivo<input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp" data-subir-pdf class="sr-only" /></label>
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
        const out = [];
        $$('.pnl-enlace', caja).forEach((li, i) => {
          const g = (k) => li.querySelector(`[data-e="${k}"]`).value.trim();
          const grupo = g('grupo'), texto = g('texto'), url = g('url');
          if (!texto && !url) return;
          if (!texto) throw new Error(`Botón ${i + 1}: falta el texto del botón.`);
          if (!urlValida(url)) throw new Error(`Botón ${i + 1}: falta el enlace o no empieza por https://. También puedes subir un archivo.`);
          out.push({ texto: grupo ? `${grupo} · ${texto}` : texto, url });
        });
        return out;
      }
      case 'imagenes':
        return $$('.pnl-imagen', caja).map((li, i) => {
          const alt = li.querySelector('[data-img-alt]').value.trim();
          if (alt.length < 5) throw new Error(`Foto ${i + 1}: describe en una frase qué se ve (lo leen quienes no pueden ver la imagen).`);
          return { url: li.querySelector('[data-img-url]').getAttribute('data-img-url'), alt };
        });
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

  // ── Reglas de la web ──
  // Lo que rompe la página (enlaces mal puestos, fotos sin descripción,
  // menos del mínimo) es un error y no deja guardar ese campo. Lo que
  // solo la afea (mayúsculas, párrafos larguísimos, botones de más) es
  // un aviso: se puede guardar igual.
  const textoPlano = (t) => String(t || '').replace(/\[\[([^|\]]*)\|[^\]]*\]\]/g, '$1').replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/^#{1,3}\s+/gm, '').replace(/^[-•*]\s+/gm, '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  const GENERICOS = /^(aqu[ií]|pincha aqu[ií]|haz clic aqu[ií]|clic aqu[ií]|click|enlace|link|ver|m[aá]s|leer m[aá]s|descargar)$/i;
  const enMayusculas = (t) => {
    const p = String(t).match(/[A-Za-zÁÉÍÓÚÑÜáéíóúñü]{3,}/g) || [];
    if (p.length >= 4 && p.filter((w) => w === w.toUpperCase()).length / p.length > 0.7) return true;
    // o cuatro palabras seguidas en mayúsculas
    return /(\b[A-ZÁÉÍÓÚÑÜ]{2,}\b[\s,.;:]+){3,}\b[A-ZÁÉÍÓÚÑÜ]{2,}\b/.test(String(t));
  };
  function revisar(c, v) {
    const errores = [], avisos = [];
    if (vacio(v)) return { errores, avisos };
    const min = c.minimo || {};
    if (min.caracteres && typeof v === 'string') {
      const n = textoPlano(v).length;
      if (n < min.caracteres) errores.push(`Escribe al menos ${min.caracteres} caracteres (llevas ${n}).`);
    }
    if (min.elementos && Array.isArray(v) && v.length < min.elementos) errores.push(`Pon al menos ${min.elementos} (llevas ${v.length}).`);
    const F = window.NSD_FICHA || {};
    if (c.tipo === 'parrafos') {
      const lineas = v.split('\n').map((l) => l.trim());
      let botones = 0, previaTitulo = false;
      lineas.forEach((l) => {
        if (!l) return;
        let m;
        if (F.RE_BOTON && (m = F.RE_BOTON.exec(l))) {
          botones++;
          if (!urlValida(m[2])) errores.push(`El botón «${m[1]}» no tiene un enlace válido.`);
          if (m[1].length > 40) avisos.push(`El botón «${m[1].slice(0, 30)}…» es muy largo: déjalo en menos de 40 letras.`);
          if (GENERICOS.test(m[1].trim())) avisos.push(`«${m[1]}» no dice adónde lleva el botón. Mejor algo como «Ver la programación».`);
        } else if (/^\[\[/.test(l)) errores.push('Hay un botón mal escrito. Bórralo y vuelve a crearlo con el botón «Botón» de la barra.');
        else if (F.RE_IMAGEN && (m = F.RE_IMAGEN.exec(l))) {
          if (m[1].trim().length < 5) errores.push('Una imagen no tiene descripción: escribe qué se ve en ella.');
        } else if (/^!\[/.test(l)) errores.push('Hay una imagen mal escrita. Bórrala y vuelve a añadirla con «Imagen».');
        if (/^#\s/.test(l)) avisos.push('Usa «Subtítulo» de la barra (##) en lugar de un solo #.');
        const t = /^#{2,3}\s+(.+)$/.exec(l);
        if (t && t[1].length > 60) avisos.push(`El subtítulo «${t[1].slice(0, 30)}…» es muy largo: déjalo en menos de 60 letras.`);
        if (t && previaTitulo) avisos.push('Hay dos subtítulos seguidos sin texto entre ellos.');
        previaTitulo = !!t;
      });
      (v.match(/\[([^\]]+)\]\(([^)]*)\)/g) || []).forEach((x) => {
        if (x.charAt(0) === '!' ) return;
        const m = /\[([^\]]+)\]\(([^)]*)\)/.exec(x);
        if (m && !urlValida(m[2])) errores.push(`El enlace «${m[1]}» no empieza por https://`);
      });
      if (botones > 6) avisos.push(`Hay ${botones} botones en este texto. Si son recursos, ponlos mejor en «Recursos y enlaces».`);
      v.split(/\n\s*\n/).forEach((b) => {
        const plano = textoPlano(b);
        if (plano.length > 900) avisos.push('Hay un párrafo muy largo: divídelo o añade un subtítulo para que se lea mejor.');
        if (b.split('\n').some((l) => !/^\[\[|^!\[/.test(l.trim()) && enMayusculas(textoPlano(l)))) avisos.push('Hay texto en MAYÚSCULAS: se lee peor y parece que se grita. Escríbelo normal.');
      });
    } else if (c.tipo === 'lista') {
      if (v.some((x) => x.length > 220)) avisos.push('Alguna línea es muy larga: una idea por línea.');
      if (new Set(v.map((x) => x.toLowerCase())).size < v.length) avisos.push('Hay líneas repetidas.');
      if (v.some(enMayusculas)) avisos.push('Hay líneas en MAYÚSCULAS: escríbelas normal.');
    } else if (c.tipo === 'enlaces') {
      const textos = v.map((x) => (/^.{2,60}?\s+·\s+(.+)$/.exec(x.texto) || [null, x.texto])[1]);
      textos.forEach((t) => {
        if (t.length > 60) avisos.push(`«${t.slice(0, 30)}…»: el texto del botón es muy largo.`);
        if (GENERICOS.test(t.trim())) avisos.push(`«${t}» no dice adónde lleva. Mejor algo como «Libro digital de 2.º».`);
      });
      if (new Set(v.map((x) => x.url)).size < v.length) avisos.push('Hay dos botones que llevan al mismo sitio.');
      const conGrupo = v.filter((x) => /\s·\s/.test(x.texto)).length;
      if (v.length > 8 && conGrupo && conGrupo < v.length) avisos.push('Unos botones tienen grupo y otros no: ponles grupo a todos para que salgan ordenados.');
      if (v.length > 40) avisos.push('Son muchos botones: agrúpalos por curso o tema.');
    } else if (c.tipo === 'imagenes') {
      if (v.length > 12) avisos.push('Más de 12 fotos hacen la página muy pesada: elige las mejores.');
    } else if (c.tipo === 'documentos') {
      v.forEach((d) => {
        if (/^documento$/i.test(d.titulo) || /\.(pdf|docx?|xlsx?|pptx?)$/i.test(d.titulo) || /_/.test(d.titulo)) avisos.push(`«${d.titulo}»: pon un título claro, por ejemplo «Programación de 2.º de ESO».`);
      });
    }
    return { errores: [...new Set(errores)], avisos: [...new Set(avisos)] };
  }

  // ── Vista previa ──
  // Pinta la sección con el mismo código que la web (departamentos.js),
  // con su color, a tamaño de ordenador o de móvil.
  function htmlPrevia(a, campos, vals) {
    const F = window.NSD_FICHA;
    if (!F) return '<p class="pnl-ayuda">La vista previa no está disponible.</p>';
    const dep = DEPS.find((d) => d.id === a.id);
    if (dep) {
      return `<div class="pnl-previa__hero"><small>${esc(dep.grupo || '')}</small><strong>${esc(dep.nombre)}</strong>${dep.resumen ? `<span>${esc(dep.resumen)}</span>` : ''}</div>
        <div class="pnl-previa__cuerpo">${F.htmlFicha(dep, campos, vals, {})}</div>`;
    }
    const secciones = campos.filter((c) => !vacio(vals[c.clave])).map((c) => {
      let cuerpo;
      if (c.tipo === 'noticias') {
        cuerpo = `<ul class="pnl-previa__noticias">${vals[c.clave].filter((n) => n.publicado !== false).slice(0, 6).map((n) => `<li><time>${esc(n.fecha)}</time><strong>${esc(n.titulo)}</strong><span>${esc(n.resumen || '')}</span></li>`).join('')}</ul>`;
      } else cuerpo = F.valorDe(c, vals[c.clave]);
      return `<section class="pnl-previa__sec"><h2>${esc(c.etiqueta)}</h2><div class="prose dep-bloque__cuerpo">${cuerpo}</div></section>`;
    }).join('');
    return `<div class="pnl-previa__hero"><small>Sección de la web</small><strong>${esc(a.nombre)}</strong></div><div class="pnl-previa__cuerpo">${secciones || '<p class="pnl-ayuda">Aún no hay nada que mostrar.</p>'}</div>`;
  }

  function insertarEn(ta, texto, opciones) {
    const o = opciones || {};
    const ini = Number(ta.dataset.selIni != null ? ta.dataset.selIni : ta.selectionStart);
    const fin = Number(ta.dataset.selFin != null ? ta.dataset.selFin : ta.selectionEnd);
    delete ta.dataset.selIni; delete ta.dataset.selFin;
    const v = ta.value;
    let antes = v.slice(0, ini), despues = v.slice(fin);
    if (o.lineaPropia) {
      if (antes && !/\n$/.test(antes)) antes += '\n';
      if (o.parrafo && antes && !/\n\n$/.test(antes)) antes += '\n';
      if (despues && !/^\n/.test(despues)) despues = '\n' + despues;
    }
    ta.value = antes + texto + despues;
    const pos = antes.length + (o.seleccion ? o.seleccion[0] : texto.length);
    ta.focus();
    ta.setSelectionRange(pos, o.seleccion ? antes.length + o.seleccion[1] : pos);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
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
      <div class="pnl-editor">
      <form class="pnl-form" data-editor="${esc(id)}" novalidate>
        <p class="pnl-reglas"><i class="bi bi-info-circle" aria-hidden="true"></i><span>Todo lo que escribas sale con el diseño de la web: no hace falta dar formato a mano. Las reglas básicas (mínimos, enlaces que funcionen, fotos con descripción, nada en mayúsculas) se comprueban mientras escribes; la vista previa enseña cómo quedará.</span></p>
        ${campos.map((c) => campoHtml(c, (datos[c.clave] || {}).valor, def[c.clave])).join('')}
        <div class="pnl-guardar"><p class="pnl-guardar__estado" data-estado-guardar>Sin cambios.</p>
          <button type="submit" class="btn btn--primary"><i class="bi bi-cloud-check" aria-hidden="true"></i> Guardar y publicar</button></div>
      </form>
      <aside class="pnl-previa" aria-labelledby="previa-t">
        <div class="pnl-previa__barra">
          <h2 id="previa-t">Vista previa</h2>
          <div class="pnl-segmentado" role="group" aria-label="Tamaño de la vista previa">
            <button type="button" data-ancho="1180" aria-pressed="true"><i class="bi bi-laptop" aria-hidden="true"></i> Ordenador</button>
            <button type="button" data-ancho="390" aria-pressed="false"><i class="bi bi-phone" aria-hidden="true"></i> Móvil</button>
          </div>
        </div>
        <div class="pnl-revision" data-revision aria-live="polite"></div>
        <div class="pnl-previa__marco" data-previa-marco><div class="pnl-previa__lienzo" data-previa data-tono="${esc((DEPS.find((d) => d.id === id) || {}).slug || 'centro')}"></div></div>
        <p class="pnl-ayuda">Así se verá al guardar. Los enlaces de la vista previa no se abren.</p>
      </aside>
      </div>`, a.nombre);
    const form = $('[data-editor]');
    const lienzo = $('[data-previa]');
    const marco = $('[data-previa-marco]');
    let anchoPrevia = 1180;
    const escalar = () => {
      const w = marco.clientWidth || anchoPrevia;
      lienzo.style.width = anchoPrevia + 'px';
      lienzo.style.zoom = String(Math.min(1, w / anchoPrevia));
    };
    let tPrevia = null;
    function actualizarPrevia() {
      const vals = {};
      const resultado = [];
      $$('.pnl-campo', form).forEach((caja) => {
        const k = caja.dataset.clave;
        const c = campos.find((x) => x.clave === k);
        const lista = caja.querySelector('[data-revision-campo]');
        let v; let r;
        try { v = leerCampo(caja); r = revisar(c, v); } catch (er) {
          r = { errores: [er.message], avisos: [] };
          if (caja.dataset.tipo === 'parrafos') v = caja.querySelector('textarea').value;
        }
        vals[k] = v;
        const tocado = (() => { try { return JSON.stringify(leerCampo(caja)) !== originales[k]; } catch (e) { return true; } })();
        caja.dataset.bloquea = tocado && r.errores.length ? '1' : '';
        lista.innerHTML = r.errores.map((m) => `<li class="is-error"><i class="bi bi-x-circle" aria-hidden="true"></i>${esc(m)}</li>`).join('') + r.avisos.map((m) => `<li class="is-aviso"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i>${esc(m)}</li>`).join('');
        lista.hidden = !lista.innerHTML;
        r.errores.forEach((m) => resultado.push(['error', c.etiqueta, m, k]));
        r.avisos.forEach((m) => resultado.push(['aviso', c.etiqueta, m, k]));
      });
      const nE = resultado.filter((x) => x[0] === 'error').length;
      const nA = resultado.length - nE;
      $('[data-revision]').innerHTML = !resultado.length
        ? '<p class="pnl-revision__ok"><i class="bi bi-check-circle" aria-hidden="true"></i> Todo cumple las reglas de la web.</p>'
        : `<details class="pnl-revision__det"${nE ? ' open' : ''}><summary><span class="${nE ? 'is-error' : 'is-aviso'}">${nE ? `${nE} ${nE === 1 ? 'cosa que corregir' : 'cosas que corregir'}` : ''}${nE && nA ? ' · ' : ''}${nA ? `${nA} ${nA === 1 ? 'consejo' : 'consejos'}` : ''}</span></summary>
            <ul>${resultado.map(([t, et, m, k]) => `<li class="is-${t}"><a href="#campo-${esc(k)}" data-ir-campo="${esc(k)}"><strong>${esc(et)}:</strong> ${esc(m)}</a></li>`).join('')}</ul></details>`;
      lienzo.innerHTML = htmlPrevia(a, campos, vals);
      escalar();
    }
    const programarPrevia = () => { clearTimeout(tPrevia); tPrevia = setTimeout(actualizarPrevia, 250); };
    if (window.ResizeObserver) new ResizeObserver(escalar).observe(marco);
    // Al ponerse en un campo, la vista previa baja hasta ese apartado
    let campoActual = null;
    form.addEventListener('focusin', (ev) => {
      const caja = ev.target.closest('.pnl-campo');
      if (!caja || caja.dataset.clave === campoActual) return;
      campoActual = caja.dataset.clave;
      const destino = lienzo.querySelector('#' + CSS.escape(campoActual.replace(/_/g, '-')));
      if (!destino) return;
      const z = parseFloat(lienzo.style.zoom) || 1;
      const y = destino.getBoundingClientRect().top - marco.getBoundingClientRect().top + marco.scrollTop;
      marco.scrollTo({ top: Math.max(0, y * (CSS.supports('zoom', '1') ? 1 : z) - 16), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    lienzo.addEventListener('click', (ev) => { if (ev.target.closest('a')) ev.preventDefault(); });
    $('.pnl-previa').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-ancho]');
      if (b) {
        anchoPrevia = Number(b.dataset.ancho);
        $$('[data-ancho]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        marco.classList.toggle('es-movil', anchoPrevia < 600);
        escalar();
      }
      const ir = ev.target.closest('[data-ir-campo]');
      if (ir) {
        ev.preventDefault();
        const caja = form.querySelector(`[data-clave="${ir.dataset.irCampo}"]`);
        caja.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
        const f = caja.querySelector('textarea, input'); if (f) f.focus({ preventScroll: true });
      }
    });
    const originales = {};
    $$('.pnl-campo', form).forEach((caja) => { try { originales[caja.dataset.clave] = JSON.stringify(leerCampo(caja)); } catch (er) { originales[caja.dataset.clave] = null; } });
    // Lo que se ve de serie cuenta como «sin guardar» solo si se toca.
    const deSerie = new Set(campos.filter((c) => vacio((datos[c.clave] || {}).valor) && !vacio(def[c.clave])).map((c) => c.clave));
    const estadoGuardar = $('[data-estado-guardar]', form);
    // «Sin guardar» solo si de verdad algo es distinto de lo publicado:
    // abrir un recuadro, mover el foco o deshacer lo escrito no cuenta.
    const hayCambios = () => $$('.pnl-campo', form).some((caja) => {
      try { return JSON.stringify(leerCampo(caja)) !== originales[caja.dataset.clave]; } catch (e) { return true; }
    });
    let tSucio = null;
    const marcarSucio = () => {
      clearTimeout(tSucio);
      tSucio = setTimeout(() => {
        const sucio = hayCambios();
        form.classList.toggle('is-sucio', sucio);
        if (sucio) estadoGuardar.textContent = 'Hay cambios sin guardar.';
        else if (/sin guardar/.test(estadoGuardar.textContent)) estadoGuardar.textContent = 'Sin cambios.';
      }, 200);
    };
    form.addEventListener('input', () => { marcarSucio(); programarPrevia(); });
    form.addEventListener('change', () => { marcarSucio(); programarPrevia(); });
    actualizarPrevia();
    window.onbeforeunload = () => (form.isConnected && hayCambios() ? true : undefined);

    form.addEventListener('click', async (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      const caja = b.closest('.pnl-campo');
      if (b.matches('[data-anadir-fila]')) {
        const cols = JSON.parse(caja.querySelector('[data-columnas]').getAttribute('data-columnas'));
        caja.querySelector('tbody').insertAdjacentHTML('beforeend', filaHtml({ columnas: cols }, {}));
        caja.querySelector('tbody tr:last-child input').focus(); marcarSucio();
      } else if (b.matches('[data-quitar-fila]')) {
        const fila = b.closest('tr, li');
        const lista = fila.parentNode;
        fila.remove();
        if (lista.matches('[data-filas-enlace]') && !lista.children.length) lista.insertAdjacentHTML('beforeend', enlaceFilaHtml({}));
        marcarSucio(); programarPrevia();
      }
      else if (b.matches('[data-subir-fila]')) { const tr = b.closest('tr, li'); if (tr.previousElementSibling) { tr.parentNode.insertBefore(tr, tr.previousElementSibling); b.focus(); marcarSucio(); programarPrevia(); } }
      else if (b.matches('[data-bajar-fila]')) { const tr = b.closest('tr, li'); if (tr.nextElementSibling) { tr.parentNode.insertBefore(tr.nextElementSibling, tr); b.focus(); marcarSucio(); programarPrevia(); } }
      else if (b.matches('[data-anadir-enlace]')) {
        caja.querySelector('[data-filas-enlace]').insertAdjacentHTML('beforeend', enlaceFilaHtml({}));
        caja.querySelector('.pnl-enlace:last-child [data-e="texto"]').focus(); marcarSucio();
      }
      else if (b.matches('[data-fmt]')) {
        const ta = caja.querySelector('textarea');
        const fmt = b.dataset.fmt;
        const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
        if (fmt === 'sub') {
          const t = sel.trim() || 'Subtítulo';
          insertarEn(ta, '## ' + t, { lineaPropia: true, parrafo: true, seleccion: [3, 3 + t.length] });
        } else if (fmt === 'neg') {
          const t = sel || 'texto destacado';
          insertarEn(ta, '**' + t + '**', { seleccion: [2, 2 + t.length] });
        } else if (fmt === 'lista') {
          const t = sel ? sel.split('\n').map((l) => (/^[-•*]\s/.test(l) ? l : '- ' + l)).join('\n') : '- Primer punto\n- Segundo punto';
          insertarEn(ta, t, { lineaPropia: true, parrafo: true });
        } else {
          const rq = caja.querySelector('[data-recuadro]');
          ta.dataset.selIni = ta.selectionStart; ta.dataset.selFin = ta.selectionEnd;
          rq.innerHTML = recuadroHtml(fmt);
          rq.hidden = false;
          const t = rq.querySelector('[data-rq="texto"]');
          if (t && sel && fmt !== 'imagen') t.value = sel.trim();
          rq.querySelector('input').focus();
        }
      }
      else if (b.matches('[data-rq-cancelar]')) { const rq = b.closest('[data-recuadro]'); rq.hidden = true; rq.innerHTML = ''; caja.querySelector('textarea').focus(); }
      else if (b.matches('[data-rq-insertar]')) {
        const rq = b.closest('[data-recuadro]');
        const ta = caja.querySelector('textarea');
        const tipo = b.dataset.rqInsertar;
        const val = (k) => { const x = rq.querySelector(`[data-rq="${k}"]`); return x ? (x.type === 'file' ? x.files[0] : x.value.trim()) : ''; };
        try {
          let texto = val('texto');
          if (tipo === 'enlace' || tipo === 'boton') {
            const url = val('url');
            if (!texto) throw new Error(tipo === 'boton' ? 'Escribe el texto del botón.' : 'Escribe el texto del enlace.');
            if (!urlValida(url)) throw new Error('El enlace tiene que empezar por https:// (o por / si es de esta web).');
            if (tipo === 'enlace') insertarEn(ta, `[${texto}](${url})`);
            else insertarEn(ta, `[[${texto.replace(/[|\]]/g, ' ')}|${url}]]`, { lineaPropia: true });
          } else if (tipo === 'archivo') {
            const f = val('archivo');
            if (!f) throw new Error('Elige el archivo.');
            if (!texto) texto = f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ');
            b.disabled = true; aviso('Subiendo ' + f.name + '…');
            const url = await api.subirArchivo(id, f);
            insertarEn(ta, `[[${texto.replace(/[|\]]/g, ' ')}|${url}]]`, { lineaPropia: true });
            aviso('Archivo subido. Ya está como botón en el texto.', 'ok');
          } else if (tipo === 'imagen') {
            const f = val('archivo');
            if (!f) throw new Error('Elige la foto.');
            if (texto.length < 5) throw new Error('Describe en una frase qué se ve en la foto.');
            b.disabled = true; aviso('Preparando la foto…');
            const r = await api.subirImagen(id, f);
            insertarEn(ta, `![${texto.replace(/[\]]/g, ' ')}](${r.url})`, { lineaPropia: true, parrafo: true });
            aviso('Foto añadida al texto.', 'ok');
          }
          rq.hidden = true; rq.innerHTML = '';
        } catch (er) { aviso(er.message, 'error'); b.disabled = false; }
      }
      else if (b.matches('[data-quitar-doc]')) { b.closest('li').remove(); marcarSucio(); programarPrevia(); }
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
      if (inp.matches('[data-subir-enlace]') && inp.files[0]) {
        const li = inp.closest('.pnl-enlace');
        const f = inp.files[0];
        aviso('Subiendo ' + f.name + '…');
        try {
          const url = await api.subirArchivo(id, f);
          li.querySelector('[data-e="url"]').value = url;
          const t = li.querySelector('[data-e="texto"]');
          if (!t.value.trim()) t.value = f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ');
          marcarSucio(); programarPrevia();
          aviso('Archivo subido. Revisa el texto del botón y guarda.', 'ok');
        } catch (er) { aviso(er.message, 'error'); }
        inp.value = '';
        return;
      }
      if (inp.matches('[data-subir-galeria]') && inp.files.length) {
        const caja = inp.closest('.pnl-campo');
        const archivos = [...inp.files];
        for (const f of archivos) {
          aviso('Preparando ' + f.name + '…');
          try {
            const r = await api.subirImagen(id, f);
            caja.querySelector('[data-lista-imagenes]').insertAdjacentHTML('beforeend', imagenItemHtml({ url: r.url, alt: '' }));
          } catch (er) { aviso(er.message, 'error'); }
        }
        inp.value = '';
        marcarSucio(); programarPrevia();
        const vacia = caja.querySelector('.pnl-imagen [data-img-alt]:placeholder-shown');
        if (vacia) vacia.focus();
        aviso('Fotos subidas. Escribe qué se ve en cada una.', 'ok');
        return;
      }
      if (!inp.matches('[data-subir-pdf]') || !inp.files[0]) return;
      const caja = inp.closest('.pnl-campo');
      const archivo = inp.files[0];
      aviso('Subiendo ' + archivo.name + '…');
      try {
        const url = await api.subirArchivo(id, archivo);
        caja.querySelector('[data-lista-docs]').insertAdjacentHTML('beforeend', docHtml({ url, titulo: archivo.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ') }));
        programarPrevia();
        marcarSucio();
        aviso('Archivo subido. Ponle un título claro y pulsa «Guardar y publicar».', 'ok');
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
      actualizarPrevia();
      const bloqueados = $$('.pnl-campo[data-bloquea="1"]', form);
      bloqueados.forEach((caja) => { caja.classList.add('is-error'); errores++; });
      if (errores) { const p = form.querySelector('.is-error input, .is-error textarea'); if (p) p.focus(); aviso(bloqueados.length ? 'Hay cosas que corregir antes de publicar: están marcadas en rojo en cada campo y en la revisión.' : 'Revisa los campos marcados.', 'error'); return; }
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

  // ── Fichas del personal ──
  // Nombres que salen en la web (equipo directivo y profesorado de cada
  // departamento), para que la dirección vea quién tiene ficha.
  function personasDeLaWeb() {
    const D = window.NSD_DEPARTAMENTOS || {}; const F = window.NSD_FICHA;
    const m = new Map();
    if (!F) return m;
    const poner = (nombre, donde) => {
      const slug = F.slugPersona(nombre);
      if (!m.has(slug)) m.set(slug, { slug, nombre, donde: [] });
      if (m.get(slug).donde.indexOf(donde) < 0) m.get(slug).donde.push(donde);
    };
    const dir = D.DIRECCION || { direccion: [], gestion: [], otros: [] };
    [...dir.direccion, ...dir.gestion, ...(dir.otros || [])].forEach((x) => poner(x.nombre, x.cargo));
    (D.DEPARTAMENTOS || []).forEach((d) => {
      const pub = ((contenidos[d.id] || {}).profesorado || {}).valor;
      const lineas = Array.isArray(pub) && pub.length ? pub : ((d.defecto || {}).profesorado || []);
      lineas.filter(Boolean).forEach((l) => poner(F.persona(l).nombre, d.nombre));
    });
    return m;
  }
  const tarjetaVista = (f) => {
    const F = window.NSD_FICHA;
    const ini = F ? F.persona(f.nombre || '').iniciales : '';
    return `<div class="persona persona--responsable pnl-ficha-vista" aria-hidden="true">
      <span class="persona__avatar">${esc(ini)}${f.foto ? `<img src="${esc(f.foto)}" alt="" />` : ''}</span>
      <span class="persona__txt"><span class="persona__nombre">${esc(f.nombre)}</span><span class="persona__cargo">${esc(f.frase || 'Así se verá tu tarjeta')}</span></span></div>`;
  };

  async function vistaFicha(slug) {
    pintar('<p class="pnl-cargando">Cargando la ficha…</p>');
    let f;
    let lista = null;
    try {
      if (slug) {
        if (!yo.es_directiva) return vistaFicha(null);
        lista = await api.fichas();
        f = lista.find((x) => x.slug === slug);
        if (!f) { pintar('<div class="pnl-vacio"><h1>No existe esa ficha</h1><p><a href="#fichas">Volver a las fichas</a></p></div>'); return; }
      } else {
        f = await api.miFicha();
      }
    } catch (e) {
      pintar(`<div class="pnl-vacio"><h1>No se ha podido cargar la ficha</h1><p>${esc(e.message)}</p><p class="pnl-ayuda">Si las fichas son nuevas, quien administra la web tiene que ejecutar <code>supabase/05_personas.sql</code> en Supabase.</p></div>`, 'Ficha');
      return;
    }
    const mia = !slug;
    const cuentas = yo.es_directiva && !mia ? (usuarios && usuarios.length ? usuarios : await api.usuarios().catch(() => [])) : [];
    const anio = new Date().getFullYear();
    pintar(`<header class="pnl-titular">${mia ? '' : '<p><a href="#fichas"><i class="bi bi-arrow-left" aria-hidden="true"></i> Fichas del personal</a></p>'}
        <h1>${mia ? 'Mi ficha' : esc(f.nombre)}</h1>
        <p>${mia ? 'Es lo que ve cualquiera al pulsar tu tarjeta en la web (organigrama, tu departamento, tus entradas del blog). Solo tú y la dirección podéis cambiarla.' : 'Ficha pública de esta persona. La dirección puede editarla y decidir qué cuenta del panel es suya.'}</p></header>
      <div class="pnl-ficha">
        <form class="pnl-form" data-form-ficha>
          <fieldset class="pnl-campo pnl-foto"><legend class="pnl-campo__etiqueta">Foto</legend>
            <div class="pnl-ficha__foto" data-foto-vista>${f.foto ? `<img src="${esc(f.foto)}" alt="" />` : '<span><i class="bi bi-person-bounding-box" aria-hidden="true"></i></span>'}</div>
            <input type="hidden" name="foto" value="${esc(f.foto || '')}" />
            <div class="pnl-acciones">
              <label class="btn btn--ghost btn--sm pnl-subir"><i class="bi bi-upload" aria-hidden="true"></i> ${f.foto ? 'Cambiar foto' : 'Subir foto'}<input type="file" accept="image/*" data-subir-retrato class="sr-only" /></label>
              <button type="button" class="btn btn--ghost btn--sm pnl-peligro" data-quitar-retrato${f.foto ? '' : ' hidden'}>Quitar foto</button>
            </div>
            <p class="pnl-ayuda">Una foto de cara, con buena luz. Se recorta en cuadrado. Opcional: si no hay foto, se ven tus iniciales.</p>
          </fieldset>
          <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="fFrase">Una frase tuya</label>
            <input id="fFrase" name="frase" value="${esc(f.frase || '')}" maxlength="160" placeholder="Lo que más me gusta de enseñar es…" /></div>
          <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="fBio">Presentación</label>
            <textarea id="fBio" name="bio" rows="7" maxlength="1500" aria-describedby="fBioAyuda" placeholder="Quién eres, qué das en el colegio, qué te gusta trabajar con los alumnos…">${esc(f.bio || '')}</textarea>
            <p class="pnl-ayuda" id="fBioAyuda">Mínimo 80 caracteres si la rellenas; hasta 1500. Línea en blanco = párrafo nuevo. Nada de datos privados (teléfono, dirección…).</p></div>
          <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="fForm">Formación</label>
            <input id="fForm" name="formacion" value="${esc(f.formacion || '')}" maxlength="400" placeholder="Licenciada en Filología Inglesa. Máster en Educación Bilingüe." /></div>
          <div class="pnl-fila">
            <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="fDesde">En el colegio desde</label>
              <input id="fDesde" name="desde" type="number" inputmode="numeric" min="1957" max="${anio}" value="${esc(f.desde || '')}" placeholder="${anio - 5}" /></div>
            <div class="pnl-campo"><label class="pnl-campo__etiqueta" for="fCorreo">Correo del colegio</label>
              <input id="fCorreo" name="correo" type="email" value="${esc(f.correo || '')}" maxlength="120" placeholder="nombre@colegionsdolores.es" aria-describedby="fCorreoAyuda" />
              <p class="pnl-ayuda" id="fCorreoAyuda">Opcional. Solo correos @colegionsdolores.es.</p></div>
          </div>
          <div class="pnl-acciones"><button type="submit" class="btn btn--primary">Guardar ficha</button>
            <a class="btn btn--ghost" href="/centro/persona?p=${encodeURIComponent(f.slug)}" target="_blank" rel="noopener">Ver en la web <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a></div>
        </form>
        <aside class="pnl-ficha__lado">
          <p class="pnl-campo__etiqueta">Vista previa de la tarjeta</p>
          <div data-vista-tarjeta>${tarjetaVista(f)}</div>
          ${!mia ? `<form class="pnl-form pnl-form--suave" data-enlazar>
            <h2>Cuenta del panel</h2>
            <label class="pnl-campo__etiqueta" for="fCuenta">Quién puede editar esta ficha</label>
            <select id="fCuenta" name="perfil"><option value="">Nadie (solo la dirección)</option>${cuentas.filter((u) => u.estado === 'aprobado').map((u) => `<option value="${esc(u.id)}"${u.id === f.perfil_id ? ' selected' : ''}>${esc(u.nombre)} · ${esc(u.email)}</option>`).join('')}</select>
            <button type="submit" class="btn btn--ghost btn--sm">Guardar</button>
          </form>` : ''}
        </aside>
      </div>`, mia ? 'Mi ficha' : f.nombre);
    const form = $('[data-form-ficha]');
    const refrescar = () => { $('[data-vista-tarjeta]').innerHTML = tarjetaVista({ nombre: f.nombre, foto: form.foto.value, frase: form.frase.value }); };
    form.addEventListener('input', refrescar);
    form.addEventListener('change', async (ev) => {
      const t = ev.target;
      if (!t.matches('[data-subir-retrato]') || !t.files[0]) return;
      aviso('Preparando la foto…');
      try {
        const url = await api.subirFoto(f.slug, t.files[0]);
        form.foto.value = url;
        $('[data-foto-vista]', form).innerHTML = `<img src="${esc(url)}" alt="" />`;
        $('[data-quitar-retrato]', form).hidden = false;
        refrescar();
        aviso('Foto subida. Guarda la ficha para publicarla.', 'ok');
      } catch (er) { aviso(er.message, 'error'); }
      t.value = '';
    });
    vista.onclick = (ev) => {
      if (ev.target.closest('[data-quitar-retrato]')) {
        form.foto.value = '';
        $('[data-foto-vista]', form).innerHTML = '<span><i class="bi bi-person-bounding-box" aria-hidden="true"></i></span>';
        ev.target.closest('[data-quitar-retrato]').hidden = true;
        refrescar();
      }
    };
    vista.onsubmit = async (ev) => {
      ev.preventDefault();
      const t = ev.target;
      try {
        if (t.matches('[data-form-ficha]')) {
          const bio = t.bio.value.trim();
          if (bio && bio.length < 80) throw new Error(`La presentación es muy corta (${bio.length} caracteres). Escribe al menos 80 o déjala vacía.`);
          const d = t.desde.value ? Number(t.desde.value) : null;
          if (d && (d < 1957 || d > anio)) throw new Error(`El año tiene que estar entre 1957 y ${anio}.`);
          const correo = t.correo.value.trim().toLowerCase();
          if (correo && !/^[a-z0-9._%+-]+@colegionsdolores\.es$/.test(correo)) throw new Error('El correo tiene que ser del colegio (@colegionsdolores.es).');
          await api.guardarFicha(f.slug, { foto: t.foto.value, frase: t.frase.value.trim(), bio, formacion: t.formacion.value.trim(), desde: d, correo });
          aviso('Ficha guardada. Ya se ve en la web.', 'ok');
        } else if (t.matches('[data-enlazar]')) {
          await api.enlazarFicha(f.slug, t.perfil.value || null);
          aviso('Cuenta actualizada.', 'ok');
        }
      } catch (er) { aviso(er.message, 'error'); }
    };
  }

  async function vistaFichas() {
    if (!yo.es_directiva) return vistaFicha(null);
    pintar('<p class="pnl-cargando">Cargando fichas…</p>');
    let lista;
    try { lista = await api.fichas(); } catch (e) {
      pintar(`<div class="pnl-vacio"><h1>No se han podido cargar las fichas</h1><p>${esc(e.message)}</p><p class="pnl-ayuda">Quien administra la web tiene que ejecutar <code>supabase/05_personas.sql</code> en Supabase.</p></div>`, 'Fichas');
      return;
    }
    const web = personasDeLaWeb();
    const porSlug = new Map(lista.map((f) => [f.slug, f]));
    const todas = [...new Set([...web.keys(), ...porSlug.keys()])].map((slug) => ({ slug, web: web.get(slug), ficha: porSlug.get(slug) }))
      .sort((a, b) => ((a.ficha || a.web).nombre).localeCompare((b.ficha || b.web).nombre, 'es'));
    const completas = todas.filter((x) => x.ficha && x.ficha.foto && x.ficha.bio).length;
    pintar(`<header class="pnl-titular"><h1>Fichas del personal</h1>
        <p>Cada persona que sale en la web tiene su tarjeta. Aquí ves quién tiene ficha, foto y presentación, y puedes crearlas o editarlas. Cada persona con cuenta edita la suya desde «Mi ficha».</p></header>
      <p class="pnl-resumen"><strong>${completas}</strong> de ${todas.length} fichas completas (con foto y presentación).</p>
      <ul class="pnl-fichas">${todas.map((x) => {
        const f = x.ficha; const nombre = (f || x.web).nombre;
        const ini = window.NSD_FICHA ? window.NSD_FICHA.persona(nombre).iniciales : '';
        return `<li class="pnl-fichas__item">
          <span class="persona__avatar">${esc(ini)}${f && f.foto ? `<img src="${esc(f.foto)}" alt="" />` : ''}</span>
          <span class="pnl-fichas__txt"><strong>${esc(nombre)}</strong><small>${esc(x.web ? x.web.donde.join(' · ') : 'No sale en ninguna página')}</small></span>
          <span class="pnl-fichas__estado">${f ? `${f.foto ? '<span class="pnl-insignia pnl-insignia--ok">Foto</span>' : '<span class="pnl-insignia pnl-insignia--falta">Sin foto</span>'}${f.bio ? '<span class="pnl-insignia pnl-insignia--ok">Presentación</span>' : '<span class="pnl-insignia pnl-insignia--falta">Sin presentación</span>'}${f.perfil_id ? '<span class="pnl-insignia">Con cuenta</span>' : ''}` : '<span class="pnl-insignia pnl-insignia--falta">Sin ficha</span>'}</span>
          ${f ? `<a class="btn btn--ghost btn--sm" href="#fichas/${encodeURIComponent(x.slug)}">Editar</a>` : `<button type="button" class="btn btn--primary btn--sm" data-crear-ficha="${esc(nombre)}">Crear ficha</button>`}
        </li>`;
      }).join('')}</ul>`, 'Fichas del personal');
    vista.onclick = async (ev) => {
      const b = ev.target.closest('[data-crear-ficha]');
      if (!b) return;
      b.disabled = true;
      try { const slug = await api.crearFicha(b.dataset.crearFicha); location.hash = '#fichas/' + encodeURIComponent(slug); }
      catch (er) { aviso(er.message, 'error'); b.disabled = false; }
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
