// Cabecera y esqueleto comunes de las páginas interiores del colegio.
// Lo usan los generadores de scripts/ para que las páginas nuevas
// tengan exactamente las mismas etiquetas que las que ya existen.
export const BASE = 'https://colegio-nsd.vercel.app';

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * @param {object} p
 *  titulo, descripcion, ruta ('/centro/departamentos/x'), seccion (data-page),
 *  css: hojas extra ['secciones.css'], noindex: bool,
 *  hero: { migas: [[texto, url]...], h1, intro, meta: [[icono, texto]] } | null,
 *  cuerpo: HTML del <main> (sin el hero), scripts: ['/assets/js/x.js'], jsonld: objeto
 */
export function pagina(p) {
  const url = BASE + (p.ruta === '/' ? '/' : p.ruta);
  const css = ['styles.css', 'animations.css', 'pages.css', ...(p.css || []), 'nsd-apple.css'];
  const migas = p.hero && p.hero.migas ? p.hero.migas.map(([t, u], i, a) =>
    i === a.length - 1 ? `<span>${esc(t)}</span>` : `<a href="${esc(u)}">${esc(t)}</a> <i class="bi bi-chevron-right" aria-hidden="true"></i>`).join('\n          ') : '';
  const hero = p.hero ? `
  <section class="page-hero">
    <div class="container page-hero__inner">
      <div>
        <nav class="crumbs" aria-label="Migas de pan">
          ${migas}
        </nav>
        <h1>${esc(p.hero.h1)}</h1>
        ${p.hero.intro ? `<p>${esc(p.hero.intro)}</p>` : ''}
      </div>
      ${p.hero.meta && p.hero.meta.length ? `<div class="page-hero__meta">
        ${p.hero.meta.map(([ico, t]) => `<span class="meta"><i class="bi ${ico}" aria-hidden="true"></i> ${esc(t)}</span>`).join('\n        ')}
      </div>` : ''}
    </div>
  </section>` : '';
  const scripts = ['/assets/js/partials.js', '/assets/js/nsd-arriba.js', ...(p.scripts || [])];
  return `<!doctype html>
<html lang="es" data-page="${esc(p.seccion || '')}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <script src="/assets/js/theme-init.js"></script>
  <title>${esc(p.titulo)}</title>
  <meta name="description" content="${esc(p.descripcion)}" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta name="theme-color" content="#1FA42C" />
${p.noindex ? '  <meta name="robots" content="noindex, nofollow" />\n' : ''}  <link rel="canonical" href="${esc(url)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(p.titulo)}" />
  <meta property="og:description" content="${esc(p.descripcion)}" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:image" content="${BASE}/assets/img/og-cover.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Colegio NSD" />
  <meta property="og:locale" content="es_ES" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(p.titulo)}" />
  <meta name="twitter:description" content="${esc(p.descripcion)}" />
  <link rel="icon" type="image/png" href="/assets/img/logo.png" />
  <link rel="preload" href="/assets/vendor/fuentes/outfit-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/vendor/fuentes/fraunces-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/assets/vendor/fuentes/fuentes.css" />
  <link rel="stylesheet" href="/assets/vendor/bootstrap-icons/iconos-nsd.css" />
${css.map((c) => `  <link rel="stylesheet" href="/assets/css/${c}" />`).join('\n')}
${p.jsonld ? `  <script type="application/ld+json">\n${JSON.stringify(p.jsonld, null, 2)}\n  </script>\n` : ''}</head>
<body id="top">
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <div id="site-header"></div>

  <main id="contenido">
${hero}
${p.cuerpo}
  </main>

  <div id="site-footer"></div>
${scripts.map((s) => `  <script src="${s}" defer></script>`).join('\n')}
</body>
</html>
`;
}

export function migasJsonLd(migas) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: migas.map(([t, u], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: BASE + u }))
  };
}
