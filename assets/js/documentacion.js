// =========================================================
// Centro de documentación para familias
// ---------------------------------------------------------
// CÓMO AÑADIR UN DOCUMENTO NUEVO
// Añade un objeto al array DOCUMENTOS con estos campos:
//
//   titulo       Nombre que verá la familia.
//   descripcion  Una frase explicando para qué sirve.
//   categoria    Una de las claves de CATEGORIAS (abajo).
//   tipo         'pdf' | 'pagina' | 'enlace' | 'formulario'
//   url          Ruta o enlace. Déjalo en null si aún no está
//                disponible: se mostrará como "Pídelo en secretaría"
//                en vez de dar un enlace roto.
//   etiquetas    Palabras por las que también debe encontrarse.
//                Incluye aquí los sinónimos que usan las familias.
//   actualizado  'AAAA-MM' para poder ordenar por novedad.
//   seccion      Opcional. Nombre de la sección a la que salta la url
//                cuando lleva ancla (#...), para avisar en la vista.
//
// Los PDF que se suban a /assets/docs/ se ven en la vista previa con
// el visor del navegador; las páginas de la web, en miniatura. Si la
// url lleva ancla, la miniatura se abre ya en esa sección.
// =========================================================

const CATEGORIAS = {
  admision:    { nombre: 'Admisión',         icono: 'bi-mortarboard',  pista: 'Solicitud de plaza, baremo, vacantes y matrícula.' },
  calendario:  { nombre: 'Curso y horarios', icono: 'bi-calendar3',    pista: 'Calendario, horarios, libros de texto y ACCEDE.' },
  comedor:     { nombre: 'Comedor',          icono: 'bi-egg-fried',    pista: 'Menú del mes, precios y normas del servicio.' },
  actividades: { nombre: 'Actividades',      icono: 'bi-trophy',       pista: 'Extraescolares, madrugadores, salidas y campamento.' },
  becas:       { nombre: 'Becas y ayudas',   icono: 'bi-cash-coin',    pista: 'Ayudas de comedor y material de la Comunidad.' },
  normativa:   { nombre: 'Normas y pagos',   icono: 'bi-shield-check', pista: 'Convivencia, autorizaciones, pagos y privacidad.' },
  plataformas: { nombre: 'Plataformas',      icono: 'bi-laptop',       pista: 'Alexia, Raíces y cómo os comunica el centro.' }
};

const DOCUMENTOS = [
  // Admisión
  { titulo: 'Solicitud de admisión', descripcion: 'Plazos, documentación necesaria, baremo y cuotas del proceso de admisión.', categoria: 'admision', tipo: 'pagina', url: '/admision',
    etiquetas: ['matricula', 'plaza', 'nuevo alumno', 'inscripcion', 'solicitud', 'baremo'], actualizado: '2026-03' },
  { titulo: 'Reserva de visita al centro', descripcion: 'Formulario para concertar una visita guiada con el equipo directivo.', categoria: 'admision', tipo: 'formulario', url: '/contacto',
    etiquetas: ['visita', 'cita', 'puertas abiertas', 'conocer el colegio'], actualizado: '2026-03' },
  { titulo: 'Escuela Infantil 0–3 años', descripcion: 'Web de la escuela infantil: proyecto, horarios, becas de la Comunidad de Madrid y reserva de plaza.', categoria: 'admision', tipo: 'enlace', url: 'https://infantil-nsd.vercel.app',
    etiquetas: ['guarderia', 'bebes', 'infantil', 'primer ciclo', '0-3'], actualizado: '2026-09' },

  // Curso y horarios
  { titulo: 'Horarios de cada etapa', descripcion: 'Entrada y salida de Infantil, Primaria y ESO, de octubre a mayo, en una sola tabla.', categoria: 'calendario', tipo: 'pagina', url: '/etapas#horarios', seccion: 'Horarios de cada etapa',
    etiquetas: ['horario', 'horarios', 'entrada', 'salida', 'jornada'], actualizado: '2026-09' },
  { titulo: 'Fechas de evaluación y entrega de notas', descripcion: 'Días de entrega de notas de las tres evaluaciones en cada etapa.', categoria: 'calendario', tipo: 'pagina', url: '/etapas/primaria#evaluacion', seccion: 'Evaluación y promoción',
    etiquetas: ['notas', 'evaluacion', 'boletin de notas', 'trimestre', 'calificaciones'], actualizado: '2026-09' },
  { titulo: 'Boletín informativo 2025-26', descripcion: 'Organización del curso pasado: calendario, horarios, libros, servicios y reuniones.', categoria: 'calendario', tipo: 'pagina', url: '/blog/boletin-25-26',
    etiquetas: ['boletin', 'circular', 'informacion', 'inicio de curso'], actualizado: '2025-09' },
  { titulo: 'Calendario escolar del curso', descripcion: 'Calendario oficial 2026-2027: inicio de curso, vacaciones de Navidad y Semana Santa y fin de curso.', categoria: 'calendario', tipo: 'pagina', url: '/etapas#calendario',
    etiquetas: ['calendario', 'festivos', 'vacaciones', 'dias lectivos', 'navidad', 'semana santa'], actualizado: '2026-09' },
  { titulo: 'Libros de texto 2026-27 · Educación Infantil', descripcion: 'Listado oficial con título, ISBN y editorial de cada curso de Infantil.', categoria: 'calendario', tipo: 'pdf', url: '/assets/docs/libros-texto-2026-2027-infantil.pdf',
    etiquetas: ['libros', 'texto', 'material', 'isbn', 'editorial', 'lista', 'infantil'], actualizado: '2026-09' },
  { titulo: 'Libros de texto 2026-27 · Educación Primaria', descripcion: 'Listado oficial con título, ISBN y editorial de cada curso de Primaria.', categoria: 'calendario', tipo: 'pdf', url: '/assets/docs/libros-texto-2026-2027-primaria.pdf',
    etiquetas: ['libros', 'texto', 'material', 'isbn', 'editorial', 'lista', 'primaria'], actualizado: '2026-09' },
  { titulo: 'Libros de texto 2026-27 · E.S.O.', descripcion: 'Listado oficial con título, ISBN y editorial de cada curso de la ESO.', categoria: 'calendario', tipo: 'pdf', url: '/assets/docs/libros-texto-2026-2027-eso.pdf',
    etiquetas: ['libros', 'texto', 'material', 'isbn', 'editorial', 'lista', 'eso', 'secundaria'], actualizado: '2026-09' },

  // Documentos del centro. Estaban en carpetas de Google Drive de la web
  // anterior: ahora se descargan desde aquí, sin salir de la página.
  { titulo: 'Plan de Convivencia', descripcion: 'Normas de conducta, faltas y sanciones. Aprobado por el Consejo Escolar en diciembre de 2024.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/plan-de-convivencia.pdf',
    etiquetas: ['convivencia', 'normas', 'conducta', 'disciplina', 'acoso'], actualizado: '2026-09' },
  { titulo: 'Reglamento de Régimen Interior', descripcion: 'Cómo se organiza el centro, órganos de gobierno, derechos y deberes de la comunidad educativa.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/reglamento-de-regimen-interior.pdf',
    etiquetas: ['rri', 'reglamento', 'regimen interior', 'normas'], actualizado: '2026-09' },
  { titulo: 'Proyecto Educativo de Centro', descripcion: 'Los principios, objetivos y líneas de actuación del colegio.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/proyecto-educativo-de-centro.pdf',
    etiquetas: ['pec', 'proyecto educativo', 'principios'], actualizado: '2026-09' },
  { titulo: 'Ideario del centro', descripcion: 'El carácter propio del colegio. Aprobado por el Consejo Escolar en junio de 2021.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/ideario-del-centro.pdf',
    etiquetas: ['ideario', 'caracter propio', 'valores'], actualizado: '2026-09' },
  { titulo: 'Normas para la reclamación de notas', descripcion: 'Plazos y procedimiento para reclamar una calificación.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/normas-reclamacion-de-notas.pdf',
    etiquetas: ['notas', 'reclamacion', 'calificaciones', 'evaluacion'], actualizado: '2026-09' },
  { titulo: 'Ley de autoridad del profesor', descripcion: 'Ley 2/2010 de la Comunidad de Madrid, de autoridad del profesor.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/ley-de-autoridad-del-profesor.pdf',
    etiquetas: ['autoridad', 'profesor', 'ley'], actualizado: '2026-09' },
  { titulo: 'Legislación educativa de referencia', descripcion: 'Las leyes que regulan la enseñanza y que aplica el centro.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/legislacion-educativa.pdf',
    etiquetas: ['legislacion', 'leyes', 'lomloe', 'loe'], actualizado: '2026-09' },
  { titulo: 'Matriculación y actualización de datos', descripcion: 'Impreso para matricular al alumno o actualizar los datos personales de la familia.', categoria: 'admision', tipo: 'pdf', url: '/assets/docs/matriculacion-actualizacion-de-datos.pdf',
    etiquetas: ['matricula', 'datos', 'impreso', 'formulario'], actualizado: '2026-09' },
  { titulo: 'Autorización para el uso de imágenes', descripcion: 'Consentimiento de las familias para imágenes, vídeos y audios del alumno.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/autorizacion-uso-de-imagenes.pdf',
    etiquetas: ['imagenes', 'fotos', 'video', 'autorizacion', 'consentimiento'], actualizado: '2026-09' },
  { titulo: 'Autorización de salidas y excursiones', descripcion: 'Impreso para autorizar las salidas extraescolares y complementarias del curso.', categoria: 'actividades', tipo: 'pdf', url: '/assets/docs/autorizacion-salidas-extraescolares.pdf',
    etiquetas: ['salidas', 'excursiones', 'autorizacion', 'extraescolares'], actualizado: '2026-09' },
  { titulo: 'Conformidad con la política de privacidad', descripcion: 'Impreso de conformidad con el tratamiento de datos del centro.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/conformidad-politica-de-privacidad.pdf',
    etiquetas: ['privacidad', 'datos', 'rgpd', 'conformidad'], actualizado: '2026-09' },
  { titulo: 'Autorización para la recogida de alumnos', descripcion: 'Personas autorizadas por la familia para recoger al alumno.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/autorizacion-recogida-de-alumnos.pdf',
    etiquetas: ['recogida', 'autorizacion', 'salida', 'personas autorizadas'], actualizado: '2026-09' },
  { titulo: 'Administración de medicamentos', descripcion: 'Solicitud y autorización para dar medicación al alumno en el centro.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/autorizacion-administracion-medicamentos.pdf',
    etiquetas: ['medicamentos', 'medicacion', 'salud', 'autorizacion'], actualizado: '2026-09' },
  { titulo: 'Domiciliación bancaria de actividades', descripcion: 'Orden de domiciliación para actividades y servicios extraescolares.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/domiciliacion-bancaria-actividades.pdf',
    etiquetas: ['banco', 'domiciliacion', 'pago', 'recibo', 'sepa'], actualizado: '2026-09' },
  { titulo: 'Plan Digital de Centro', descripcion: 'Cómo se usa la tecnología en el colegio y qué objetivos digitales tiene.', categoria: 'normativa', tipo: 'pdf', url: '/assets/docs/plan-digital-de-centro.pdf',
    etiquetas: ['digital', 'tecnologia', 'plan digital', 'tic'], actualizado: '2026-09' },
  { titulo: 'Código Escuela 4.0', descripcion: 'Programa de pensamiento computacional, programación y robótica del centro.', categoria: 'actividades', tipo: 'pdf', url: '/assets/docs/codigo-escuela-4-0.pdf',
    etiquetas: ['codigo', 'robotica', 'programacion', 'escuela 4.0'], actualizado: '2026-09' },
  { titulo: 'Guía de cuidado de los libros', descripcion: 'Cómo mantener en buen estado los libros del programa ACCEDE.', categoria: 'calendario', tipo: 'pdf', url: '/assets/docs/guia-cuidado-de-los-libros.pdf',
    etiquetas: ['accede', 'libros', 'cuidado', 'prestamo'], actualizado: '2026-09' },
  { titulo: 'ACCEDE: instrucciones de la Comunidad', descripcion: 'Resumen de las instrucciones del programa de préstamo de libros.', categoria: 'calendario', tipo: 'pdf', url: '/assets/docs/accede-instrucciones.pdf',
    etiquetas: ['accede', 'libros', 'prestamo', 'instrucciones'], actualizado: '2026-09' },
  { titulo: 'ACCEDE: Anexo I de adhesión', descripcion: 'Impreso para incorporarse al programa de préstamo de libros.', categoria: 'calendario', tipo: 'pdf', url: '/assets/docs/accede-anexo-i-adhesion.pdf',
    etiquetas: ['accede', 'anexo', 'adhesion', 'libros'], actualizado: '2026-09' },
  { titulo: 'ACCEDE: Anexo IV de renuncia', descripcion: 'Impreso para renunciar al programa de préstamo de libros.', categoria: 'calendario', tipo: 'pdf', url: '/assets/docs/accede-anexo-iv-renuncia.pdf',
    etiquetas: ['accede', 'anexo', 'renuncia', 'libros'], actualizado: '2026-09' },
  { titulo: 'ACCEDE: circular de devolución', descripcion: 'Plazos y condiciones para devolver los libros prestados.', categoria: 'calendario', tipo: 'pdf', url: '/assets/docs/accede-circular-devolucion.pdf',
    etiquetas: ['accede', 'devolucion', 'libros', 'circular'], actualizado: '2026-09' },
  { titulo: 'Admisión: calendario de actuaciones 2026-27', descripcion: 'Fechas oficiales del proceso ordinario de admisión.', categoria: 'admision', tipo: 'pdf', url: '/assets/docs/admision-calendario-de-actuaciones.pdf',
    etiquetas: ['admision', 'calendario', 'plazos', 'fechas'], actualizado: '2026-09' },
  { titulo: 'Admisión: formulario de solicitud', descripcion: 'Impreso oficial de solicitud de plaza para presentar en el centro.', categoria: 'admision', tipo: 'pdf', url: '/assets/docs/admision-formulario-de-solicitud.pdf',
    etiquetas: ['admision', 'solicitud', 'formulario', 'impreso', 'plaza'], actualizado: '2026-09' },
  { titulo: 'Admisión: criterios y baremación', descripcion: 'Cómo se puntúan las solicitudes: hermanos, proximidad, renta y criterios del centro.', categoria: 'admision', tipo: 'pdf', url: '/assets/docs/admision-criterios-y-baremacion.pdf',
    etiquetas: ['admision', 'baremo', 'puntos', 'criterios'], actualizado: '2026-09' },
  { titulo: 'Admisión: vacantes ofertadas 2026-27', descripcion: 'Plazas libres por curso en Infantil, Primaria y ESO.', categoria: 'admision', tipo: 'pdf', url: '/assets/docs/admision-vacantes-ofertadas.pdf',
    etiquetas: ['admision', 'vacantes', 'plazas', 'libres'], actualizado: '2026-09' },
  { titulo: 'Admisión: información básica para familias', descripcion: 'Resumen del proceso de admisión en centros sostenidos con fondos públicos.', categoria: 'admision', tipo: 'pdf', url: '/assets/docs/admision-informacion-basica-familias.pdf',
    etiquetas: ['admision', 'informacion', 'familias', 'proceso'], actualizado: '2026-09' },
  { titulo: 'Admisión: necesidades educativas especiales', descripcion: 'Proceso para el alumnado con necesidades específicas de apoyo educativo.', categoria: 'admision', tipo: 'pdf', url: '/assets/docs/admision-necesidades-educativas-especiales.pdf',
    etiquetas: ['admision', 'necesidades', 'nee', 'apoyo', 'especiales'], actualizado: '2026-09' },
  { titulo: 'Admisión: resolución de las Viceconsejerías', descripcion: 'Resolución conjunta que regula el proceso de admisión del curso.', categoria: 'admision', tipo: 'pdf', url: '/assets/docs/admision-resolucion-viceconsejerias.pdf',
    etiquetas: ['admision', 'resolucion', 'normativa'], actualizado: '2026-09' },
  { titulo: 'Admisión: información complementaria', descripcion: 'Documento complementario sobre el proceso y los registros donde presentar la solicitud.', categoria: 'admision', tipo: 'pdf', url: '/assets/docs/admision-mas-informacion.pdf',
    etiquetas: ['admision', 'registro', 'informacion'], actualizado: '2026-09' },
  { titulo: 'Comunicado del equipo docente a las familias', descripcion: 'Alexia, agenda escolar, web y tablón de anuncios: cómo se comunica el centro.', categoria: 'plataformas', tipo: 'pdf', url: '/assets/docs/comunicado-servicios-inicio-de-curso.pdf',
    etiquetas: ['comunicado', 'alexia', 'agenda', 'familias'], actualizado: '2026-09' },
  { titulo: '4º ESO + Empresa', descripcion: 'Memoria del programa de estancias en empresas de la Comunidad de Madrid.', categoria: 'actividades', tipo: 'pdf', url: '/assets/docs/4eso-empresa.pdf',
    etiquetas: ['4eso', 'empresa', 'practicas', 'estancias'], actualizado: '2026-09' },

  // Comedor
  { titulo: 'Menú del comedor en PDF', descripcion: 'El menú del mes tal y como lo publica la cocina, con los valores nutricionales de cada día.', categoria: 'comedor', tipo: 'pdf', url: '/assets/docs/menu-comedor-septiembre-2026.pdf',
    etiquetas: ['menu', 'comedor', 'comida', 'pdf', 'septiembre', 'nutricional'], actualizado: '2026-09' },
  { titulo: 'Comedor: menús y funcionamiento', descripcion: 'Menú del mes, alérgenos, necesidades por edad y normas del servicio.', categoria: 'comedor', tipo: 'pagina', url: '/servicios/comedor',
    etiquetas: ['menu', 'cocina', 'alergias', 'intolerancias', 'dieta', 'almuerzo', 'comida'], actualizado: '2026-09' },
  { titulo: 'Precios del comedor, desayuno y merienda', descripcion: 'Importe de cada mes del curso 2026-27, desayuno, merienda y bono de día suelto.', categoria: 'comedor', tipo: 'pagina', url: '/servicios/comedor#precios', seccion: 'Tarifas 2026–27',
    etiquetas: ['precio', 'tarifa', 'coste', 'cuanto cuesta', 'bono', 'dia suelto', 'desayuno', 'merienda'], actualizado: '2026-09' },

  // Actividades
  { titulo: 'Extraescolares y simulador de precios', descripcion: 'Las 14 actividades por tipo y la calculadora del precio de vuestra combinación.', categoria: 'actividades', tipo: 'pagina', url: '/servicios/extraescolares',
    etiquetas: ['extraescolar', 'deporte', 'musica', 'robotica', 'judo', 'baile', 'ingles', 'simulador', 'calculadora'], actualizado: '2026-09' },
  { titulo: 'Tarifas de extraescolares 2026-27', descripcion: 'Opciones A, B, C y D, actividades sueltas, descuentos y cuotas anuales.', categoria: 'actividades', tipo: 'pagina', url: '/servicios/extraescolares#tarifas',
    etiquetas: ['precio', 'precios', 'tarifa', 'coste', 'cuanto cuesta', 'descuento', 'opcion', 'cuota'], actualizado: '2026-09' },
  { titulo: 'Madrugadores', descripcion: 'Entrada desde las 7:30, con desayuno opcional y bilingüismo incluido, 12 € el día.', categoria: 'actividades', tipo: 'pagina', url: '/servicios/madrugadores',
    etiquetas: ['madrugadores', 'aula matinal', 'acogida', 'temprano', 'conciliacion', 'horario ampliado'], actualizado: '2026-09' },
  { titulo: 'Dolores Dragons · baloncesto', descripcion: 'Web de la escuela de baloncesto del colegio: categorías, calendario y cómo apuntarse.', categoria: 'actividades', tipo: 'enlace', url: 'https://dolores-dragons.vercel.app',
    etiquetas: ['baloncesto', 'basket', 'club', 'deporte', 'dragons', 'equipo'], actualizado: '2026-09' },
  { titulo: 'Campamento urbano de verano', descripcion: 'Web del campamento: semanas, horarios, actividades e inscripción.', categoria: 'actividades', tipo: 'enlace', url: 'https://campamento-nsd.vercel.app',
    etiquetas: ['campamento', 'verano', 'julio', 'vacaciones', 'urbano'], actualizado: '2026-06' },

  // Becas
  { titulo: 'Becas y ayudas al estudio', descripcion: 'Información oficial de la Comunidad de Madrid: becas de comedor, material y ayudas.', categoria: 'becas', tipo: 'enlace', url: 'https://www.comunidad.madrid/servicios/educacion',
    etiquetas: ['beca', 'ayuda', 'comedor gratuito', 'material escolar', 'subvencion'], actualizado: '2026-05' },

  // Normas y pagos
  { titulo: 'Horario de secretaría', descripcion: 'Los tres tramos del curso, con los días y horas de atención.', categoria: 'normativa', tipo: 'pagina', url: '/familias#secretaria', seccion: 'Horario de secretaría',
    etiquetas: ['secretaria', 'horario', 'atencion', 'oficina', 'abierto', 'cuando'], actualizado: '2026-09' },
  { titulo: 'Normas administrativas y pagos', descripcion: 'Pagos antes del día 10, altas y bajas antes del 25, recibos devueltos y certificados.', categoria: 'normativa', tipo: 'pagina', url: '/contacto#normas', seccion: 'Normas administrativas',
    etiquetas: ['pago', 'recibo', 'domiciliacion', 'baja', 'alta', 'mensualidad', 'cuota', 'certificado', 'impago'], actualizado: '2026-09' },

  { titulo: 'Programaciones didácticas', descripcion: 'Objetivos, criterios y programación de cada departamento y etapa.', categoria: 'normativa', tipo: 'pagina', url: '/centro/departamentos',
    etiquetas: ['programaciones', 'programacion', 'contenidos', 'materias', 'temario'], actualizado: '2026-09' },
  { titulo: 'Criterios de evaluación', descripcion: 'Criterios generales de cada etapa, promoción y cómo reclamar una nota.', categoria: 'normativa', tipo: 'pagina', url: '/familias/evaluacion',
    etiquetas: ['criterios de evaluacion', 'criterios', 'evaluacion', 'calificacion', 'notas'], actualizado: '2026-09' },

  // Plataformas
  { titulo: 'Alexia · plataforma de familias', descripcion: 'Notas, faltas, comunicaciones con los tutores y autorizaciones.', categoria: 'plataformas', tipo: 'enlace', url: 'https://web2.alexiaedu.com/ACWeb/LogOn.aspx',
    etiquetas: ['alexia', 'notas', 'calificaciones', 'faltas', 'tutor', 'comunicaciones', 'app'], actualizado: '2026-09' },
  { titulo: 'Raíces · Comunidad de Madrid', descripcion: 'Plataforma oficial de gestión académica de la Comunidad de Madrid.', categoria: 'plataformas', tipo: 'enlace', url: 'https://raices.madrid.org/',
    etiquetas: ['raices', 'comunidad de madrid', 'oficial', 'expediente'], actualizado: '2026-09' },
  { titulo: 'Google Classroom', descripcion: 'Tareas, materiales y entregas de cada clase.', categoria: 'plataformas', tipo: 'enlace', url: 'https://classroom.google.com/',
    etiquetas: ['classroom', 'google', 'tareas', 'deberes', 'clase'], actualizado: '2026-10' },
  { titulo: 'Información a las familias', descripcion: 'Ideario, proyecto educativo, normas, servicios y precios, programas y resultados de pruebas externas.', categoria: 'normativa', tipo: 'pagina', url: '/familias/informacion',
    etiquetas: ['informacion', 'precios', 'resultados', 'pruebas externas', 'proyecto educativo', 'transparencia'], actualizado: '2026-10' },
  { titulo: 'Formularios y gestiones en línea', descripcion: 'Altas y bajas de servicios, autorizaciones e inscripciones.', categoria: 'admision', tipo: 'formulario', url: '/familias/formularios',
    etiquetas: ['formulario', 'alta', 'baja', 'servicios', 'secretaria virtual', 'google forms'], actualizado: '2026-10' },
  { titulo: 'Canal interno de información', descripcion: 'Para comunicar posibles infracciones de forma confidencial o anónima (Ley 2/2023).', categoria: 'normativa', tipo: 'pagina', url: '/canal-informante',
    etiquetas: ['canal', 'denuncia', 'informante', 'whistleblowing', 'irregularidad'], actualizado: '2026-10' }
];

// Lo primero que necesita una familia. Es una lista escogida a mano, no una
// estadistica: la web no lleva contador propio en el servidor. Lo que si se
// mide es lo que abre cada visitante, y eso manda sobre este orden.
const DESTACADOS = [
  'Matriculación y actualización de datos',
  'Menú del comedor en PDF',
  'Calendario escolar del curso',
  'Libros de texto 2026-27 · Educación Primaria',
  'Autorización para el uso de imágenes',
  'Autorización de salidas y excursiones',
  'Admisión: formulario de solicitud',
  'Domiciliación bancaria de actividades'
];

// Búsquedas rápidas: lo que más preguntan las familias en secretaría
const RAPIDAS = ['menú', 'horarios', 'precios', 'notas', 'madrugadores', 'becas'];

// ---------------------------------------------------------

(function () {
  'use strict';
  const raiz = document.getElementById('docCenter');
  if (!raiz) return;

  const $ = (id) => document.getElementById(id);
  const input = $('docSearch');
  const limpiarBtn = $('docClear');
  const tabs = $('docTabs');
  const rapidas = $('docRapidas');
  const lista = $('docResults');
  const vacio = $('docEmpty');
  const cuenta = $('docCount');
  const vacioTermino = $('docEmptyTerm');
  const panel = $('docPanel');
  const volver = $('docVolver');
  const vista = $('docVista');
  const columnaVista = $('docVistaCol');
  const estrecho = window.matchMedia('(max-width: 980px)');

  // El peso de cada PDF, leido de los propios archivos al publicar.
  // Si se sube un PDF nuevo hay que anadir aqui su linea.
  const PESOS = {
    '/assets/docs/4eso-empresa.pdf': 9750010,
    '/assets/docs/accede-anexo-i-adhesion.pdf': 93559,
    '/assets/docs/accede-anexo-iv-renuncia.pdf': 84523,
    '/assets/docs/accede-circular-devolucion.pdf': 225924,
    '/assets/docs/accede-instrucciones.pdf': 122357,
    '/assets/docs/admision-calendario-de-actuaciones.pdf': 48321,
    '/assets/docs/admision-criterios-y-baremacion.pdf': 63489,
    '/assets/docs/admision-formulario-de-solicitud.pdf': 2585242,
    '/assets/docs/admision-informacion-basica-familias.pdf': 135694,
    '/assets/docs/admision-mas-informacion.pdf': 562086,
    '/assets/docs/admision-necesidades-educativas-especiales.pdf': 41005,
    '/assets/docs/admision-resolucion-viceconsejerias.pdf': 528286,
    '/assets/docs/admision-vacantes-ofertadas.pdf': 187966,
    '/assets/docs/autorizacion-administracion-medicamentos.pdf': 701034,
    '/assets/docs/autorizacion-recogida-de-alumnos.pdf': 379622,
    '/assets/docs/autorizacion-salidas-extraescolares.pdf': 516174,
    '/assets/docs/autorizacion-uso-de-imagenes.pdf': 527987,
    '/assets/docs/codigo-escuela-4-0.pdf': 5015887,
    '/assets/docs/comunicado-servicios-inicio-de-curso.pdf': 357687,
    '/assets/docs/conformidad-politica-de-privacidad.pdf': 626149,
    '/assets/docs/domiciliacion-bancaria-actividades.pdf': 66366,
    '/assets/docs/guia-cuidado-de-los-libros.pdf': 1843535,
    '/assets/docs/ideario-del-centro.pdf': 37130,
    '/assets/docs/legislacion-educativa.pdf': 1706383,
    '/assets/docs/ley-de-autoridad-del-profesor.pdf': 34830,
    '/assets/docs/libros-texto-2026-2027-eso.pdf': 2505917,
    '/assets/docs/libros-texto-2026-2027-infantil.pdf': 1315245,
    '/assets/docs/libros-texto-2026-2027-primaria.pdf': 2690525,
    '/assets/docs/matriculacion-actualizacion-de-datos.pdf': 840703,
    '/assets/docs/menu-comedor-septiembre-2026.pdf': 913359,
    '/assets/docs/normas-reclamacion-de-notas.pdf': 393439,
    '/assets/docs/plan-de-convivencia.pdf': 392086,
    '/assets/docs/plan-digital-de-centro.pdf': 760602,
    '/assets/docs/proyecto-educativo-de-centro.pdf': 412103,
    '/assets/docs/reglamento-de-regimen-interior.pdf': 336008
  };

  function pesoTexto(url) {
    const b = PESOS[url];
    if (!b) return "";
    return b >= 1048576 ? (b / 1048576).toFixed(1).replace(".", ",") + " MB"
                        : Math.round(b / 1024) + " KB";
  }

  const TIPOS = {
    pdf:        { icono: 'bi-file-earmark-pdf',   nombre: 'PDF' },
    pagina:     { icono: 'bi-file-earmark-text',  nombre: 'Página' },
    enlace:     { icono: 'bi-box-arrow-up-right', nombre: 'Web externa' },
    formulario: { icono: 'bi-ui-checks',          nombre: 'Formulario' }
  };
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  // Sin tildes y en minúsculas: "matricula" encuentra "matrícula"
  const normalizar = (s) => (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const externo = (u) => /^https?:/.test(u || '');
  const dominio = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } };
  const fecha = (am) => { const [a, m] = am.split('-').map(Number); return `${MESES[m - 1]} de ${a}`; };

  // Lo que se abre en esta visita sube en la lista mientras dura la página.
  // Antes se guardaba en localStorage ('nsd-docs-abiertos') para las
  // visitas siguientes; como no es imprescindible para usar la web, ya no
  // se guarda nada en el navegador y se borra lo que quedara de antes.
  const aperturas = {};
  try { localStorage.removeItem('nsd-docs-abiertos'); } catch (e) { /* sin almacenamiento */ }

  function leerAperturas() {
    return aperturas;
  }

  function apuntarApertura(url) {
    if (!url) return;
    aperturas[url] = (aperturas[url] || 0) + 1;
  }

  const INDICE = DOCUMENTOS.map((doc, i) => ({
    doc, i,
    titulo: normalizar(doc.titulo),
    texto: normalizar([doc.titulo, doc.descripcion, (CATEGORIAS[doc.categoria] || {}).nombre, (doc.etiquetas || []).join(' ')].join(' '))
  }));

  let consulta = '';
  let categoria = 'todas';
  let elegido = null;

  // Resaltado de cada palabra buscada, conservando las tildes del original
  function resaltar(texto, termino) {
    const seguro = esc(texto);
    const palabras = normalizar(termino).split(/\s+/).filter(Boolean);
    if (!palabras.length) return seguro;
    const base = normalizar(seguro);
    const tramos = [];
    palabras.forEach((p) => { let pos = base.indexOf(p); while (pos !== -1) { tramos.push([pos, pos + p.length]); pos = base.indexOf(p, pos + p.length); } });
    if (!tramos.length) return seguro;
    tramos.sort((a, b) => a[0] - b[0]);
    const unidos = [tramos[0]];
    for (let k = 1; k < tramos.length; k++) { const u = unidos[unidos.length - 1]; if (tramos[k][0] <= u[1]) u[1] = Math.max(u[1], tramos[k][1]); else unidos.push(tramos[k]); }
    let out = '', c = 0;
    unidos.forEach(([a, b]) => { out += seguro.slice(c, a) + '<mark>' + seguro.slice(a, b) + '</mark>'; c = b; });
    return out + seguro.slice(c);
  }

  const palabrasDe = () => normalizar(consulta).trim().split(/\s+/).filter(Boolean);

  // Todas las palabras deben aparecer; primero lo que coincide en el título
  function filtrar() {
    const palabras = palabrasDe();
    return INDICE
      .filter(({ doc, texto }) => (categoria === 'todas' || categoria === 'todo' || doc.categoria === categoria) && palabras.every((p) => texto.includes(p)))
      .map((x) => ({ ...x, puntos: palabras.reduce((s, p) => s + (x.titulo.includes(p) ? 2 : 1), 0) + (x.doc.url ? 0.5 : 0) }))
      .sort((a, b) => b.puntos - a.puntos || a.i - b.i);
  }

  // Una página no se descarga: se guarda en PDF con el diálogo de
  // impresión, que la web abre sola al llegar con ?imprimir=1.
  const paraImprimir = (u) => {
    const [ruta, ancla] = u.split('#');
    return ruta + (ruta.includes('?') ? '&' : '?') + 'imprimir=1' + (ancla ? '#' + ancla : '');
  };

  // Qué puede llevarse la familia, además de mirarlo en pantalla
  function accion(doc) {
    if (!doc.url) return { icono: 'bi-envelope', texto: 'Pedirlo a secretaría', href: `mailto:secretaria@colegionsdolores.es?subject=${encodeURIComponent('Solicitud: ' + doc.titulo)}`, descarga: false, fuera: false };
    if (externo(doc.url)) return { icono: 'bi-box-arrow-up-right', texto: `Abrir ${dominio(doc.url)}`, href: doc.url, descarga: false, fuera: true };
    if (doc.tipo === 'pdf') return { icono: 'bi-download', texto: 'Descargar el PDF', href: doc.url, descarga: true, fuera: false };
    return { icono: 'bi-file-earmark-arrow-down', texto: 'Guardar esta página en PDF', href: paraImprimir(doc.url), descarga: false, fuera: true };
  }

  const botonAccion = (doc, clase) => {
    const a = accion(doc);
    return `<a class="${clase}" href="${esc(a.href)}"${a.descarga ? ' download' : ''}${a.fuera ? ' target="_blank" rel="noopener noreferrer"' : ''} title="${esc(a.texto)}" data-abre="${esc(doc.url || '')}">
      <i class="bi ${a.icono}" aria-hidden="true"></i><span class="sr-only">${esc(a.texto)}: ${esc(doc.titulo)}</span>
    </a>`;
  };

  function fila({ doc, i }) {
    const t = TIPOS[doc.tipo] || TIPOS.pagina;
    const estado = doc.url ? '' : '<span class="doc2-fila__estado">En secretaría</span>';
    const peso = pesoTexto(doc.url);
    return `<li class="doc2-item"><button type="button" class="doc2-fila${elegido === i ? ' is-elegido' : ''}" data-i="${i}" aria-pressed="${elegido === i}" aria-controls="docVista">
      <span class="doc2-fila__ico" aria-hidden="true"><i class="bi ${t.icono}"></i></span>
      <span class="doc2-fila__txt"><span class="doc2-fila__titulo">${resaltar(doc.titulo, consulta)}</span><span class="doc2-fila__desc">${resaltar(doc.descripcion, consulta)}</span></span>
      <span class="doc2-fila__meta">${estado}<span class="doc2-fila__tipo">${t.nombre}${peso ? ' · ' + peso : ''}</span></span>
    </button>${botonAccion(doc, 'doc2-baja')}</li>`;
  }

  // ── El panel de inicio ──────────────────────────────────
  // Sin buscar nada, la pagina no empieza con 56 filas: empieza con lo que
  // mas se descarga y con las siete carpetas.

  function porTitulo(t) { return INDICE.find((x) => x.doc.titulo === t); }

  // Primero lo que mas ha abierto quien esta mirando; el resto, la lista
  // escogida a mano. Nunca se repite un documento.
  function destacados() {
    const vistos = leerAperturas();
    const fuera = [];
    const mete = (x) => { if (x && fuera.indexOf(x) < 0) fuera.push(x); };
    INDICE.filter((x) => x.doc.url && vistos[x.doc.url])
      .sort((a, b) => vistos[b.doc.url] - vistos[a.doc.url])
      .forEach((x) => mete(Object.assign({}, x, { veces: vistos[x.doc.url] })));
    DESTACADOS.forEach((t) => mete(porTitulo(t)));
    return fuera.slice(0, 8);
  }

  function tarjeta(x) {
    const doc = x.doc;
    const t = TIPOS[doc.tipo] || TIPOS.pagina;
    const a = accion(doc);
    const peso = pesoTexto(doc.url);
    const veces = x.veces > 1 ? `<span class="doc2-tarjeta__veces">${x.veces} veces</span>` : '';
    return `<li><a class="doc2-tarjeta" href="${esc(a.href)}"${a.descarga ? ' download' : ''}${a.fuera ? ' target="_blank" rel="noopener noreferrer"' : ''} data-abre="${esc(doc.url || '')}">
      <span class="doc2-tarjeta__ico" aria-hidden="true"><i class="bi ${t.icono}"></i></span>
      <span class="doc2-tarjeta__nom">${esc(doc.titulo)}</span>
      <span class="doc2-tarjeta__meta">${esc(t.nombre)}${peso ? ' · ' + peso : ''}${veces}</span>
      <span class="doc2-tarjeta__pie"><i class="bi ${a.icono}" aria-hidden="true"></i> ${esc(a.texto)}</span>
    </a></li>`;
  }

  function carpetas() {
    return Object.entries(CATEGORIAS).map(([k, c]) => {
      const n = INDICE.filter(({ doc }) => doc.categoria === k).length;
      return `<li><button type="button" class="doc2-carpeta" data-cat="${k}">
        <span class="doc2-carpeta__ico" aria-hidden="true"><i class="bi ${c.icono}"></i></span>
        <span class="doc2-carpeta__nom">${esc(c.nombre)}</span>
        <span class="doc2-carpeta__pista">${esc(c.pista)}</span>
        <span class="doc2-carpeta__n">${n} ${n === 1 ? 'documento' : 'documentos'}</span>
      </button></li>`;
    }).join('');
  }

  function panelHtml() {
    const top = destacados();
    const hayHistorial = top.some((x) => x.veces);
    const nota = hayHistorial
      ? 'Ordenado con lo que más abrís en este dispositivo. No se guarda en ningún otro sitio.'
      : 'Los impresos y listados con los que empieza el curso.';
    return `<section class="doc2-panel__bloque" aria-labelledby="docTopH">
        <h3 class="doc2-panel__h" id="docTopH"><i class="bi bi-download" aria-hidden="true"></i> Lo más descargado</h3>
        <p class="doc2-panel__nota">${esc(nota)}</p>
        <ul class="doc2-destacados">${top.map(tarjeta).join('')}</ul>
      </section>
      <section class="doc2-panel__bloque" aria-labelledby="docCarpH">
        <h3 class="doc2-panel__h" id="docCarpH"><i class="bi bi-folder2" aria-hidden="true"></i> Las carpetas</h3>
        <p class="doc2-panel__nota">Elegid una para ver solo esos documentos, o buscad arriba.</p>
        <ul class="doc2-carpetas">${carpetas()}</ul>
        <button type="button" class="btn btn--ghost doc2-vertodo" data-cat="todo"><i class="bi bi-list-ul" aria-hidden="true"></i> Ver la lista completa (${INDICE.length} documentos)</button>
      </section>`;
  }

  function pintarTabs() {
    const palabras = palabrasDe();
    const base = INDICE.filter(({ texto }) => palabras.every((p) => texto.includes(p)));
    const n = (c) => base.filter(({ doc }) => doc.categoria === c).length;
    tabs.innerHTML = `<button type="button" class="doc2-tab" data-cat="todo" aria-pressed="${categoria === 'todas' || categoria === 'todo'}">Todo <span>${base.length}</span></button>` +
      Object.entries(CATEGORIAS).map(([k, c]) => `<button type="button" class="doc2-tab" data-cat="${k}" aria-pressed="${categoria === k}"${n(k) ? '' : ' disabled'}><i class="bi ${c.icono}" aria-hidden="true"></i>${c.nombre} <span>${n(k)}</span></button>`).join('');
  }

  function pintar() {
    const res = filtrar();
    const enReposo = !consulta.trim() && categoria === 'todas';

    // En reposo la pagina abre con los destacados y las carpetas; en cuanto
    // se busca o se entra en una carpeta, manda la lista.
    if (panel) {
      panel.hidden = !enReposo;
      panel.innerHTML = enReposo ? panelHtml() : '';
    }
    if (volver) {
      const c = categoria === 'todo' ? { icono: 'bi-list-ul', nombre: 'Todos los documentos' } : CATEGORIAS[categoria];
      const dentro = !!c && !consulta.trim();
      volver.hidden = !dentro;
      volver.innerHTML = dentro
        ? `<button type="button" class="doc2-volver" data-cat="todas"><i class="bi bi-arrow-left" aria-hidden="true"></i> Todas las carpetas</button>
           <span class="doc2-volver__aqui"><i class="bi ${c.icono}" aria-hidden="true"></i> ${esc(c.nombre)}</span>`
        : '';
    }
    // Sin búsqueda y con "Todo": agrupado por categoría. Con búsqueda: por relevancia.
    if (!consulta.trim() && (categoria === 'todas' || categoria === 'todo')) {
      lista.innerHTML = Object.entries(CATEGORIAS).map(([k, c]) => {
        const grupo = res.filter(({ doc }) => doc.categoria === k);
        return grupo.length ? `<li class="doc2-grupo"><h3 class="doc2-grupo__titulo"><i class="bi ${c.icono}" aria-hidden="true"></i> ${c.nombre}</h3><ul>${grupo.map(fila).join('')}</ul></li>` : '';
      }).join('');
    } else lista.innerHTML = res.map(fila).join('');

    const hay = res.length > 0;
    // En reposo solo se ven los destacados y las carpetas: la lista entera
    // duplicaba la página (más de diez pantallas en el móvil).
    lista.hidden = !hay || enReposo;
    vacio.hidden = hay;
    if (vacioTermino) vacioTermino.textContent = consulta.trim() ? `«${consulta.trim()}»` : 'ese filtro';
    limpiarBtn.hidden = !consulta;
    cuenta.hidden = enReposo;
    cuenta.textContent = hay ? `${res.length} ${res.length === 1 ? 'resultado' : 'resultados'}` : 'Ningún resultado';
    pintarTabs();

    // La vista previa sigue al elegido si sigue en la lista; si no, al primero
    if (!res.some(({ i }) => i === elegido)) elegido = hay ? res[0].i : null;
    mostrar(enReposo ? null : elegido, false);
    sincronizarUrl();
  }

  function vistaHtml(doc) {
    const t = TIPOS[doc.tipo] || TIPOS.pagina;
    const c = CATEGORIAS[doc.categoria];
    const cab = `<div class="doc2-vista__cab">
        <span class="doc2-vista__ico" aria-hidden="true"><i class="bi ${t.icono}"></i></span>
        <div><p class="doc2-vista__cat"><i class="bi ${c.icono}" aria-hidden="true"></i> ${c.nombre} · ${t.nombre}</p><h3>${esc(doc.titulo)}</h3></div>
      </div>
      <p class="doc2-vista__desc">${esc(doc.descripcion)}</p>
      ${doc.seccion ? `<p class="doc2-vista__ancla"><i class="bi bi-bookmark-check" aria-hidden="true"></i> Se abre en la sección <strong>${esc(doc.seccion)}</strong></p>` : ''}
      <p class="doc2-vista__fecha"><i class="bi bi-clock-history" aria-hidden="true"></i> Actualizado en ${fecha(doc.actualizado)}</p>`;

    if (!doc.url) {
      const asunto = encodeURIComponent(`Solicitud: ${doc.titulo}`);
      return cab + `<div class="doc2-vista__marco doc2-vista__marco--pendiente">
          <i class="bi bi-hourglass-split" aria-hidden="true"></i>
          <p><strong>Todavía no está publicado en la web.</strong> Secretaría os lo envía por correo o os lo prepara para recoger.</p>
        </div>
        <div class="doc2-vista__acciones">
          <a class="btn btn--primary" href="mailto:secretaria@colegionsdolores.es?subject=${asunto}"><i class="bi bi-envelope" aria-hidden="true"></i> Pedirlo por correo</a>
          <a class="btn btn--ghost" href="tel:+34914719959"><i class="bi bi-telephone" aria-hidden="true"></i> 91 471 99 59</a>
        </div>`;
    }
    if (externo(doc.url)) {
      return cab + `<div class="doc2-vista__marco doc2-vista__marco--externo">
          <i class="bi bi-globe2" aria-hidden="true"></i>
          <p>Se abre en <strong>${esc(dominio(doc.url))}</strong>, en una pestaña nueva.</p>
        </div>
        <div class="doc2-vista__acciones">
          <a class="btn btn--primary" href="${esc(doc.url)}" target="_blank" rel="noopener noreferrer">Abrir ${esc(dominio(doc.url))} <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a>
        </div>`;
    }
    // Página propia o PDF: miniatura real, sin interacción
    return cab + `<div class="doc2-vista__marco doc2-vista__marco--pagina">
        <iframe src="${esc(doc.url)}" title="Vista previa de ${esc(doc.titulo)}" loading="lazy" tabindex="-1" aria-hidden="true"></iframe>
        <a class="doc2-vista__capa" href="${esc(doc.url)}" tabindex="-1" aria-hidden="true"></a>
      </div>
      <div class="doc2-vista__acciones">
        <a class="btn btn--primary" href="${esc(doc.url)}" data-abre="${esc(doc.url)}">${doc.tipo === 'pdf' ? 'Abrir el PDF' : 'Abrir la página'} <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
        <a class="btn btn--ghost" href="${esc(accion(doc).href)}"${doc.tipo === 'pdf' ? ' download' : ' target="_blank" rel="noopener noreferrer"'} data-abre="${esc(doc.url)}"><i class="bi ${accion(doc).icono}" aria-hidden="true"></i> ${doc.tipo === 'pdf' ? 'Descargar' : 'Guardar en PDF'}</a>
        <button type="button" class="btn btn--ghost" data-copiar="${esc(doc.url)}"><i class="bi bi-link-45deg" aria-hidden="true"></i> Copiar enlace</button>
      </div>`;
  }

  // La vista previa va al lado en escritorio y debajo de la fila en móvil
  // En móvil la vista va dentro de su propio <li>: una <ul> solo admite <li>
  const envoltorioVista = document.createElement('li');
  envoltorioVista.className = 'doc2-vista-li';
  envoltorioVista.style.listStyle = 'none';
  function colocarVista() {
    if (estrecho.matches) {
      const btn = lista.querySelector(`[data-i="${elegido}"]`);
      if (btn) { btn.closest('li').after(envoltorioVista); envoltorioVista.appendChild(vista); }
      else { columnaVista.appendChild(vista); envoltorioVista.remove(); }
    } else if (vista.parentElement !== columnaVista) { columnaVista.appendChild(vista); envoltorioVista.remove(); }
  }

  function mostrar(i, enfocar) {
    elegido = i;
    lista.querySelectorAll('.doc2-fila').forEach((b) => {
      const si = Number(b.dataset.i) === i;
      b.classList.toggle('is-elegido', si);
      b.setAttribute('aria-pressed', String(si));
    });
    if (i === null || i === undefined) { vista.hidden = true; return; }
    if (vista.dataset.doc !== String(i)) {
      vista.innerHTML = vistaHtml(DOCUMENTOS[i]);
      vista.dataset.doc = String(i);
      const marco = vista.querySelector('.doc2-vista__marco--pagina iframe');
      if (marco) marco.addEventListener('load', () => irAlAncla(marco));
    }
    vista.hidden = false;
    colocarVista();
    ajustarMiniatura();
    if (enfocar && estrecho.matches) vista.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // El # en el src no siempre lleva la miniatura a la sección (la página
  // aún está montándose cuando el navegador salta), así que se empuja
  // desde aquí en cuanto termina de cargar. Es el mismo origen.
  function irAlAncla(iframe) {
    const ancla = (iframe.getAttribute('src').split('#')[1] || '');
    if (!ancla) return;
    const empujar = () => {
      try {
        const doc = iframe.contentDocument;
        const destino = doc && doc.getElementById(ancla);
        if (destino) iframe.contentWindow.scrollTo(0, Math.max(0, destino.getBoundingClientRect().top + iframe.contentWindow.scrollY - 40));
      } catch (e) { /* si no se deja, la miniatura se queda arriba */ }
    };
    // Se repite porque la página sigue creciendo mientras cargan las
    // imágenes: el primer salto se queda corto.
    [0, 400, 1200].forEach((t) => setTimeout(empujar, t));
  }

  // La miniatura se pinta a 1280 px y se reduce al ancho real del marco
  function ajustarMiniatura() {
    const marco = vista.querySelector('.doc2-vista__marco--pagina');
    if (!marco || !marco.clientWidth) return;
    marco.querySelector('iframe').style.transform = `scale(${marco.clientWidth / 1280})`;
  }
  if (window.ResizeObserver) new ResizeObserver(ajustarMiniatura).observe(vista);

  function sincronizarUrl() {
    const p = new URLSearchParams();
    if (consulta.trim()) p.set('q', consulta.trim());
    if (categoria !== 'todas') p.set('cat', categoria);
    const s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }

  // ── Eventos ──
  input.addEventListener('input', () => { consulta = input.value; pintar(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && consulta) { e.preventDefault(); consulta = ''; input.value = ''; pintar(); }
    if (e.key === 'ArrowDown') { const b = lista.querySelector('.doc2-fila'); if (b) { e.preventDefault(); b.focus(); } }
  });
  limpiarBtn.addEventListener('click', () => { consulta = ''; input.value = ''; input.focus(); pintar(); });
  tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (!b || b.disabled) return; categoria = b.dataset.cat; pintar(); });
  rapidas.innerHTML = RAPIDAS.map((r) => `<button type="button" class="doc2-rapida" data-q="${esc(r)}">${esc(r)}</button>`).join('');
  rapidas.addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (!b) return; consulta = b.dataset.q; input.value = consulta; categoria = 'todas'; pintar(); });
  lista.addEventListener('click', (e) => { const b = e.target.closest('.doc2-fila'); if (b) mostrar(Number(b.dataset.i), true); });
  // Flechas para recorrer la lista
  lista.addEventListener('keydown', (e) => {
    const b = e.target.closest('.doc2-fila');
    if (!b || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    e.preventDefault();
    const todas = [...lista.querySelectorAll('.doc2-fila')];
    const sig = todas[todas.indexOf(b) + (e.key === 'ArrowDown' ? 1 : -1)];
    if (sig) { sig.focus(); mostrar(Number(sig.dataset.i), false); } else if (e.key === 'ArrowUp') input.focus();
  });
  vista.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copiar]');
    if (!b) return;
    const url = new URL(b.dataset.copiar, location.origin).href;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
      () => { b.innerHTML = '<i class="bi bi-check-lg" aria-hidden="true"></i> Enlace copiado'; },
      () => { window.prompt('Copiad este enlace:', url); });
  });
  if (estrecho.addEventListener) estrecho.addEventListener('change', colocarVista);

  // El panel: una carpeta lleva a su lista, sin perder de vista el buscador.
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function irALista() {
    const ancla = raiz.querySelector('.doc2__buscador');
    if (ancla) ancla.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
  }
  if (panel) panel.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    categoria = b.dataset.cat;
    pintar();
    irALista();
  });
  if (volver) volver.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    categoria = b.dataset.cat;
    pintar();
    irALista();
  });
  // Cualquier boton de abrir o descargar suma en el contador del navegador
  raiz.addEventListener('click', (e) => {
    const a = e.target.closest('[data-abre]');
    if (a && a.dataset.abre) apuntarApertura(a.dataset.abre);
  });

  // Atajos: "/" o Ctrl/Cmd+K llevan al buscador
  document.addEventListener('keydown', (e) => {
    const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.key === '/' && !escribiendo) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); input.focus(); input.select(); }
  });

  // Estado inicial desde la URL (se puede compartir una búsqueda)
  const p = new URLSearchParams(location.search);
  if (p.get('q')) { consulta = p.get('q'); input.value = consulta; }
  if (p.get('cat') && (CATEGORIAS[p.get('cat')] || p.get('cat') === 'todo')) categoria = p.get('cat');
  raiz.classList.add('is-listo');
  pintar();
})();
