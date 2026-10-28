# Panel de edición de la web · puesta en marcha y uso

El panel deja que la dirección, cada departamento y secretaría editen su parte de la web sin tocar código. Vive en `/panel` y se entra por `/acceso`.

## Cómo funciona

- **Cuentas con aprobación.** Cualquiera puede *solicitar* una cuenta en `/acceso` (nombre, cargo, correo, contraseña y qué quiere editar). La cuenta nace **pendiente** y no puede tocar nada. La dirección la aprueba en el panel, le da un rol y le asigna lo que puede editar, o la rechaza.
- **Roles.**
  - `editor`: edita solo los ámbitos que tiene concedidos (por ejemplo, su departamento).
  - `directiva`: edita toda la web, aprueba cuentas, concede y quita permisos, suspende cuentas.
  - `admin`: lo mismo, y además nombra a otros admin y da acceso al canal interno.
- **Canal interno (Ley 2/2023).** La dirección **no** ve las comunicaciones. Solo las ve la persona a la que un admin le dé el ámbito «Gestión del canal interno de información» (la Responsable del Sistema). Nadie puede darse permisos a sí mismo.
- **Seguridad.** Todas las reglas están en la base de datos (Row Level Security de Postgres). Aunque alguien manipulara el JavaScript de la web, la base de datos no le dejaría editar lo que no le toca. El esquema está probado con 61 pruebas de permisos y 43 comprobaciones de punta a punta.
- **Historial.** Cada cambio queda registrado (quién, cuándo, valor anterior y nuevo) y se puede deshacer desde el panel.
- **Si el panel se cae, la web no.** Cada página tiene su contenido de serie en el HTML. Lo publicado en el panel lo sustituye al cargar; si Supabase no responde, se ve el de serie.

## Puesta en marcha (una vez, unos 20 minutos)

1. **Crear la cuenta de Supabase** en <https://supabase.com> (plan gratuito) con la **cuenta de Google de la web del colegio** (no una cuenta personal). Organización «Colegio NSD». Después, *Organization → Team* → invitar a Fan como *Developer* o *Administrator*. Cuando exista la cuenta de Workspace del colegio, invitarla como *Owner* y quitar la anterior.
2. **Crear el proyecto** `colegio-nsd-web`, región **Europa** (*West EU – Frankfurt* o *Paris*). Guarda la contraseña de la base de datos en un gestor de contraseñas.
3. **SQL Editor** → *New query* → pegar `supabase/01_esquema.sql` entero → *Run*. Después, lo mismo con `supabase/02_ambitos.sql`, `supabase/03_blog.sql` (el blog), `supabase/04_archivos.sql` (subir Word, Excel, PowerPoint y fotos además de PDF) `supabase/05_personas.sql` (fichas del personal) `supabase/06_rendimiento_y_seguridad.sql` (permisos rápidos, índices, límites contra envíos masivos y archivos sin listado público) `supabase/07_avisos_supabase.sql` (lo que señala el *Security/Performance Advisor*) y `supabase/09_comedor.sql` (el menú del comedor desde el panel). Todos se pueden volver a ejecutar sin perder nada; si se repite cualquiera del 01 al 05, hay que repetir después el 04, el 06 y el 07 (el 09 solo añade una fila y no se ve afectado).
4. **Authentication → Sign In / Providers → Email**: activado. *Minimum password length*: 10.
5. **Authentication → URL Configuration**:
   - *Site URL*: `https://www.colegionsdolores.es`.
   - *Redirect URLs*: añadir `https://www.colegionsdolores.es/**`.
6. **Correo de avisos.** Sin SMTP propio, Supabase solo envía correos a los miembros del equipo del proyecto, así que el «He olvidado la contraseña» no les llegaría a los profesores. El colegio tiene Google Workspace for Education: los pasos (cuenta `no-responder@`, contraseña de aplicación, SMTP de Gmail, plantillas en español y **Confirm email**) están en `docs/CORREO.md`.
   - Hasta que esté puesto, dejar *Confirm email* desactivado. Es seguro igualmente, porque ninguna cuenta hace nada hasta que la dirección la aprueba, pero entonces la dirección debe comprobar quién es cada solicitante.
7. **Conectar la web.** *Project Settings → API*: copiar **Project URL** y la clave **anon public** en `assets/js/cms-config.js`. Nunca la `service_role`. Guardar, `git commit` y `git push`, y volver a subir el paquete a Hostinger (`node scripts/empaquetar-hostinger.mjs`).
8. **Primera cuenta de administración.** Registrarse en `/acceso` → *Solicitar cuenta*. Luego, en el SQL Editor:

   ```sql
   update public.perfiles set rol = 'admin', estado = 'aprobado', revisado_en = now()
    where email = 'correo-de-esa-cuenta';
   ```

   Desde ahí, todo lo demás (aprobar a la dirección, a los departamentos, dar el canal a su responsable) se hace en el panel.
9. **Función de formularios**: *Edge Functions → Deploy a new function → Via Editor*, nombre `formularios`, pegar `supabase/functions/formularios/index.ts` y desactivar *Verify JWT*. Mantiene los formularios de secretaría sincronizados con Google Forms (ver `docs/FORMULARIOS.md`).
10. **Comprobar**: entrar en `/panel`, editar un campo de un departamento y ver que aparece en `/centro/departamentos/...`.

## Blog

Cualquier cuenta aprobada escribe entradas en **Blog** (menú del panel): titular, resumen, texto, foto de portada, un PDF opcional y la fecha. Salen en `/blog`, en la portada y en la página del departamento que las firma. La dirección de cada una es `/blog/entrada?e=<titular-sin-tildes>`.

- **Quién firma.** La entrada va a nombre de un ámbito que la cuenta puede editar (su departamento o sección). Quien tiene varios elige cuál.
- **Categoría y etiquetas.** Las decide la base de datos, no el panel:
  - Dirección y quien tenga el ámbito «Secretaría» las **eligen**. Si dejan las etiquetas vacías, se ponen solas.
  - El resto **no** las elige: categoría de su etapa (Infantil, Primaria, ESO, Orientación, Bilingüismo) y etiquetas de su departamento, más la etapa que nombre el texto. Si la dirección recategoriza una entrada y luego el departamento la edita, vuelve a la clasificación automática.
  - La tabla de cada ámbito está en `supabase/03_blog.sql` (sección 1). Las categorías tienen que existir también en `NSD_CATEGORIAS` (`assets/js/noticias-datos.js`).
- **Borradores y programadas.** Sin marcar «Publicada» es un borrador. Con fecha futura sale ese día. Ninguna de las dos se ve fuera del panel.
- **Fotos.** El panel las reduce a 1600 px (WebP) antes de subirlas al bucket `imagenes`. Hay que describir cada foto, y no publicar fotos de alumnos sin autorización de imagen.
- Los «Comunicados breves» de la sección Noticias siguen existiendo para avisos de una línea.

## Editor con vista previa y reglas

- Cada sección se edita con una **vista previa** al lado (ordenador o móvil), pintada con el mismo código que la web y con el color del departamento.
- Los textos largos tienen una barra: subtítulo, negrita, lista, enlace, **botón** (texto + enlace), **archivo** (se sube y queda como botón de descarga) e **imagen** (con descripción obligatoria). Se guardan así:
  - `[[Texto del botón|https://enlace]]` en una línea propia → botón
  - `![Qué se ve](https://…)` en una línea propia → imagen con pie
- «Recursos y enlaces» va por filas: grupo (opcional), texto del botón, enlace o archivo subido.
- «Fotos» es una galería: cada foto con su descripción.
- **Reglas** que se comprueban al escribir: mínimos de cada campo (`minimo` en `cms-esquema.js`), enlaces que empiecen por https://, botones y fotos bien escritos y con descripción. Esto bloquea el guardado del campo que se ha tocado. Mayúsculas, párrafos larguísimos, botones de más o textos tipo «pincha aquí» solo avisan.

## Qué falta publicar

La vista de dirección separa lo que aporta la dirección (información a las familias, datos legales) de lo que escribe cada departamento, y dice si ese departamento ya tiene alguien con cuenta. Lo que la web enseña de serie cuenta como publicado. Un texto de sustitución (por ejemplo, «disponible en secretaría») se marca en el HTML con `data-cms-provisional` para que siga contando como pendiente.

## Menú del comedor

Quien tenga asignado el ámbito **«Menú del comedor»** (en *Cuentas y permisos*; dirección y administración ya lo tienen) ve en el panel el apartado **Menú del comedor**. Se sube el PDF o el Excel (.xlsx) del mes y la web se adapta sola:

1. El navegador lee el archivo (con `pdf.js`, copia local en `assets/vendor/pdfjs/`; el archivo no sale a ningún servicio de terceros) y reconoce cada día: fecha, primer plato, segundo, guarnición, postre, postre 2 de guardería, bebida, pan y las cuatro cifras de energía.
2. Enseña lo leído, día a día, para revisarlo y corregirlo. Los días a los que les falta el primer o el segundo plato salen abiertos y marcados «Revisar»; no se puede publicar mientras falten.
3. Al pulsar **Publicar** se sube el archivo original (carpeta `comedor` del almacén `documentos`) y se guarda el mes como una fila de `contenidos` (`comedor` / `mes_2026_09`). Tiene historial como el resto de cambios. Un mes ya publicado se sustituye subiendo otro archivo (pide confirmar); **Quitar** lo retira.
4. `/servicios/comedor` (`assets/js/menu-comedor.js`) pinta primero el menú que viene incluido en la web (`menu-datos.js`) y luego pide a Supabase los meses publicados: muestra el de este mes o, si no hay, el siguiente. Sin conexión o sin nada publicado se queda el incluido, así que la página nunca queda vacía.

El formato que entiende es el de siempre (tabla con «Primero», «Segundo», «Guarniciones», «Postre 1/2», «Bebida», «Pan» y «Kcal. Prot. Lip. H.C.»). Si un día cambia el modelo del PDF y la lectura sale mal, el panel avisa y se puede corregir a mano; la lectura está en `assets/js/menu-lector.js`. Un PDF que es una foto (escaneo) no tiene texto y no se puede leer: hay que subir el original. El Excel se lee con la misma lógica, pero solo está probado con una hoja de muestra con ese diseño; con el primero real conviene mirar la revisión con atención.

## Pruebas

`supabase/pruebas/` tiene una simulación mínima de Supabase para PostgreSQL local y las pruebas: `blog.py` (permisos, clasificación, borradores, fotos), `personas.py` (fichas) `comedor.py` (el menú del comedor), `seguridad.py` (lo del 06: columnas ocultas, archivos sin listado, límites del canal y de altas, y que el historial no se vuelva lento). Nunca se ejecutan contra el proyecto real.

## Rendimiento y caché

- **Navegador** (`assets/js/cms.js`): cada lectura de Supabase se guarda en el navegador. Menos de 1 minuto: se usa tal cual. Hasta 30 minutos: se usa al momento y se renueva por detrás. Si Supabase no responde, se usa la copia (hasta 1 día). Al guardar en el panel, la caché de ese navegador caduca, así que quien edita ve su cambio en el acto; el resto de visitantes lo ve como mucho en un minuto.
- **Hostinger** (`.htaccess` generado): CSS y JS con `?v=` se guardan un año (inmutables); el HTML se revalida siempre; fuentes e iconos, 30 días. Si cambias una foto, súbela con otro nombre.
- **Función de formularios**: guarda la estructura de cada Google Form 2 minutos (y la sirve hasta 1 hora mientras la renueva). Si Google falla, sigue sirviendo la última buena. Con 50 visitas a la vez hace una sola llamada a Google.
- **Panel**: las fotos se reducen en segundo plano (`assets/js/imagen-worker.js`), así el panel no se congela con fotos grandes del móvil.

## Mantenimiento

- **Pausa del plan gratuito.** Supabase pausa los proyectos gratuitos tras 7 días sin actividad. Las visitas a la web ya generan actividad, pero si alguna vez se pausa, la web sigue funcionando con el contenido de serie. Para reactivarlo: *Dashboard → Restore project*.
- **Copia de seguridad.** Automática y cifrada cada domingo con GitHub Actions; se guardan 90 días. Puesta en marcha y cómo restaurar: `docs/COPIAS.md`.
- **Borrar una cuenta del todo**: suspenderla en el panel y luego *Authentication → Users → Delete user*.
- **Iconos.** La web carga solo los iconos de Bootstrap Icons que usa (`assets/vendor/bootstrap-icons/iconos-nsd.css`). Si pones un icono nuevo (`bi-algo`), ejecuta `python3 scripts/iconos.py` para añadirlo; sin eso no se verá.
- **Añadir un departamento**: añadirlo en `assets/js/departamentos-datos.js` y en `supabase/02_ambitos.sql` (ejecutarlo de nuevo), y después `node scripts/generar-departamentos.mjs`.
- **Canal interno.** Avisos: acuse en 7 días naturales, respuesta en 3 meses. El panel marca los plazos. Conviene que la responsable entre al menos una vez por semana.

## Qué puede editar cada ámbito

| Ámbito | Página | Campos |
|---|---|---|
| Etapas (Infantil, Primaria) | `/centro/departamentos/infantil`, `/primaria` | presentación, áreas, objetivos\*, criterios de evaluación\*, instrumentos\*, calificación, promoción, programaciones\* (PDF) |
| Departamentos de la ESO (11) | `/centro/departamentos/<materia>` | presentación, cursos, objetivos\*, criterios de evaluación\*, instrumentos\*, calificación\*, recuperación, programaciones\* (PDF), profesorado, recursos |
| Orientación | `/centro/departamentos/orientacion` | funciones\*, atención a la diversidad\*, recursos para alumnos y familias, materias |
| Bilingüismo | `/centro/departamentos/bilinguismo` | programa por etapas, certificaciones, resultados de pruebas de inglés |
| Noticias y comunicados | portada y `/blog` | comunicados breves con fecha, sección y enlace |
| Secretaría | `/familias` | aviso destacado, horario, normas |
| Formularios | `/familias/formularios` | enlaces a los formularios (Google Forms u otros) |
| Información a las familias | `/familias/informacion`, `/admision` | precios\*, resultados de pruebas externas\*, programas, líneas del proyecto educativo\*, vacantes y SAE, curso\* |
| Evaluación | `/familias/evaluacion` | fechas, criterios generales por etapa, reclamaciones |
| Menú del comedor | `/servicios/comedor` | se sube el PDF o Excel del mes y se publica solo (ver «Menú del comedor») |
| Datos legales | aviso legal, privacidad, protección de la infancia, canal | DPD\*, Registro Mercantil\*, coordinación de bienestar\*, responsable del canal\* |

\* obligatorio por normativa; la vista «Qué falta publicar» del panel lo controla.

## Cuentas del profesorado creadas por la dirección

Para no esperar a que cada profesor pida su cuenta, la dirección puede darlas de alta de golpe:

1. Ejecutar una vez `supabase/10_cuentas_profesorado.sql` (añade la contraseña provisional y el cambio de correo).
2. `node scripts/cuentas-profesorado.mjs`: lee las listas de profesorado de `assets/js/departamentos-datos.js` y deja en `_privado/` (fuera del repositorio) el SQL de alta, un CSV y unas tarjetas para imprimir con el correo y la contraseña provisional de cada persona.
3. Pegar `alta-profesorado.sql` en el SQL Editor y ejecutarlo **una sola vez**. Las cuentas nacen aprobadas, con rol `editor` y permiso sobre sus departamentos o etapa. Si alguien ya tenía cuenta con ese correo, no se toca su contraseña: solo se le añaden permisos.
4. Repartir las tarjetas en mano y borrar `_privado/` cuando estén entregadas.

Al entrar con la contraseña provisional, el panel solo deja usar «Mi cuenta» hasta cambiarla. Desde «Mi cuenta» cada persona puede cambiar también el correo con el que entra (pide la contraseña actual y no necesita correo de confirmación). Los correos provisionales siguen el patrón `nombre.apellido@colegionsdolores.es` y no son buzones reales: hasta que cada uno ponga el suyo, «He olvidado la contraseña» no le llegaría.
