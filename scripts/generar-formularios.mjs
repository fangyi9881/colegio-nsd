// Actualiza las tarjetas de /familias/formularios a partir de la lista de
// formularios de secretaría (scripts/formularios-google.mjs).
//
//   node scripts/generar-formularios.mjs
//
// Cada tarjeta abre el formulario ORIGINAL de Google Forms en otra pestaña.
// No hay formularios propios en la web: las respuestas las recibe secretaría
// en Google igual que antes y la web no trata ningún dato de las familias.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc } from './plantilla.mjs';
import { FORMULARIOS } from './formularios-google.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hub = path.join(RAIZ, 'familias/formularios.html');

const tarjetas = `<!-- formularios:inicio (generado por scripts/generar-formularios.mjs) -->
      <ul class="formularios">
        ${FORMULARIOS.map((f) => `<li><article class="formulario">
          <span class="formulario__ico"><i class="bi ${f.icono}" aria-hidden="true"></i></span>
          <h3>${esc(f.titulo)}</h3>
          <p>${esc(f.resumen)}</p>
          ${f.plazo ? `<p class="formulario__plazo">${esc(f.plazo)}</p>` : ''}
          <a class="btn btn--primary btn--sm" href="${esc(f.corto)}" target="_blank" rel="noopener noreferrer">Abrir formulario<i class="bi bi-box-arrow-up-right" aria-hidden="true"></i><span class="sr-only"> ${esc(f.titulo)} (se abre en otra pestaña, en Google Forms)</span></a>
        </article></li>`).join('\n        ')}
      </ul>
      <!-- formularios:fin -->`;

const h = fs.readFileSync(hub, 'utf8');
const re = /<!-- formularios:inicio[\s\S]*?<!-- formularios:fin -->/;
if (!re.test(h)) throw new Error('Faltan las marcas <!-- formularios:inicio --> en familias/formularios.html');
fs.writeFileSync(hub, h.replace(re, tarjetas));
console.log(`Tarjetas actualizadas: ${FORMULARIOS.map((f) => f.slug).join(', ')}`);
