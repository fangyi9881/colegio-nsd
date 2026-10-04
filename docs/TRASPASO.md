# Traspaso a www.colegionsdolores.es · fin de semana del 9 al 12 de octubre de 2026

Objetivo: que el dominio del colegio pase a servir la web nueva desde **Hostinger** **sin cortar el correo** y sin perder las direcciones antiguas que la gente tiene guardadas. Vercel (`colegio-nsd.vercel.app`) se queda dos semanas como copia de seguridad.

El dominio está en **Piensa Solutions**. Ahí ya se añadió en junio el registro `campamento → 76.76.21.21` (la web del campamento, que sigue en Vercel), así que el panel de DNS es conocido.

## La regla de oro

**Solo se tocan los registros de la web (`@` y `www`) y se pueden AÑADIR registros TXT. Nunca MX, SPF, DKIM, DMARC, `autodiscover`, `mail`, `campamento` ni ningún otro.** Si se cambian los servidores de nombres (NS) o se borra la zona, el correo de `@colegionsdolores.es` deja de funcionar. El correo se mudará más adelante, en una operación aparte.

## Cuentas

| Servicio | Cuenta |
|---|---|
| Hostinger | La de la agencia de Fan (alojamiento de varios clientes). Contrato de encargado del tratamiento con el colegio. |
| Supabase (panel) | La cuenta de Google de la web del colegio (luego, la de Workspace), con Fan como miembro. |
| Google Forms | La cuenta que ya usa secretaría. La web solo los enlaza. |
| Dominio y correo (Piensa) | El colegio. |

## Antes del fin de semana (hasta el jueves 8)

| Cuándo | Qué | Quién |
|---|---|---|
| Lun 5 | Contratar **Hostinger** (plan Unlimited) con la cuenta de la agencia. **No** registrar ni transferir el dominio: se queda en Piensa. | Fan |
| Lun 5 | Montar Supabase con la cuenta de la web y conectar el panel (`docs/PANEL.md`), incluida la función `formularios`. Crear la cuenta admin y aprobar a la dirección. | Fan + Claude |
| Mar 6 | Hostinger → *Sitios web → Añadir sitio web → Dominio existente* → `colegionsdolores.es`. Subir `dist/colegio-web.zip` (`node scripts/empaquetar-hostinger.mjs`) a `public_html` y extraerlo. Probar en la dirección temporal que da Hostinger. | Fan + Claude |
| Mar 6 | Los departamentos solicitan su cuenta y la dirección las aprueba. Rellenar los **datos legales** en el panel (DPD, Registro Mercantil, coordinación de bienestar, Responsable del canal). | Dirección |
| Mié 7 | **Captura de toda la zona DNS** en Piensa (todas las filas). Anotar el valor actual de `@` y de `www`: es el plan de vuelta atrás. | Fan |
| Mié 7 | Bajar el **TTL** de `@` y `www` a 300 segundos (5 min). | Fan |
| Mié 7 | Anotar la **IP del servidor** de Hostinger (hPanel → *Detalles del plan*). | Fan |
| Mié 7 | Sacar la **lista de direcciones de la web antigua** (Search Console o el menú de Joomla). Las habituales ya están redirigidas; añadir las que falten en `vercel.json` y regenerar `.htaccess`. | Fan + Claude |
| Jue 8 | **Copia de seguridad de Joomla** (archivos y base de datos) desde Piensa. | Fan |
| Jue 8 | Repaso final con la dirección en móvil y ordenador. Desde aquí no se cambia contenido hasta el lunes. | Fan + dirección |

## El fin de semana

### Viernes 9 por la tarde (la web antigua sigue funcionando)

1. Comprobar que la web está completa en la dirección temporal de Hostinger.
2. Supabase → *Authentication → URL Configuration*: *Site URL* = `https://www.colegionsdolores.es` y añadir `https://www.colegionsdolores.es/**` en *Redirect URLs*.

### Sábado 10 por la mañana (el cambio)

1. Piensa → DNS de `colegionsdolores.es`:
   - `@` → registro **A** con la **IP de Hostinger** (sustituye al valor actual).
   - `www` → **CNAME** `colegionsdolores.es` (o un registro A con la misma IP si Piensa no deja CNAME).
   - **Nada más.**
2. Esperar de 5 a 30 minutos. En hPanel → *Seguridad → SSL*, instalar el certificado gratuito para `colegionsdolores.es` y `www`, y activar *Forzar HTTPS*.
3. Desde la carpeta del colegio:

   ```bash
   node scripts/cambiar-dominio.mjs https://www.colegionsdolores.es
   node scripts/empaquetar-hostinger.mjs
   git add -A . ':!material-sin-procesar'
   git commit -m "chore: dominio definitivo www.colegionsdolores.es"
   git push
   ```

   Cambia los enlaces canónicos, el sitemap y los botones de compartir. Subir el `dist/colegio-web.zip` nuevo a Hostinger.
4. Comprobaciones (marcar cada una):
   - [ ] `https://colegionsdolores.es` lleva a `https://www.colegionsdolores.es` con candado.
   - [ ] Portada, `/admision`, `/familias/informacion`, `/canal-informante` y un departamento cargan bien.
   - [ ] Se abre un PDF de `/familias/formularios`.
   - [ ] `/acceso` → entrar → el panel carga y se puede guardar un cambio.
   - [ ] El formulario de contacto llega a secretaría.
   - [ ] **Correo**: un correo desde fuera a `secretaria@colegionsdolores.es` y otro desde ella hacia fuera. Los dos tienen que llegar.
   - [ ] Una dirección antigua (por ejemplo, `/index.php/secretaria/admision`) lleva a su página nueva.

### Domingo 11

- Google Search Console: propiedad de dominio `colegionsdolores.es` (verificación por TXT, que no afecta al correo) y enviar `https://www.colegionsdolores.es/sitemap.xml`.
- Revisar los registros de acceso de Hostinger: las direcciones antiguas que den 404 se añaden a `vercel.json` y se regenera el `.htaccess`.

### Lunes 12 (festivo)

- Preparar el comunicado a las familias por Alexia para el martes: dirección nueva, `/familias` como punto de entrada, y que los formularios y documentos están en la web.

## Si algo sale mal

Volver a poner en Piensa los valores antiguos de `@` y `www` que se anotaron el miércoles. Con TTL 300, en unos minutos vuelve la web antigua. Si el problema es de Hostinger y no de la web, se puede apuntar el dominio a Vercel (`@` → A `76.76.21.21`, `www` → CNAME `cname.vercel-dns.com`) y añadir el dominio en el proyecto de Vercel. El correo no se habrá tocado.

## Después del traspaso

- Tras dos semanas sin incidencias: devolver el TTL a 3600 y borrar el proyecto de Vercel.
- **No dar de baja el hosting de Piensa hasta mudar el correo**: probablemente el correo va dentro de ese plan.
- Correo y Google Workspace: operación aparte, más adelante.

## Modelo de texto de protección de datos para cada formulario de Google

> **Protección de datos.** Responsable: Colegio Ntra. Sra. de los Dolores, S.L. (CIF B-28853497). Finalidad: gestionar esta solicitud. Base jurídica: la relación educativa con el centro y, en su caso, vuestro consentimiento. Los datos se guardan en Google (adherida al Marco de Privacidad de Datos UE-EE. UU.) y no se ceden a terceros salvo obligación legal. Podéis ejercer vuestros derechos en secretaria@colegionsdolores.es. Más información: https://www.colegionsdolores.es/privacidad

En cada formulario: no pedir más datos de los necesarios; nunca datos de salud salvo que sea imprescindible (por ejemplo, alergias para el comedor), y desactivar «Recopilar direcciones de correo» si no hace falta.
