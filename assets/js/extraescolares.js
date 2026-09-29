// =========================================================
// Simulador de extraescolares
// ---------------------------------------------------------
// Catálogo por tipo + combinación de la familia: precio con la
// opción más barata (A, B, C o sueltas), semana resultante,
// choques de horario y recomendaciones con lo que cuesta cada
// actividad de más. Datos: extraescolares-datos.js.
//
// Precio: las opciones A, B y C se aplican a Bilingüismo y a las
// actividades de 44 €; las escuelas deportivas van a 35 € cada una,
// como en la tabla de tarifas. Es orientativo: secretaría confirma.
// =========================================================
(function () {
  'use strict';
  const D = window.NSD_EXTRA;
  const raiz = document.getElementById('simulador');
  if (!D || !raiz) return;
  const { ETAPAS, TIPOS, TARIFAS, ACTIVIDADES } = D;
  const POR_ID = Object.fromEntries(ACTIVIDADES.map((a) => [a.id, a]));
  const DIAS = ['L', 'M', 'X', 'J', 'V'];
  const DIAS_LARGOS = { L: 'lunes', M: 'martes', X: 'miércoles', J: 'jueves', V: 'viernes' };

  const $ = (sel) => raiz.querySelector(sel);
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const euros = (n) => `${n.toLocaleString('es-ES')} €`;

  // ── Estado ─────────────────────────────────────────────────────────────
  const estado = { etapa: 'pri1', sel: new Map(), tipo: 'todos', encaja: false, madru: 0 };

  // ── Horarios y choques ────────────────────────────────────────────────
  const opciones = (a, etapa = estado.etapa) => (a.horarios[etapa] || []);
  const disponible = (a) => opciones(a).length > 0;
  const franjas = (a, i) => (opciones(a)[i] || []).flatMap((fr) => fr.dias.map((d) => ({ dia: d, ini: fr.ini, fin: fr.fin })));
  const ocupadas = (excepto) => {
    const m = new Map();
    estado.sel.forEach((i, id) => { if (id !== excepto) franjas(POR_ID[id], i).forEach((f) => m.set(`${f.dia}${f.ini}`, id)); });
    return m;
  };
  // Primera opción de grupo que no choca; si todas chocan, con quién
  const encaje = (a) => {
    const occ = ocupadas(a.id);
    for (let i = 0; i < opciones(a).length; i++) {
      const choque = franjas(a, i).find((f) => occ.has(`${f.dia}${f.ini}`));
      if (!choque) return { i, choque: null };
      if (i === opciones(a).length - 1) return { i: -1, choque: POR_ID[occ.get(`${choque.dia}${choque.ini}`)], franja: choque };
    }
    return { i: -1, choque: null };
  };
  const textoDias = (dias) => dias.length === 5 ? 'de lunes a viernes'
    : dias.length === 2 ? `${DIAS_LARGOS[dias[0]]} y ${DIAS_LARGOS[dias[1]]}` : dias.map((d) => DIAS_LARGOS[d]).join(', ');
  const textoHorario = (a, i = 0) => (opciones(a)[i] || []).map((fr) => `${textoDias(fr.dias)}, ${fr.ini}–${fr.fin}`).join(' · ');
  const textoHorarios = (a) => opciones(a).length > 1
    ? opciones(a).map((_, i) => `Grupo ${String.fromCharCode(65 + i)}: ${textoHorario(a, i)}`).join(' · ')
    : textoHorario(a);

  // ── Precio ────────────────────────────────────────────────────────────
  // n actividades de 44 € sin bilingüe: parejas en opción C y la suelta
  const resto = (n) => Math.floor(n / 2) * TARIFAS.opcionC + (n % 2) * TARIFAS.actividad;
  function precio(sel = estado.sel) {
    const ids = [...sel.keys()];
    const bil = ids.includes('bilingue');
    const act = ids.filter((id) => POR_ID[id].tarifa === 'actividad').length;
    const dep = ids.filter((id) => POR_ID[id].tarifa === 'deportiva').length;
    const consultar = ids.some((id) => POR_ID[id].tarifa === 'consultar');
    const sueltas = (bil ? TARIFAS.bilingue : 0) + act * TARIFAS.actividad + dep * TARIFAS.deportiva;

    // Todas las formas válidas de agrupar, y la más barata
    const formas = [];
    if (bil) {
      formas.push({ bil: 'solo', en: 0, coste: TARIFAS.bilingue + resto(act) });
      if (act >= 1) formas.push({ bil: 'A', en: 1, coste: TARIFAS.opcionA + resto(act - 1) });
      if (act >= 2) formas.push({ bil: 'B', en: 2, coste: TARIFAS.opcionB + resto(act - 2) });
    } else formas.push({ bil: null, en: 0, coste: resto(act) });
    const mejor = formas.sort((x, y) => x.coste - y.coste)[0];

    const lineas = [];
    if (mejor.bil === 'A') lineas.push(['Opción A · Bilingüismo + 1 actividad', TARIFAS.opcionA]);
    if (mejor.bil === 'B') lineas.push(['Opción B · Bilingüismo + 2 actividades', TARIFAS.opcionB]);
    if (mejor.bil === 'solo') lineas.push(['Bilingüismo', TARIFAS.bilingue]);
    const libres = act - mejor.en;
    const parejas = Math.floor(libres / 2);
    if (parejas) lineas.push([`Opción C · 2 actividades${parejas > 1 ? ` (×${parejas})` : ''}`, parejas * TARIFAS.opcionC]);
    if (libres % 2) lineas.push(['Actividad suelta', TARIFAS.actividad]);
    if (dep) lineas.push([`Escuela deportiva${dep > 1 ? `s (${dep} × 35 €)` : ''}`, dep * TARIFAS.deportiva]);
    const total = mejor.coste + dep * TARIFAS.deportiva;
    return { total, sueltas, ahorro: sueltas - total, lineas, consultar, n: ids.length - (consultar ? 1 : 0) };
  }
  const coste = (id) => {
    const s = new Map(estado.sel);
    s.set(id, 0);
    return precio(s).total - precio().total;
  };

  // ── Recomendaciones ──────────────────────────────────────────────────
  // Lo primero, el baloncesto del colegio; después, lo que más barato
  // sale añadir gracias a las opciones combinadas.
  function recomendaciones() {
    const recs = [];
    const libres = ACTIVIDADES.filter((a) => disponible(a) && !estado.sel.has(a.id) && a.tarifa !== 'consultar');
    const cabe = (a) => encaje(a).i > -1;

    const dragons = POR_ID.baloncesto;
    if (disponible(dragons) && !estado.sel.has('baloncesto')) {
      const e = encaje(dragons);
      if (e.i > -1) recs.push({ destacada: true, id: 'baloncesto', texto: `<strong>Dolores Dragons encaja en vuestra semana:</strong> ${textoHorario(dragons)}, con partidos los sábados. ${euros(coste('baloncesto'))} más al mes.`, boton: 'Añadir baloncesto' });
      else recs.push({ destacada: true, id: 'baloncesto', cambia: e.choque.id, texto: `<strong>El baloncesto coincide con ${esc(e.choque.corto)}.</strong> Si os tira más la canasta, cambiadlo: 35 €/mes con equipo y partidos los sábados.`, boton: `Cambiar ${e.choque.corto} por baloncesto` });
    }
    if (estado.etapa === 'inf' && !estado.sel.has('predeporte') && cabe(POR_ID.predeporte)) {
      recs.push({ destacada: true, id: 'predeporte', texto: `<strong>Predeporte</strong> es la entrada al baloncesto de Dolores Dragons: juego, coordinación y equipo. ${euros(coste('predeporte'))} más al mes.`, boton: 'Añadir predeporte' });
    }

    // La actividad que menos cuesta añadir (las opciones combinadas abaratan la siguiente)
    const candidatas = libres.filter((a) => a.tarifa === 'actividad' && cabe(a))
      .map((a) => ({ a, extra: coste(a.id) })).sort((x, y) => x.extra - y.extra);
    if (candidatas.length && candidatas[0].extra < TARIFAS.actividad) {
      const { a, extra } = candidatas[0];
      recs.push({ id: a.id, texto: `Con <strong>${esc(a.corto)}</strong> la combinación mejora de opción: os sale por <strong>${euros(extra)}</strong> más al mes en vez de ${euros(TARIFAS.actividad)}.`, boton: `Añadir ${a.corto}` });
    }

    const bil = POR_ID.bilingue;
    if (disponible(bil) && !estado.sel.has('bilingue') && cabe(bil) && estado.sel.size) {
      const conBil = new Map(estado.sel); conBil.set('bilingue', 0);
      const opcion = precio(conBil).lineas.map((l) => l[0]).find((t) => /^Opción [AB]/.test(t));
      recs.push({ id: 'bilingue', texto: `Sumad el <strong>Bilingüismo</strong>, una hora de inglés cada mañana: ${opcion ? `con vuestras actividades entra en la ${opcion.split(' ·')[0].toLowerCase()} y ` : ''}cuesta ${euros(coste('bilingue'))} más al mes.`, boton: 'Añadir bilingüismo' });
    }
    if (!estado.sel.has('bilingue') && !estado.madru && estado.sel.size) {
      recs.push({ enlace: '/servicios/madrugadores', texto: '¿Os viene mejor dejarlos pronto? <strong>Madrugadores</strong>: entrada desde las 8:00 con bilingüismo incluido, 12 € el día.', boton: 'Ver Madrugadores' });
    }
    return recs.slice(0, 3);
  }

  // ── Pintado ──────────────────────────────────────────────────────────
  function pintarEtapas() {
    $('#simEtapas').innerHTML = Object.entries(ETAPAS).map(([k, e]) =>
      `<button type="button" class="sim-etapa" data-etapa="${k}" aria-pressed="${k === estado.etapa}"><strong>${e.nombre}</strong><span>${e.detalle}</span></button>`).join('');
  }

  function tarjeta(a) {
    const sel = estado.sel.has(a.id);
    const e = sel ? { i: estado.sel.get(a.id), choque: null } : encaje(a);
    const bloqueada = !sel && e.i === -1;
    const precioTxt = a.tarifa === 'consultar' ? 'Precio en secretaría' : `${TARIFAS[a.tarifa]} €/mes`;
    const det = (a.detalles && a.detalles[estado.etapa]) || a.detalle;
    return `<article class="act${sel ? ' is-sel' : ''}${bloqueada ? ' is-bloq' : ''}${a.destacada ? ' act--dragons' : ''}" data-id="${a.id}">
      <div class="act__cab">
        <span class="act__ico" aria-hidden="true">${a.destacada ? '<img src="/assets/img/webs/dolores-dragons.png" alt="" width="30" height="30" />' : `<i class="bi ${TIPOS[a.tipo].icono}"></i>`}</span>
        <div class="act__titulo"><h4>${esc(a.nombre)}</h4><span class="act__precio">${precioTxt}</span></div>
        ${a.insignia ? `<span class="act__insignia">${esc(a.insignia)}</span>` : ''}
      </div>
      <p>${esc(a.resumen)}</p>
      <p class="act__hora"><i class="bi bi-clock" aria-hidden="true"></i> ${esc(textoHorarios(a))}</p>
      ${det ? `<details class="act__mas"><summary>Más detalles</summary><p>${esc(det)}${a.enlace ? ` <a href="${a.enlace}">Web del club <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>` : ''}</p></details>` : ''}
      ${bloqueada ? `<p class="act__choque"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i> Coincide con ${esc(e.choque ? e.choque.corto : 'otra actividad')} (${DIAS_LARGOS[e.franja.dia]}, ${e.franja.ini})</p>` : ''}
      <button type="button" class="act__boton" data-accion="alternar" aria-pressed="${sel}"${bloqueada ? ' disabled' : ''}>
        <i class="bi ${sel ? 'bi-check-lg' : 'bi-plus-lg'}" aria-hidden="true"></i> ${sel ? 'Añadida' : 'Añadir'}<span class="sr-only"> ${esc(a.nombre)}</span>
      </button>
    </article>`;
  }

  function pintarLista() {
    const lista = ACTIVIDADES.filter(disponible);
    const tipos = Object.keys(TIPOS).filter((t) => lista.some((a) => a.tipo === t));
    if (estado.tipo !== 'todos' && !tipos.includes(estado.tipo)) estado.tipo = 'todos';
    $('#simTipos').innerHTML = [`<button type="button" class="sim-tipo" data-tipo="todos" aria-pressed="${estado.tipo === 'todos'}">Todas <span>${lista.length}</span></button>`]
      .concat(tipos.map((t) => `<button type="button" class="sim-tipo" data-tipo="${t}" aria-pressed="${estado.tipo === t}"><i class="bi ${TIPOS[t].icono}" aria-hidden="true"></i>${TIPOS[t].nombre} <span>${lista.filter((a) => a.tipo === t).length}</span></button>`)).join('');
    const visibles = lista.filter((a) => (estado.tipo === 'todos' || a.tipo === estado.tipo) && (!estado.encaja || estado.sel.has(a.id) || encaje(a).i > -1));
    $('#simLista').innerHTML = tipos.filter((t) => visibles.some((a) => a.tipo === t)).map((t) => `
      <section class="sim-grupo" aria-labelledby="tipo-${t}">
        <h3 class="sim-grupo__titulo" id="tipo-${t}"><i class="bi ${TIPOS[t].icono}" aria-hidden="true"></i> ${TIPOS[t].nombre}</h3>
        <div class="sim-grupo__lista">${visibles.filter((a) => a.tipo === t).map(tarjeta).join('')}</div>
      </section>`).join('') || '<p class="sim-nada">Con este filtro no queda nada que encaje. Quitad «Solo lo que encaja» para ver todo.</p>';
  }

  function pintarSemana() {
    const usadas = [...new Set(ACTIVIDADES.filter(disponible).flatMap((a) => opciones(a).flat().map((fr) => fr.ini)))]
      .sort((x, y) => parseFloat(x.replace(':', '.')) - parseFloat(y.replace(':', '.')));
    const celda = (dia, ini) => {
      const ids = [...estado.sel.entries()].filter(([id, i]) => franjas(POR_ID[id], i).some((f) => f.dia === dia && f.ini === ini)).map(([id]) => POR_ID[id]);
      return ids.length ? `<td class="is-llena t-${ids[0].tipo}">${ids.map((a) => esc(a.semana || a.corto)).join('<br>')}</td>` : '<td></td>';
    };
    $('#simSemana').innerHTML = `<table class="sim-semana"><caption class="sr-only">Semana con las actividades elegidas</caption>
      <thead><tr><th scope="col"><span class="sr-only">Hora</span></th>${DIAS.map((d) => `<th scope="col">${d}</th>`).join('')}</tr></thead>
      <tbody>${usadas.map((h) => `<tr><th scope="row">${h}</th>${DIAS.map((d) => celda(d, h)).join('')}</tr>`).join('')}</tbody></table>`;
  }

  function pintarResumen() {
    const p = precio();
    const vacio = estado.sel.size === 0;
    $('#simVacio').hidden = !vacio;
    $('#simDetalle').hidden = vacio;
    const madruMes = estado.madru * TARIFAS.madrugadoresDia * 4;
    const totalMes = p.total + madruMes;
    raiz.querySelectorAll('[data-sim-total]').forEach((el) => { el.textContent = euros(totalMes); });
    raiz.querySelectorAll('[data-sim-num]').forEach((el) => { el.textContent = `${estado.sel.size} ${estado.sel.size === 1 ? 'actividad' : 'actividades'}`; });
    if (vacio) { pintarRecs(); return; }

    $('#simElegidas').innerHTML = [...estado.sel.entries()].map(([id, i]) => {
      const a = POR_ID[id];
      return `<li><span><strong>${esc(a.corto)}</strong><small>${esc(textoHorario(a, i))}</small></span><button type="button" class="sim-quitar" data-quitar="${id}" aria-label="Quitar ${esc(a.nombre)}"><i class="bi bi-x-lg" aria-hidden="true"></i></button></li>`;
    }).join('');
    $('#simDesglose').innerHTML = p.lineas.map(([t, v]) => `<li><span>${t}</span><span>${euros(v)}</span></li>`).join('')
      + (madruMes ? `<li><span>Madrugadores (${estado.madru} ${estado.madru === 1 ? 'día' : 'días'}/semana, 4 semanas)</span><span>${euros(madruMes)}</span></li>` : '')
      + (p.consultar ? '<li class="is-nota"><span>Bilingüismo ESO · Cambridge</span><span>en secretaría</span></li>' : '');
    const media = p.n ? Math.round(p.total / p.n) : 0;
    $('#simAhorro').innerHTML = p.ahorro > 0
      ? `<i class="bi bi-piggy-bank" aria-hidden="true"></i> <span>Por separado serían ${euros(p.sueltas)}: <strong>ahorráis ${euros(p.ahorro)} al mes</strong>${p.n > 1 ? ` y cada actividad sale a ${euros(media)}` : ''}.</span>`
      : p.n > 1 ? `<i class="bi bi-info-circle" aria-hidden="true"></i> <span>Cada actividad sale a ${euros(media)} de media.</span>` : '';
    $('#simAhorro').hidden = !$('#simAhorro').innerHTML;
    pintarRecs();
    pintarSemana();
  }

  function pintarRecs() {
    const recs = recomendaciones();
    $('#simRecs').hidden = !recs.length;
    $('#simRecsLista').innerHTML = recs.map((r) => `<li class="${r.destacada ? 'is-dragons' : ''}">
      <p>${r.texto}</p>
      ${r.enlace ? `<a class="btn btn--ghost btn--sm" href="${r.enlace}">${r.boton} <i class="bi bi-arrow-right" aria-hidden="true"></i></a>`
        : `<button type="button" class="btn ${r.destacada ? 'btn--gold' : 'btn--ghost'} btn--sm" data-rec="${r.id}"${r.cambia ? ` data-cambia="${r.cambia}"` : ''}><i class="bi bi-plus-lg" aria-hidden="true"></i> ${esc(r.boton)}</button>`}
    </li>`).join('');
  }

  function pintarMadru() {
    $('#simMadru').innerHTML = [0, 1, 2, 3, 4, 5].map((n) => `<button type="button" data-madru="${n}" aria-pressed="${estado.madru === n}">${n === 0 ? 'No' : n}</button>`).join('');
  }

  function guardarUrl() {
    const q = new URLSearchParams();
    q.set('etapa', estado.etapa);
    if (estado.sel.size) q.set('act', [...estado.sel.keys()].join(','));
    if (estado.madru) q.set('madru', estado.madru);
    history.replaceState(null, '', `${location.pathname}?${q}#simulador`);
    const correo = raiz.querySelector('[data-sim-correo]');
    if (correo) {
      const p = precio();
      const cuerpo = [
        'Hola:', '', `Queremos información para inscribir a nuestro hijo/a (${ETAPAS[estado.etapa].nombre}) en estas extraescolares del curso 2026-27:`, '',
        ...[...estado.sel.entries()].map(([id, i]) => `- ${POR_ID[id].nombre}: ${textoHorario(POR_ID[id], i)}`),
        ...(estado.madru ? [`- Madrugadores: ${estado.madru} días a la semana`] : []),
        '', `Precio orientativo según el simulador: ${euros(p.total + estado.madru * TARIFAS.madrugadoresDia * 4)} al mes.`, '',
        'Nombre del alumno/a:', 'Curso:', 'Teléfono de contacto:', '', 'Gracias.'
      ].join('\n');
      correo.href = `mailto:secretaria@colegionsdolores.es?subject=${encodeURIComponent('Inscripción en extraescolares 2026-27')}&body=${encodeURIComponent(cuerpo)}`;
    }
  }

  function pintarTodo() { pintarEtapas(); pintarLista(); pintarResumen(); pintarMadru(); guardarUrl(); }

  // ── Acciones ─────────────────────────────────────────────────────────
  const anunciar = (txt) => { const v = $('#simVoz'); if (v) { v.textContent = ''; setTimeout(() => { v.textContent = txt; }, 30); } };
  function alternar(id) {
    const a = POR_ID[id];
    if (!a || !disponible(a)) return;
    if (estado.sel.has(id)) { estado.sel.delete(id); anunciar(`${a.corto} quitada. Total ${euros(precio().total)} al mes.`); }
    else {
      const e = encaje(a);
      if (e.i === -1) return;
      estado.sel.set(id, e.i);
      anunciar(`${a.corto} añadida. Total ${euros(precio().total)} al mes.`);
    }
    pintarLista(); pintarResumen(); guardarUrl();
  }

  raiz.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || b.disabled) return;
    if (b.dataset.etapa) {
      estado.etapa = b.dataset.etapa;
      // Al cambiar de etapa se conserva lo que siga existiendo y encaje
      const antes = [...estado.sel.keys()];
      estado.sel.clear();
      antes.forEach((id) => { const a = POR_ID[id]; if (disponible(a)) { const e = encaje(a); if (e.i > -1) estado.sel.set(id, e.i); } });
      pintarTodo();
    } else if (b.dataset.tipo) { estado.tipo = b.dataset.tipo; pintarLista(); }
    else if (b.dataset.accion === 'alternar') {
      const id = b.closest('[data-id]').dataset.id;
      alternar(id);
      const nuevo = raiz.querySelector(`[data-id="${id}"] .act__boton`);
      if (nuevo) nuevo.focus({ preventScroll: true });
    } else if (b.dataset.quitar) alternar(b.dataset.quitar);
    else if (b.dataset.rec) {
      if (b.dataset.cambia) estado.sel.delete(b.dataset.cambia);
      alternar(b.dataset.rec);
    } else if (b.dataset.madru !== undefined) { estado.madru = Number(b.dataset.madru); pintarMadru(); pintarResumen(); guardarUrl(); }
    else if (b.id === 'simVaciar') { estado.sel.clear(); estado.madru = 0; pintarTodo(); anunciar('Combinación vaciada.'); }
    else if (b.id === 'simCopiar') {
      const url = location.href;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
        () => { b.innerHTML = '<i class="bi bi-check-lg" aria-hidden="true"></i> Enlace copiado'; anunciar('Enlace copiado.'); },
        () => { window.prompt('Copiad este enlace:', url); });
    }
  });
  const encajaCtl = $('#simEncaja');
  if (encajaCtl) encajaCtl.addEventListener('change', () => { estado.encaja = encajaCtl.checked; pintarLista(); });

  // Añadir desde fuera del simulador (banda de Dolores Dragons)
  document.querySelectorAll('[data-sim-anadir]').forEach((a) => a.addEventListener('click', () => {
    const id = a.dataset.simAnadir;
    const act = POR_ID[id];
    if (act && !disponible(act)) { estado.etapa = Object.keys(act.horarios)[0]; }
    if (!estado.sel.has(id)) {
      const e = encaje(act);
      if (e.i === -1 && e.choque) estado.sel.delete(e.choque.id);
      estado.sel.set(id, Math.max(0, encaje(act).i));
    }
    pintarTodo();
  }));

  // ── Estado inicial (el enlace se puede compartir) ─────────────────────
  const q = new URLSearchParams(location.search);
  const hashInicial = location.hash;
  if (ETAPAS[q.get('etapa')]) estado.etapa = q.get('etapa');
  (q.get('act') || '').split(',').filter((id) => POR_ID[id] && disponible(POR_ID[id])).forEach((id) => {
    const e = encaje(POR_ID[id]); if (e.i > -1) estado.sel.set(id, e.i);
  });
  const m = Number(q.get('madru')); if (m >= 0 && m <= 5) estado.madru = m;
  raiz.classList.add('is-listo');
  pintarTodo();
  if (!q.get('etapa')) history.replaceState(null, '', location.pathname + hashInicial);
})();
