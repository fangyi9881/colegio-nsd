/* Formularios de secretaría (/familias/formularios/*).

   El formulario es de la web, pero las respuestas se envían al Google
   Form original, así que secretaría las recibe en su hoja de siempre.

   Sincronización: al cargar, se pide a Supabase (función «formularios»)
   la estructura actual del Google Form. Si coincide con la adaptada
   (data-huella), no se toca nada. Si secretaría ha cambiado preguntas u
   opciones, se pinta el formulario nuevo tal cual está en Google, con el
   diseño de la web. Si Supabase no responde, se queda la versión adaptada.

   Google no deja leer su respuesta desde otra web (no-cors): si la
   petición sale sin error de red, se da por enviada. */
(function () {
  'use strict';

  const G = window.NSD_GFORM;
  const PERMITIDOS = /^(entry\.\d+(_year|_month|_day|_hour|_minute|\.other_option_response)?|emailAddress|fvv|pageHistory)$/;
  const OTRO = '__other_option__';

  /* ---------- Datos que se envían ---------- */
  function datos(form) {
    const p = new URLSearchParams();
    Array.prototype.forEach.call(form.elements, (el) => {
      if (!el.name || el.disabled || !PERMITIDOS.test(el.name)) return;
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
      const v = (el.value || '').trim();
      if (!v) return;
      if (el.hasAttribute('data-fecha')) {
        const [fecha, hora] = v.split('T');
        const [a, m, d] = fecha.split('-');
        if (!el.hasAttribute('data-sin-anio')) p.append(el.name + '_year', a);
        p.append(el.name + '_month', String(+m));
        p.append(el.name + '_day', String(+d));
        if (hora) { const [h, mi] = hora.split(':'); p.append(el.name + '_hour', h); p.append(el.name + '_minute', mi); }
        return;
      }
      if (el.hasAttribute('data-hora')) {
        const [h, mi] = v.split(':');
        p.append(el.name + '_hour', h);
        p.append(el.name + '_minute', mi);
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

  function nombreDe(el) {
    const et = el.closest('fieldset') ? el.closest('fieldset').querySelector('legend') : el.closest('label');
    return et ? et.textContent.replace(/\(opcional\)/, '').replace(/\s+/g, ' ').trim() : 'un campo';
  }

  // Devuelve [mensaje, elemento al que llevar el foco] o null si todo está bien.
  function revisar(form) {
    const campos = Array.prototype.slice.call(form.querySelectorAll('[data-gform-campos] input, [data-gform-campos] select, [data-gform-campos] textarea'));
    const malo = campos.find((el) => !el.disabled && !el.checkValidity());
    if (malo) {
      const motivo = malo.validity.valueMissing ? 'falta por rellenar' : 'no tiene el formato correcto';
      return [`«${nombreDe(malo)}» ${motivo}.`, malo];
    }
    const grupo = Array.prototype.find.call(form.querySelectorAll('[data-req-grupo]'), (fs) => !fs.querySelector('input:checked'));
    if (grupo) return [`Elegid al menos una opción en «${grupo.querySelector('legend').textContent.replace(/\s+/g, ' ').trim()}».`, grupo.querySelector('input')];

    const filasReq = Array.prototype.find.call(form.querySelectorAll('[data-fila-req]'), (f) => !f.querySelector('input:checked'));
    if (filasReq) return [`Falta responder «${filasReq.getAttribute('aria-label')}».`, filasReq.querySelector('input')];

    const sel = form.getAttribute('data-al-menos');
    if (sel && !Array.prototype.some.call(form.querySelectorAll(sel), tieneValor)) {
      return [form.getAttribute('data-al-menos-msg'), form.querySelector(sel)];
    }
    const sinHorario = Array.prototype.find.call(form.querySelectorAll('.actividad'), (a) => {
      const h = a.querySelector('[data-horario]');
      const alta = a.querySelector('input[value="ALTA"]');
      return h && alta && alta.checked && !h.value;
    });
    if (sinHorario) return [`Elegid el horario de «${sinHorario.querySelector('.actividad__nombre').textContent}».`, sinHorario.querySelector('[data-horario]')];

    const otroVacio = Array.prototype.find.call(form.querySelectorAll(`input[value="${OTRO}"]:checked`), (o) => {
      const t = form.querySelector(`[name="${o.name}.other_option_response"]`);
      return t && !t.value.trim();
    });
    if (otroVacio) return ['Escribid qué es «Otro».', form.querySelector(`[name="${otroVacio.name}.other_option_response"]`)];
    return null;
  }

  /* ---------- Formulario genérico, a partir de la estructura de Google ---------- */
  function el(tag, attrs, hijos) {
    const n = document.createElement(tag);
    Object.keys(attrs || {}).forEach((k) => {
      if (attrs[k] === false || attrs[k] == null) return;
      if (k === 'texto') n.textContent = attrs[k];
      else if (k === 'clase') n.className = attrs[k];
      else n.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    (hijos || []).forEach((h) => h && n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h));
    return n;
  }

  // «ESCUELA DE JUDO» → «Escuela de judo». Solo si la frase viene entera en mayúsculas.
  function bonito(t) {
    const s = (t || '').replace(/\s+/g, ' ').trim();
    if (s === 'SI') return 'Sí';
    const letras = s.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
    const mayus = letras.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '').length;
    if (letras.length > 3 && mayus / letras.length > 0.7) {
      const m = s.toLowerCase();
      return m.charAt(0).toUpperCase() + m.slice(1);
    }
    return s;
  }
  function partir(titulo) {
    const lineas = (titulo || '').split('\n').map((l) => l.trim()).filter(Boolean);
    return { nombre: bonito(lineas[0] || ''), resto: lineas.slice(1).join(' ') };
  }

  let contador = 0;
  function ayuda(texto) { return texto ? el('span', { clase: 'form-ayuda', texto }) : null; }
  function opc(b) { return b.req ? null : el('span', { clase: 'gform__opc', texto: ' (opcional)' }); }

  function opcionesChips(b, tipo, extra) {
    const caja = el('div', { clase: 'opciones' });
    b.ops.forEach((o, i) => {
      const valor = o.otro ? OTRO : o.valor;
      const input = el('input', Object.assign({ type: tipo, name: 'entry.' + b.entry, value: valor, required: tipo === 'radio' && b.req && i === 0 }, extra || {}));
      caja.appendChild(el('label', { clase: 'opcion' }, [input, el('span', { texto: o.otro ? 'Otro' : bonito(o.valor) })]));
    });
    if (b.ops.some((o) => o.otro)) {
      caja.appendChild(el('label', { clase: 'opcion-otro' }, ['Otro: ', el('input', { type: 'text', name: 'entry.' + b.entry + '.other_option_response' })]));
    }
    return caja;
  }

  function bloque(b) {
    const id = 'gf-' + (++contador);
    const { nombre, resto } = partir(b.titulo);
    const desc = [resto, b.desc].filter(Boolean).join(' ');
    switch (b.tipo) {
      case 'seccion':
        return el('div', { clase: 'gform__seccion' }, [el('h3', { texto: nombre || 'Más datos' }), desc ? el('p', { texto: desc }) : null]);
      case 'texto': case 'parrafo': case 'fecha': case 'hora': {
        let campo;
        if (b.tipo === 'parrafo') campo = el('textarea', { id, name: 'entry.' + b.entry, rows: 3, required: b.req });
        else if (b.tipo === 'fecha') campo = el('input', { id, type: b.conHora ? 'datetime-local' : 'date', name: 'entry.' + b.entry, required: b.req, 'data-fecha': true, 'data-sin-anio': !b.conAnio });
        else if (b.tipo === 'hora') campo = el('input', { id, type: 'time', name: 'entry.' + b.entry, required: b.req, 'data-hora': true });
        else {
          const t = /correo|e-?mail/i.test(nombre) ? 'email' : /tel[eé]fono|m[oó]vil/i.test(nombre) ? 'tel' : 'text';
          campo = el('input', { id, type: t, name: 'entry.' + b.entry, required: b.req, autocomplete: t === 'email' ? 'email' : t === 'tel' ? 'tel' : null });
        }
        return el('div', { clase: 'form-row' }, [el('label', { for: id }, [nombre, opc(b), campo, ayuda(desc)])]);
      }
      case 'desplegable': {
        const sel = el('select', { id, name: 'entry.' + b.entry, required: b.req }, [el('option', { value: '', texto: 'Elegid una opción' })]);
        b.ops.forEach((o) => { if (!o.otro) sel.appendChild(el('option', { value: o.valor, texto: bonito(o.valor) })); });
        return el('div', { clase: 'form-row' }, [el('label', { for: id }, [nombre, opc(b), sel, ayuda(desc)])]);
      }
      case 'radio': case 'casillas': case 'escala': {
        const valores = b.ops.map((o) => o.valor);
        // Alta / Baja (y, si las hay, más opciones): el mismo control que la versión adaptada.
        if (b.tipo !== 'escala' && valores[0] === 'ALTA' && valores[1] === 'BAJA') {
          const fs = el('fieldset', { clase: 'actividad' });
          fs.appendChild(el('legend', {}, [el('span', { clase: 'actividad__nombre', texto: nombre }), desc ? el('span', { clase: 'actividad__horario', texto: desc }) : null]));
          const seg = el('div', { clase: 'segmento', role: 'radiogroup', 'aria-label': nombre });
          [['', 'Sin cambios'], ['ALTA', 'Alta'], ['BAJA', 'Baja']].forEach(([v, t]) => {
            seg.appendChild(el('label', {}, [el('input', { type: 'radio', name: 'entry.' + b.entry, value: v, checked: !v, 'data-cambio': !!v }), el('span', { texto: t })]));
          });
          fs.appendChild(seg);
          const otras = b.ops.slice(2).filter((o) => !o.otro);
          if (otras.length) {
            const ex = el('fieldset', { clase: 'actividad__extra' }, [el('legend', { texto: 'Opciones' })]);
            ex.appendChild(opcionesChips({ entry: b.entry, ops: otras }, b.tipo === 'radio' ? 'checkbox' : 'checkbox'));
            fs.appendChild(ex);
          }
          return fs;
        }
        // Una sola casilla (p. ej. «CERTIFICADO DE NOTAS: SI»): una casilla con el nombre de la pregunta.
        if (b.tipo === 'casillas' && b.ops.length === 1 && !b.ops[0].otro) {
          const unica = /^(s[ií]|acepto|de acuerdo)$/i.test(b.ops[0].valor) || b.ops[0].valor.length < 4 ? nombre : bonito(b.ops[0].valor);
          return el('label', { clase: 'form-check gform__check' }, [
            el('input', { type: 'checkbox', name: 'entry.' + b.entry, value: b.ops[0].valor, required: b.req }), el('span', { texto: unica })]);
        }
        const fs = el('fieldset', { clase: 'gform__grupo', 'data-req-grupo': b.req && b.tipo === 'casillas' }, [el('legend', {}, [nombre, opc(b)])]);
        if (b.tipo === 'escala' && b.extremos.length) fs.appendChild(ayuda(`${b.extremos[0] || ''} → ${b.extremos[1] || ''}`));
        fs.appendChild(opcionesChips(b, b.tipo === 'casillas' ? 'checkbox' : 'radio'));
        if (desc) fs.appendChild(ayuda(desc));
        return fs;
      }
      case 'rejilla': {
        const fs = el('fieldset', { clase: 'gform__grupo rejilla' }, [el('legend', {}, [nombre, opc(b)])]);
        if (desc) fs.appendChild(ayuda(desc));
        b.filas.forEach((f) => {
          const ops = el('div', { clase: 'opciones' });
          b.cols.forEach((c) => ops.appendChild(el('label', { clase: 'opcion' }, [
            el('input', { type: b.multiple ? 'checkbox' : 'radio', name: 'entry.' + f.entry, value: c }),
            el('span', {}, [c, el('span', { clase: 'sr-only', texto: ' · ' + f.nombre })]),
          ])));
          fs.appendChild(el('div', { clase: 'rejilla__fila', role: 'group', 'aria-label': f.nombre, 'data-fila-req': b.req }, [el('span', { clase: 'rejilla__dia', 'aria-hidden': 'true', texto: f.nombre }), ops]));
        });
        return fs;
      }
      default:
        return null;
    }
  }

  function pintarGenerico(form, esquema) {
    const campos = form.querySelector('[data-gform-campos]');
    // Guardar lo que la persona ya haya escrito, para no perderlo.
    const antes = {};
    Array.prototype.forEach.call(campos.querySelectorAll('[name]'), (c) => {
      if ((c.type === 'checkbox' || c.type === 'radio') && !c.checked) return;
      if (!c.value) return;
      (antes[c.name] = antes[c.name] || []).push(c.value);
    });

    const nuevo = el('div', { 'data-gform-campos': true });
    if (esquema.descripcion) nuevo.appendChild(el('p', { clase: 'gform__desc', texto: esquema.descripcion }));
    if (esquema.email === 'campo') {
      nuevo.appendChild(el('div', { clase: 'form-row' }, [el('label', { for: 'gf-email' }, ['Correo electrónico',
        el('input', { id: 'gf-email', type: 'email', name: 'emailAddress', required: true, autocomplete: 'email' })])]));
    }
    esquema.bloques.forEach((b) => { const n = bloque(b); if (n) nuevo.appendChild(n); });
    campos.replaceWith(nuevo);

    Array.prototype.forEach.call(nuevo.querySelectorAll('[name]'), (c) => {
      const v = antes[c.name];
      if (!v) return;
      if (c.type === 'checkbox' || c.type === 'radio') c.checked = v.indexOf(c.value) !== -1;
      else c.value = v[0];
    });

    form.removeAttribute('data-al-menos');
    const ph = form.querySelector('[name="pageHistory"]');
    ph.value = Array.from({ length: esquema.paginas }, (_, i) => i).join(',');
    form.setAttribute('data-sincronizado', 'google');
  }

  function soloEnGoogle(form, motivo) {
    const cuerpo = form.querySelector('[data-gform-cuerpo]');
    cuerpo.textContent = '';
    cuerpo.appendChild(el('p', { clase: 'gform__desc', texto: motivo }));
    cuerpo.appendChild(el('a', { clase: 'btn btn--primary btn--block', href: form.getAttribute('data-original'), target: '_blank', rel: 'noopener noreferrer', texto: 'Abrir el formulario en Google Forms' }));
  }

  /* ---------- Sincronizar con Google a través de Supabase ---------- */
  async function sincronizar(form) {
    const cfg = window.NSD_CMS_CONFIG || {};
    const id = form.getAttribute('data-form-id');
    if (!G || !cfg.url || !cfg.anonKey || !id) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    try {
      const r = await fetch(cfg.url.replace(/\/$/, '') + '/functions/v1/formularios?id=' + encodeURIComponent(id), {
        headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey },
        signal: ctrl.signal,
      });
      if (!r.ok) return;
      const raw = await r.json();
      if (raw.login) { soloEnGoogle(form, 'Este formulario pide iniciar sesión con una cuenta de Google. Se rellena en Google Forms.'); return; }
      if (!raw.p) return;
      if (G.huella(raw.p) === form.getAttribute('data-huella')) return; // sin cambios: versión adaptada
      const esquema = G.normalizar(raw);
      if (!esquema.soportado) { soloEnGoogle(form, 'Este formulario tiene preguntas que solo se pueden responder en Google Forms (por ejemplo, subir archivos).'); return; }
      pintarGenerico(form, esquema);
    } catch (e) {
      /* Sin conexión con Supabase: se queda la versión adaptada. */
    } finally {
      clearTimeout(t);
    }
  }

  /* ---------- Envío ---------- */
  function preparar(form) {
    const error = form.querySelector('[data-gform-error]');
    const exito = form.querySelector('[data-gform-exito]');
    let enviando = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (enviando) return;
      const cuerpo = form.querySelector('[data-gform-cuerpo]');
      const boton = form.querySelector('[type="submit"]');
      const textoBoton = boton.innerHTML;
      error.hidden = true;
      form.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));

      const fallo = revisar(form);
      if (fallo) {
        error.textContent = fallo[0];
        error.hidden = false;
        if (fallo[1]) {
          const pl = fallo[1].closest('details');
          if (pl) pl.open = true;
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
        error.textContent = 'No se ha podido enviar. Comprobad la conexión e intentadlo otra vez, o ';
        error.appendChild(el('a', { href: form.getAttribute('data-original'), target: '_blank', rel: 'noopener noreferrer', texto: 'abrid el formulario en Google Forms' }));
        error.appendChild(document.createTextNode('.'));
        error.hidden = false;
      } finally {
        enviando = false;
        boton.disabled = false;
        boton.innerHTML = textoBoton;
      }
    });

    form.querySelector('[data-gform-otra]').addEventListener('click', () => {
      exito.hidden = true;
      const cuerpo = form.querySelector('[data-gform-cuerpo]');
      cuerpo.hidden = false;
      const primero = cuerpo.querySelector('input:not([type=hidden]), select, textarea');
      if (primero) primero.focus();
    });

    // En cada desplegable, cuántos cambios lleva marcados
    const contar = () => form.querySelectorAll('.gform__pliegue').forEach((d) => {
      const n = d.querySelectorAll('[data-cambio]:checked').length;
      const b = d.querySelector('[data-cuenta]');
      if (!b) return;
      b.hidden = !n;
      b.textContent = n === 1 ? '1 cambio' : n + ' cambios';
    });
    form.addEventListener('change', contar);
    form.addEventListener('reset', () => setTimeout(contar));

    sincronizar(form);
  }

  document.querySelectorAll('form[data-gform]').forEach(preparar);
})();
