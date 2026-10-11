# Hosting del ecosistema NSD (estado a 11/10/2026)

| Web | Dominio | Dónde está |
|---|---|---|
| Colegio | https://www.colegionsdolores.es | Hostinger (public_html) |
| Infantil | https://infantil.colegionsdolores.es | Hostinger (public_html/infantil) |
| Campamento | https://campamento.colegionsdolores.es | Vercel (proyecto campamento-nsd) |
| Dolores Dragons | dolores-dragons.vercel.app | Vercel (a propósito) |
| Dragons Den | dragons-den-eight.vercel.app | Vercel (a propósito) |

Las únicas referencias que siguen apuntando a Vercel en todo el ecosistema son las de Dolores Dragons y Dragons Den.

## Redirecciones
- `/etapas/infantil-0-3` y `/…/campamento-de-verano` del colegio llevan a los subdominios (.htaccess del colegio).
- `infantil-nsd.vercel.app/*` y `campamento-nsd.vercel.app/*` redirigen a su subdominio (vercel.json de cada proyecto; en Hostinger, .htaccess de infantil).
- `colegio-nsd.vercel.app` sigue sirviendo de respaldo del colegio.

## Cómo publicar
- Colegio: `node scripts/cambiar-dominio.mjs` + `node scripts/empaquetar-hostinger.mjs`, subir el zip a public_html y extraer con "Replace all". Las fuentes locales conservan colegio-nsd.vercel.app a propósito.
- Infantil: subir los archivos a public_html/infantil y `vercel --prod --yes` en la carpeta infantil.
- Campamento: `npm run build` y `vercel --prod --yes`.

## Pendiente
- Search Console: comprobar sitemaps de infantil y campamento (enviados el 11/10/2026).
- URLs antiguas de Joomla sin equivalencia (p. ej. /index.php/mega/ep/pdep): hace falta la lista de Search Console.
- DNS: subir el TTL a 3600 pasadas dos semanas. El correo sigue en Piensa.
