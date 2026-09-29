// =========================================================
// Calendario mensual del curso
// ---------------------------------------------------------
//   <div data-calendario></div>
//
// Se pinta un mes completo con los eventos de calendario-datos.js:
// las fechas del curso, los avisos que se repiten cada mes (día 10 y
// día 25) y los días en los que secretaría atiende. Al pulsar un día
// se abre su detalle debajo; con las flechas del teclado se recorre.
// =========================================================
(function () {
  'use strict';
  const caja = document.querySelector('[data-calendario]');
  const C = window.NSD_CALENDARIO;
  if (!caja || !C) return;

  const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const ICONOS = { lectivo: 'bi-backpack', evaluacion: 'bi-journal-check', actividad: 'bi-trophy', vacaciones: 'bi-sun', reunion: 'bi-people', pago: 'bi-cash-coin' };
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const iso = (f) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
  const aFecha = (s) => { const [a, m, d] = String(s).split('-').map(Number); return new Date(a, m - 1, d); };

  // El curso va de septiembre a junio: fuera de ahí no hay nada que enseñar
  const eventos = (C.eventos || []).map((e) => ({ ...e, d: aFecha(e.fecha) }));
  const fechas = eventos.map((e) => e.d).sort((a, b) => a - b);
  const primero = fechas[0] || hoy;
  const ultimo = fechas[fechas.length - 1] || hoy;
  const limiteIni = new Date(Math.min(primero.getTime(), hoy.getTime()));
  const limiteFin = new Date(Math.max(ultimo.getTime(), hoy.getTime()));

  let mes = hoy.getMonth(), anio = hoy.getFullYear(), elegido = iso(hoy);

  // ¿Hay clase ese día? Fin de semana y fuera del curso, no. Los
  // periodos de vacaciones que vienen del boletín del curso pasado se
  // marcan como «sin confirmar» en vez de darlos por buenos.
  function clase(f) {
    const L = C.lectivo;
    if (f.getDay() === 0 || f.getDay() === 6) return { hay: false, motivo: 'Fin de semana' };
    if (!L) return { hay: null, motivo: '' };
    if (L.desde && iso(f) < L.desde) return { hay: false, motivo: 'El curso aún no ha empezado' };
    if (L.hasta && iso(f) > L.hasta) return { hay: false, motivo: 'El curso ya ha terminado' };
    const v = (L.sinClase || []).find((p) => iso(f) >= p.desde && iso(f) <= p.hasta);
    if (v) return { hay: false, motivo: v.titulo, porConfirmar: v.porConfirmar };
    return { hay: true, motivo: 'Día lectivo' };
  }

  // Qué pasa un día concreto: fechas del curso, avisos del mes y secretaría
  function delDia(f) {
    const lista = eventos.filter((e) => iso(e.d) === iso(f))
      .map((e) => ({ tipo: e.tipo, icono: ICONOS[e.tipo] || 'bi-calendar-event', titulo: e.titulo, detalle: e.detalle, url: e.url, clase: 'es-evento' }));
    (C.recurrentes || []).forEach((r) => {
      if (f.getDate() === r.dia) lista.push({ icono: 'bi-cash-coin', titulo: r.titulo, detalle: r.detalle, url: r.url, clase: 'es-aviso' });
    });
    const periodo = (C.secretaria || []).find((p) => p.meses.includes(f.getMonth() + 1));
    const tramo = periodo && periodo.tramos.find((t) => t.dias.includes(f.getDay()));
    if (tramo) lista.push({ icono: 'bi-door-open', titulo: 'Secretaría abierta', detalle: `De ${tramo.horario} · horario ${periodo.nombre}`, clase: 'es-secretaria' });
    return lista;
  }

  function pintar() {
    const primeroDelMes = new Date(anio, mes, 1);
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    // Lunes primero: el domingo (0) pasa a ser el séptimo
    const hueco = (primeroDelMes.getDay() + 6) % 7;

    const celdas = [];
    for (let i = 0; i < hueco; i++) celdas.push('<li class="cal__vacia" aria-hidden="true"></li>');
    for (let d = 1; d <= diasEnMes; d++) {
      const f = new Date(anio, mes, d);
      const cosas = delDia(f);
      const eventosDelDia = cosas.filter((c) => c.clase === 'es-evento');
      const avisos = cosas.filter((c) => c.clase === 'es-aviso');
      const cl = clase(f);
      const clases = [
        iso(f) === iso(hoy) ? 'es-hoy' : '',
        iso(f) === elegido ? 'is-elegido' : '',
        f < hoy ? 'es-pasado' : '',
        eventosDelDia.length ? 'tiene-evento' : '',
        cl.hay === true ? 'con-clase' : cl.hay === false ? 'sin-clase' : '',
        cl.porConfirmar ? 'sin-confirmar' : '',
      ].filter(Boolean).join(' ');
      const marcas = [
        ...eventosDelDia.map(() => '<span class="cal__punto cal__punto--evento"></span>'),
        ...avisos.map(() => '<span class="cal__punto cal__punto--aviso"></span>'),
      ].join('');
      const resumen = (cl.hay === true ? ', con clase' : cl.hay === false ? ', sin clase' : '')
        + (cosas.length ? `, ${cosas.length} ${cosas.length === 1 ? 'cosa' : 'cosas'}` : '');
      celdas.push(`<li><button type="button" class="cal__dia ${clases}" data-dia="${iso(f)}" aria-pressed="${iso(f) === elegido}">
        <span class="cal__num">${d}</span>
        <span class="cal__marcas" aria-hidden="true">${marcas}</span>
        <span class="sr-only">${d} de ${MESES[mes]}${resumen}</span>
      </button></li>`);
    }

    const puedeAntes = new Date(anio, mes, 1) > new Date(limiteIni.getFullYear(), limiteIni.getMonth(), 1);
    const puedeDespues = new Date(anio, mes, 1) < new Date(limiteFin.getFullYear(), limiteFin.getMonth(), 1);

    caja.innerHTML = `
      <div class="cal">
        <div class="cal__mes-col">
        <div class="cal__cab">
          <button type="button" class="cal__flecha" data-mover="-1"${puedeAntes ? '' : ' disabled'}><i class="bi bi-chevron-left" aria-hidden="true"></i><span class="sr-only">Mes anterior</span></button>
          <p class="cal__mes" aria-live="polite">${MESES[mes]} <span>${anio}</span></p>
          <button type="button" class="cal__flecha" data-mover="1"${puedeDespues ? '' : ' disabled'}><i class="bi bi-chevron-right" aria-hidden="true"></i><span class="sr-only">Mes siguiente</span></button>
          <button type="button" class="cal__hoy" data-hoy>Hoy</button>
        </div>
        <ol class="cal__semana" aria-hidden="true">${DIAS_CORTOS.map((d) => `<li>${d}</li>`).join('')}</ol>
        <ul class="cal__rejilla">${celdas.join('')}</ul>
        <p class="cal__leyenda">
          <span><i class="cal__muestra cal__muestra--clase"></i> Con clase</span>
          <span><i class="cal__muestra cal__muestra--sin"></i> Sin clase</span>
          <span><i class="cal__muestra cal__muestra--dudosa"></i> Sin confirmar</span>
          <span><i class="cal__punto cal__punto--evento"></i> Fecha del curso</span>
          <span><i class="cal__punto cal__punto--aviso"></i> Aviso del mes</span>
        </p>
        </div>
        <div class="cal__detalle" data-detalle></div>
      </div>`;
    pintarDetalle();
  }

  function pintarDetalle() {
    const zona = caja.querySelector('[data-detalle]');
    if (!zona) return;
    const f = aFecha(elegido);
    const cosas = delDia(f);
    const cl = clase(f);
    zona.innerHTML = `
      <h3>${DIAS[f.getDay()]}, ${f.getDate()} de ${MESES[f.getMonth()]}${f.getFullYear() !== hoy.getFullYear() ? ' de ' + f.getFullYear() : ''}</h3>
      ${cl.hay === null ? '' : `<p class="cal__clase ${cl.hay ? 'es-si' : 'es-no'}${cl.porConfirmar ? ' es-dudosa' : ''}">
        <i class="bi ${cl.hay ? 'bi-backpack2' : 'bi-house-door'}" aria-hidden="true"></i>
        <span><strong>${cl.hay ? 'Hay clase' : 'No hay clase'}</strong>${cl.motivo ? ' · ' + esc(cl.motivo) : ''}${cl.porConfirmar ? ' <em>(fecha sin confirmar)</em>' : ''}</span>
      </p>`}
      ${cosas.length ? `<ul>${cosas.map((c) => `<li class="${c.clase}">
          <i class="bi ${c.icono}" aria-hidden="true"></i>
          <span><strong>${c.url ? `<a href="${esc(c.url)}">${esc(c.titulo)}</a>` : esc(c.titulo)}</strong>${c.detalle ? `<span>${esc(c.detalle)}</span>` : ''}</span>
        </li>`).join('')}</ul>`
        : '<p class="cal__nada">Nada previsto este día. El calendario oficial completo se pide en <a href="/contacto">secretaría</a>.</p>'}`;
  }

  caja.addEventListener('click', (e) => {
    const mover = e.target.closest('[data-mover]');
    if (mover) {
      const n = Number(mover.dataset.mover);
      mes += n;
      if (mes < 0) { mes = 11; anio--; }
      if (mes > 11) { mes = 0; anio++; }
      pintar();
      return;
    }
    if (e.target.closest('[data-hoy]')) { mes = hoy.getMonth(); anio = hoy.getFullYear(); elegido = iso(hoy); pintar(); return; }
    const dia = e.target.closest('[data-dia]');
    if (dia) {
      elegido = dia.dataset.dia;
      caja.querySelectorAll('.cal__dia').forEach((b) => {
        const si = b.dataset.dia === elegido;
        b.classList.toggle('is-elegido', si);
        b.setAttribute('aria-pressed', String(si));
      });
      pintarDetalle();
    }
  });

  // Recorrer el mes con las flechas, como en un calendario de escritorio
  caja.addEventListener('keydown', (e) => {
    const b = e.target.closest('.cal__dia');
    if (!b) return;
    const saltos = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 };
    if (!(e.key in saltos)) return;
    e.preventDefault();
    const f = aFecha(b.dataset.dia);
    f.setDate(f.getDate() + saltos[e.key]);
    if (f.getMonth() !== mes || f.getFullYear() !== anio) { mes = f.getMonth(); anio = f.getFullYear(); elegido = iso(f); pintar(); }
    else { elegido = iso(f); pintar(); }
    const sig = caja.querySelector(`[data-dia="${iso(f)}"]`);
    if (sig) sig.focus();
  });

  pintar();
})();
