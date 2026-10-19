// Formularios de secretaría. Cada tarjeta de /familias/formularios abre el
// Google Form original en otra pestaña. Para cambiar uno, edita aquí y ejecuta
//   node scripts/generar-formularios.mjs

export const FORMULARIOS = [
  {
    "slug": "actividades-y-servicios",
    "titulo": "Altas y bajas de actividades y servicios",
    "resumen": "Comedor, horario ampliado, actividades extraescolares, bilingüismo y Alexia.",
    "icono": "bi-calendar2-check",
    "plazo": "Antes del día 25 para que se aplique el mes siguiente",
    "corto": "https://forms.gle/oGbKQdamjwEkbtyAA"
  },
  {
    "slug": "oferta-extraescolares",
    "titulo": "Ofertas de actividades extraescolares 2026-2027",
    "resumen": "Packs con descuento de bilingüismo y actividades, de octubre a mayo.",
    "icono": "bi-stars",
    "plazo": "Curso 2026-2027, de octubre a mayo",
    "corto": "https://forms.gle/MH1ijxVMZDZgyeu6A"
  },
  {
    "slug": "actualizacion-de-datos",
    "titulo": "Actualización de datos",
    "resumen": "Nuevo teléfono, correo, domicilio, alergias o cualquier otro cambio.",
    "icono": "bi-person-vcard",
    "corto": "https://forms.gle/N3tEj63ubFBmYeMa6"
  },
  {
    "slug": "certificados",
    "titulo": "Solicitud de certificados",
    "resumen": "Matrícula, traslado, notas, asistencia o traslado al extranjero.",
    "icono": "bi-file-earmark-check",
    "corto": "https://forms.gle/MBUKAyto4t5ppF6W9"
  },
  {
    "slug": "recogida-de-titulos",
    "titulo": "Cita para recoger historiales y títulos",
    "resumen": "Historial académico, título de la ESO, certificados de Cambridge y otros.",
    "icono": "bi-mortarboard",
    "corto": "https://forms.gle/Q2HUifSzHbR3nzFX6"
  }
];
