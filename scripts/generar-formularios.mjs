// Genera una página por formulario de secretaría en
// /familias/formularios/<slug>.html y las tarjetas de /familias/formularios.
//
//   node scripts/generar-formularios.mjs
//
// Las respuestas van al Google Form original (ver formularios-google.mjs),
// así que secretaría las sigue viendo en su hoja de respuestas de siempre.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pagina, migasJsonLd, esc } from './plantilla.mjs';
import { FORMULARIOS } from './formularios-google.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(RAIZ, 'familias/formularios');
fs.mkdirSync(DIR, { recursive: true });

const accion = (f) => `https://docs.google.com/forms/d/e/${f.id}/formResponse`;
const nombre = (entry) => `entry.${entry}`;
const opcional = (c) => (!c.req && !c.cambio ? ' <span class="gform__opc">(opcional)</span>' : '');
const ayuda = (t, id) => (t ? `<span class="form-ayuda"${id ? ` id="${id}"` : ''}>${esc(t)}</span>` : '');

function campo(f, c, n) {
  const id = `${f.slug}-${c.entry || c.tipo}-${n}`;
  const cambio = c.cambio ? ' data-cambio' : '';
  const req = c.req ? ' required' : '';
  const desc = c.ayuda ? ` aria-describedby="${id}-ayuda"` : '';
  switch (c.tipo) {
    case 'seccion':
      return `<div class="gform__seccion"><h3>${esc(c.titulo)}</h3>${c.ayuda ? `<p>${esc(c.ayuda)}</p>` : ''}</div>`;
    case 'texto': case 'tel': case 'email': case 'emailcampo': {
      const tipo = c.tipo === 'tel' ? 'tel' : c.tipo.startsWith('email') ? 'email' : 'text';
      const name = c.tipo === 'email' ? 'emailAddress' : nombre(c.entry);
      const ac = c.autocomplete || (tipo === 'tel' ? 'tel' : tipo === 'email' ? 'email' : '');
      return `<div class="form-row"><label for="${id}">${esc(c.label)}${opcional(c)}
          <input type="${tipo}" id="${id}" name="${name}"${req}${cambio}${ac ? ` autocomplete="${ac}"` : ''}${c.placeholder ? ` placeholder="${esc(c.placeholder)}"` : ''}${desc}${tipo === 'tel' ? ' inputmode="tel"' : ''} />
          ${ayuda(c.ayuda, `${id}-ayuda`)}</label></div>`;
    }
    case 'parrafo':
      return `<div class="form-row"><label for="${id}">${esc(c.label)}${opcional(c)}
          <textarea id="${id}" name="${nombre(c.entry)}" rows="3"${req}${cambio}${desc}></textarea>
          ${ayuda(c.ayuda, `${id}-ayuda`)}</label></div>`;
    case 'fecha':
      return `<div class="form-row"><label for="${id}">${esc(c.label)}${opcional(c)}
          <input type="date" id="${id}" name="${nombre(c.entry)}"${req} data-fecha /></label></div>`;
    case 'mes':
      return `<div class="form-row"><label for="${id}">${esc(c.label)}
          <select id="${id}" name="${nombre(c.entry)}"${req}><option value="">Elegid el mes</option>${c.ops.map((m) => `<option>${esc(m)}</option>`).join('')}</select></label></div>`;
    case 'radio': case 'casillas': {
      const tipo = c.tipo === 'radio' ? 'radio' : 'checkbox';
      if (c.sinTitulo && c.ops.length === 1) {
        return `<label class="form-check gform__check"><input type="checkbox" name="${nombre(c.entry)}" value="${esc(c.ops[0][0])}"${req}${cambio} /><span>${esc(c.ops[0][1])}</span></label>`;
      }
      const grupo = c.req && tipo === 'checkbox' ? ' data-req-grupo' : '';
      return `<fieldset class="gform__grupo"${grupo}><legend>${esc(c.label)}${opcional(c)}</legend>
          <div class="opciones">${c.ops.map(([v, t], i) => `<label class="opcion"><input type="${tipo}" name="${nombre(c.entry)}" value="${esc(v)}"${tipo === 'radio' && c.req && i === 0 ? ' required' : ''}${cambio} /><span>${esc(t)}</span></label>`).join('')}</div>
          ${ayuda(c.ayuda)}</fieldset>`;
    }
    case 'altabaja': {
      const ab = [['', 'Sin cambios'], ['ALTA', 'Alta'], ['BAJA', 'Baja']];
      let extra = '';
      if (c.extra && c.extra.tipo === 'radio') {
        extra = `<label class="actividad__extra" for="${id}-h">${esc(c.extra.label)}
            <select id="${id}-h" name="${nombre(c.entry)}" data-horario><option value="">Elegid el horario</option>${c.extra.ops.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join('')}</select></label>`;
      } else if (c.extra) {
        extra = `<fieldset class="actividad__extra"><legend>${esc(c.extra.label)}</legend><div class="opciones">${c.extra.ops.map(([v, t]) => `<label class="opcion"><input type="checkbox" name="${nombre(c.entry)}" value="${esc(v)}" /><span>${esc(t)}</span></label>`).join('')}</div></fieldset>`;
      }
      if (c.detalle) {
        extra += `<label class="actividad__extra" for="${id}-d">${esc(c.detalle.label)}
            <textarea id="${id}-d" name="${nombre(c.detalle.entry)}" rows="2"></textarea>${ayuda(c.detalle.ayuda)}</label>`;
      }
      return `<fieldset class="actividad">
          <legend><span class="actividad__nombre">${esc(c.nombre)}</span>${c.horario ? `<span class="actividad__horario">${esc(c.horario)}</span>` : ''}</legend>
          <div class="segmento" role="radiogroup" aria-label="${esc(c.nombre)}">${ab.map(([v, t]) => `<label><input type="radio" name="${nombre(c.entry)}" value="${v}"${v ? ' data-cambio' : ' checked'} /><span>${t}</span></label>`).join('')}</div>
          ${extra}</fieldset>`;
    }
    case 'oferta': {
      const cuerpo = c.ops
        ? `<div class="opciones">${c.ops.map(([v, t]) => `<label class="opcion"><input type="checkbox" name="${nombre(c.entry)}" value="${esc(v)}" data-cambio /><span>${esc(t)}</span></label>`).join('')}</div>`
        : `<label for="${id}">${esc(c.label)}<input type="text" id="${id}" name="${nombre(c.entry)}" placeholder=" " data-cambio /></label>`;
      return `<fieldset class="oferta"><legend><span class="oferta__nombre">${esc(c.nombre)}</span><span class="oferta__precio">${esc(c.precio)}</span></legend>${cuerpo}</fieldset>`;
    }
    case 'rejilla':
      return `<fieldset class="gform__grupo rejilla"><legend class="sr-only">${esc(c.label)}</legend>
          ${c.filas.map(([e, dia]) => `<div class="rejilla__fila" role="group" aria-label="${esc(dia)}"><span class="rejilla__dia" aria-hidden="true">${esc(dia)}</span><div class="opciones">${c.cols.map((col) => `<label class="opcion"><input type="checkbox" name="${nombre(e)}" value="${esc(col)}" /><span>${esc(col)}<span class="sr-only"> del ${esc(dia.toLowerCase())}</span></span></label>`).join('')}</div></div>`).join('\n          ')}
        </fieldset>`;
    default:
      throw new Error('Tipo de campo desconocido: ' + c.tipo);
  }
}

// Las secciones con «plegar: true» van en un desplegable cerrado: el
// formulario de altas y bajas medía diez pantallas en el móvil.
function campos(f) {
  const out = [];
  let abierto = false;
  f.campos.forEach((c, i) => {
    if (c.tipo === 'seccion') {
      if (abierto) { out.push('</div></details>'); abierto = false; }
      if (c.plegar) {
        out.push(`<details class="pliegue gform__pliegue"><summary class="pliegue__cab"><h3>${esc(c.titulo)}</h3><span class="gform__cuenta" data-cuenta hidden></span><i class="bi bi-chevron-down pliegue__ico" aria-hidden="true"></i></summary><div class="pliegue__cuerpo">${c.ayuda ? `<p class="form-ayuda">${esc(c.ayuda)}</p>` : ''}`);
        abierto = true;
        return;
      }
    }
    out.push(campo(f, c, i));
  });
  if (abierto) out.push('</div></details>');
  return out.join('\n          ');
}

function formulario(f) {
  return `
  <section class="section">
    <div class="container gform-wrap">
      <div class="gform-lado">
        <p class="gform-lado__intro">${esc(f.intro)}</p>
        ${f.plazo ? `<p class="formulario__plazo"><i class="bi bi-clock" aria-hidden="true"></i> ${esc(f.plazo)}</p>` : ''}
        <ul class="gform-lado__pasos">
          <li><i class="bi bi-1-circle" aria-hidden="true"></i> Rellenáis el formulario.</li>
          <li><i class="bi bi-2-circle" aria-hidden="true"></i> Llega a secretaría al momento.</li>
          <li><i class="bi bi-3-circle" aria-hidden="true"></i> Os contestamos por teléfono o por correo.</li>
        </ul>
        <p class="gform-lado__alt">¿Alguna duda? Llamad al <a href="tel:+34914719959">91&nbsp;471&nbsp;99&nbsp;59</a> o escribid a <a href="mailto:secretaria@colegionsdolores.es">secretaria@colegionsdolores.es</a>.</p>
      </div>
      <form class="form-card gform" action="${accion(f)}" method="POST" data-gform data-form-id="${f.id}" data-huella="${f.huella}" data-al-menos="${esc(f.alMenos.selector)}" data-al-menos-msg="${esc(f.alMenos.mensaje)}" data-original="${esc(f.corto)}" novalidate>
        <input type="hidden" name="fvv" value="1" />
        <input type="hidden" name="pageHistory" value="0" />
        <div class="form-card__header">
          <span class="form-card__header-ico"><i class="bi ${f.icono}" aria-hidden="true"></i></span>
          <div class="form-card__header-text">
            <h2 class="h3-like">${esc(f.titulo)}</h2>
            <p class="form-card__header-sub">Llega directamente a secretaría</p>
          </div>
        </div>
        <div class="form-body" data-gform-cuerpo>
          <div data-gform-campos>
          ${campos(f)}
          </div>
          <div class="aviso-datos">
            <p class="aviso-datos__titulo">Información básica sobre protección de datos</p>
            <dl>
              <div><dt>Responsable</dt><dd>Colegio Ntra. Sra. de los Dolores, S.L.</dd></div>
              <div><dt>Finalidad</dt><dd>Tramitar esta solicitud y comunicarnos con vosotros sobre ella.</dd></div>
              <div><dt>Legitimación</dt><dd>La relación educativa con el centro y, en lo que no sea necesario para ella, vuestro consentimiento.</dd></div>
              <div><dt>Destinatarios</dt><dd>Las respuestas se guardan en Google Forms (Google, adherida al Marco de Privacidad de Datos UE-EE. UU.). No se ceden a terceros salvo obligación legal.</dd></div>
              <div><dt>Derechos</dt><dd>Acceso, rectificación, supresión y los demás, en <a href="mailto:secretaria@colegionsdolores.es">secretaria@colegionsdolores.es</a>. Más información en la <a href="/privacidad">política de privacidad</a>.</dd></div>
            </dl>
          </div>
          <p class="gform__error" role="alert" data-gform-error hidden></p>
          <button type="submit" class="btn btn--primary btn--block">Enviar a secretaría</button>
          <p class="gform__alt">¿No funciona? <a href="${esc(f.corto)}" target="_blank" rel="noopener noreferrer">Abrid este formulario en Google Forms</a>.</p>
        </div>
        <div class="gform__exito" data-gform-exito tabindex="-1" hidden>
          <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
          <h3>Solicitud enviada</h3>
          <p>Ya la tiene secretaría. Si hace falta algo más, os llamamos o escribimos.</p>
          <button type="button" class="btn btn--ghost" data-gform-otra>Enviar otra</button>
        </div>
      </form>
    </div>
  </section>`;
}

for (const f of FORMULARIOS) {
  const ruta = `/familias/formularios/${f.slug}`;
  const migas = [['Inicio', '/'], ['Secretaría Virtual', '/familias'], ['Formularios', '/familias/formularios'], [f.titulo, ruta]];
  const html = pagina({
    titulo: `${f.titulo} · Colegio NSD`,
    descripcion: `${f.titulo} en el Colegio NSD: ${f.resumen} Se envía en línea a secretaría.`.slice(0, 300),
    ruta, seccion: 'familias', css: ['secciones.css', 'informacion.css'],
    hero: { migas, h1: f.titulo, intro: f.resumen, meta: [['bi-send-check', 'En línea'], ['bi-clock', 'Unos 3 minutos']] },
    cuerpo: formulario(f),
    scripts: ['/assets/js/cms-config.js', '/assets/js/gform-esquema.js', '/assets/js/formularios-google.js'],
    jsonld: migasJsonLd ? migasJsonLd(migas) : undefined,
  });
  fs.writeFileSync(path.join(DIR, `${f.slug}.html`), html);
}

// Tarjetas en /familias/formularios, entre las marcas.
const hub = path.join(RAIZ, 'familias/formularios.html');
const tarjetas = `<!-- formularios:inicio (generado por scripts/generar-formularios.mjs) -->
      <ul class="formularios">
        ${FORMULARIOS.map((f) => `<li><article class="formulario">
          <span class="formulario__ico"><i class="bi ${f.icono}" aria-hidden="true"></i></span>
          <h3>${esc(f.titulo)}</h3>
          <p>${esc(f.resumen)}</p>
          ${f.plazo ? `<p class="formulario__plazo">${esc(f.plazo)}</p>` : ''}
          <a class="btn btn--primary btn--sm" href="/familias/formularios/${f.slug}">Rellenar<span class="sr-only"> ${esc(f.titulo)}</span></a>
        </article></li>`).join('\n        ')}
      </ul>
      <!-- formularios:fin -->`;
let h = fs.readFileSync(hub, 'utf8');
const re = /<!-- formularios:inicio[\s\S]*?<!-- formularios:fin -->/;
if (!re.test(h)) throw new Error('Faltan las marcas <!-- formularios:inicio --> en familias/formularios.html');
fs.writeFileSync(hub, h.replace(re, tarjetas));

console.log(`Formularios generados: ${FORMULARIOS.map((f) => f.slug).join(', ')}`);
