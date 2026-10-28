// Regenera la parte estática de servicios/extraescolares.html a partir de
// assets/js/extraescolares-datos.js: el catálogo que se ve sin JavaScript
// (#simLista), el horario semanal y los recuentos de actividades.
//   node scripts/generar-extraescolares.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
createRequire(import.meta.url)(path.join(RAIZ, 'assets/js/extraescolares-datos.js'));
const { ETAPAS, TIPOS, TARIFAS, ACTIVIDADES } = globalThis.NSD_EXTRA;

const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dias = (d) => d.length === 5 ? 'L a V' : d.join(' y ');
const opcion = (op) => op.map((fr) => `${dias(fr.dias)} ${fr.ini}–${fr.fin}`).join(', ');
const textoHorarios = (a) => Object.keys(ETAPAS).filter((e) => a.horarios[e])
  .map((e) => `${ETAPAS[e].nombre}: ${a.horarios[e].map(opcion).join(' o ')}`).join(' · ');
const precio = (a) => a.tarifa === 'consultar' ? 'Precio en secretaría' : `${TARIFAS[a.tarifa]} €/mes`;

// ── Catálogo sin JavaScript ─────────────────────────────────────────────
const I = (n) => ' '.repeat(n);
let lista = '';
for (const [tipo, t] of Object.entries(TIPOS)) {
  const acts = ACTIVIDADES.filter((a) => a.tipo === tipo);
  if (!acts.length) continue;
  lista += `\n${I(10)}<section class="sim-grupo">\n${I(12)}<h3 class="sim-grupo__titulo"><i class="bi ${t.icono}" aria-hidden="true"></i> ${esc(t.nombre)}</h3>\n${I(12)}<div class="sim-grupo__lista">`;
  for (const a of acts) {
    lista += `\n${I(14)}<article class="act${a.destacada ? ' act--dragons' : ''}">\n${I(16)}<div class="act__cab"><div class="act__titulo"><h4>${esc(a.nombre)}</h4><span class="act__precio">${precio(a)}</span></div></div>\n${I(16)}<p>${esc(a.resumen)}</p>\n${I(16)}<p class="act__hora"><i class="bi bi-clock" aria-hidden="true"></i> ${esc(textoHorarios(a))}</p>\n${I(14)}</article>`;
  }
  lista += `\n${I(12)}</div>\n${I(10)}</section>`;
}

// ── Horario semanal ─────────────────────────────────────────────────────
const DIAS = ['L', 'M', 'X', 'J', 'V'];
const min = (h) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
const celdas = new Map(); // ini -> dia -> Map(id -> Set(etapa))
for (const a of ACTIVIDADES) for (const [e, ops] of Object.entries(a.horarios)) for (const op of ops) for (const fr of op) for (const d of fr.dias) {
  if (!celdas.has(fr.ini)) celdas.set(fr.ini, new Map());
  const fila = celdas.get(fr.ini);
  if (!fila.has(d)) fila.set(d, new Map());
  const c = fila.get(d);
  if (!c.has(a.id)) c.set(a.id, new Set());
  c.get(a.id).add(e);
}
const etiquetaEtapas = (set) => {
  const out = [];
  if (set.has('inf')) out.push('Inf');
  if (set.has('pri1') && set.has('pri2')) out.push('Primaria');
  else if (set.has('pri1')) out.push('1.º–3.º');
  else if (set.has('pri2')) out.push('4.º–6.º');
  if (set.has('eso')) out.push('ESO');
  return out.join(', ');
};
const filas = [...celdas.keys()].sort((a, b) => min(a) - min(b)).map((ini) => {
  const fila = celdas.get(ini);
  const tds = DIAS.map((d) => {
    const c = fila.get(d);
    if (!c) return '<td class="is-vacia"><span class="sr-only">Sin actividades</span></td>';
    const items = ACTIVIDADES.filter((a) => c.has(a.id)).map((a) => `<li><strong>${esc(a.corto)}</strong> <span>${etiquetaEtapas(c.get(a.id))}</span></li>`);
    return `<td><ul>${items.join('')}</ul></td>`;
  }).join('');
  return `<tr><th scope="row">${ini}</th>${tds}</tr>`;
}).join('');

// ── Escribir ────────────────────────────────────────────────────────────
const NUM = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince'];
const n = ACTIVIDADES.length;
const Num = NUM[n][0].toUpperCase() + NUM[n].slice(1);
const ruta = path.join(RAIZ, 'servicios/extraescolares.html');
let html = fs.readFileSync(ruta, 'utf8');
const crlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');
const antes = html;
html = html.replace(/(<div id="simLista">)[\s\S]*?(\n {10}<\/div>\n {8}<\/div>\n\s*<aside)/, `$1${lista}$2`);
html = html.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${filas}</tbody>`);
html = html.replace(/\b\d+ actividades( por tipo| · )/g, `${n} actividades$1`);
html = html.replace(/<p>[A-ZÁÉÍÓÚ][a-záéíóú]+ actividades de octubre a mayo/, `<p>${Num} actividades de octubre a mayo`);
if (html === antes) console.log('Sin cambios.');
fs.writeFileSync(ruta, crlf ? html.replace(/\n/g, '\r\n') : html);
console.log(`extraescolares.html: ${n} actividades, ${celdas.size} franjas en el horario.`);
