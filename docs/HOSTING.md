# Hosting del ecosistema NSD (estado a 13/10/2026)

| Web | Dominio | Dónde está |
|---|---|---|
| Colegio | https://www.colegionsdolores.es | Hostinger (`domains/colegionsdolores.es/public_html`) |
| Infantil | https://infantil.colegionsdolores.es | Hostinger (`public_html/infantil`) |
| Campamento | https://campamento.colegionsdolores.es | Hostinger (`public_html/campamento`) |
| colegionsdolores.com | Dominio añadido en Hostinger | Redirección 301 a https://www.colegionsdolores.es |
| Dolores Dragons | dolores-dragons.vercel.app | Vercel (a propósito) |
| Dragons Den | dragons-den-eight.vercel.app | Vercel (a propósito) |

Las únicas referencias que siguen apuntando a Vercel son los enlaces a Dolores Dragons y Dragons Den. Los formularios de contacto de infantil y campamento ya no existen (botones de llamar y escribir); los de secretaría del colegio van por la función `formularios` de Supabase.

Los dominios siguen registrados en Piensa con el DNS allí. El correo está en Google Workspace.

## Redirecciones
- `/etapas/infantil-0-3` y `/…/campamento-de-verano` del colegio llevan a los subdominios (`.htaccess` del colegio).
- `.htaccess` de cada sitio lo genera `scripts/generar-htaccess.mjs` a partir del `vercel.json` del colegio. Los `?v=` de CSS y JS llevan caché inmutable de un año; el HTML se revalida siempre.

## Cómo publicar
Hostinger no tiene SSH ni FTP cómodo en este plan; se publica por el administrador de archivos (API REST con el JWT de la sesión) o subiendo un zip y extrayéndolo.

- **Colegio**: construir en una copia, no en la carpeta de trabajo: `cambiar-dominio.mjs`, `versionar-assets.mjs`, `minificar-assets.mjs`, `generar-htaccess.mjs` y `seo.mjs <raiz> https://www.colegionsdolores.es`. Subir el resultado a `public_html`.
- **Infantil**: HTML estático. Ejecutar `node ../colegio/scripts/seo.mjs . https://infantil.colegionsdolores.es` y subir a `public_html/infantil`.
- **Campamento**: Astro. `npm run build` y subir `dist/` a `public_html/campamento` (`seo.mjs` sobre `dist` para sitemap y datos estructurados).
- Zips de apoyo en `_publicar/` (se pueden borrar tras publicar).

## SEO
`scripts/seo.mjs` es idempotente: recorta descripciones de más de 160 caracteres, añade JSON-LD (`WebPage`, `AboutPage`, `ContactPage`, `Article` y `BreadcrumbList`) a las páginas indexables sin él, y regenera `sitemap.xml` y `robots.txt`. `scripts/faq-ld.mjs <archivo>` añade `FAQPage` a páginas con bloques `<details><summary>`.

## Pendiente
- Search Console: reenviar los sitemaps de los tres sitios y revisar las páginas «Duplicada: Google eligió otra canónica».
- Velocidad (PageSpeed móvil): CSS que bloquea el render, unos 169 KB de CSS sin usar en `styles.css`, optimización de la imagen LCP y `font-display`.
- URLs antiguas de Joomla sin equivalencia (p. ej. `/index.php/mega/ep/pdep`): hace falta la lista de Search Console.
- DNS: subir el TTL a 3600 pasadas dos semanas.
- Cancelar los hostings de Piensa (.com 24/01/2027, .es 06/02/2027) tras confirmar con Piensa que se conserva la zona DNS.

## Publicar una versión (procedimiento probado el 14/10/2026)

1. `git archive HEAD` a una carpeta limpia y, en ella: `scripts/cambiar-dominio.mjs https://www.colegionsdolores.es`, `versionar-assets.mjs`, `minificar-assets.mjs` (necesita `npm i --no-save esbuild`), `generar-htaccess.mjs` y `seo.mjs . https://www.colegionsdolores.es`.
2. Zip de esa carpeta sin `docs/`, `supabase/`, `scripts/`, `node_modules/`, `material-sin-procesar/`, `*.md`, `*.ps1`, `*.sh`, `*.mjs`, `vercel.json`, `quotes-state.json` ni `package*.json`. Debe incluir `.htaccess` y `.well-known/`.
3. hPanel > Administrador de archivos > `domains/colegionsdolores.es/public_html` > subir y extraer **en public_html**, no en una subcarpeta. Si una carpeta ya existe, Hostinger crea otra con sufijo numérico: son copias antiguas y se pueden borrar tras comprobar la web.
4. Comprobar con Ctrl+F5 la portada, `/servicios/comedor`, `/panel` y `/.well-known/security.txt`.
5. `git push origin main` desde PowerShell en la carpeta del colegio (la máquina virtual no tiene credenciales de GitHub).
