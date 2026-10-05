# Copias de seguridad de Supabase

El plan gratuito de Supabase no guarda copias descargables. Esta web se hace las suyas sola con una acción de GitHub (`.github/workflows/copia-supabase.yml`):

- **Cuándo:** todos los domingos a las 03:17 (hora UTC). También se puede lanzar a mano.
- **Qué guarda:** la base de datos entera. Eso incluye cuentas y permisos, contenidos, blog, fichas, historial y canal interno.
- **Dónde:** en GitHub → pestaña **Actions** → cada ejecución de «Copia de seguridad de Supabase» → apartado **Artifacts**. Se guardan 90 días, así que siempre hay unas 13 copias.
- **Cifrada:** cada copia está cifrada con AES-256 y una contraseña que solo tiene el colegio. Sin esa contraseña el archivo no sirve para nada, aunque alguien lo descargue. El canal interno contiene datos personales y no puede salir sin cifrar.
- **Qué no guarda:** los archivos subidos (PDF, fotos), que viven en *Storage*. Si se pierden, se vuelven a subir desde el panel.

## Puesta en marcha (una vez)

1. **Cadena de conexión.** En Supabase, pulsa **Connect** (arriba). Elige **Session pooler**, copia la URI (`postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-…pooler.supabase.com:5432/postgres`) y cambia `[YOUR-PASSWORD]` por la contraseña de la base de datos (la del gestor de contraseñas). Si no la tienes, en **Project Settings → Database → Reset database password** se crea otra. La web no la usa, así que no se rompe nada.
2. **Contraseña de las copias.** Invéntate una frase larga, de 16 caracteres como mínimo, y guárdala en el gestor de contraseñas del colegio. **Si se pierde, las copias no se pueden abrir.**
3. **Guardarlas en GitHub.** En el repositorio `colegio-nsd` → **Settings → Secrets and variables → Actions → New repository secret**:
   - `SUPABASE_DB_URL` = la cadena del paso 1
   - `COPIA_CLAVE` = la frase del paso 2
4. **Primera copia.** En la pestaña **Actions**, abre **Copia de seguridad de Supabase** y pulsa **Run workflow**. En un par de minutos tiene que salir en verde, con un archivo `supabase-colegio-AAAA-MM-DD` en *Artifacts*.

Si una copia falla, GitHub manda un correo a la cuenta dueña del repositorio.

## Restaurar una copia

Solo si se ha perdido la base de datos o hay que llevarla a otro proyecto.

1. Descarga el archivo desde *Artifacts* y descomprime el `.zip`. Saldrá `supabase-colegio-AAAA-MM-DD.tar.gz.gpg`.
2. Descífralo y descomprímelo. Para descifrarlo, `gpg` pedirá la contraseña de las copias:

   ```
   gpg -d supabase-colegio-AAAA-MM-DD.tar.gz.gpg > copia.tar.gz
   tar -xzf copia.tar.gz
   ```

   En Windows, `gpg` viene con [Gpg4win](https://www.gpg4win.org/) o con Git for Windows (en la terminal *Git Bash*).
3. Cárgala en un proyecto de Supabase vacío. Necesitas su cadena de conexión y `psql`:

   ```
   psql --single-transaction -v ON_ERROR_STOP=1 \
     --file roles.sql --file esquema.sql \
     --command 'SET session_replication_role = replica' \
     --file datos.sql --dbname "CADENA_DE_CONEXIÓN"
   ```

4. Si el proyecto es nuevo, cambia en `assets/js/cms-config.js` la URL y la clave pública por las del proyecto nuevo, y vuelve a poner el CAPTCHA, la función `formularios` y los ajustes de Authentication (ver `docs/PANEL.md`).
