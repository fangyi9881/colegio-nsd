// =========================================================
// «Hoy en el cole»: qué día es, qué pasa hoy y qué viene después.
//   <div data-agenda>            versión completa
//   <div data-agenda="compacta"> versión de una columna
// Los datos salen de calendario-datos.js.
// =========================================================
(function () {
  'use strict';
  const C = window.NSD_CALENDARIO;
  const cajas = document.querySelectorAll('[data-agenda]');
  if (!C || !cajas.length) return;

  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const ICONOS = { lectivo: 'bi-backpack', evaluacion: 'bi-journal-check', actividad: 'bi-trophy', vacaciones: 'bi-sun', reunion: 'bi-people', pago: 'bi-cash-coin' };
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const aFecha = (s) => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
  const dias = (f) => Math.round((f - hoy) / 86400000);
  // Cerca, los días exactos; lejos, el mes: «en 271 días» no dice nada
  const cuando = (n, f) => n === 0 ? 'hoy' : n === 1 ? 'mañana' : n <= 21 ? `en ${n} días` : `en ${MESES[f.getMonth()]}`;
  const fechaCorta = (f) => `${f.getDate()} de ${MESES[f.getMonth()]}`;

  // ── Secretaría: qué toca hoy ──
  function secretaria() {
    const mes = hoy.getMonth() + 1;
    const dia = hoy.getDay();
    const periodo = C.secretaria.find((p) => p.meses.includes(mes));
    if (!periodo) return { estado: 'consultar', texto: 'Consulta el horario de verano en secretaría.' };
    if (dia === 0 || dia === 6) {
      const prox = periodo.tramos.find((t) => t.dias.includes(1)) || periodo.tramos[0];
      return { estado: 'cerrado', texto: `Hoy es ${DIAS[dia]}. El lunes atiende de ${prox.horario}.` };
    }
    const tramo = periodo.tramos.find((t) => t.dias.includes(dia));
    return tramo
      ? { estado: 'abierto', texto: `Hoy atiende de <strong>${tramo.horario}</strong>.`, nota: `Horario ${periodo.nombre}.` }
      : { estado: 'cerrado', texto: `Hoy no hay atención al público (${DIAS[dia]}).`, nota: `Horario ${periodo.nombre}.` };
  }

  // ── Avisos del mes: días 10 y 25 ──
  function recordatorios() {
    const d = hoy.getDate();
    return C.recurrentes.map((r) => {
      const quedan = r.dia - d;
      const estado = quedan === 0 ? 'Es hoy' : quedan > 0 ? `Quedan ${quedan} ${quedan === 1 ? 'día' : 'días'}` : 'Pasó este mes';
      return { ...r, quedan, estado, urgente: quedan >= 0 && quedan <= 3 };
    }).sort((a, b) => (a.quedan < 0) - (b.quedan < 0) || a.quedan - b.quedan);
  }

  const proximos = C.eventos
    .map((e) => ({ ...e, d: aFecha(e.fecha), n: dias(aFecha(e.fecha)) }))
    .filter((e) => e.n >= 0)
    .sort((a, b) => a.n - b.n);
  const deHoy = proximos.filter((e) => e.n === 0);

  const filaEvento = (e) => `<li class="agenda-ev${e.n === 0 ? ' es-hoy' : ''}">
      <span class="agenda-ev__dia"><b>${e.d.getDate()}</b><span>${MESES[e.d.getMonth()].slice(0, 3)}</span></span>
      <span class="agenda-ev__txt">
        <strong>${e.url ? `<a href="${esc(e.url)}">${esc(e.titulo)}</a>` : esc(e.titulo)}</strong>
        ${e.detalle ? `<span>${esc(e.detalle)}</span>` : ''}
      </span>
      <span class="agenda-ev__cuando"><i class="bi ${ICONOS[e.tipo] || 'bi-calendar-event'}" aria-hidden="true"></i>${cuando(e.n, e.d)}</span>
    </li>`;

  // ── ¿Hoy hay clase? ──
  // Fin de semana y fuera del curso, no. Las vacaciones que vienen del
  // boletín del curso pasado se avisan como pendientes de confirmar.
  function hayClase() {
    const L = C.lectivo;
    const d = hoy.getDay();
    if (d === 0 || d === 6) return { hay: false, motivo: 'Es fin de semana' };
    if (!L) return null;
    const f = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    if (L.desde && f < L.desde) return { hay: false, motivo: 'El curso todavía no ha empezado' };
    if (L.hasta && f > L.hasta) return { hay: false, motivo: 'El curso ya ha terminado' };
    const v = (L.sinClase || []).find((p) => f >= p.desde && f <= p.hasta);
    if (v) return { hay: false, motivo: v.titulo, porConfirmar: v.porConfirmar };
    return { hay: true, motivo: 'Día lectivo' };
  }

  const sec = secretaria();
  const recs = recordatorios();
  const cl = hayClase();

  cajas.forEach((caja) => {
    const compacta = caja.dataset.agenda === 'compacta';
    const nEventos = compacta ? 2 : 4;
    caja.innerHTML = `
      ${compacta ? '' : '<h2 class="sr-only">Agenda del curso</h2>'}
      <div class="agenda${compacta ? ' agenda--compacta' : ''}">
        <div class="agenda__hoy">
          <p class="agenda__rotulo">Hoy en el cole</p>
          <p class="agenda__fecha"><time datetime="${hoy.toISOString().slice(0, 10)}">${DIAS[hoy.getDay()]}, <b>${hoy.getDate()}</b> de ${MESES[hoy.getMonth()]}</time></p>
          <p class="agenda__curso">Curso ${esc(C.curso)}</p>
          ${cl ? `<p class="agenda__clase ${cl.hay ? 'es-si' : 'es-no'}">
            <i class="bi ${cl.hay ? 'bi-backpack2' : 'bi-house-door'}" aria-hidden="true"></i>
            <span><strong>${cl.hay ? 'Hoy hay clase' : 'Hoy no hay clase'}</strong>${cl.motivo ? ` <small>${esc(cl.motivo)}${cl.porConfirmar ? ' · fecha sin confirmar' : ''}</small>` : ''}</span>
          </p>` : ''}
          <p class="agenda__secretaria agenda__secretaria--${sec.estado}">
            <i class="bi ${sec.estado === 'abierto' ? 'bi-door-open' : 'bi-door-closed'}" aria-hidden="true"></i>
            <span><strong>Secretaría</strong> ${sec.texto}${sec.nota ? ` <small>${sec.nota}</small>` : ''}</span>
          </p>
        </div>

        <div class="agenda__cuerpo">
          ${deHoy.length ? `<h3 class="agenda__titulo">Hoy</h3><ul class="agenda__lista">${deHoy.map(filaEvento).join('')}</ul>` : ''}
          <h3 class="agenda__titulo">${deHoy.length ? 'Después' : 'Próximas fechas'}</h3>
          <ul class="agenda__lista">${proximos.filter((e) => e.n > 0).slice(0, nEventos).map(filaEvento).join('') || '<li class="agenda-ev"><span class="agenda-ev__txt">No queda ninguna fecha publicada de este curso.</span></li>'}</ul>

          <h3 class="agenda__titulo">Este mes</h3>
          <ul class="agenda__avisos">
            ${recs.map((r) => `<li class="${r.urgente ? 'es-urgente' : ''}${r.quedan < 0 ? ' es-pasado' : ''}">
              <i class="bi bi-cash-coin" aria-hidden="true"></i>
              <span><strong>Día ${r.dia} · ${esc(r.titulo)}</strong><span>${esc(r.detalle)}</span></span>
              <span class="agenda__estado">${r.estado}</span>
            </li>`).join('')}
          </ul>
          ${compacta ? `<p class="agenda__pie"><a href="/familias#agenda">Ver la agenda completa <i class="bi bi-arrow-right" aria-hidden="true"></i></a></p>`
            : `<details class="agenda__pendiente">
                 <summary>Fechas pendientes de confirmar (${C.porConfirmar.length})</summary>
                 <ul>${C.porConfirmar.map((p) => `<li><strong>${esc(p.titulo)}</strong> <span>${esc(p.detalle)}</span>${p.url ? ` <a href="${esc(p.url)}">Ver</a>` : ''}</li>`).join('')}</ul>
                 <p>El calendario oficial completo se pide en <a href="/contacto">secretaría</a>.</p>
               </details>`}
        </div>
      </div>`;
  });
})();
