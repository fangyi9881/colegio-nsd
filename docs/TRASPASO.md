# Traspaso a www.colegionsdolores.es · fin de semana del 9 al 12 de octubre de 2026

Objetivo: que el dominio del colegio pase a servir la web nueva (Vercel) **sin cortar el correo** y sin perder las direcciones antiguas que la gente tiene guardadas.

El dominio está en **Piensa Solutions**. Ahí ya se añadió en junio el registro `campamento → 76.76.21.21`, así que el panel de DNS es conocido.

## La regla de oro

**Solo se tocan los registros de la web (`@` y `www`). Nunca MX, TXT (SPF, DKIM, DMARC), `autodiscover`, `mail`, `campamento` ni ningún otro.** Si se cambian los servidores de nombres (NS) o se borra la zona, el correo de `@colegionsdolores.es` deja de funcionar.

## Antes del fin de semana (hasta el jueves 8)

| Cuándo | Qué | Quién |
|---|---|---|
| Lun 5 | Montar Supabase y conectar el panel (`docs/PANEL.md`). Crear la cuenta admin y aprobar a la dirección. | Fan |
| Lun 5 | Decidir el plan de Vercel. El plan Hobby es solo para uso personal y no comercial; la web de un cliente debería ir en **Pro**. Alternativa gratuita que sí permite uso comercial: Cloudflare Pages. | Fan + colegio |
| Mar 6 | Los departamentos solicitan su cuenta y la dirección las aprueba. Cada uno rellena objetivos, criterios, calificación y programación. Ver «Qué falta publicar» en el panel. | Dirección |
| Mar 6 | Rellenar en el panel los **datos legales**: DPD, Registro Mercantil, coordinación de bienestar y Responsable del canal interno. Revisar los precios y poner los resultados de las pruebas externas. | Dirección / secretaría |
| Mar 6 | Pegar en *Formularios* los enlaces de los formularios de Google que se usan ahora. Comprobar que cada formulario lleva al principio el texto de protección de datos (modelo abajo). | Secretaría |
| Mié 7 | **Captura de toda la zona DNS** en Piensa (todas las filas). Anotar el valor actual de `@` y de `www`: es el plan de vuelta atrás. | Fan |
| Mié 7 | Bajar el **TTL** de `@` y `www` a 300 segundos (5 min). Así, si algo falla, se vuelve atrás en minutos. | Fan |
| Mié 7 | Sacar la **lista de direcciones de la web antigua**: Google Search Console (*Páginas*) o el gestor de menús de Joomla. Las rutas habituales ya están redirigidas en `vercel.json`; añadir las que falten. | Fan |
| Jue 8 | **Copia de seguridad de Joomla** (archivos y base de datos) desde el panel de Piensa. | Fan |
| Jue 8 | Repaso final en `colegio-nsd.vercel.app` con móvil y ordenador. | Fan + dirección |

## El fin de semana

### Viernes 9 por la tarde (la web antigua sigue funcionando)

1. Vercel → proyecto `colegio-nsd` → *Settings → Domains* → añadir `www.colegionsdolores.es` y `colegionsdolores.es`. Vercel mostrará qué registros pide; deberían ser los de abajo.
2. Supabase → *Authentication → URL Configuration* → *Site URL* = `https://www.colegionsdolores.es`.

### Sábado 10 por la mañana (el cambio)

1. Piensa → DNS de `colegionsdolores.es`:
   - `www` → **CNAME** `cname.vercel-dns.com` (si `www` era un registro A, borrar ese A y crear el CNAME).
   - `@` → **A** `76.76.21.21` (sustituye al valor actual).
   - **Nada más.**
2. Esperar a que Vercel marque los dos dominios como *Valid Configuration* y emita el certificado HTTPS (de 5 a 30 minutos).
3. En el ordenador, desde la carpeta del colegio:

   ```bash
   node scripts/cambiar-dominio.mjs https://www.colegionsdolores.es
   git add -A . ':!material-sin-procesar'
   git commit -m "chore: dominio definitivo www.colegionsdolores.es"
   git push
   ```

   Esto cambia los enlaces canónicos, el sitemap y los botones de compartir. Además redirige `colegio-nsd.vercel.app` al dominio nuevo.
4. Comprobaciones (marcar cada una):
   - [ ] `https://colegionsdolores.es` lleva a `https://www.colegionsdolores.es` con candado.
   - [ ] Portada, `/admision`, `/familias/informacion`, `/canal-informante` y un departamento cargan bien.
   - [ ] `/acceso` → entrar → el panel carga y se puede guardar un cambio.
   - [ ] El formulario de contacto llega a secretaría.
   - [ ] **Correo**: enviar un correo a `secretaria@colegionsdolores.es` desde fuera y otro desde ella hacia fuera. Los dos tienen que llegar.
   - [ ] Una dirección antigua (por ejemplo, `/index.php/secretaria/admision`) lleva a su página nueva.

### Domingo 11

- Google Search Console: añadir la propiedad de dominio `colegionsdolores.es` (verificación por TXT, que no afecta al correo) y enviar `https://www.colegionsdolores.es/sitemap.xml`.
- Vercel → *Logs*: buscar respuestas 404 y añadir las redirecciones que falten en `vercel.json`.

### Lunes 12 (festivo)

- Preparar el comunicado a las familias por Alexia para el martes: dirección nueva, `/familias` como punto de entrada, y que los formularios y documentos están en la web.

## Si algo sale mal

Volver a poner en Piensa los valores antiguos de `@` y `www` que se anotaron el miércoles. Con TTL 300, en unos minutos vuelve la web antigua. El correo no se habrá tocado.

## Después del traspaso

- Pasar a Vercel Pro (o a Cloudflare Pages) si no se hizo antes.
- Tras dos semanas sin incidencias, devolver el TTL a 3600 y dar de baja el hosting de Joomla (guardando la copia de seguridad).
- Solicitar **Google Workspace for Education Fundamentals** (gratuito) y migrar a él los formularios y Classroom. Ver `docs/INFORME-LEGAL.md`.

## Modelo de texto de protección de datos para cada formulario de Google

> **Protección de datos.** Responsable: Colegio Ntra. Sra. de los Dolores, S.L. (CIF B-28853497). Finalidad: gestionar esta solicitud. Base jurídica: la relación educativa con el centro y, en su caso, vuestro consentimiento. Los datos se guardan en Google (adherida al Marco de Privacidad de Datos UE-EE. UU.) y no se ceden a terceros salvo obligación legal. Podéis ejercer vuestros derechos en secretaria@colegionsdolores.es. Más información: https://www.colegionsdolores.es/privacidad

En cada formulario: no pedir más datos de los necesarios; nunca datos de salud salvo que sea imprescindible (por ejemplo, alergias para el comedor), y desactivar «Recopilar direcciones de correo» si no hace falta.
