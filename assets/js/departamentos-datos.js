/* =========================================================
   Departamentos y etapas: datos de partida
   ---------------------------------------------------------
   Es la ficha que se ve si el panel de edición todavía no está
   configurado o si un departamento aún no ha rellenado algo.
   Lo que cada departamento publique desde el panel
   (/panel) SUSTITUYE campo a campo a lo que hay aquí.

   Si se añade un departamento:
     1. Añadirlo aquí (id igual que en supabase/02_ambitos.sql).
     2. node scripts/generar-departamentos.mjs  → crea su página.
     3. Añadirlo a 02_ambitos.sql y ejecutarlo en Supabase.

   Los campos "obligatorios" (objetivos, criterios de evaluación,
   instrumentos, calificación y programación) se quedan vacíos a
   propósito: tiene que escribirlos cada departamento. Mientras
   falten, la ficha lo dice y remite a secretaría.
   ========================================================= */
(function (raiz) {
  'use strict';

  const GRUPOS = [
    { id: 'Infantil y Primaria', titulo: 'Educación Infantil y Primaria', icono: 'bi-balloon-heart',
      texto: 'Los equipos docentes de cada etapa: propuesta pedagógica, criterios de evaluación y programaciones.' },
    { id: 'ESO', titulo: 'Educación Secundaria Obligatoria', icono: 'bi-mortarboard',
      texto: 'Cada departamento coordina su materia de 1.º a 4.º de ESO.' },
    { id: 'Orientación y apoyo', titulo: 'Orientación y apoyo', icono: 'bi-compass',
      texto: 'Atención a la diversidad, orientación académica y recursos para alumnos y familias.' },
    { id: 'Bilingüismo', titulo: 'Bilingüismo', icono: 'bi-translate',
      texto: 'El Programa Bilingüe de la Comunidad de Madrid, desde Infantil hasta 4.º de ESO.' }
  ];

  const D = [
    {
      id: 'etapa-infantil', slug: 'infantil', nombre: 'Educación Infantil', corto: 'Infantil', grupo: 'Infantil y Primaria',
      esquema: 'etapa', icono: 'bi-balloon-heart', color: 1,
      resumen: 'Segundo ciclo de Infantil (3 a 6 años): aprendizaje global, juego y primer contacto con el inglés.',
      defecto: {
        presentacion: 'El segundo ciclo de Educación Infantil acoge a niños y niñas de 3 a 6 años. Se trabaja de forma global, a través del juego, la experimentación y las rutinas, con un primer contacto diario con el inglés dentro del Programa Bilingüe.\n\nEl primer ciclo (0 a 3 años) tiene su propia web: [Escuela Infantil NSD](https://infantil-nsd.vercel.app).',
        areas: ['Crecimiento en Armonía', 'Descubrimiento y Exploración del Entorno', 'Comunicación y Representación de la Realidad'],
        recursos: [{ texto: 'Página de la etapa', url: '/etapas/infantil-3-6' }]
      }
    },
    {
      id: 'etapa-primaria', slug: 'primaria', nombre: 'Educación Primaria', corto: 'Primaria', grupo: 'Infantil y Primaria',
      esquema: 'etapa', icono: 'bi-book', color: 2,
      resumen: 'De 1.º a 6.º: criterios de evaluación, calificación y promoción y programaciones de cada área.',
      defecto: {
        presentacion: 'La Educación Primaria va de 1.º a 6.º y se organiza en tres ciclos de dos cursos. El equipo docente de cada ciclo coordina la programación de las áreas y la evaluación del alumnado.',
        areas: ['Lengua Castellana y Literatura', 'Matemáticas', 'Ciencias de la Naturaleza', 'Ciencias Sociales', 'Lengua Extranjera: Inglés', 'Educación Artística', 'Educación Física', 'Religión o Atención Educativa', 'Educación en Valores Cívicos y Éticos (en el tercer ciclo)'],
        recursos: [{ texto: 'Página de la etapa', url: '/etapas/primaria' }, { texto: 'Evaluación, promoción y reclamaciones', url: '/familias/evaluacion' }]
      }
    },
    {
      id: 'dep-matematicas', slug: 'matematicas', nombre: 'Matemáticas', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-calculator', color: 2,
      resumen: 'Resolución de problemas y razonamiento lógico, con material manipulativo desde los primeros cursos.',
      defecto: { presentacion: 'Metodología manipulativa, resolución de problemas y razonamiento lógico desde los primeros cursos.', cursos: ['1.º a 4.º de ESO'] }
    },
    {
      id: 'dep-lengua', slug: 'lengua', nombre: 'Lengua Castellana y Literatura', corto: 'Lengua', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-book', color: 4,
      resumen: 'Comprensión lectora, expresión oral y escrita y animación a la lectura con la biblioteca del centro.',
      defecto: { presentacion: 'Comprensión lectora, expresión oral y escrita, y animación a la lectura con la biblioteca del centro y el plan lector.', cursos: ['1.º a 4.º de ESO'] }
    },
    {
      id: 'dep-geografia-historia', slug: 'geografia-historia', nombre: 'Geografía e Historia', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-globe-europe-africa', color: 5,
      resumen: 'Geography & History dentro del programa bilingüe, con proyectos de patrimonio y ciudadanía.',
      defecto: { presentacion: 'Geography & History dentro del Programa Bilingüe, con proyectos de patrimonio, ciudadanía y salidas culturales.', cursos: ['1.º a 4.º de ESO'] }
    },
    {
      id: 'dep-ciencias', slug: 'ciencias', nombre: 'Ciencias', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-eyedropper', color: 3,
      resumen: 'Biology & Geology y Physics & Chemistry, con prácticas en el laboratorio del centro.',
      defecto: { presentacion: 'Biology & Geology y Physics & Chemistry, con prácticas en el laboratorio propio del centro y parte de las clases en inglés.', cursos: ['Biología y Geología', 'Física y Química'] }
    },
    {
      id: 'dep-tecnologia', slug: 'tecnologia', nombre: 'Tecnología y Digitalización', corto: 'Tecnología', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-cpu', color: 6,
      resumen: 'Robótica, programación e impresión 3D en el aula taller, dentro del programa Código Escuela 4.0.',
      defecto: { presentacion: 'Robótica, programación e impresión 3D en el aula taller, dentro del programa Código Escuela 4.0.' }
    },
    {
      id: 'dep-ingles', slug: 'ingles', nombre: 'Inglés', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-translate', color: 1,
      resumen: 'Programa Bilingüe oficial, con profesorado especialista y preparación de los exámenes de Cambridge.',
      defecto: { presentacion: 'Programa Bilingüe oficial de la Comunidad de Madrid, con profesorado especialista y auxiliares de conversación. El colegio es centro examinador autorizado de Cambridge.', cursos: ['1.º a 4.º de ESO'] }
    },
    {
      id: 'dep-frances', slug: 'frances', nombre: 'Francés', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-chat-quote', color: 1,
      resumen: 'Segunda lengua extranjera en la ESO, con preparación de los exámenes oficiales DELF.',
      defecto: { presentacion: 'Segunda lengua extranjera en la ESO, con preparación de los exámenes oficiales DELF.' }
    },
    {
      id: 'dep-educacion-fisica', slug: 'educacion-fisica', nombre: 'Educación Física', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-bicycle', color: 3,
      resumen: 'Deporte escolar y hábitos saludables, con 1.500 m² de instalaciones deportivas.',
      defecto: { presentacion: 'Deporte escolar y hábitos saludables. Los 1.500 m² de instalaciones deportivas permiten trabajar baloncesto, voleibol, fútbol sala y otros deportes, a veces con varios grupos a la vez.', cursos: ['1.º a 4.º de ESO'] }
    },
    {
      id: 'dep-artistico', slug: 'artistico', nombre: 'Departamento Artístico', corto: 'Artístico', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-palette', color: 5,
      resumen: 'Música y Plástica, con proyectos que atraviesan las etapas y actividades en la Semana Cultural.',
      defecto: { presentacion: 'Música y Educación Plástica, Visual y Audiovisual, con proyectos artísticos que atraviesan las etapas, murales colectivos y actividades en la Semana Cultural.', cursos: ['Música', 'Educación Plástica, Visual y Audiovisual'] }
    },
    {
      id: 'dep-religion-valores', slug: 'religion-valores', nombre: 'Religión y Atención Educativa', corto: 'Religión y At. Educativa', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-signpost-split', color: 4,
      resumen: 'Religión, de oferta obligatoria para el centro y voluntaria para las familias, y su alternativa de Atención Educativa.',
      defecto: { presentacion: 'La ley obliga a todos los centros a ofrecer la asignatura de Religión, que es voluntaria para el alumnado. Quien no la elige cursa Atención Educativa. Esta oferta es compatible con el carácter laico del colegio, recogido en su ideario.', cursos: ['Religión', 'Atención Educativa'] }
    },
    {
      id: 'dep-diversificacion', slug: 'diversificacion', nombre: 'Diversificación Curricular', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-diagram-3', color: 6,
      resumen: 'Programa de 3.º y 4.º de ESO para que más alumnos obtengan el título (antes, PMAR).',
      defecto: { presentacion: 'El Programa de Diversificación Curricular organiza los contenidos de 3.º y 4.º de ESO en ámbitos, con grupos reducidos y una metodología adaptada, para que el alumnado que lo necesita pueda obtener el título de Graduado en ESO. Sustituye a los antiguos Programas de Mejora del Aprendizaje (PMAR).', cursos: ['3.º y 4.º de ESO'] }
    },
    {
      id: 'dep-orientacion', slug: 'orientacion', nombre: 'Orientación', grupo: 'Orientación y apoyo', esquema: 'orientacion',
      icono: 'bi-compass', color: 4,
      resumen: 'Detección temprana de dificultades, atención a la diversidad y orientación académica y profesional.',
      defecto: {
        presentacion: 'El Departamento de Orientación lo forman dos profesionales de la psicopedagogía y trabaja en las tres etapas, en colaboración con tutores y familias.',
        funciones: ['Evaluación psicopedagógica para detectar necesidades específicas de apoyo educativo.', 'Asesoramiento al profesorado en las medidas de atención a la diversidad.', 'Coordinación con las familias y con los servicios externos (equipos de orientación, servicios sociales y sanitarios).', 'Orientación académica y profesional, sobre todo en 3.º y 4.º de ESO.', 'Apoyo al plan de acción tutorial y a la convivencia.'],
        atencion_diversidad: 'Refuerzos, adaptaciones, planes individualizados y coordinación con las familias, según las necesidades de cada alumno y lo que prevé la normativa de la Comunidad de Madrid.'
      }
    },
    {
      id: 'dep-bilinguismo', slug: 'bilinguismo', nombre: 'Bilingüismo', grupo: 'Bilingüismo', esquema: 'bilinguismo',
      icono: 'bi-translate', color: 1,
      resumen: 'Centro bilingüe de la Comunidad de Madrid desde 2004 (Orden 2476/2014), de Infantil a 4.º de ESO.',
      defecto: {
        presentacion: 'El colegio forma parte del Programa Bilingüe de la Comunidad de Madrid desde 2004 (centro concertado bilingüe, B.O.C.M. Orden 2476/2014, de 31 de julio).',
        certificaciones: ['Cambridge Assessment English (centro examinador autorizado)', 'Programa BEDA y BEDA Kids']
      }
    }
  ];

  const api = { GRUPOS, DEPARTAMENTOS: D };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.NSD_DEPARTAMENTOS = api;
})(typeof window !== 'undefined' ? window : globalThis);
