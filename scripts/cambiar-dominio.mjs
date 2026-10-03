// Cambia la dirección de la web en todas las páginas cuando se haga el
// traspaso al dominio definitivo:
//
//   node scripts/cambiar-dominio.mjs https://www.colegionsdolores.es
//
// Toca: enlaces canónicos, og:url/og:image, sitemap, robots, enlaces de
// compartir del blog (también los codificados) y la plantilla de los
// generadores. Añade además la redirección de colegio-nsd.vercel.app al
// dominio nuevo, para que Google no vea dos webs iguales.
// Es idempotente: se puede ejecutar dos veces sin estropear nada.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIEJO = 'https://colegio-nsd.vercel.app';
const NUEVO = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(NUEVO)) {
  console.error('Uso: node scripts/cambiar-dominio.mjs https://www.colegionsdolores.es');
  process.exit(1);
}
const IGNORAR = new Set(['.git', 'node_modules', 'material-sin-procesar', 'baloncesto-nsd', 'assets/vendor', 'assets/docs', 'assets/img', 'images']);
const EXT = new Set(['.html', '.xml', '.txt', '.js', '.mjs', '.json', '.webmanifest']);
const pares = [[VIEJO, NUEVO], [encodeURIComponent(VIEJO), encodeURIComponent(NUEVO)], ['colegio-nsd.vercel.app', new URL(NUEVO).host]];
let archivos = 0, cambios = 0;

function recorrer(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    const rel = path.relative(RAIZ, abs).split(path.sep).join('/');
    if (IGNORAR.has(rel) || IGNORAR.has(e.name)) continue;
    if (e.isDirectory()) { recorrer(abs); continue; }
    if (!EXT.has(path.extname(e.name)) || rel === 'vercel.json' || rel === 'scripts/cambiar-dominio.mjs' || rel === 'TODO.md') continue;
    let s = fs.readFileSync(abs, 'utf8');
    let n = 0;
    for (const [a, b] of pares) { const partes = s.split(a); n += partes.length - 1; s = partes.join(b); }
    if (n) { fs.writeFileSync(abs, s); archivos++; cambios += n; }
  }
}
recorrer(RAIZ);

// Redirección del dominio de Vercel al nuevo
const vj = path.join(RAIZ, 'vercel.json');
const cfg = JSON.parse(fs.readFileSync(vj, 'utf8'));
const host = new URL(NUEVO).host;
if (!cfg.redirects.some((r) => r.has && r.has[0] && r.has[0].value === 'colegio-nsd.vercel.app')) {
  cfg.redirects.unshift({ source: '/:path*', has: [{ type: 'host', value: 'colegio-nsd.vercel.app' }], destination: `${NUEVO}/:path*`, permanent: true });
}
fs.writeFileSync(vj, JSON.stringify(cfg, null, 2) + '\n');
console.log(`${cambios} sustituciones en ${archivos} archivos. Dominio: ${host}`);
console.log('Revisa con git diff y publica.');
