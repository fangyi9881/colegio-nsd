/* =========================================================
   Colegio NSD · Envío de formularios con Web3Forms
   ─────────────────────────────────────────────────────────
   CONFIGURACIÓN (solo una vez):
   1. Ve a https://web3forms.com → "Get your free access key"
   2. Introduce secretaria@colegionsdolores.es como email destino
   3. Pega aquí la clave que te envían por email
   ========================================================= */
(function () {
  'use strict';

  // ⚠️ Reemplaza con tu clave gratuita de Web3Forms
  const ACCESS_KEY = '206c83e1-a7f9-485a-9c91-46e8a892f6f4';

  // ─── Estilos: spinner + mensajes de estado ─────────────
  const style = document.createElement('style');
  style.textContent =
    '.btn-spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,.3);' +
    'border-top-color:#fff;border-radius:50%;animation:_nsd-spin .7s linear infinite;' +
    'vertical-align:middle;margin-right:6px}' +
    '@keyframes _nsd-spin{to{transform:rotate(360deg)}}' +
    '.form-status{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;' +
    'border-radius:12px;margin-top:14px;font-size:.88rem;line-height:1.6;' +
    'animation:_nsd-fadein .3s ease}' +
    '.form-status--ok{background:rgba(22,163,74,.1);border:1px solid rgba(22,163,74,.2);color:#15803d}' +
    '.form-status--err{background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.15);color:#dc2626}' +
    '.form-status a{color:inherit;font-weight:700;text-decoration:underline}' +
    '.form-status i{font-size:1.3rem;flex-shrink:0;line-height:1.2}' +
    '.form-status[hidden]{display:none!important}' +
    '@keyframes _nsd-fadein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}';
  document.head.appendChild(style);

  // ─── Setup de cada formulario ──────────────────────────
  function setup(formId, successId, errorId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Asegura que access_key está en el form
    let keyInput = form.querySelector('[name="access_key"]');
    if (!keyInput) {
      keyInput = document.createElement('input');
      keyInput.type = 'hidden';
      keyInput.name = 'access_key';
      form.prepend(keyInput);
    }
    keyInput.value = ACCESS_KEY;

    const btn      = form.querySelector('[type="submit"]');
    const successEl = successId ? document.getElementById(successId) : null;
    const errorEl   = errorId   ? document.getElementById(errorId)   : null;
    const origHTML  = btn ? btn.innerHTML : '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      // Estado: cargando
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span>Enviando…'; }
      if (errorEl) errorEl.hidden = true;

      try {
        const r = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(form)
        });
        const j = await r.json();
        if (!r.ok || !j.success) throw new Error(j.message || 'Error del servidor');

        // Estado: éxito
        form.style.display = 'none';
        if (successEl) {
          successEl.hidden = false;
          successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        form.reset();

      } catch {
        // Estado: error
        if (btn) { btn.disabled = false; btn.innerHTML = origHTML; }
        if (errorEl) errorEl.hidden = false;
      }
    });
  }

  // Formulario en index.html (sección de contacto)
  setup('contactoForm', 'contactoSuccess', 'contactoError');

  // Formulario en contacto.html
  setup('contactoFormPage', 'contactoSuccessPage', 'contactoErrorPage');

})();
