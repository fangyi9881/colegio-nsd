# Formularios de secretaría

Los cinco formularios de `/familias/formularios/` son la versión de la web de los Google Forms de secretaría. Se rellenan en la web y **la respuesta se envía al Google Form original**, así que llega a la misma hoja de respuestas de siempre. Secretaría no tiene que cambiar nada.

| Página | Google Form |
|---|---|
| `/familias/formularios/actividades-y-servicios` | <https://forms.gle/oGbKQdamjwEkbtyAA> |
| `/familias/formularios/oferta-extraescolares` | <https://forms.gle/MH1ijxVMZDZgyeu6A> |
| `/familias/formularios/actualizacion-de-datos` | <https://forms.gle/N3tEj63ubFBmYeMa6> |
| `/familias/formularios/certificados` | <https://forms.gle/MBUKAyto4t5ppF6W9> |
| `/familias/formularios/recogida-de-titulos` | <https://forms.gle/Q2HUifSzHbR3nzFX6> |

No publicado: <https://forms.gle/4tVBCBcs9VYDBXyK7> («Programar una cita») es la plantilla de ejemplo de Google, con la dirección «Tu calle, 123».

## Sincronización automática con Google Forms

Cuando alguien abre un formulario, la web pide a Supabase (función `formularios`) cómo está ahora ese Google Form:

- **Si no ha cambiado**, se ve la versión adaptada (textos revisados, botones Alta/Baja, horarios…).
- **Si secretaría ha cambiado algo** (una actividad nueva, un horario, una pregunta, un texto), la web pinta al momento el formulario tal como está en Google, con el diseño de la web, y envía con los códigos nuevos. No hay que tocar la web.
- **Si el formulario pide iniciar sesión en Google o tiene preguntas de subir archivos**, la web muestra el botón para abrirlo en Google Forms.
- **Si Supabase no responde**, se queda la versión adaptada.

La versión automática es correcta pero más sencilla que la adaptada (los títulos salen como en Google). Cuando haya cambios, conviene volver a adaptarla: actualizar `scripts/formularios-google.mjs` con los textos y la nueva `huella`, y `node scripts/generar-formularios.mjs`.

**Puesta en marcha (una vez):** Supabase → *Edge Functions* → *Deploy a new function* → *Via Editor* → nombre `formularios` → pegar `supabase/functions/formularios/index.ts` → *Deploy*. En los ajustes de la función, desactivar *Verify JWT*. Mientras no esté desplegada, la web usa la versión adaptada.

**Formularios nuevos:** la función solo responde para los formularios de su lista. Para otro, añadir su ID al principio de `index.ts` (o en la variable `FORMULARIOS_EXTRA`).

## Reglas para secretaría

- **Se puede** cambiar en Google Forms la descripción y los colores: no afecta a la web.
- **Se puede** añadir, quitar o cambiar preguntas y opciones: la web se actualiza sola en cuanto alguien abre el formulario. Conviene avisar a Fan para que vuelva a adaptar el diseño.
- No activar en Google Forms «Restringir a usuarios» ni «Limitar a 1 respuesta»: obligan a iniciar sesión en Google y la web ya no podría enviar.
- Cada página tiene debajo el enlace al Google Form original por si algo falla.

## Cómo se actualiza

1. Cambiar el formulario en `scripts/formularios-google.mjs` (códigos `entry` y textos exactos).
2. `node scripts/generar-formularios.mjs`
3. Enviar una respuesta de prueba y comprobar que aparece en la hoja de Google.

Los formularios EXTRA que secretaría publique desde el panel (sección «Formularios») aparecen debajo de estos cinco como enlace a Google Forms.
