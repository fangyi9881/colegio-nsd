/* Formularios de secretaría (/familias/formularios/*).
   El formulario es de la web, pero las respuestas se envían al Google
   Form original, así que secretaría las recibe en su hoja de siempre.
   Google no deja leer su respuesta desde otra web (no-cors): si la
   petición sale sin error de red, se da por enviada. */
(function () {
  'use strict';

  const PERMITIDOS = /^(entry\.\d+|emailAddress|fvv|pageHistory)$/;

  function datos(form) {
    const p = new URLSearchParams();
    Array.prototype.forEach.call(form.elements, (el) => {
      if (!el.name || el.disabled || !PERMITIDOS.test(el.name)) return;
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
      const v = (el.value || '').trim();
      if (!v) return;
      if (el.hasAttribute('data-fecha')) {
        const [a, m, d] = v.split('-');
        p.append(el.name + '_year', a);
        p.append(el.name + '_month', String(+m));
        p.append(el.name + '_day', String(+d));
        return;
      }
      p.append(el.name, v);
    });
    return p;
  }

  function tieneValor(el) {
    if (el.type === 'checkbox' || el.type === 'radio') return el.checked;
    return !!(el.value || '').trim();
  }

  // Devuelve [mensaje, elemento al que llevar el foco] o null si todo está bien.
  function revisar(form) {
    const campos = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
    const malo = campos.find((el) => !el.checkValidity());
    if (malo) {
      const etiqueta = malo.closest('fieldset') ? malo.closest('fieldset').querySelector('legend') : malo.closest('label');
      const nombre = etiqueta ? etiqueta.textContent.replace(/\(opcional\)/, '').trim().split('\n')[0] : 'un campo';
      const motivo = malo.validity.valueMissing ? 'falta por rellenar' : 'no tiene el formato correcto';
      return [`«${nombre}» ${motivo}.`, malo];
    }
    const grupo = Array.prototype.find.call(form.querySelectorAll('[data-req-grupo]'),
      (fs) => !fs.querySelector('input:checked'));
    if (grupo) return [`Elegid al menos una opción en «${grupo.querySelector('legend').textContent.trim()}».`, grupo.querySelector('input')];

    const sel = form.getAttribute('data-al-menos');
    if (sel && !Array.prototype.some.call(form.querySelectorAll(sel), tieneValor)) {
      return [form.getAttribute('data-al-menos-msg'), form.querySelector(sel)];
    }
    // Un alta en horario ampliado necesita el horario.
    const sinHorario = Array.prototype.find.call(form.querySelectorAll('.actividad'), (a) => {
      const h = a.querySelector('[data-horario]');
      const alta = a.querySelector('input[value="ALTA"]');
      return h && alta && alta.checked && !h.value;
    });
    if (sinHorario) {
      return [`Elegid el horario de «${sinHorario.querySelector('.actividad__nombre').textContent}».`, sinHorario.querySelector('[data-horario]')];
    }
    return null;
  }

  function preparar(form) {
    const cuerpo = form.querySelector('[data-gform-cuerpo]');
    const error = form.querySelector('[data-gform-error]');
    const exito = form.querySelector('[data-gform-exito]');
    const boton = form.querySelector('[type="submit"]');
    const textoBoton = boton.innerHTML;
    let enviando = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (enviando) return;
      error.hidden = true;
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));

      const fallo = revisar(form);
      if (fallo) {
        error.textContent = fallo[0];
        error.hidden = false;
        if (fallo[1]) {
          fallo[1].setAttribute('aria-invalid', 'true');
          fallo[1].focus({ preventScroll: true });
          fallo[1].scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
        return;
      }

      enviando = true;
      boton.disabled = true;
      boton.textContent = 'Enviando…';
      try {
        await fetch(form.action, { method: 'POST', mode: 'no-cors', body: datos(form) });
        cuerpo.hidden = true;
        exito.hidden = false;
        exito.focus();
        form.reset();
      } catch (err) {
        error.innerHTML = '';
        error.append('No se ha podido enviar. Comprobad la conexión e intentadlo otra vez, o ');
        const a = document.createElement('a');
        a.href = form.getAttribute('data-original');
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'abrid el formulario en Google Forms';
        error.append(a, '.');
        error.hidden = false;
      } finally {
        enviando = false;
        boton.disabled = false;
        boton.innerHTML = textoBoton;
      }
    });

    form.querySelector('[data-gform-otra]').addEventListener('click', () => {
      exito.hidden = true;
      cuerpo.hidden = false;
      const primero = cuerpo.querySelector('input:not([type=hidden]), select, textarea');
      if (primero) primero.focus();
    });
  }

  document.querySelectorAll('form[data-gform]').forEach(preparar);
})();
