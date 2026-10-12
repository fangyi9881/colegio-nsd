// Añade ?v=<versión> a los enlaces a /assets/css/*.css y /assets/js/*.js de todas las páginas.
// Los estilos y scripts se sirven con caché de 10 minutos y «stale-while-revalidate» de un día:
// sin esto, un móvil puede seguir con la copia anterior tras publicar. Se ejecuta DESPUÉS de
// cambiar-dominio.mjs y ANTES de empaquetar-hostinger.mjs, sobre la copia que se va a publicar
// (no se commitea el resultado).
//   node scripts/versionar-assets.mjs [versión]      (por defecto, la fecha y hora de hoy)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const v = process.argv[2] || new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
const IGNORAR = new Set(['node_modules', '.git', 'dist', 'supabase', 'docs', 'scripts']);
const RE = /((?:src|href)=")(\/assets\/(?:css|js)\/[A-Za-z0-9._\/-]+\.(?:css|js))(")/g;

let paginas = 0, cambios = 0;
(function recorre(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorre(p);
    else if (e.name.endsWith('.html')) {
      const s = fs.readFileSync(p, 'utf8');
      const n = s.replace(RE, (_, a, u, c) => { cambios++; return `${a}${u}?v=${v}${c}`; });
      if (n !== s) { fs.writeFileSync(p, n); paginas++; }
    }
  }
})(RAIZ);
console.log(`${cambios} enlaces versionados (v=${v}) en ${paginas} páginas.`);
