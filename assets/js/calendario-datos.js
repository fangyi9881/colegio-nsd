// =========================================================
// Calendario del colegio: lo que muestra el widget «Hoy en el cole».
// ---------------------------------------------------------
// CÓMO AÑADIR UNA FECHA
//   fecha       'AAAA-MM-DD' (o 'fin' para un rango: { fecha, fin })
//   titulo      Lo que verá la familia.
//   detalle     Una frase corta (opcional).
//   tipo        'lectivo' | 'evaluacion' | 'actividad' | 'vacaciones' | 'reunion'
//   url         Página con más información (opcional).
//   porConfirmar  true si la fecha viene del boletín del curso pasado y
//                 secretaría todavía no ha confirmado la de este curso.
//
// Solo se ponen fechas publicadas. Si no hay dato, no se inventa: se
// queda en la lista de «pendiente de confirmar» que el widget enseña.
// =========================================================
window.NSD_CALENDARIO = {
  curso: '2026-27',

  eventos: [
    { fecha: '2026-10-01', titulo: 'Empiezan las extraescolares', detalle: 'Todas las actividades del curso arrancan hoy.', tipo: 'actividad', url: '/servicios/extraescolares' },
    { fecha: '2026-12-22', titulo: 'Entrega de notas · 1.ª evaluación', tipo: 'evaluacion', url: '/etapas/infantil-3-6#evaluacion' },
    { fecha: '2027-03-18', titulo: 'Entrega de notas · 2.ª evaluación', tipo: 'evaluacion', url: '/etapas/infantil-3-6#evaluacion' },
    { fecha: '2027-06-18', titulo: 'Entrega de notas · evaluación final', tipo: 'evaluacion', url: '/etapas/infantil-3-6#evaluacion' },
  ],

  // Del boletín de inicio de curso. Las fechas de este curso las confirma
  // secretaría: el widget las enseña aparte, marcadas.
  porConfirmar: [
    { titulo: 'Vacaciones de Navidad', detalle: 'El curso pasado fueron del 22 de diciembre al 7 de enero.' },
    { titulo: 'Vacaciones de Semana Santa', detalle: 'El curso pasado fueron del 27 de marzo al 6 de abril.' },
    { titulo: 'Fin de curso', detalle: 'El curso pasado terminó el 22 de junio (Infantil y Primaria) y el 23 (ESO).' },
    { titulo: 'Campamento de verano 2027', detalle: 'Las fechas se anuncian en secretaría.', url: 'https://campamento-nsd.vercel.app' },
  ],

  // Cuándo hay clase y cuándo no.
  //   desde / hasta  Principio y fin del periodo lectivo ('hasta' en null
  //                  mientras secretaría no confirme la fecha de fin).
  //   sinClase       Periodos sin clase. Los que vienen del boletín del
  //                  curso pasado van con porConfirmar: true y se pintan
  //                  distinto, para no dar por segura una fecha que no lo es.
  // Los sábados y domingos se dan por no lectivos sin necesidad de lista.
  lectivo: {
    desde: '2026-09-08',
    hasta: null,
    sinClase: [
      { desde: '2026-12-22', hasta: '2027-01-07', titulo: 'Vacaciones de Navidad', porConfirmar: true },
      { desde: '2027-03-27', hasta: '2027-04-06', titulo: 'Vacaciones de Semana Santa', porConfirmar: true },
    ],
  },

  // Se repiten todos los meses
  recurrentes: [
    { dia: 10, titulo: 'Pago de las mensualidades', detalle: 'Por domiciliación o en secretaría, antes del día 10.', url: '/contacto' },
    { dia: 25, titulo: 'Altas y bajas de servicios', detalle: 'Para el mes siguiente, antes del día 25.', url: '/contacto' },
  ],

  // Horario de atención de secretaría, por época del curso.
  // dias: 1 = lunes … 5 = viernes
  secretaria: [
    { meses: [9, 6], nombre: 'septiembre y junio', tramos: [{ dias: [1, 3, 5], horario: '9:15 – 12:30' }, { dias: [2, 4], horario: '16:00 – 18:30' }] },
    { meses: [10, 11, 12, 1, 2, 3, 4, 5], nombre: 'de octubre a mayo', tramos: [{ dias: [1, 3, 5], horario: '9:15 – 12:00' }, { dias: [2, 4], horario: '15:15 – 18:00' }] },
    { meses: [7], nombre: 'julio', tramos: [{ dias: [1, 2, 3, 4, 5], horario: '9:15 – 13:00' }] },
  ],
};
