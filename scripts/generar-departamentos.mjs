// Genera una página por departamento o etapa en /centro/departamentos/<slug>.html
// a partir de assets/js/departamentos-datos.js y del esquema de campos.
//
//   node scripts/generar-departamentos.mjs
//
// Volver a ejecutarlo tras añadir o renombrar un departamento. El
// contenido que publique cada departamento desde el panel NO se guarda
// aquí: se lee en vivo desde la web, así que no hace falta regenerar
// cuando alguien edita su ficha.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { pagina, migasJsonLd, esc } from './plantilla.mjs';

const require = createRequire(import.meta.url);
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { DEPARTAMENTOS, GRUPOS, DIRECCION } = require(path.join(RAIZ, 'assets/js/departamentos-datos.js'));
const { ESQUEMAS } = require(path.join(RAIZ, 'assets/js/cms-esquema.js'));
const { htmlFicha, htmlOrganigrama } = require(path.join(RAIZ, 'assets/js/departamentos.js'));

const dir = path.join(RAIZ, 'centro/departamentos');
fs.mkdirSync(dir, { recursive: true });

const generadas = [];
for (const d of DEPARTAMENTOS) {
  const esquema = ESQUEMAS[d.esquema];
  if (!esquema) throw new Error(`Esquema desconocido para ${d.id}: ${d.esquema}`);
  const grupo = GRUPOS.find((g) => g.id === d.grupo);
  const ruta = `/centro/departamentos/${d.slug}`;
  const migas = [['Inicio', '/'], ['El Centro', '/centro'], ['Departamentos', '/centro/departamentos'], [d.nombre, ruta]];
  const esEtapa = d.esquema === 'etapa';
  const html = pagina({
    titulo: `${d.nombre} · ${esEtapa ? 'Etapa' : 'Departamento'} · Colegio NSD`,
    descripcion: `${d.nombre} en el Colegio NSD (Carabanchel): objetivos, criterios de evaluación y calificación, programación didáctica y recursos. ${d.resumen}`.slice(0, 300),
    ruta, seccion: 'centro', css: ['secciones.css', 'informacion.css', 'personas.css'],
    hero: {
      migas, h1: d.nombre, intro: d.resumen,
      meta: [[grupo ? grupo.icono : 'bi-people', grupo ? grupo.titulo : d.grupo]]
    },
    jsonld: migasJsonLd(migas),
    cuerpo: `
  <section class="section">
    <div class="container">
      <div data-dep="${esc(d.id)}">
${htmlFicha(d, esquema, {}, {})}
      </div>
    </div>
  </section>`,
    scripts: ['/assets/js/cms-config.js', '/assets/js/cms.js', '/assets/js/cms-esquema.js', '/assets/js/departamentos-datos.js', '/assets/js/departamentos.js', '/assets/js/personas.js']
  });
  fs.writeFileSync(path.join(dir, `${d.slug}.html`), html);
  generadas.push(ruta);
}
console.log(`${generadas.length} páginas generadas en centro/departamentos/`);
fs.writeFileSync(path.join(RAIZ, 'scripts/.departamentos-rutas.json'), JSON.stringify(generadas, null, 2));

// ── Página índice: /centro/departamentos ──
const PEDAGOGICA = [
  ['bi-journal-text', 'Proyecto Educativo de Centro', 'PDF', '/assets/docs/proyecto-educativo-de-centro.pdf'],
  ['bi-heart', 'Ideario del centro', 'Carácter propio', '/centro/mision-valores#ideario'],
  ['bi-shield-check', 'Plan de Convivencia', 'PDF', '/assets/docs/plan-de-convivencia.pdf'],
  ['bi-book', 'Reglamento de Régimen Interior', 'PDF', '/assets/docs/reglamento-de-regimen-interior.pdf'],
  ['bi-bank', 'Decreto 32/2019, de convivencia', 'BOCM', 'https://www.bocm.es/boletin/CM_Orden_BOCM/2019/04/15/BOCM-20190415-1.PDF'],
  ['bi-person-badge', 'Ley 2/2010, de Autoridad del Profesor', 'PDF', '/assets/docs/ley-de-autoridad-del-profesor.pdf'],
  ['bi-collection', 'Normativa educativa', 'PDF', '/assets/docs/legislacion-educativa.pdf'],
  ['bi-laptop', '#CompDigEdu · Plan Digital de Centro', 'PDF', '/assets/docs/plan-digital-de-centro.pdf'],
  ['bi-hand-thumbs-up', 'Acoso escolar y protección de la infancia', 'Protocolos y contacto', '/proteccion-infancia'],
  ['bi-clipboard-check', 'Evaluación, promoción y reclamaciones', 'Por etapa', '/familias/evaluacion']
];
const migasIndice = [['Inicio', '/'], ['El Centro', '/centro'], ['Departamentos', '/centro/departamentos']];
const grupos = GRUPOS.map((g) => {
  const deps = DEPARTAMENTOS.filter((d) => d.grupo === g.id);
  return `
      <section class="deps-grupo" aria-labelledby="g-${esc(g.id.toLowerCase().replace(/[^a-z]+/g, '-'))}">
        <header class="deps-grupo__cab">
          <span class="deps-grupo__ico" aria-hidden="true"><i class="bi ${g.icono}"></i></span>
          <div><h2 id="g-${esc(g.id.toLowerCase().replace(/[^a-z]+/g, '-'))}">${esc(g.titulo)}</h2><p>${esc(g.texto)}</p></div>
        </header>
        <ul class="deps-lista">
          ${deps.map((d) => `<li class="deps-item" data-tono="${d.slug}"><a href="/centro/departamentos/${d.slug}">
            <span class="deps-item__ico" aria-hidden="true"><i class="bi ${d.icono}"></i></span>
            <span class="deps-item__nombre">${esc(d.nombre)}</span>
            <span class="deps-item__resumen">${esc(d.resumen)}</span>
          </a></li>`).join('\n          ')}
        </ul>
      </section>`;
}).join('\n');
const indice = pagina({
  titulo: 'Departamentos Didácticos · Colegio NSD Carabanchel',
  descripcion: 'Departamentos y etapas del Colegio NSD en Carabanchel: objetivos, criterios de evaluación y calificación y programaciones de Infantil, Primaria, cada materia de la ESO, Orientación y Bilingüismo.',
  ruta: '/centro/departamentos', seccion: 'centro', css: ['secciones.css', 'informacion.css'],
  hero: {
    migas: migasIndice, h1: 'Departamentos didácticos',
    intro: 'Cada etapa y cada departamento publica aquí sus objetivos, cómo evalúa y califica y su programación didáctica.',
    meta: [['bi-grid-3x3-gap', `${DEPARTAMENTOS.length} equipos docentes`], ['bi-clipboard-check', 'Criterios públicos']]
  },
  jsonld: migasJsonLd(migasIndice),
  cuerpo: `
  <section class="section">
    <div class="container">
${grupos}
    </div>
  </section>

  <section class="section section--soft" id="informacion-pedagogica" aria-labelledby="ped-titulo">
    <div class="container">
      <header class="section__head section__head--left">
        <span class="eyebrow">Documentos del centro</span>
        <h2 id="ped-titulo">Información pedagógica</h2>
        <p>Los documentos que organizan la vida del colegio. Están también en el <a href="/familias/documentacion">centro de documentación</a>, con buscador.</p>
      </header>
      <ul class="pedagogica">
        ${PEDAGOGICA.map(([ico, t, sub, u]) => `<li><a href="${esc(u)}"${/^https?:/.test(u) || /\.pdf$/.test(u) ? ' target="_blank" rel="noopener"' : ''}><i class="bi ${ico}" aria-hidden="true"></i><span>${esc(t)}<small>${esc(sub)}${/^https?:/.test(u) ? ' · se abre en otra pestaña' : ''}</small></span></a></li>`).join('\n        ')}
      </ul>
    </div>
  </section>`,
  scripts: []
});
fs.writeFileSync(path.join(dir, 'index.html'), indice);
console.log('Índice escrito en centro/departamentos/index.html');

// ── Organigrama: /centro/organigrama ──
const migasOrg = [['Inicio', '/'], ['El Centro', '/centro'], ['Organigrama', '/centro/organigrama']];
const totalPersonas = new Set([
  ...DIRECCION.direccion, ...DIRECCION.gestion, ...DIRECCION.otros
].map((x) => x.nombre).concat(DEPARTAMENTOS.flatMap((d) => ((d.defecto || {}).profesorado || []).map((l) => require(path.join(RAIZ, 'assets/js/departamentos.js')).persona(l).nombre)))).size;
const organigrama = pagina({
  titulo: 'Organigrama · Colegio NSD Carabanchel',
  descripcion: 'Organigrama del Colegio NSD: dirección, equipo de gestión, coordinaciones de etapa y programa, y el profesorado de cada departamento con su cargo.',
  ruta: '/centro/organigrama', seccion: 'centro', css: ['secciones.css', 'informacion.css', 'personas.css'],
  hero: {
    migas: migasOrg, h1: 'Organigrama',
    intro: 'Quién es quién en el colegio: la dirección, las coordinaciones y el equipo de cada etapa y departamento, con el cargo de cada persona.',
    meta: [['bi-people', `${totalPersonas} personas`], ['bi-diagram-3', `${DEPARTAMENTOS.length} equipos`]]
  },
  jsonld: migasJsonLd(migasOrg),
  cuerpo: `
  <section class="section">
    <div class="container" data-organigrama>
${htmlOrganigrama(DIRECCION, DEPARTAMENTOS, (d) => (d.defecto || {}).profesorado)}
    </div>
  </section>`,
  scripts: ['/assets/js/cms-config.js', '/assets/js/cms.js', '/assets/js/departamentos-datos.js', '/assets/js/departamentos.js', '/assets/js/personas.js']
});
fs.mkdirSync(path.join(RAIZ, 'centro'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'centro/organigrama.html'), organigrama);
console.log('Organigrama escrito en centro/organigrama.html');

// ── Ficha de una persona: /centro/persona?p=slug ──
const migasPersona = [['Inicio', '/'], ['El Centro', '/centro'], ['Organigrama', '/centro/organigrama'], ['Ficha', '/centro/persona']];
const persona = pagina({
  titulo: 'Ficha del equipo · Colegio NSD',
  descripcion: 'Ficha de una persona del equipo del Colegio NSD: cargos, presentación y formación.',
  ruta: '/centro/persona', seccion: 'centro', css: ['secciones.css', 'informacion.css', 'personas.css'],
  hero: { migas: migasPersona, h1: 'Ficha del equipo', intro: 'Quién es, qué hace en el colegio y cómo contactar.', meta: [] },
  jsonld: migasJsonLd(migasPersona),
  cuerpo: `
  <section class="section">
    <div class="container" data-persona-pagina>
      <p class="ficha-cargando">Cargando la ficha…</p>
      <noscript><p>Para ver la ficha hace falta JavaScript. Todo el equipo está en el <a href="/centro/organigrama">organigrama</a>.</p></noscript>
    </div>
  </section>`,
  scripts: ['/assets/js/cms-config.js', '/assets/js/cms.js', '/assets/js/departamentos-datos.js', '/assets/js/departamentos.js', '/assets/js/personas.js']
});
fs.writeFileSync(path.join(RAIZ, 'centro/persona.html'), persona);
console.log('Ficha escrita en centro/persona.html');
