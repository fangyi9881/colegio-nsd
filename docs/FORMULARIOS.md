# Formularios de secretaría

La web no tiene formularios propios para las gestiones de secretaría. Cada tarjeta de `/familias/formularios` abre el **Google Form original** en otra pestaña, y las respuestas llegan a la misma hoja de siempre. La web no recibe ni guarda ningún dato de esos formularios.

Por qué enlace y no incrustado (iframe): incrustar Google Forms carga cookies de Google al abrir la página, lo que obligaría a pedir consentimiento antes (art. 22.2 LSSI); además la política de seguridad de la web (`frame-src`) no permite marcos de Google Forms. El enlace directo evita ambos problemas y es lo que mejor funciona en el móvil.

| Tarjeta | Google Form |
|---|---|
| Altas y bajas de actividades y servicios | <https://forms.gle/oGbKQdamjwEkbtyAA> |
| Ofertas de actividades extraescolares | <https://forms.gle/MH1ijxVMZDZgyeu6A> |
| Actualización de datos | <https://forms.gle/N3tEj63ubFBmYeMa6> |
| Solicitud de certificados | <https://forms.gle/MBUKAyto4t5ppF6W9> |
| Cita para recoger historiales y títulos | <https://forms.gle/Q2HUifSzHbR3nzFX6> |

No publicado: <https://forms.gle/4tVBCBcs9VYDBXyK7> («Programar una cita») es la plantilla de ejemplo de Google, con la dirección «Tu calle, 123».

## Añadir o cambiar un formulario

- **Desde el panel** (`/panel` → Formularios): se añaden formularios nuevos pegando su enlace; aparecen debajo de los cinco.
- **Los cinco fijos**: se editan en `scripts/formularios-google.mjs` y se regeneran las tarjetas con `node scripts/generar-formularios.mjs`.

Cada formulario de Google debe llevar la información básica de protección de datos (responsable, finalidad, derechos y enlace a la política de privacidad).

## Qué se retiró

Las cinco páginas `/familias/formularios/<nombre>` (con su script de envío y sincronización) ya no existen. Las direcciones antiguas redirigen a `/familias/formularios`, y la antigua `…/formularios-de-altas-y-bajas-en-servicios` va directa al formulario de altas y bajas.

La función de Supabase `formularios` ya no la usa la web; se puede dejar o borrar sin efecto.
