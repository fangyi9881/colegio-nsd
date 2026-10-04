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

## Reglas para secretaría

- **Se puede** cambiar en Google Forms la descripción, el orden de las preguntas y los colores: no afecta a la web.
- **Hay que avisar a Fan antes de** añadir, borrar o renombrar una pregunta o una opción (por ejemplo, una actividad nueva o un horario distinto). La web envía cada respuesta con el código interno de la pregunta y el texto exacto de cada opción; si no coincide, Google la descarta sin avisar.
- No activar en Google Forms «Restringir a usuarios» ni «Limitar a 1 respuesta»: obligan a iniciar sesión en Google y la web ya no podría enviar.
- Cada página tiene debajo el enlace al Google Form original por si algo falla.

## Cómo se actualiza

1. Cambiar el formulario en `scripts/formularios-google.mjs` (códigos `entry` y textos exactos).
2. `node scripts/generar-formularios.mjs`
3. Enviar una respuesta de prueba y comprobar que aparece en la hoja de Google.

Los formularios EXTRA que secretaría publique desde el panel (sección «Formularios») aparecen debajo de estos cinco como enlace a Google Forms.
