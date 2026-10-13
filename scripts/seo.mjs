// scripts/seo.mjs — Pasada SEO idempotente sobre el árbol ya construido.
// Uso: node scripts/seo.mjs <raiz> <https://www.dominio>
// Añade BreadcrumbList + WebPage (JSON-LD) donde falte, ajusta descripciones largas
// y regenera el sitemap con todas las páginas indexables.
import fs from 'node:fs'; import path from 'node:path';
const raiz = path.resolve(process.argv[2] || '.');
const base = (process.argv[3] || 'https://www.colegionsdolores.es').replace(/\/$/, '');
const SALTAR = new Set(['node_modules', 'dist', 'docs', 'supabase', 'material-sin-procesar', '_astro', 'scripts', 'assets']);
const tipoPagina = (rel) => /^contacto/.test(rel) ? 'ContactPage' : /^(admision|centro\/sobre-nosotros)/.test(rel) ? (rel.startsWith('admision') ? 'WebPage' : 'AboutPage') : /^blog\/[^i]/.test(rel) ? 'Article' : /^familias\/formularios\//.test(rel) ? 'WebPage' : 'WebPage';
function* html(d, rel = '') { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name.startsWith('.') || SALTAR.has(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) yield* html(p, rel + e.name + '/'); else if (e.name.endsWith('.html')) yield [p, rel + e.name]; } }
const limpia = (t) => t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const url = (rel) => { const r = rel.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, ''); return base + '/' + r; };
const corta = (d, max = 158) => { if (d.length <= max) return d; const c = d.slice(0, max + 1); const punto = Math.max(c.lastIndexOf('. '), c.lastIndexOf('; ')); if (punto > 90) return c.slice(0, punto + 1); return c.slice(0, c.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…'; };
const cambios = { ld: 0, desc: 0 }; const indexables = [];
for (const [p, rel] of html(raiz)) {
  let s = fs.readFileSync(p, 'utf8'); const orig = s;
  s = s.replace(/  <script type="application\/ld\+json">\{"@context":"https:\/\/schema.org","@graph":\[\{"@type":"[A-Za-z]+","@id":"[^"]*#pagina"[^\n]*<\/script>\n/, '');
  // enlazar la ficha del colegio de la portada
  if (rel === 'index.html') s = s.replace(/"@type": "School",\n(\s+)"name"/, `"@type": "School",\n$1"@id": "${base}/#colegio",\n$1"name"`);
  if (!/<title>/.test(s)) continue;
  const noindex = /name="robots" content="[^"]*noindex/i.test(s);
  if (!noindex) indexables.push(rel);
  // descripciones largas
  s = s.replace(/<meta name="description" content="([^"]*)"/, (m, d) => { const dd = d.replace(/&amp;/g, '&'); if (dd.length <= 160) return m; const n = corta(dd).replace(/&/g, '&amp;'); cambios.desc++; return `<meta name="description" content="${n}"`; });
  // JSON-LD
  if (!noindex && !/application\/ld\+json/.test(s)) {
    const titulo = limpia((s.match(/<title>(.*?)<\/title>/s) || [])[1] || '').replace(/\s*·\s*Colegio NSD$/, '');
    const desc = ((s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/&amp;/g, '&');
    const nav = (s.match(/<nav class="crumbs"[^>]*>(.*?)<\/nav>/s) || [])[1] || '';
    const items = []; const re = /<a href="([^"]+)"[^>]*>(.*?)<\/a>|<span[^>]*>(.*?)<\/span>/gs; let m;
    while ((m = re.exec(nav))) { if (m[1]) items.push({ name: limpia(m[2]), item: m[1].startsWith('http') ? m[1] : base + m[1] }); else if (m[3] && limpia(m[3])) items.push({ name: limpia(m[3]), item: url(rel) }); }
    if (!items.length || items[0].name !== 'Inicio') items.unshift({ name: 'Inicio', item: base + '/' });
    const grafo = [{ '@type': tipoPagina(rel), '@id': url(rel) + '#pagina', url: url(rel), name: titulo, description: desc, inLanguage: 'es-ES', isPartOf: { '@type': 'WebSite', '@id': base + '/#web', url: base + '/', name: 'Colegio NSD' }, about: { '@type': 'School', '@id': base + '/#colegio', name: 'Colegio Nuestra Señora de los Dolores' }, breadcrumb: { '@id': url(rel) + '#migas' } },
      { '@type': 'BreadcrumbList', '@id': url(rel) + '#migas', itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: x.item })) }];
    const ld = `  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo })}</script>\n`;
    s = s.replace('</head>', ld + '</head>'); cambios.ld++;
  }
  if (s !== orig) fs.writeFileSync(p, s);
}
// sitemap
const hoy = new Date().toISOString().slice(0, 10);
const prio = (r) => r === 'index.html' ? '1.0' : /^(admision|contacto|etapas\/|familias\/index|servicios\/index)/.test(r) ? '0.8' : /^blog\/./.test(r) ? '0.6' : '0.7';
const lista = indexables.filter((r) => !/^(googlea|pdf-|blog\/entrada|centro\/persona)/.test(r)).sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` + lista.map((r) => `  <url><loc>${url(r)}</loc><lastmod>${hoy}</lastmod><priority>${prio(r)}</priority></url>`).join('\n') + `\n</urlset>\n`;
fs.writeFileSync(path.join(raiz, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(raiz, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
console.log(JSON.stringify({ ...cambios, sitemap: lista.length }));
