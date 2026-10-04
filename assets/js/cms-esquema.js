/* =========================================================
   Colegio NSD · Qué se puede editar desde el panel
   ---------------------------------------------------------
   Un "esquema" es la lista de campos de un tipo de ámbito. El
   panel dibuja el formulario a partir de aquí y la web pública
   usa los mismos nombres de campo para pintar el contenido.
   Los ámbitos (qué departamento o sección es cada uno) están en
   la base de datos (supabase/02_ambitos.sql).

   Tipos de campo:
     texto     una línea
     parrafos  texto largo; línea en blanco = párrafo nuevo;
               líneas que empiezan por "- " = lista;
               [texto](https://enlace) = enlace
     lista     una entrada por línea
     enlaces   una entrada por línea: Texto | https://enlace
     documentos  archivos subidos al panel (PDF, Word, Excel…) con título
     imagenes  fotos subidas al panel, con su descripción
     filas     tabla con las columnas indicadas
     email, url
   "minimo": lo mínimo que tiene que tener el campo cuando se rellena
     ({ caracteres: N } o { elementos: N }), para que no se publique
     un apartado a medias. Un campo vacío se puede guardar: sale
     como pendiente.
   "ejemplo": texto de muestra que se ve en el campo vacío y que
     marca la estructura que se espera.
   "obligatorio": lo exige la normativa o la web no tiene
   sentido sin ello. El panel avisa si falta y la página pública
   lo marca como pendiente.
   ========================================================= */
(function (raiz) {
  'use strict';

  const OBJETIVOS = { clave: 'objetivos', etiqueta: 'Objetivos', tipo: 'lista', obligatorio: true, minimo: { elementos: 3 },
    ayuda: 'Al menos tres, uno por línea. Qué se espera que aprenda el alumnado en vuestra materia o etapa.',
    ejemplo: 'Comprender y expresar ideas con claridad, de forma oral y escrita.\nResolver problemas aplicando lo aprendido a situaciones reales.\nTrabajar en equipo y respetar las opiniones de los demás.' };
  const CRITERIOS = { clave: 'criterios_evaluacion', etiqueta: 'Criterios de evaluación', tipo: 'parrafos', obligatorio: true, minimo: { caracteres: 60 },
    ayuda: 'Cómo se valora el aprendizaje: un resumen claro, mejor por curso con un subtítulo para cada uno. Si tenéis el documento completo, súbelo con el botón «Archivo» y quedará como botón de descarga.',
    ejemplo: '## 1.º de ESO\nSe valora la comprensión de los contenidos, el razonamiento y la expresión…\n\n## 2.º de ESO\n…' };
  const INSTRUMENTOS = { clave: 'instrumentos', etiqueta: 'Instrumentos y procedimientos de evaluación', tipo: 'lista', obligatorio: true, minimo: { elementos: 2 },
    ayuda: 'Al menos dos, uno por línea: exámenes, trabajos, observación en clase, cuaderno, proyectos, exposiciones…',
    ejemplo: 'Pruebas escritas al final de cada unidad.\nTrabajos y proyectos individuales y en grupo.\nObservación del trabajo diario en clase.' };
  const CALIFICACION = { clave: 'criterios_calificacion', etiqueta: 'Criterios de calificación', tipo: 'filas', obligatorio: true, minimo: { elementos: 2 },
    columnas: [{ clave: 'concepto', etiqueta: 'Qué se califica' }, { clave: 'peso', etiqueta: 'Peso en la nota' }],
    ayuda: 'Cómo se obtiene la nota, con al menos dos filas. Por ejemplo: Pruebas escritas · 60 %.' };
  const PROGRAMACION = { clave: 'programaciones', etiqueta: 'Programaciones didácticas', tipo: 'documentos', obligatorio: true, minimo: { elementos: 1 },
    ayuda: 'Una por curso o una para todo el departamento, con un título claro (por ejemplo, «Programación de 2.º de ESO, curso 2026-2027»). PDF, Word, Excel o PowerPoint, hasta 15 MB.' };
  const PRESENTACION = { clave: 'presentacion', etiqueta: 'Presentación', tipo: 'parrafos', minimo: { caracteres: 120 },
    ayuda: 'Dos o tres frases sobre el departamento y su forma de trabajar. Puedes añadir subtítulos, enlaces como botones, archivos e imágenes con la barra de herramientas.',
    ejemplo: 'El departamento trabaja… En clase se combinan…\n\n## Qué hacemos este curso\n- Proyecto…\n- Salida a…' };
  const GALERIA = { clave: 'galeria', etiqueta: 'Fotos', tipo: 'imagenes',
    ayuda: 'Fotos de proyectos, salidas o del aula. Describe cada una en una frase. No subáis fotos en las que se reconozca a alumnos sin autorización de imagen.' };
  const RECURSOS = { clave: 'recursos', etiqueta: 'Recursos y enlaces', tipo: 'enlaces',
    ayuda: 'Cada fila es un botón: un enlace o un archivo que subas. Con «Grupo» se ordenan en desplegables (por ejemplo, por curso).' };

  const ESQUEMAS = {
    departamento: [
      PRESENTACION,
      { clave: 'cursos', etiqueta: 'Cursos y materias', tipo: 'lista',
        ayuda: 'Una por línea. Por ejemplo: 1.º ESO · Matemáticas (bilingüe).' },
      OBJETIVOS, CRITERIOS, INSTRUMENTOS, CALIFICACION,
      { clave: 'recuperacion', etiqueta: 'Recuperación y materias pendientes', tipo: 'parrafos', minimo: { caracteres: 60 },
        ayuda: 'Cómo se recupera una evaluación y una materia pendiente de cursos anteriores. Puedes adjuntar los materiales con el botón «Archivo».',
        ejemplo: '## Recuperar una evaluación\n…\n\n## Materia pendiente de cursos anteriores\n…' },
      PROGRAMACION,
      { clave: 'profesorado', etiqueta: 'Profesorado', tipo: 'lista',
        ayuda: 'Una persona por línea. Opcional. Solo nombre y función: nada de correos personales.',
        ejemplo: 'Nombre Apellidos · jefa del departamento\nNombre Apellidos' },
      GALERIA,
      RECURSOS
    ],
    etapa: [
      Object.assign({}, PRESENTACION, { etiqueta: 'Presentación de la etapa' }),
      { clave: 'areas', etiqueta: 'Áreas y horario', tipo: 'lista', ayuda: 'Una por línea.' },
      OBJETIVOS, CRITERIOS, INSTRUMENTOS,
      Object.assign({}, CALIFICACION, { obligatorio: false,
        ayuda: 'En Primaria: IN, SU, BI, NT, SB y cómo se llega a cada uno. En Infantil no hay calificación numérica: puede quedar vacío.' }),
      { clave: 'promocion', etiqueta: 'Criterios de promoción', tipo: 'parrafos',
        ayuda: 'En Primaria, cuándo se decide la permanencia de un año más. En Infantil puede quedar vacío.' },
      Object.assign({}, PROGRAMACION, { etiqueta: 'Programaciones didácticas y propuesta pedagógica' }),
      { clave: 'profesorado', etiqueta: 'Profesorado', tipo: 'lista',
        ayuda: 'Una persona por línea. Opcional. Solo nombre y función: nada de correos personales.' },
      GALERIA,
      RECURSOS
    ],
    orientacion: [
      PRESENTACION,
      { clave: 'funciones', etiqueta: 'Funciones del Departamento de Orientación', tipo: 'lista', obligatorio: true },
      { clave: 'atencion_diversidad', etiqueta: 'Medidas de atención a la diversidad', tipo: 'parrafos', obligatorio: true },
      { clave: 'recursos_alumnos', etiqueta: 'Recursos para alumnos', tipo: 'enlaces' },
      { clave: 'recursos_familias', etiqueta: 'Recursos para familias', tipo: 'enlaces' },
      { clave: 'materias', etiqueta: 'Materias vinculadas al Departamento', tipo: 'lista' },
      Object.assign({}, PROGRAMACION, { obligatorio: false, minimo: null, etiqueta: 'Plan de orientación y documentos' }),
      { clave: 'profesorado', etiqueta: 'Equipo', tipo: 'lista' },
      GALERIA
    ],
    bilinguismo: [
      { clave: 'presentacion', etiqueta: 'Presentación del programa', tipo: 'parrafos' },
      { clave: 'infantil_primaria', etiqueta: 'Infantil y Primaria', tipo: 'parrafos' },
      { clave: 'eso', etiqueta: 'Educación Secundaria', tipo: 'parrafos' },
      { clave: 'certificaciones', etiqueta: 'Exámenes y certificaciones', tipo: 'lista' },
      { clave: 'resultados', etiqueta: 'Resultados de las pruebas externas de inglés', tipo: 'filas',
        columnas: [{ clave: 'curso', etiqueta: 'Curso y prueba' }, { clave: 'resultado', etiqueta: 'Resultado' }],
        ayuda: 'La normativa de Madrid pide publicar los resultados de las pruebas externas, también las de bilingüismo.' },
      Object.assign({}, PROGRAMACION, { obligatorio: false, minimo: null, etiqueta: 'Documentos del programa' }),
      { clave: 'profesorado', etiqueta: 'Profesorado y auxiliares', tipo: 'lista',
        ayuda: 'Una persona por línea. Por ejemplo: «Primaria · Nombre Apellidos (coordinadora)». Nada de correos personales.' },
      GALERIA
    ],
    noticias: [
      { clave: 'breves', etiqueta: 'Comunicados breves', tipo: 'noticias',
        ayuda: 'Avisos cortos que aparecen en la portada y en el blog. Para una noticia con texto largo, foto o documento, usa «Blog» en el menú.' }
    ],
    secretaria: [
      { clave: 'aviso', etiqueta: 'Aviso destacado para familias', tipo: 'texto',
        ayuda: 'Se ve arriba en la página de Familias. Vacío = sin aviso.' },
      { clave: 'aviso_enlace', etiqueta: 'Enlace del aviso (opcional)', tipo: 'url' },
      { clave: 'horario', etiqueta: 'Horario de secretaría', tipo: 'filas',
        columnas: [{ clave: 'periodo', etiqueta: 'Periodo' }, { clave: 'manana', etiqueta: 'Mañanas' }, { clave: 'tarde', etiqueta: 'Tardes' }] },
      { clave: 'notas', etiqueta: 'Normas administrativas', tipo: 'lista' }
    ],
    formularios: [
      { clave: 'lista', etiqueta: 'Formularios adicionales', tipo: 'filas',
        columnas: [{ clave: 'titulo', etiqueta: 'Nombre del formulario' }, { clave: 'para', etiqueta: 'Para qué sirve' },
                   { clave: 'plazo', etiqueta: 'Plazo' }, { clave: 'url', etiqueta: 'Enlace al formulario', tipo: 'url' }],
        ayuda: 'Los cinco formularios de secretaría ya están en la web y se actualizan solos cuando cambian en Google. Aquí solo hace falta añadir otros nuevos: pega su enlace de Google Forms (o del que uséis) y revisa que el formulario incluya la información de protección de datos.' }
    ],
    'informacion-familias': [
      { clave: 'precios', etiqueta: 'Precios de actividades complementarias, extraescolares y servicios', tipo: 'filas', obligatorio: true,
        columnas: [{ clave: 'concepto', etiqueta: 'Actividad o servicio' }, { clave: 'precio', etiqueta: 'Precio' }, { clave: 'nota', etiqueta: 'Observaciones' }],
        ayuda: 'Obligatorio en los centros concertados de Madrid (Resolución de 4 de diciembre de 2023). Todas son voluntarias y no lucrativas.' },
      { clave: 'pruebas_externas', etiqueta: 'Resultados de las pruebas de evaluación externas', tipo: 'filas', obligatorio: true,
        columnas: [{ clave: 'prueba', etiqueta: 'Prueba y curso' }, { clave: 'resultado', etiqueta: 'Resultado del centro' }, { clave: 'referencia', etiqueta: 'Media de referencia' }] },
      { clave: 'programas', etiqueta: 'Programas y proyectos del centro', tipo: 'lista' },
      { clave: 'pec_lineas', etiqueta: 'Líneas básicas del Proyecto Educativo', tipo: 'parrafos', obligatorio: true },
      { clave: 'vacantes', etiqueta: 'Vacantes y admisión (texto breve)', tipo: 'parrafos' },
      { clave: 'actualizado', etiqueta: 'Curso al que se refiere esta información', tipo: 'texto', obligatorio: true,
        ayuda: 'Por ejemplo: 2026-2027. La información tiene que estar siempre al día.' }
    ],
    evaluacion: [
      { clave: 'calendario', etiqueta: 'Fechas de evaluación y entrega de notas', tipo: 'filas',
        columnas: [{ clave: 'evaluacion', etiqueta: 'Evaluación' }, { clave: 'fecha', etiqueta: 'Fecha' }] },
      { clave: 'infantil', etiqueta: 'Criterios generales · Infantil', tipo: 'parrafos' },
      { clave: 'primaria', etiqueta: 'Criterios generales · Primaria', tipo: 'parrafos' },
      { clave: 'eso', etiqueta: 'Criterios generales · ESO', tipo: 'parrafos' },
      { clave: 'reclamaciones', etiqueta: 'Procedimiento de reclamación (texto propio del centro)', tipo: 'parrafos' }
    ],
    legal: [
      { clave: 'dpd_nombre', etiqueta: 'Delegado de Protección de Datos (nombre o empresa)', tipo: 'texto', obligatorio: true },
      { clave: 'dpd_email', etiqueta: 'Correo del Delegado de Protección de Datos', tipo: 'email', obligatorio: true },
      { clave: 'registro_mercantil', etiqueta: 'Datos de inscripción en el Registro Mercantil', tipo: 'texto', obligatorio: true,
        ayuda: 'Ejemplo: Registro Mercantil de Madrid, tomo X, folio Y, hoja M-Z.' },
      { clave: 'coordinador_bienestar', etiqueta: 'Coordinación de bienestar y protección (nombre)', tipo: 'texto', obligatorio: true },
      { clave: 'coordinador_email', etiqueta: 'Correo de la coordinación de bienestar', tipo: 'email' },
      { clave: 'canal_responsable', etiqueta: 'Responsable del Sistema interno de información', tipo: 'texto', obligatorio: true,
        ayuda: 'Persona o comité nombrado por la titularidad (Ley 2/2023, art. 8).' },
      { clave: 'canal_externo', etiqueta: 'Otro canal del centro (si ya tenéis uno contratado)', tipo: 'url' }
    ]
  };

  

  const api = { ESQUEMAS };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.NSD_ESQUEMA = api;
})(typeof window !== 'undefined' ? window : globalThis);
