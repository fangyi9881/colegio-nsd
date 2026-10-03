#!/usr/bin/env node
/*
 * Prepara la web para subirla a Hostinger.
 *
 *   node scripts/empaquetar-hostinger.mjs
 *
 * 1. Regenera .htaccess desde vercel.json.
 * 2. Crea dist/colegio-web.zip solo con los archivos de la web que están
 *    en git (sin docs/, supabase/, scripts/, notas ni herramientas).
 *
 * El zip se sube en hPanel (Administrador de archivos → public_html →
 * Subir y Extraer) o con el despliegue de Hostinger por API.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: RAIZ, encoding: 'utf8', maxBuffer: 1 << 26, ...opts });

run('node', ['scripts/generar-htaccess.mjs'], { stdio: 'inherit' });

const FUERA = [
  /^(docs|supabase|scripts|material-sin-procesar|baloncesto-nsd|node_modules|dist)\//,
  /^\.(git|vercel|vscode|claude)/,
  /^[^/]+\.(md|ps1|sh|mjs)$/,
  /^(vercel\.json|quotes-state\.json|\.gitignore|\.vercelignore|pdf-texto\.html|pdf-vista\.html)$/,
];

const enGit = run('git', ['ls-files', '-z']).split('\0').filter(Boolean);
const archivos = [...new Set([...enGit, '.htaccess', 'assets/img/.htaccess'])]
  .filter((f) => !FUERA.some((re) => re.test(f)))
  .filter((f) => existsSync(join(RAIZ, f)));

const DIST = join(RAIZ, 'dist');
const ZIP = join(DIST, 'colegio-web.zip');
mkdirSync(DIST, { recursive: true });
rmSync(ZIP, { force: true });
run('zip', ['-q', '-X', ZIP, '-@'], { input: archivos.join('\n') });

const obligatorios = ['index.html', '404.html', '.htaccess', 'assets/js/cms-config.js'];
const faltan = obligatorios.filter((f) => !archivos.includes(f));
if (faltan.length) throw new Error('Faltan en el paquete: ' + faltan.join(', '));

console.log(`dist/colegio-web.zip: ${archivos.length} archivos.`);
