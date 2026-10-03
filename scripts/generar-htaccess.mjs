#!/usr/bin/env node
/*
 * Genera .htaccess (Apache / LiteSpeed, p. ej. Hostinger) a partir de
 * vercel.json, para que las dos configuraciones no se separen nunca.
 *
 *   node scripts/generar-htaccess.mjs
 *
 * Traduce: URLs limpias (sin .html y sin barra final), redirecciones
 * (incluidas las de la web antigua de Joomla), cabeceras de seguridad,
 * caché, la página 404 y el bloqueo de los archivos internos del
 * repositorio (docs/, supabase/, scripts/…), que en Hostinger se suben
 * con el despliegue por Git aunque no formen parte de la web.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(RAIZ, 'vercel.json'), 'utf8'));

/* Carpetas y archivos del repositorio que no son web. */
const CARPETAS_INTERNAS = ['docs', 'supabase', 'scripts', 'material-sin-procesar', 'baloncesto-nsd', 'node_modules', '.git', '.vercel', '.vscode', '.claude'];
const ARCHIVOS_INTERNOS = '(vercel|quotes-state)\\.json|[^/]+\\.(md|ps1|sh|mjs)|\\.(gitignore|vercelignore|htaccess)';

const esc = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

/* Convierte un patrón de Vercel (/:prefijo+/slug, /:ruta*) en regex de
   RewriteRule (sin la barra inicial) y su destino con $1, $2… */
function traducir(origen, destino) {
  const nombres = [];
  let re = '';
  const trozos = origen.replace(/^\//, '').split('/');
  trozos.forEach((t, i) => {
    const sep = i ? '/' : '';
    const m = t.match(/^:(\w+)([+*]?)$/);
    if (!m) { re += sep + esc(t); return; }
    nombres.push(m[1]);
    if (m[2] === '+') re += sep + '(.+)';
    else if (m[2] === '*') re += i ? '(?:/(.*))?' : '(.*)';
    else re += sep + '([^/]+)';
  });
  let dest = destino;
  nombres.forEach((n, i) => {
    dest = dest.replace(new RegExp(':' + n + '\\*?', 'g'), '$' + (i + 1));
  });
  // En el destino, '?' abre la query y '#' es ancla: el flag NE evita que se escapen.
  return { re: '^' + re + '/?$', dest };
}

/* Las redirecciones de dominio (sin www -> www) van antes que el paso a
   HTTPS para hacerlo en un solo salto. */
function hostRedirects() {
  const out = [];
  for (const r of cfg.redirects || []) {
    if (!(r.has || []).some((h) => h.type === 'host')) continue;
    out.push('# Dominio sin www -> www, en un solo salto.');
    for (const h of r.has) out.push(`RewriteCond %{HTTP_HOST} ^${esc(h.value)}$ [NC]`);
    const { re, dest } = traducir(r.source, r.destination);
    out.push(`RewriteRule ${re} ${dest} [R=${r.permanent ? 301 : 302},L,NE]`, '');
  }
  return out;
}

const L = [];
const p = (...x) => L.push(...x);

p('# ---------------------------------------------------------------',
  '# GENERADO por scripts/generar-htaccess.mjs a partir de vercel.json.',
  '# No editar a mano: cambia vercel.json y vuelve a generarlo.',
  '# ---------------------------------------------------------------',
  '',
  'Options -Indexes -MultiViews',
  'DirectoryIndex index.html',
  'DirectorySlash Off',
  'ErrorDocument 404 /404.html',
  '',
  '<IfModule mod_mime.c>',
  '  AddType application/manifest+json .webmanifest',
  '  AddType image/avif .avif',
  '  AddType image/webp .webp',
  '  AddType font/woff2 .woff2',
  '  AddDefaultCharset utf-8',
  '  AddCharset utf-8 .html .css .js .json .xml .txt .webmanifest',
  '</IfModule>',
  '',
  'RewriteEngine On',
  'RewriteBase /',
  '',
  '# 1. Archivos internos del repositorio: no existen para el público.',
  `RewriteRule ^(${CARPETAS_INTERNAS.map(esc).join('|')})(/|$) - [R=404,L]`,
  `RewriteRule ^(${ARCHIVOS_INTERNOS})$ - [R=404,L]`,
  '',
  ...hostRedirects(),
  '# 2. HTTPS siempre (detrás del proxy de Hostinger también).',
  'RewriteCond %{HTTPS} !=on',
  'RewriteCond %{HTTP:X-Forwarded-Proto} !=https',
  'RewriteCond %{HTTP_HOST} !^(localhost|127\\.0\\.0\\.1)(:\\d+)?$',
  'RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L,NE]',
  '');

p('# 3. Redirecciones (las mismas que en vercel.json).');
for (const r of cfg.redirects || []) {
  if ((r.has || []).some((h) => h.type === 'host')) continue;
  const code = r.permanent ? 301 : 302;
  const conds = [];
  let qsd = '';
  for (const h of r.has || []) {
    if (h.type === 'host') conds.push(`RewriteCond %{HTTP_HOST} ^${esc(h.value)}$ [NC]`);
    else if (h.type === 'query') { conds.push(`RewriteCond %{QUERY_STRING} (^|&)${esc(h.key)}=`); qsd = ',QSD'; }
    else throw new Error('Condición "has" no soportada: ' + h.type);
  }
  const { re, dest } = traducir(r.source, r.destination);
  p(...conds, `RewriteRule ${re} ${dest} [R=${code},L,NE${qsd}]`);
}
p('');

if (cfg.cleanUrls) {
  p('# 4. URLs limpias: /pagina.html -> /pagina y /pagina/index -> /pagina',
    'RewriteCond %{THE_REQUEST} \\s/+(?:([^?\\s]*?)/)?index\\.html[\\s?]',
    'RewriteRule ^ /%1 [R=301,L,NE]',
    '# (menos el archivo de verificación de Google, que debe responder tal cual)',
    'RewriteCond %{REQUEST_URI} !^/google[0-9a-f]+\\.html$',
    'RewriteCond %{THE_REQUEST} \\s/+([^?\\s]+?)\\.html[\\s?]',
    'RewriteRule ^ /%1 [R=301,L,NE]');
}
if (cfg.trailingSlash === false) {
  p('# Sin barra final (salvo la raíz).',
    'RewriteCond %{REQUEST_URI} ^/(.+)/$',
    'RewriteRule ^ /%1 [R=301,L,NE]');
}
p('# /pagina sirve pagina.html; /carpeta sirve carpeta/index.html.',
  'RewriteCond %{REQUEST_FILENAME}.html -f',
  'RewriteRule ^(.+)$ $1.html [L]',
  'RewriteCond %{REQUEST_FILENAME} -d',
  'RewriteCond %{REQUEST_FILENAME}/index.html -f',
  'RewriteRule ^(.+)$ $1/index.html [L]',
  '');

/* Cabeceras. */
const global = (cfg.headers || []).find((h) => h.source === '/(.*)');
p('# 5. Cabeceras de seguridad (todas las respuestas).', '<IfModule mod_headers.c>');
for (const h of global ? global.headers : []) {
  p(`  Header always set ${h.key} "${h.value.replace(/"/g, '\\"')}"`);
}
p('',
  '  # Caché: HTML, CSS y JS se revalidan siempre (se publican sin hash).',
  '  <FilesMatch "\\.(html|css|js)$">',
  '    Header set Cache-Control "public, max-age=0, must-revalidate"',
  '  </FilesMatch>',
  '  # Fuentes: no cambian de nombre ni de contenido.',
  '  <FilesMatch "\\.woff2$">',
  '    Header set Cache-Control "public, max-age=31536000, immutable"',
  '  </FilesMatch>',
  '  # Panel y acceso: ni buscadores ni caché.',
  '  <FilesMatch "^(panel|acceso|nueva-clave)\\.html$">',
  '    Header set X-Robots-Tag "noindex, nofollow"',
  '    Header set Cache-Control "no-store"',
  '  </FilesMatch>',
  '</IfModule>',
  '',
  '<IfModule mod_deflate.c>',
  '  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json application/xml image/svg+xml application/manifest+json',
  '</IfModule>',
  '');

writeFileSync(join(RAIZ, '.htaccess'), L.join('\n'));

/* Las imágenes de assets/img llevan caché larga en Vercel: lo mismo aquí. */
const img = (cfg.headers || []).find((h) => h.source === '/assets/img/:path*');
if (img) {
  writeFileSync(join(RAIZ, 'assets/img/.htaccess'), [
    '# GENERADO por scripts/generar-htaccess.mjs (caché de imágenes).',
    '<IfModule mod_headers.c>',
    ...img.headers.map((h) => `  Header set ${h.key} "${h.value}"`),
    '</IfModule>', '',
  ].join('\n'));
}
console.log('.htaccess generado:', (cfg.redirects || []).length, 'redirecciones.');
