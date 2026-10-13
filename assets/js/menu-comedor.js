/* =========================================================
   Menú del comedor: tabla semana a semana.
   ---------------------------------------------------------
   Lee window.NSD_MENU (menu-datos.js) y pinta el menú dentro
   de [data-menu-comedor]. Arriba, el botón para bajarse el
   PDF que firma el centro.

   La tabla es la fuente principal porque se lee con lector de
   pantalla, se busca con Ctrl+F y se ve bien en el móvil; el
   PDF está para quien lo quiera imprimir o guardar.
   ========================================================= */
(function () {
  'use strict';

  const caja = document.querySelector('[data-menu-comedor]');
  if (!caja || !window.NSD_MENU) return;

  // El menú que trae la propia web (menu-datos.js) se pinta al instante.
  // Después se piden a Supabase los meses que ha publicado el centro desde el
  // panel: si hay uno que toca (el de este mes, o el siguiente), sustituye al
  // incluido. Sin conexión o sin menús publicados, no cambia nada.
  function pintar(M) {
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const aFecha = (f) => {
    const [a, m, d] = String(f).split('-').map(Number);
    return new Date(a, m - 1, d);
  };

  // Los días se agrupan por semana natural (lunes a viernes)
  const semanas = [];
  M.dias.forEach((d) => {
    const fecha = aFecha(d.fecha);
    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() - ((fecha.getDay() + 6) % 7));
    const clave = lunes.toISOString().slice(0, 10);
    let s = semanas.find((z) => z.clave === clave);
    if (!s) { s = { clave, dias: [] }; semanas.push(s); }
    s.dias.push(d);
  });
  semanas.sort((a, b) => a.clave.localeCompare(b.clave));

  const rotulo = (s) => {
    const p = aFecha(s.dias[0].fecha);
    const u = aFecha(s.dias[s.dias.length - 1].fecha);
    const mismoMes = p.getMonth() === u.getMonth();
    return p.getDate() + (mismoMes ? '' : ' de ' + MESES[p.getMonth()]) +
      ' al ' + u.getDate() + ' de ' + MESES[u.getMonth()];
  };

  // ── ¿Qué toca hoy? Solo si el día está en este menú ──
  const hoy = new Date();
  const claveHoy = hoy.getFullYear() + '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
    String(hoy.getDate()).padStart(2, '0');
  const deHoy = M.dias.find((d) => d.fecha === claveHoy);

  const FILAS = [
    ['primero', 'Primer plato'],
    ['segundo', 'Segundo plato'],
    ['guarnicion', 'Guarnición'],
    ['postre', 'Postre'],
    ['bebida', 'Bebida'],
    ['pan', 'Pan'],
  ];

  // Una semana a la vista: las cuatro o cinco tablas seguidas ocupaban
  // cinco pantallas en el móvil. Se abre la de esta semana (o la próxima).
  let activa = semanas.findIndex((s) => s.dias.some((d) => d.fecha >= claveHoy));
  if (activa < 0) activa = 0;

  function tabla(s, i) {
    const dias = s.dias;
    // El dia de hoy se recalcula en cada carga de la pagina (claveHoy, mas
    // arriba), asi que la columna que se destaca cambia sola cada dia sin
    // tocar nada aqui.
    const cabeceras = dias.map((d) => {
      const f = aFecha(d.fecha);
      const esHoy = d.fecha === claveHoy;
      return `<th scope="col" class="${esHoy ? 'es-hoy' : ''}"><span class="menu-dia">${esc(DIAS[f.getDay()])}${esHoy ? ' <span class="menu-hoy-eti">Hoy</span>' : ''}</span><span class="menu-num">${f.getDate()}</span></th>`;
    }).join('');

    const cuerpo = FILAS.map(([clave, nombre]) => {
      const celdas = dias.map((d) => {
        const esHoy = d.fecha === claveHoy;
        const v = d[clave];
        if (!v) return `<td class="menu-vacia${esHoy ? ' es-hoy' : ''}">—</td>`;
        const extra = clave === 'postre' && d.postre2
          ? `<span class="menu-extra">y ${esc(d.postre2)} <em>(guardería)</em></span>` : '';
        return `<td${esHoy ? ' class="es-hoy"' : ''}>${esc(v)}${extra}</td>`;
      }).join('');
      return `<tr><th scope="row">${nombre}</th>${celdas}</tr>`;
    }).join('');

    const energia = dias.map((d) => `<td${d.fecha === claveHoy ? ' class="es-hoy"' : ''}><strong>${d.kcal}</strong> kcal<span class="menu-macros">P ${d.prot} · L ${d.lip} · HC ${d.hc}</span></td>`).join('');

    return `<div class="menu-semana" id="menu-semana-${i}"${i === activa ? '' : ' hidden'}>
      <h3 class="menu-semana__rotulo">${esc(rotulo(s))}</h3>
      <div class="menu-marco">
        <table class="menu-tabla">
          <caption class="sr-only">Menú del comedor del ${esc(rotulo(s))}</caption>
          <thead><tr><th scope="col"><span class="sr-only">Plato</span></th>${cabeceras}</tr></thead>
          <tbody>${cuerpo}<tr class="menu-energia"><th scope="row">Energía</th>${energia}</tr></tbody>
        </table>
      </div>
    </div>`;
  }

  const hoyHtml = deHoy ? `
    <div class="menu-hoy">
      <span class="menu-hoy__eti"><i class="bi bi-egg-fried" aria-hidden="true"></i> Hoy comen</span>
      <p class="menu-hoy__platos">${esc(deHoy.primero)} · ${esc(deHoy.segundo)}${deHoy.guarnicion ? ' con ' + esc(deHoy.guarnicion) : ''} · ${esc(deHoy.postre)}</p>
    </div>` : '';

  caja.innerHTML = `
    <div class="menu-cab">
      <div class="menu-cab__txt">
        <h2 id="menu-mes"><i class="bi bi-calendar2-week" aria-hidden="true"></i> Menú de ${esc(M.mes)}</h2>
        <p class="menu-cab__sub">Evaluado por el Asesoramiento Nutricional de la Comunidad de Madrid.</p>
      </div>
      <div class="menu-cab__acciones">
        <a class="btn btn--primary" href="${esc(M.archivo)}" download="${esc(M.nombreDescarga)}">
          <i class="bi bi-download" aria-hidden="true"></i> Descargar el menú${M.formato === 'xlsx' ? ' en Excel' : ' en PDF'}
        </a>
        ${M.formato === 'xlsx' ? '' : `<a class="btn btn--ghost" href="${esc(M.archivo)}" target="_blank" rel="noopener">
          <i class="bi bi-file-earmark-pdf" aria-hidden="true"></i> Ver el PDF
          <span class="sr-only">(se abre en una pestaña nueva)</span>
        </a>`}
        <span class="menu-cab__peso">${M.paginas ? M.paginas + (M.paginas === 1 ? ' página' : ' páginas') + ' · ' : ''}${esc(M.peso)}</span>
      </div>
    </div>
    ${hoyHtml}
    ${semanas.length > 1 ? `<div class="menu-semanas" role="group" aria-label="Elegir semana">${semanas.map((s, i) => `<button type="button" class="menu-semanas__btn" data-semana="${i}" aria-controls="menu-semana-${i}" aria-pressed="${i === activa}">${esc(rotulo(s))}</button>`).join('')}</div>` : ''}
    ${semanas.map(tabla).join('')}
    <p class="menu-pie">El mismo menú para todos los comensales. Las dietas por alergia o intolerancia se elaboran aparte, en la cocina del centro: avisa en secretaría.</p>`;

  }

  caja.addEventListener('click', (e) => {
    const b = e.target.closest('[data-semana]');
    if (!b) return;
    const n = Number(b.dataset.semana);
    caja.querySelectorAll('[data-semana]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    caja.querySelectorAll('.menu-semana').forEach((t, i) => { t.hidden = i !== n; });
  });

  pintar(window.NSD_MENU);

  const C = window.NSD_CMS_CONFIG || {};
  if (!C.url || !C.anonKey || !window.fetch) return;
  const hoyIso = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const valido = (m) => m && Array.isArray(m.dias) && m.dias.length && m.dias.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.fecha) && d.primero && d.segundo);
  fetch(C.url + '/rest/v1/contenidos?ambito_id=eq.comedor&clave=like.mes_*&select=clave,valor&order=clave.asc', {
    headers: { apikey: C.anonKey, Authorization: 'Bearer ' + C.anonKey }
  }).then((r) => (r.ok ? r.json() : [])).then((filas) => {
    const meses = (filas || []).map((f) => f.valor).filter(valido).map((m) => Object.assign({ nombreDescarga: 'Menu-comedor-Colegio-NSD', peso: '', formato: 'pdf' }, m));
    if (!meses.length) return;
    const hoy = hoyIso();
    // el mes de hoy; si no hay, el primero que aún no ha pasado; si no, el último
    const actual = meses.find((m) => m.dias[0].fecha.slice(0, 7) === hoy.slice(0, 7)) ||
      meses.find((m) => m.dias[m.dias.length - 1].fecha >= hoy) || meses[meses.length - 1];
    if (actual && actual.archivo !== window.NSD_MENU.archivo) pintar(actual);
  }).catch(() => { /* se queda el menú incluido en la web */ });
})();
