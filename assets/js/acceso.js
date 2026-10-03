/* =========================================================
   /acceso y /acceso/nueva-clave
   Entrar, solicitar una cuenta y recuperar la contraseña.
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const raizAcceso = $('[data-acceso]');
  if (!raizAcceso) return;
  const MIN_CLAVE = 10;

  const api = window.NSD_PANEL_API && window.NSD_PANEL_API.obtener();
  if (!api) {
    $('[data-acceso-sin-config]').hidden = false;
    raizAcceso.querySelectorAll('form, [role="tablist"], .acceso-alt').forEach((f) => { f.hidden = true; });
    return;
  }

  function estado(form, texto, tipo) {
    const caja = form.querySelector('[data-estado]');
    caja.hidden = !texto;
    caja.className = 'acceso-estado' + (tipo ? ' acceso-estado--' + tipo : '');
    caja.textContent = texto || '';
    if (texto) caja.focus({ preventScroll: false });
  }
  function ocupado(form, si, texto) {
    const b = form.querySelector('[type="submit"]');
    if (!b) return;
    if (!b.dataset.original) b.dataset.original = b.textContent;
    b.disabled = si;
    b.textContent = si ? (texto || 'Un momento…') : b.dataset.original;
  }

  // ── Página de nueva contraseña (enlace del correo de recuperación) ──
  const formNueva = $('#formNuevaClave');
  if (formNueva) {
    let lista = false;
    const preparar = () => { lista = true; formNueva.querySelector('fieldset').disabled = false; estado(formNueva, ''); };
    api.alCambiarSesion((evento, sesion) => { if (sesion && (evento === 'PASSWORD_RECOVERY' || evento === 'SIGNED_IN' || evento === 'INITIAL_SESSION')) preparar(); });
    api.sesion().then((s) => { if (s) preparar(); });
    setTimeout(() => { if (!lista) estado(formNueva, 'Este enlace no es válido o ha caducado. Pide otro desde «He olvidado la contraseña».', 'error'); }, 4000);
    formNueva.addEventListener('submit', async (e) => {
      e.preventDefault();
      const c1 = formNueva.clave.value, c2 = formNueva.clave2.value;
      if (c1.length < MIN_CLAVE) return estado(formNueva, `La contraseña tiene que tener al menos ${MIN_CLAVE} caracteres.`, 'error');
      if (c1 !== c2) return estado(formNueva, 'Las dos contraseñas no coinciden.', 'error');
      ocupado(formNueva, true, 'Guardando…');
      try {
        await api.cambiarClave(c1);
        estado(formNueva, 'Contraseña cambiada. Te llevamos al panel…', 'ok');
        setTimeout(() => { location.href = '/panel'; }, 1200);
      } catch (err) { estado(formNueva, err.message, 'error'); ocupado(formNueva, false); }
    });
    return;
  }

  // Ya hay sesión: directo al panel
  api.sesion().then((s) => { if (s) location.replace('/panel'); }).catch(() => {});

  if (/[?&]confirmado=1/.test(location.search)) {
    const aviso = $('[data-aviso-confirmado]');
    if (aviso) aviso.hidden = false;
  }

  // ── Pestañas ──
  const pestanas = [...raizAcceso.querySelectorAll('[role="tab"]')];
  function mostrar(id, foco) {
    pestanas.forEach((t) => {
      const si = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', String(si));
      t.tabIndex = si ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !si;
      if (si && foco) t.focus();
    });
    history.replaceState(null, '', id === 'panelEntrar' ? location.pathname : '#' + id.replace('panel', '').toLowerCase());
  }
  pestanas.forEach((t, i) => {
    t.addEventListener('click', () => mostrar(t.getAttribute('aria-controls')));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = pestanas[(i + d + pestanas.length) % pestanas.length];
      mostrar(n.getAttribute('aria-controls'), true);
    });
  });
  document.querySelectorAll('[data-ir-pestana]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); mostrar(a.getAttribute('data-ir-pestana'), true); }));
  const inicial = { '#solicitar': 'panelSolicitar', '#recuperar': 'panelRecuperar' }[location.hash];
  if (inicial) mostrar(inicial);

  // ── Ámbitos que se pueden pedir ──
  const sel = $('#solAmbito');
  api.ambitos().then((lista) => {
    const grupos = {};
    lista.filter((a) => a.tipo !== 'especial').forEach((a) => { (grupos[a.grupo || 'Otros'] = grupos[a.grupo || 'Otros'] || []).push(a); });
    Object.keys(grupos).forEach((g) => {
      const og = document.createElement('optgroup');
      og.label = g;
      grupos[g].forEach((a) => { const o = document.createElement('option'); o.value = a.id; o.textContent = a.nombre; og.appendChild(o); });
      sel.appendChild(og);
    });
  }).catch(() => {});

  // ── Entrar ──
  const fEntrar = $('#formEntrar');
  fEntrar.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fEntrar.checkValidity()) { fEntrar.reportValidity(); return; }
    ocupado(fEntrar, true, 'Entrando…');
    try {
      await api.entrar(fEntrar.email.value, fEntrar.clave.value);
      location.href = '/panel';
    } catch (err) { estado(fEntrar, err.message, 'error'); ocupado(fEntrar, false); }
  });

  // ── Solicitar cuenta ──
  const fSol = $('#formSolicitar');
  fSol.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fSol.checkValidity()) { fSol.reportValidity(); return; }
    if (fSol.clave.value.length < MIN_CLAVE) return estado(fSol, `La contraseña tiene que tener al menos ${MIN_CLAVE} caracteres.`, 'error');
    if (fSol.clave.value !== fSol.clave2.value) return estado(fSol, 'Las dos contraseñas no coinciden.', 'error');
    ocupado(fSol, true, 'Enviando la solicitud…');
    try {
      const r = await api.solicitar({ email: fSol.email.value, clave: fSol.clave.value, nombre: fSol.nombre.value, cargo: fSol.cargo.value, ambito: fSol.ambito.value, motivo: fSol.motivo.value });
      fSol.querySelector('fieldset').hidden = true;
      estado(fSol, r.necesitaConfirmar
        ? 'Solicitud enviada. Te hemos mandado un correo: abre el enlace para confirmar tu dirección. Después, la dirección del colegio revisará tu solicitud y te dará acceso.'
        : 'Solicitud enviada. La dirección del colegio la revisará; cuando la apruebe podrás entrar con tu correo y tu contraseña.', 'ok');
      if (!r.necesitaConfirmar) await api.salir();
    } catch (err) { estado(fSol, err.message, 'error'); ocupado(fSol, false); }
  });

  // ── Recuperar contraseña ──
  const fRec = $('#formRecuperar');
  fRec.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fRec.checkValidity()) { fRec.reportValidity(); return; }
    ocupado(fRec, true, 'Enviando…');
    try {
      await api.recuperar(fRec.email.value);
      estado(fRec, 'Si ese correo tiene una cuenta, en unos minutos recibirás un enlace para elegir una contraseña nueva. Mira también en la carpeta de spam.', 'ok');
    } catch (err) { estado(fRec, err.message, 'error'); }
    ocupado(fRec, false);
  });
})();
