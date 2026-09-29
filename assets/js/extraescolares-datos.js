// =========================================================
// Extraescolares 2026-27: datos del catálogo y de las tarifas.
// De aquí salen la página (el generador la pinta en HTML) y el
// simulador de precios. Un cambio de horario o de precio se hace
// solo aquí.
// ---------------------------------------------------------
// tarifa:  'bilingue' (63 €), 'actividad' (44 €), 'deportiva' (35 €)
//          o 'consultar' (sin precio publicado)
// horarios: por etapa, una o varias opciones de grupo; cada opción es
//          una lista de franjas { dias, ini, fin }. Si hay varias
//          opciones (Predeporte A o B) se elige la que no choque.
// =========================================================
(function (raiz) {
  const ETAPAS = {
    inf:  { nombre: 'Infantil',        detalle: '3 a 5 años' },
    pri1: { nombre: 'Primaria 1.º–3.º', detalle: '6 a 9 años' },
    pri2: { nombre: 'Primaria 4.º–6.º', detalle: '9 a 12 años' },
    eso:  { nombre: 'ESO',             detalle: '12 a 16 años' }
  };

  const TIPOS = {
    deporte:    { nombre: 'Deporte',               icono: 'bi-dribbble' },
    idiomas:    { nombre: 'Idiomas',               icono: 'bi-translate' },
    arte:       { nombre: 'Arte, música y escena', icono: 'bi-palette' },
    tecnologia: { nombre: 'Tecnología y lógica',   icono: 'bi-cpu' },
    estudio:    { nombre: 'Estudio',               icono: 'bi-journal-check' }
  };

  const TARIFAS = {
    bilingue: 63, actividad: 44, deportiva: 35,
    opcionA: 95,  // Bilingüismo + 1 actividad
    opcionB: 125, // Bilingüismo + 2 actividades
    opcionC: 70,  // Dos actividades (excepto Bilingüismo)
    madrugadoresDia: 12
  };

  const f = (dias, ini, fin) => ({ dias, ini, fin });
  const LX = ['L', 'X'], MJ = ['M', 'J'], LV = ['L', 'M', 'X', 'J', 'V'];

  const ACTIVIDADES = [
    {
      id: 'baloncesto', semana: 'Dragons', nombre: 'Baloncesto · Dolores Dragons', corto: 'Baloncesto', tipo: 'deporte', tarifa: 'deportiva', destacada: true,
      resumen: 'La escuela de baloncesto del colegio. Entrenamientos en la pista del cole y partidos los sábados por la mañana en Carabanchel y Latina.',
      detalle: 'Categorías Prebenjamín (1.º–2.º), Benjamín (3.º–4.º), Alevín (5.º–6.º), Infantil (1.º–2.º ESO) y Cadete (3.º–4.º ESO). Entrenamientos y partidos incluidos.',
      enlace: 'https://dolores-dragons.vercel.app',
      horarios: { pri1: [[f(MJ, '17:00', '18:00')]], pri2: [[f(MJ, '17:00', '18:00')]], eso: [[f(MJ, '18:00', '19:00')]] }
    },
    {
      id: 'futbol', nombre: 'Fútbol Sala', corto: 'Fútbol', tipo: 'deporte', tarifa: 'deportiva',
      resumen: 'Escuela deportiva con equipos en competición oficial los sábados por la mañana.',
      detalle: 'Categorías Prebenjamín (1.º–2.º), Benjamín (3.º–4.º), Alevín (5.º–6.º), Infantil (1.º–2.º ESO) y Cadete (3.º–4.º ESO). Entrenamientos y partidos incluidos.',
      horarios: { pri1: [[f(LX, '17:00', '18:00')]], pri2: [[f(LX, '17:00', '18:00')]], eso: [[f(LX, '18:00', '19:00')]] }
    },
    {
      id: 'predeporte', semana: 'Predep.', nombre: 'Predeporte', corto: 'Predeporte', tipo: 'deporte', tarifa: 'deportiva',
      resumen: 'Habilidades motrices, coordinación y trabajo en equipo a través del juego: la entrada al baloncesto y al fútbol.',
      detalle: 'Dos grupos: A (lunes y miércoles) y B (martes y jueves). El simulador os coloca en el que encaje.',
      horarios: { inf: [[f(LX, '17:00', '18:00')], [f(MJ, '17:00', '18:00')]] }
    },
    {
      id: 'judo', nombre: 'Escuela de Judo', corto: 'Judo', tipo: 'deporte', tarifa: 'actividad', insignia: 'Judogui gratis',
      resumen: 'Iniciación desde los 4 años, competición oficial en Primaria y preparación de cinturones.',
      detalle: 'En Infantil, solo para 4 y 5 años. Judogui gratis para quien se apunta por primera vez.',
      horarios: { inf: [[f(MJ, '17:00', '18:00')]], pri1: [[f(MJ, '17:00', '18:00')]], pri2: [[f(MJ, '17:00', '18:00')]] }
    },
    {
      id: 'bilingue', semana: 'Inglés', nombre: 'Programa de Bilingüismo', corto: 'Bilingüismo', tipo: 'idiomas', tarifa: 'bilingue',
      resumen: 'Una hora de inglés cada mañana antes de clase, de lunes a viernes.',
      detalles: {
        inf: 'Vocabulary, Songs & Games, Workbook, Short Stories y Creativity (3 y 4 años). BEDA Preparation (5 años).',
        pri1: 'Iniciación a los exámenes de Cambridge (4 h) y comprensión lectora y problemas en español (1 h).',
        pri2: 'Preparación de los exámenes de Cambridge (4 h) y Sports (1 h).'
      },
      horarios: { inf: [[f(LV, '8:55', '9:50')]], pri1: [[f(LV, '8:55', '9:50')]], pri2: [[f(LV, '8:55', '9:50')]] }
    },
    {
      id: 'cambridge-eso', semana: 'Cambridge', nombre: 'Bilingüismo ESO · Cambridge', corto: 'Cambridge', tipo: 'idiomas', tarifa: 'consultar',
      resumen: 'Preparación de los títulos oficiales de Cambridge, adaptada a cada curso.',
      detalle: 'KET (1.º) y PET (2.º): de lunes a viernes, 12:30–13:25. FIRST (3.º y 4.º): martes y jueves, 14:20–15:05. Precio en secretaría.',
      horarios: { eso: [[f(LV, '12:30', '13:25')]] }
    },
    {
      id: 'academia', nombre: 'Academia de inglés', corto: 'Academia', tipo: 'idiomas', tarifa: 'actividad',
      resumen: 'Inglés de forma natural y dinámica, adaptado a cada edad.',
      horarios: { pri1: [[f(MJ, '17:00', '18:00')]], pri2: [[f(MJ, '17:00', '18:00')]], eso: [[f(MJ, '17:00', '18:00')]] }
    },
    {
      id: 'musica', nombre: 'Escuela de Música', corto: 'Música', tipo: 'arte', tarifa: 'actividad', insignia: 'Nuevo',
      resumen: 'Del movimiento y la canción en Infantil a la banda de rock en Secundaria.',
      detalles: {
        inf: 'Música y Movimiento: canciones, danzas y cuentos musicales.',
        pri1: 'Taller de Música: percusión, percusión corporal y canto coral.',
        pri2: 'Taller de Música: percusión, percusión corporal y canto coral.',
        eso: 'Banda de Rock · Combo: guitarra, bajo, batería y teclado.'
      },
      horarios: { inf: [[f(LX, '14:00', '15:00')]], pri1: [[f(MJ, '14:00', '15:00')]], pri2: [[f(MJ, '14:00', '15:00')]], eso: [[f(LX, '17:00', '18:00')]] }
    },
    {
      id: 'pintura', nombre: 'Pintura y manualidades', corto: 'Pintura', tipo: 'arte', tarifa: 'actividad', insignia: 'Nuevo',
      resumen: 'Jabones naturales, barro, dibujo, pulseras, velas y experimentos con fragancias.',
      horarios: { inf: [[f(MJ, '14:00', '15:00')]], pri1: [[f(MJ, '17:00', '18:00')]], pri2: [[f(MJ, '17:00', '18:00')]] }
    },
    {
      id: 'teatro', nombre: 'Teatro', corto: 'Teatro', tipo: 'arte', tarifa: 'actividad', insignia: 'Nuevo',
      resumen: 'Técnicas de actuación, expresión corporal y trabajo en equipo.',
      horarios: { pri1: [[f(MJ, '17:00', '18:00')]], pri2: [[f(MJ, '17:00', '18:00')]], eso: [[f(MJ, '17:00', '18:00')]] }
    },
    {
      id: 'baile', nombre: 'Baile moderno', corto: 'Baile', tipo: 'arte', tarifa: 'actividad',
      resumen: 'Coreografías actuales para ganar coordinación, ritmo y expresión corporal.',
      horarios: { inf: [[f(LX, '17:00', '18:00')]], pri1: [[f(LX, '17:00', '18:00')]], pri2: [[f(LX, '17:00', '18:00')]] }
    },
    {
      id: 'robotica', nombre: 'Robótica', corto: 'Robótica', tipo: 'tecnologia', tarifa: 'actividad', insignia: 'Nuevo',
      resumen: 'Manejo y programación de robots: lógica, resolución de problemas y trabajo en equipo.',
      horarios: { pri1: [[f(MJ, '17:00', '18:00')]], pri2: [[f(MJ, '17:00', '18:00')]] }
    },
    {
      id: 'informatica', semana: 'Informát.', nombre: 'Informática', corto: 'Informática', tipo: 'tecnologia', tarifa: 'actividad', insignia: 'Plazas limitadas',
      resumen: 'Ofimática, Canva y creación de videojuegos con Scratch.',
      detalles: {
        pri1: 'Grupo B: iniciación a la informática, PowerPoint, Publisher o Canva y navegación web.',
        pri2: 'Grupo A: Scratch, creación de videojuegos, Canva y Word, Excel y PowerPoint.'
      },
      horarios: { pri1: [[f(MJ, '14:00', '15:00')]], pri2: [[f(LX, '14:00', '15:00')]] }
    },
    {
      id: 'ajedrez', nombre: 'Ajedrez', corto: 'Ajedrez', tipo: 'tecnologia', tarifa: 'actividad', insignia: 'Nuevo',
      resumen: 'De la base a las estrategias de torneo: lógica, memoria y concentración.',
      horarios: { pri1: [[f(LX, '17:00', '18:00')]], pri2: [[f(LX, '17:00', '18:00')]] }
    },
    {
      id: 'refuerzo', nombre: 'Refuerzo y apoyo escolar', corto: 'Refuerzo', tipo: 'estudio', tarifa: 'actividad', insignia: 'Nuevo',
      resumen: 'Grupos reducidos para hacer las tareas, reforzar contenidos y coger hábitos de estudio.',
      horarios: { pri1: [[f(LX, '17:00', '18:00')]], pri2: [[f(LX, '17:00', '18:00')]], eso: [[f(LX, '17:00', '18:00')]] }
    }
  ];

  raiz.NSD_EXTRA = { ETAPAS, TIPOS, TARIFAS, ACTIVIDADES };
})(typeof window !== 'undefined' ? window : globalThis);
