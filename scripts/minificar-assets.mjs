// Minifica los CSS y JS propios de la copia que se va a publicar (no el
// código fuente). Se ejecuta DESPUÉS de versionar-assets.mjs y ANTES de
// empaquetar-hostinger.mjs:
//   node scripts/minificar-assets.mjs
// Necesita esbuild (npm i --no-save esbuild). Salta lo que ya viene
// minificado (*.min.*) y assets/vendor.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let antes = 0, despues = 0, n = 0;
async function recorre(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(RAIZ, p).replace(/\\/g, '/');
    if (e.isDirectory()) {
      if (/^(node_modules|\.git|docs|supabase|scripts|dist|assets\/vendor)$/.test(rel)) continue;
      await recorre(p);
    } else if (/^assets\/(css|js)\/[^/]+\.(css|js)$/.test(rel) && !/\.min\./.test(e.name)) {
      const src = fs.readFileSync(p, 'utf8');
      const loader = e.name.endsWith('.css') ? 'css' : 'js';
      const r = await transform(src, { loader, minify: true, legalComments: 'none', target: 'es2019' });
      antes += Buffer.byteLength(src); despues += Buffer.byteLength(r.code); n++;
      fs.writeFileSync(p, r.code);
    }
  }
}
await recorre(RAIZ);
console.log(`${n} archivos minificados: ${(antes / 1024).toFixed(0)} KB -> ${(despues / 1024).toFixed(0)} KB.`);
