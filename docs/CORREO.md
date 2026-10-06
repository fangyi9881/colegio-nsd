# Correo del panel con Google Workspace for Education

El panel manda dos correos: **confirmar la cuenta** al pedirla y **cambiar la contraseña** cuando alguien la olvida. Sin un servidor de correo propio, Supabase solo los envía a los miembros del proyecto, así que a los profesores no les llegarían.

El colegio tiene Google Workspace for Education en `colegionsdolores.es`, así que los correos salen de Google, con el dominio del colegio y sin tocar los DNS (los registros MX y SPF ya son de Google).

## 1. Cuenta para enviar (consola de administración de Google)

Lo hace quien administra el Workspace del colegio, en [admin.google.com](https://admin.google.com):

1. **Crear un usuario** solo para esto: `no-responder@colegionsdolores.es`, nombre «Colegio NSD». En Education las licencias no cuestan nada. No conviene usar el buzón de secretaría: si alguien cambia su contraseña, el panel deja de enviar correos.
2. **Verificación en dos pasos** para ese usuario (*Seguridad → Autenticación → Verificación en dos pasos*: permitirla en su unidad organizativa). Después, entrar con esa cuenta en [myaccount.google.com](https://myaccount.google.com) → *Seguridad* y activarla.
3. **Contraseña de aplicación**: con esa cuenta, en [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), crear una llamada «Supabase». Salen 16 letras. Se pegan en el paso 2 y se guardan en el gestor de contraseñas del colegio; no se mandan por correo ni por WhatsApp.
   - Si la página dice que no está disponible, el administrador tiene bloqueadas las contraseñas de aplicación o la verificación en dos pasos para esa unidad. Se puede mover el usuario a una unidad propia («Sistemas») con esas dos opciones permitidas.
4. **DKIM** (para que no lleguen a spam): *Aplicaciones → Google Workspace → Gmail → Autenticar correo electrónico*. Si pone «No se autentica el correo», pulsar *Generar registro*, añadir en Piensa el registro TXT `google._domainkey` que indica y, al día siguiente, pulsar *Iniciar autenticación*. Es un registro nuevo: no cambia ni el MX ni el SPF.

## 2. Supabase

*Authentication → Emails → SMTP Settings* → *Enable custom SMTP*:

| Campo | Valor |
|---|---|
| Sender email | `no-responder@colegionsdolores.es` |
| Sender name | `Colegio NSD` |
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | `no-responder@colegionsdolores.es` |
| Password | la contraseña de aplicación de 16 letras |
| Minimum interval | 30 segundos (lo deja Supabase por defecto) |

Gmail solo deja enviar con la dirección de la propia cuenta: el *Sender email* tiene que ser exactamente el mismo que el *Username*.

Después:

1. *Authentication → Rate Limits*: «Rate limit for sending emails» a **60 por hora**. Sobra para un claustro y frena a quien quiera usar el formulario para mandar correos en masa.
2. *Authentication → Emails → Templates*: pegar las plantillas en español de `supabase/plantillas-correo/`:
   - **Confirm signup** → asunto «Confirma tu cuenta del panel del Colegio NSD», cuerpo `confirmar.html`.
   - **Reset password** → asunto «Cambia tu contraseña del panel del Colegio NSD», cuerpo `recuperar.html`.
3. *Authentication → Sign In / Providers → Email*: activar **Confirm email**.

## 3. Comprobarlo

1. En `/acceso`, *He olvidado la contraseña* con una cuenta de profesor real. Tiene que llegar en menos de un minuto, desde «Colegio NSD».
2. En Gmail, abrir el correo → los tres puntos → *Mostrar original*: SPF, DKIM y DMARC deben poner **PASS**.
3. Pedir una cuenta de prueba con otro correo: tiene que llegar el de confirmación, y la cuenta aparece pendiente en el panel hasta que la dirección la aprueba. Después, rechazarla desde el panel.

Si no llega nada: *Authentication → Logs* en Supabase. «Username and Password not accepted» es casi siempre que se ha pegado la contraseña normal de la cuenta en vez de la de aplicación.

## Límites

Una cuenta de Workspace envía unos 2.000 correos al día. El panel manda unos pocos por semana.
