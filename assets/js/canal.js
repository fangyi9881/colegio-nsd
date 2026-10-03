/* /canal-informante: envío y consulta de comunicaciones (Ley 2/2023).
   Habla directamente con dos funciones de la base de datos
   (canal_enviar y canal_consultar) con la clave pública: la tabla
   no se puede leer desde fuera. */
(function () {
  'use strict';
  const form = document.querySelector('[data-canal-form]');
  if (!form) return;
  const C = window.NSD_CMS_CONFIG || {};
  const activo = !!(C.url && C.anonKey);
  const campos = form.querySelector('[data-canal-campos]');
  const errorEl = form.querySelector('[data-canal-error]');
  const consulta = document.querySelector('[data-canal-consulta]');

  if (!activo) {
    form.querySelector('[data-canal-inactivo]').hidden = false;
    campos.disabled = true;
    if (consulta) consulta.querySelector('button').disabled = true;
    return;
  }

  const rpc = (fn, args) => fetch(`${C.url.replace(/\/+$/, '')}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: C.anonKey, Authorization: `Bearer ${C.anonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  }).then(async (r) => {
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error((j && j.message) || 'No se ha podido enviar. Inténtalo de nuevo.');
    return j;
  });

  const datos = form.querySelector('[data-canal-datos]');
  form.addEventListener('change', (e) => {
    if (e.target.name === 'anonima') datos.hidden = e.target.value !== 'no';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const anonima = form.anonima.value !== 'no';
    const boton = form.querySelector('[type="submit"]');
    boton.disabled = true;
    try {
      const codigo = await rpc('canal_enviar', {
        p_categoria: form.categoria.value, p_relato: form.relato.value, p_anonima: anonima,
        p_nombre: anonima ? null : form.nombre.value, p_contacto: anonima ? null : form.contacto.value
      });
      campos.hidden = true;
      const ok = form.querySelector('[data-canal-ok]');
      ok.hidden = false;
      form.querySelector('[data-canal-codigo]').textContent = codigo;
      ok.focus();
    } catch (err) {
      errorEl.textContent = err.message; errorEl.hidden = false; errorEl.focus();
      boton.disabled = false;
    }
  });

  const ESTADOS = { recibida: 'Recibida, pendiente de acuse', acusada: 'Recibida y en estudio', en_tramite: 'En trámite', cerrada: 'Cerrada' };
  const fecha = (iso) => (iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
  if (consulta) consulta.addEventListener('submit', async (e) => {
    e.preventDefault();
    const out = document.querySelector('[data-canal-resultado]');
    out.textContent = '';
    const codigo = consulta.codigo.value.trim();
    if (codigo.replace(/[^a-z0-9]/gi, '').length < 16) { out.textContent = 'El código tiene 16 caracteres (XXXX-XXXX-XXXX-XXXX).'; return; }
    try {
      const r = await rpc('canal_consultar', { p_codigo: codigo });
      if (!r) { out.textContent = 'No hay ninguna comunicación con ese código. Revisa que esté bien escrito.'; return; }
      const dl = document.createElement('dl');
      [['Estado', ESTADOS[r.estado] || r.estado], ['Enviada', fecha(r.creado_en)], ['Acuse de recibo', fecha(r.acuse_en)], ['Respuesta', r.respuesta || 'Todavía no hay respuesta.']].forEach(([k, v]) => {
        const dt = document.createElement('dt'); dt.textContent = k;
        const dd = document.createElement('dd'); dd.textContent = v;
        dl.append(dt, dd);
      });
      out.appendChild(dl);
    } catch (err) { out.textContent = err.message; }
  });
})();
