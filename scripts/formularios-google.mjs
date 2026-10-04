// Formularios de secretaría: versión propia de la web de los Google Forms
// del colegio. Las respuestas se envían al mismo Google Form, así que
// llegan a la misma hoja de respuestas que ya usa secretaría.
//
// Cada campo lleva el «entry» de su pregunta en Google y, en las de
// opciones, el texto EXACTO de cada opción (también con sus erratas):
// si no coincide letra a letra, Google descarta la respuesta.
//
// Si secretaría cambia una pregunta en Google Forms, hay que actualizar
// este archivo y regenerar: node scripts/generar-formularios.mjs
// Comprobado contra los formularios publicados el 4 de octubre de 2026.
//
// SINCRONIZACIÓN AUTOMÁTICA: al abrir la página, la web pide a Supabase
// (función «formularios») la estructura actual del Google Form. Si su
// huella sigue siendo la de aquí, se queda esta versión adaptada; si
// secretaría ha cambiado algo, la web pinta el formulario nuevo tal cual
// está en Google, con el diseño de la web. Ver docs/FORMULARIOS.md.

const AB = [['ALTA', 'Alta'], ['BAJA', 'Baja']];

const ALUMNO_NSD = {
  tipo: 'radio', entry: 1000057, req: true, label: '¿El alumno o la alumna es del colegio?',
  ops: [
    ['Sí, es alumno de NSD', 'Sí, estudia en el colegio'],
    ['No, procede de otro centro pero desea inscribirse en una actividad', 'No, viene de otro centro y quiere apuntarse a una actividad'],
  ],
};
const CONTACTO = (req) => ({
  tipo: 'casillas', entry: 1000026, req, label: '¿Cómo preferís que os contactemos?',
  ops: [['Teléfono', 'Por teléfono'], ['Correo electrónico', 'Por correo electrónico']],
});
const DECLARACION = {
  tipo: 'casillas', entry: 1892676867, req: true, label: 'Declaración responsable', sinTitulo: true,
  ops: [['Declaro que, bajo mi responsabilidad, los dos progenitores estamos de acuerdo con estos cambios.',
    'Declaro, bajo mi responsabilidad, que los dos progenitores estamos de acuerdo con estos cambios.']],
};
const MESES = ['Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'];

export const FORMULARIOS = [
  {
    slug: 'actividades-y-servicios',
    huella: '2ec3ce2a', // huella de las preguntas de Google cuando se adaptó (ver assets/js/gform-esquema.js)
    id: '1FAIpQLSfWPC4Ge-xvPgfLqojVjP08qJqZYSjzkaMzdnScrYpjljpsGg',
    corto: 'https://forms.gle/oGbKQdamjwEkbtyAA',
    titulo: 'Altas y bajas de actividades y servicios',
    resumen: 'Comedor, horario ampliado, actividades extraescolares, bilingüismo y Alexia.',
    icono: 'bi-calendar2-check',
    plazo: 'Antes del día 25 para que se aplique el mes siguiente',
    intro: 'Las altas y bajas se comunican antes del día 25 de cada mes y se aplican el mes siguiente. Una baja comunicada después del 25 se cobra el mes completo. El cambio se mantiene hasta que nos digáis lo contrario.',
    alMenos: { selector: '[data-cambio]', mensaje: 'Marcad al menos un alta o una baja.' },
    campos: [
      { tipo: 'seccion', titulo: 'Datos del alumno o la alumna' },
      ALUMNO_NSD,
      { tipo: 'texto', entry: 1000020, req: true, label: 'Nombre y apellidos', autocomplete: 'off' },
      { tipo: 'texto', entry: 1000022, req: true, label: 'Curso y grupo', placeholder: 'Ej.: 3.º B de Primaria', ayuda: 'Si viene de otro centro, escribid «Externo».' },
      { tipo: 'seccion', titulo: 'Contacto' },
      { tipo: 'email', req: true, label: 'Correo electrónico' },
      { tipo: 'tel', entry: 375457895, req: true, label: 'Teléfono' },
      CONTACTO(true),
      { tipo: 'mes', entry: 1293194945, req: true, label: 'Mes en el que empieza el alta o la baja', ops: MESES },

      { tipo: 'seccion', titulo: 'Servicios', ayuda: 'Marcad Alta o Baja solo en lo que cambia. Lo que dejéis en «Sin cambios» no se envía.' },
      { tipo: 'altabaja', entry: 1982291985, nombre: 'Escuela Infantil (0, 1 y 2 años)', horario: 'Elegid el alta o la baja y los servicios.',
        extra: { tipo: 'casillas', label: 'Servicios', ops: [['DESAYUNO', 'Desayuno'], ['COMIDA', 'Comida'], ['MERIENDA', 'Merienda'],
          ['MODIFICACIÓN DE HORARIO (Escriba el nuevo horario en observaciones y comentarios, al final del formulario)', 'Cambio de horario (escribid el nuevo en observaciones)']] } },
      { tipo: 'altabaja', entry: 1803937935, nombre: 'Comedor escolar',
        detalle: { tipo: 'parrafo', entry: 1387798149, label: 'Alergias o intolerancias del alumno o la alumna', ayuda: 'Solo si las hay. Secretaría las pasa a cocina.' } },
      { tipo: 'altabaja', entry: 1279733622, nombre: 'Plataforma de comunicación Alexia Familia' },

      { tipo: 'seccion', titulo: 'Horario ampliado' },
      { tipo: 'altabaja', entry: 150743366, nombre: 'Mañanas, de septiembre a junio',
        extra: { tipo: 'radio', label: 'Horario', ops: [['De 07:00 a 09:00 horas', '7:00 a 9:00'], ['De 07:30 a 09:00 horas', '7:30 a 9:00'], ['De 08:00 a 09:00 horas', '8:00 a 9:00'], ['De 08:30 a 09:00 horas', '8:30 a 9:00']] } },
      { tipo: 'altabaja', entry: 1771654384, nombre: 'Tardes, de octubre a mayo',
        extra: { tipo: 'radio', label: 'Horario', ops: [['De 17:00 a 17:30 horas', '17:00 a 17:30'], ['De 17:00 a 18:00 horas', '17:00 a 18:00'], ['De 17:00 a 18:30 horas', '17:00 a 18:30'], ['De 17:00 a 19:00 horas', '17:00 a 19:00']] } },
      { tipo: 'altabaja', entry: 1933639936, nombre: 'Tardes de septiembre y junio', horario: 'Con la jornada continua, horas de estancia después del comedor.',
        extra: { tipo: 'radio', label: 'Horario', ops: [['De 15:00 a 15:30 horas', '15:00 a 15:30'], ['De 15:00 a 16:00 horas', '15:00 a 16:00'], ['De 15:00 a 16:30 horas', '15:00 a 16:30'], ['De 15:00 a 17:00 horas', '15:00 a 17:00'], ['De 15:00 a 17:30 horas', '15:00 a 17:30'], ['De 15:00 a 18:00 horas', '15:00 a 18:00'], ['De 15:00 a 18:30 horas', '15:00 a 18:30'], ['De 15:00 a 19:00 horas', '15:00 a 19:00']] } },

      { tipo: 'seccion', titulo: 'Bilingüismo' },
      { tipo: 'altabaja', entry: 302010649, nombre: 'Infantil y Primaria', horario: 'De lunes a viernes, de 8:55 a 9:50.' },
      { tipo: 'altabaja', entry: 253023968, nombre: 'ESO: preparación de KET, PET y First', horario: 'KET (1.º) y PET (2.º): de lunes a viernes, de 12:30 a 13:25. First (3.º y 4.º): martes y jueves, de 14:15 a 15:05.' },

      { tipo: 'seccion', titulo: 'Actividades extraescolares' },
      { tipo: 'altabaja', entry: 750836880, nombre: 'Informática y nuevas tecnologías', horario: 'Grupo A (4.º a 6.º de Primaria): lunes y miércoles, de 14:00 a 15:00. Grupo B (1.º a 3.º): martes y jueves, de 14:00 a 15:00.' },
      { tipo: 'altabaja', entry: 38555804, nombre: 'Robótica', horario: 'Martes y jueves, de 17:00 a 18:00.' },
      { tipo: 'altabaja', entry: 959533080, nombre: 'Predeporte (Infantil)', horario: 'Grupo A: lunes y miércoles. Grupo B: martes y jueves. De 17:00 a 18:00.' },
      { tipo: 'altabaja', entry: 1870473501, nombre: 'Escuela de fútbol sala', horario: 'Lunes y miércoles: Primaria de 17:00 a 18:00 y ESO de 18:00 a 19:00.' },
      { tipo: 'altabaja', entry: 1793031709, nombre: 'Escuela de baloncesto', horario: 'Martes y jueves: Primaria de 17:00 a 18:00 y ESO de 18:00 a 19:00.' },
      { tipo: 'altabaja', entry: 1810613116, nombre: 'Escuela de judo', horario: 'Infantil (4 y 5 años) y Primaria.' },
      { tipo: 'altabaja', entry: 572724581, nombre: 'Baile', horario: 'Lunes y miércoles, de 17:00 a 18:00.' },
      { tipo: 'altabaja', entry: 1037948695, nombre: 'Escuela de música', horario: 'Lunes y miércoles, de 14:00 a 15:00.' },
      { tipo: 'altabaja', entry: 1877876117, nombre: 'Teatro', horario: 'Primaria y ESO: martes y jueves, de 17:00 a 18:00.' },
      { tipo: 'altabaja', entry: 215480121, nombre: 'Ajedrez', horario: 'Lunes y miércoles, de 17:00 a 18:00.' },
      { tipo: 'altabaja', entry: 1219244109, nombre: 'Pintura y manualidades', horario: 'Infantil: martes y jueves, de 14:00 a 15:00. Primaria: martes y jueves, de 17:00 a 18:00.' },
      { tipo: 'altabaja', entry: 1028345146, nombre: 'Academia de inglés', horario: 'Martes y jueves, de 17:00 a 18:00.' },
      { tipo: 'altabaja', entry: 585359360, nombre: 'Refuerzo y apoyo escolar', horario: 'Primaria y ESO: lunes y miércoles, de 17:00 a 18:00.' },

      { tipo: 'seccion', titulo: 'Para terminar' },
      { tipo: 'parrafo', entry: 1000023, label: 'Observaciones', ayuda: 'Por ejemplo, el nuevo horario si pedís un cambio.' },
      DECLARACION,
    ],
  },

  {
    slug: 'oferta-extraescolares',
    huella: 'ce786ef1', // huella de las preguntas de Google cuando se adaptó (ver assets/js/gform-esquema.js)
    id: '1FAIpQLSeX5Lw-aM5uNq36RXF_Q_XDuh7KolfETyuz8J7RSojSGT-8oA',
    corto: 'https://forms.gle/MH1ijxVMZDZgyeu6A',
    titulo: 'Ofertas de actividades extraescolares 2026-2027',
    resumen: 'Packs con descuento de bilingüismo y actividades, de octubre a mayo.',
    icono: 'bi-stars',
    plazo: 'Curso 2026-2027, de octubre a mayo',
    intro: 'Precios con descuento para el curso 2026-2027, de octubre a mayo. Si se da de baja durante el curso y se vuelve a apuntar después, se pierde el descuento y cada actividad se paga a su precio de ese momento.',
    alMenos: { selector: '[data-cambio]', mensaje: 'Elegid al menos una de las ofertas.' },
    campos: [
      { tipo: 'seccion', titulo: 'Datos del alumno o la alumna' },
      ALUMNO_NSD,
      { tipo: 'texto', entry: 1000020, req: true, label: 'Nombre y apellidos', autocomplete: 'off' },
      { tipo: 'texto', entry: 1000022, req: true, label: 'Curso y grupo', placeholder: 'Ej.: 2.º A de ESO', ayuda: 'Si viene de otro centro, escribid «Externo».' },
      { tipo: 'seccion', titulo: 'Contacto' },
      { tipo: 'email', req: true, label: 'Correo electrónico' },
      { tipo: 'tel', entry: 375457895, req: true, label: 'Teléfono' },
      CONTACTO(true),
      { tipo: 'seccion', titulo: 'Elegid la oferta', ayuda: 'Rellenad solo la que os interese.' },
      { tipo: 'oferta', entry: 1279733622, nombre: 'Opción A · Bilingüismo y 1 actividad', precio: '95 €/mes', label: '¿Qué actividad?' },
      { tipo: 'oferta', entry: 1020318871, nombre: 'Opción B · Bilingüismo y 2 actividades', precio: '125 €/mes', label: '¿Qué 2 actividades?' },
      { tipo: 'oferta', entry: 724316397, nombre: 'Opción C · 2 actividades, sin bilingüismo', precio: '70 €/mes', label: '¿Qué 2 actividades?' },
      { tipo: 'oferta', entry: 1177141294, nombre: 'Opción D · Deportes', precio: '35 €/mes por actividad', label: 'Actividades',
        ops: [['Futbol Sala', 'Fútbol sala'], ['Predeporte', 'Predeporte'], ['Baloncesto', 'Baloncesto']] },
      { tipo: 'seccion', titulo: 'Para terminar' },
      { tipo: 'parrafo', entry: 1000023, label: 'Observaciones' },
      DECLARACION,
    ],
  },

  {
    slug: 'actualizacion-de-datos',
    huella: '23dece5d', // huella de las preguntas de Google cuando se adaptó (ver assets/js/gform-esquema.js)
    id: '1FAIpQLSd3Lr1lkpFm5QrnctvyeAMuuCnIszPjEWmRegdjmIE5G-OtoQ',
    corto: 'https://forms.gle/N3tEj63ubFBmYeMa6',
    titulo: 'Actualización de datos',
    resumen: 'Nuevo teléfono, correo, domicilio, alergias o cualquier otro cambio.',
    icono: 'bi-person-vcard',
    intro: 'Avisad cada vez que cambie un dato del alumno o de la familia: se incorpora a su expediente y nos permite avisaros a tiempo de cualquier cosa.',
    alMenos: { selector: '[data-cambio]', mensaje: 'Escribid al menos un dato que cambia.' },
    campos: [
      { tipo: 'seccion', titulo: '¿De quién son los datos?' },
      { tipo: 'texto', entry: 1000020, req: true, label: 'Nombre y apellidos del alumno o la alumna', autocomplete: 'off' },
      { tipo: 'texto', entry: 1000022, req: true, label: 'Curso actual', placeholder: 'Ej.: 5.º de Primaria' },
      { tipo: 'texto', entry: 1979708554, req: true, label: 'Nombre y apellidos de quien hace el cambio', ayuda: 'Padre, madre, tutor o tutora legal.', autocomplete: 'name' },
      { tipo: 'email', req: true, label: 'Vuestro correo electrónico', ayuda: 'Para confirmaros el cambio.' },
      { tipo: 'seccion', titulo: 'Datos que cambian', ayuda: 'Rellenad solo lo que cambia.' },
      { tipo: 'tel', entry: 375457895, label: 'Nuevo teléfono', cambio: true },
      { tipo: 'emailcampo', entry: 1000025, label: 'Nuevo correo electrónico', cambio: true },
      { tipo: 'texto', entry: 1223480983, label: 'Nuevo domicilio', autocomplete: 'street-address', cambio: true },
      { tipo: 'parrafo', entry: 1708410187, label: 'Nuevas alergias o intolerancias', cambio: true },
      { tipo: 'parrafo', entry: 1000023, label: 'Otros cambios u observaciones', cambio: true },
    ],
  },

  {
    slug: 'certificados',
    huella: '51beb85c', // huella de las preguntas de Google cuando se adaptó (ver assets/js/gform-esquema.js)
    id: '1FAIpQLSfdNrd0MEjwujgE07oi9MPiQRE4XVnxjsWl2tu996PWgpcvrQ',
    corto: 'https://forms.gle/MBUKAyto4t5ppF6W9',
    titulo: 'Solicitud de certificados',
    resumen: 'Matrícula, traslado, notas, asistencia o traslado al extranjero.',
    icono: 'bi-file-earmark-check',
    intro: 'Pedid aquí el certificado que necesitéis. Secretaría os avisa cuando esté listo, para recogerlo en el colegio o recibirlo por correo.',
    alMenos: { selector: '[data-cambio]', mensaje: 'Marcad al menos un certificado o escribid cuál necesitáis.' },
    campos: [
      { tipo: 'seccion', titulo: 'Datos del alumno o la alumna' },
      { tipo: 'texto', entry: 1000020, req: true, label: 'Nombre y apellidos', autocomplete: 'off' },
      { tipo: 'texto', entry: 1000022, req: true, label: 'Curso actual', placeholder: 'Ej.: 4.º de ESO' },
      { tipo: 'fecha', entry: 1941822940, req: true, label: 'Fecha de nacimiento' },
      { tipo: 'texto', entry: 375457895, label: 'DNI o NIE', ayuda: 'Si lo tiene.', autocomplete: 'off' },
      { tipo: 'texto', entry: 1316955750, req: true, label: 'Curso académico del certificado', placeholder: 'Ej.: 2025-2026' },
      { tipo: 'radio', entry: 1511309436, req: true, label: '¿Necesitáis que aparezca el número de identificación del alumno (NIA)?', ops: [['SI', 'Sí'], ['NO', 'No']] },
      { tipo: 'seccion', titulo: 'Contacto' },
      { tipo: 'email', req: true, label: 'Correo electrónico' },
      { tipo: 'tel', entry: 947201858, label: 'Teléfono' },
      CONTACTO(false),
      { tipo: 'seccion', titulo: 'Certificado que pedís' },
      { tipo: 'casillas', entry: 302010649, label: 'Certificado de matriculación', sinTitulo: true, cambio: true, ops: [['SI', 'Certificado de matriculación']] },
      { tipo: 'casillas', entry: 1279733622, label: 'Certificado de traslado', sinTitulo: true, cambio: true, ops: [['SI', 'Certificado de traslado']] },
      { tipo: 'casillas', entry: 1803937935, label: 'Certificado de notas', sinTitulo: true, cambio: true, ops: [['SI', 'Certificado de notas']] },
      { tipo: 'casillas', entry: 1329453499, label: 'Certificado de asistencia regular al centro', sinTitulo: true, cambio: true, ops: [['SI', 'Certificado de asistencia regular al centro']] },
      { tipo: 'casillas', entry: 300153210, label: 'Certificado de traslado al extranjero', sinTitulo: true, cambio: true, ops: [['SI', 'Certificado de traslado al extranjero']] },
      { tipo: 'parrafo', entry: 1000023, label: 'Otro certificado', ayuda: 'Si no está en la lista, escribid cuál.', cambio: true },
      { tipo: 'radio', entry: 1558609455, req: true, label: '¿Cómo queréis recibirlo?',
        ops: [['En la Secretaría del Centro', 'Lo recogemos en secretaría'], ['Deseo sea enviado a mi correo electónico', 'Por correo electrónico']] },
    ],
  },

  {
    slug: 'recogida-de-titulos',
    huella: '590352ea', // huella de las preguntas de Google cuando se adaptó (ver assets/js/gform-esquema.js)
    id: '1FAIpQLSfYr2MMEZ-Tz2NysefFTaerJYeAh5HF0MVXxRP08qIIUEDkGQ',
    corto: 'https://forms.gle/Q2HUifSzHbR3nzFX6',
    titulo: 'Cita para recoger historiales y títulos',
    resumen: 'Historial académico, título de la ESO, certificados de Cambridge y otros.',
    icono: 'bi-mortarboard',
    intro: 'Decidnos qué documento necesitáis y cuándo os viene bien; os llamamos para daros fecha. El título de la ESO y el historial académico de la ESO los recoge el propio alumno o alumna con su DNI. El historial de Primaria lo recogen los padres o tutores legales.',
    alMenos: { selector: '[data-cambio]', mensaje: 'Elegid el documento o escribid cuál es.' },
    campos: [
      { tipo: 'seccion', titulo: 'Documento' },
      { tipo: 'radio', entry: 1533160103, label: 'Documento que vais a recoger', cambio: true,
        ops: [['Historial Académico del alumno', 'Historial académico'], ['Título de Graduado en E.S.O.', 'Título de Graduado en ESO'],
          ['Cerfificados  y Títulos Cambridge', 'Certificados y títulos de Cambridge'], ['Libro de Escolaridad', 'Libro de escolaridad'], ['Certificado de Escolaridad', 'Certificado de escolaridad']] },
      { tipo: 'parrafo', entry: 824006088, label: 'Otro documento', ayuda: 'Si no está en la lista, escribid cuál.', cambio: true },
      { tipo: 'texto', entry: 1362564071, req: true, label: 'Nombre, apellidos y curso del alumno o la alumna', autocomplete: 'off' },
      { tipo: 'email', req: true, label: 'Correo electrónico', ayuda: 'Para avisaros de la fecha.' },
      { tipo: 'seccion', titulo: '¿Cuándo os viene bien?', ayuda: 'Marcad todas las franjas que podáis. Nos ajustamos lo más posible.' },
      { tipo: 'rejilla', label: 'Disponibilidad', cols: ['Mañana', 'Mediodía', 'Tarde'],
        filas: [[1313414293, 'Lunes'], [1956059881, 'Martes'], [168762299, 'Miércoles'], [1593905522, 'Jueves'], [288948008, 'Viernes']] },
      { tipo: 'parrafo', entry: 2140974612, label: 'Algo más sobre vuestra disponibilidad' },
    ],
  },
];

// Formularios recibidos que NO se publican y por qué.
export const DESCARTADOS = [
  { corto: 'https://forms.gle/4tVBCBcs9VYDBXyK7', motivo: '«Programar una cita» es la plantilla de ejemplo de Google: dirección «Tu calle, 123» y preguntas de dieta para un evento.' },
];
