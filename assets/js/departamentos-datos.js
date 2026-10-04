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
      defecto: {
        presentacion: 'Metodología manipulativa, resolución de problemas y razonamiento lógico desde los primeros cursos.',
        cursos: ['1.º a 4.º de ESO'],
        profesorado: ["Marga Orell Cernuda · jefa del departamento", "Mónica Merino Polo", "Pablo Martínez Carreño", "Sergio Álvarez Blanco", "Tamara Villa Piña", "Yésica Horcajada Domingo"],
        criterios_calificacion: [{"concepto": "Criterios de calificación de 1.º a 4.º de ESO", "peso": "[Ver el documento](https://docs.google.com/document/d/1tn0bTklHkXzaCDmT-vseu4Ak-9fLetcZ/edit?usp=sharing)"}]
      }
    },
    {
      id: 'dep-lengua', slug: 'lengua', nombre: 'Lengua Castellana y Literatura', corto: 'Lengua', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-book', color: 4,
      resumen: 'Comprensión lectora, expresión oral y escrita y animación a la lectura con la biblioteca del centro.',
      defecto: {
        presentacion: 'Comprensión lectora, expresión oral y escrita, y animación a la lectura con la biblioteca del centro y el plan lector.',
        cursos: ['1.º a 4.º de ESO'],
        profesorado: ["Pilar Ayllón Prados · jefa del departamento", "Virginia Tejedor Guillén", "Raúl Herschel Junyent", "Augusto Vilchez Sag", "Guillermo Fenoy Magán", "Clara Berea Navamuel"],
        criterios_evaluacion: "El departamento publica sus criterios de evaluación en este documento: [Criterios de evaluación de Lengua Castellana y Literatura](https://docs.google.com/document/d/1jhQALp3nfA12sDtvHwjH_C7AirdH_Fm_/edit?usp=sharing).",
        recuperacion: "Contenidos para recuperar la materia pendiente de cursos anteriores:\n\n- [Pendientes de 1.º y 2.º de ESO](https://drive.google.com/file/d/1oj7-EVhgVNK9nTn-0XpSqmLGJBAgFh98/view?usp=sharing)\n- [Pendientes de 3.º de ESO](https://drive.google.com/file/d/1ZIbb2Xlklf-32bie3YzAIGi_8dimaCmg/view?usp=sharing)",
        recursos: [{"texto": "Ejercicios de refuerzo · 1.º ESO", "url": "https://drive.google.com/drive/folders/1LZ-hcF-uMgfroD3oX1_wwbIsaMY-Ptzu?usp=sharing"}, {"texto": "Ejercicios de refuerzo · 2.º ESO", "url": "https://drive.google.com/drive/folders/1z6jp_oNmOJU7BNvXJj27Mhpx2yMuCC5T?usp=sharing"}, {"texto": "Ejercicios de refuerzo · 3.º ESO", "url": "https://drive.google.com/drive/folders/1reIPwVagIWURdJcN7xyb9y0UXnVgfMIH?usp=sharing"}, {"texto": "Ejercicios de refuerzo · 4.º ESO", "url": "https://drive.google.com/drive/folders/1yHzGwvPASmfaYComQYD0FGb5xvr-C-qR?usp=sharing"}]
      }
    },
    {
      id: 'dep-geografia-historia', slug: 'geografia-historia', nombre: 'Geografía e Historia', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-globe-europe-africa', color: 5,
      resumen: 'Geography & History dentro del programa bilingüe, con proyectos de patrimonio y ciudadanía.',
      defecto: {
        presentacion: 'Geography & History dentro del Programa Bilingüe, con proyectos de patrimonio, ciudadanía y salidas culturales.',
        cursos: ['1.º a 4.º de ESO'],
        profesorado: ["José Manuel Guzmán Soria · jefe del departamento", "Clara Berea Navamuel", "Mariano Caballero Espericueta", "Augusto Vilchez Sag"],
        criterios_evaluacion: "El departamento publica sus criterios de evaluación en este documento: [Criterios de evaluación de Geografía e Historia](https://drive.google.com/file/d/1oxXORkVAcS6P1EWGCGJHfa3_-DcY7RiP/view?usp=sharing).",
        programaciones: [{"titulo": "Programaciones didácticas de 1.º de ESO", "url": "https://drive.google.com/drive/folders/1I15oOJJ8Cru_6IpTCK8AaNBa1GL1hiRh?usp=sharing"}, {"titulo": "Programaciones didácticas de 2.º de ESO", "url": "https://drive.google.com/drive/folders/1j0V42OmXLHPyQsYMaUlMpGNCoLu-_9vp?usp=sharing"}, {"titulo": "Programaciones didácticas de 3.º de ESO", "url": "https://drive.google.com/drive/folders/1KsLbivqhkYqnpKwdjRi59srILgb6aVMZ?usp=sharing"}, {"titulo": "Programaciones didácticas de 4.º de ESO", "url": "https://drive.google.com/drive/folders/1t1QO7ZfjoRFWxREyglxUWJITBbCjlwkt?usp=sharing"}],
        recursos: [{"texto": "Blogs de la asignatura · 1.º ESO", "url": "https://primeroesoccssnsd.blogspot.com/"}, {"texto": "Blogs de la asignatura · 2.º ESO", "url": "https://segundoesoccssnsd.blogspot.com/"}, {"texto": "Blogs de la asignatura · 3.º ESO", "url": "https://terceroesoccssnsd.blogspot.com/"}, {"texto": "Blogs de la asignatura · 4.º ESO", "url": "https://cuartoesoccssnsd.blogspot.com/"}, {"texto": "Cultura Clásica · página de Mariano Caballero", "url": "https://forms.office.com/r/qNdBagfg03"}]
      }
    },
    {
      id: 'dep-ciencias', slug: 'ciencias', nombre: 'Ciencias', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-eyedropper', color: 3,
      resumen: 'Biology & Geology y Physics & Chemistry, con prácticas en el laboratorio del centro.',
      defecto: {
        presentacion: 'Biology & Geology y Physics & Chemistry, con prácticas en el laboratorio propio del centro y parte de las clases en inglés.',
        cursos: ['Biología y Geología', 'Física y Química'],
        profesorado: ["Pablo Martínez Carreño · jefe del departamento", "Yésica Horcajada Domingo", "Tamara Villa Piña", "Sergio Álvarez Blanco", "Mónica Merino Polo", "Marga Orell Cernuda"],
        recursos: [{"texto": "Física y Química, 3.º ESO · Unidad 0", "url": "https://drive.google.com/file/d/1jDGzgih1cBmcmY_KHD3o_BEippu0FNJO/view?usp=drive_link"}, {"texto": "Física y Química, 3.º ESO · Unidad 1", "url": "https://drive.google.com/file/d/1GwbUqplFvAfHXsX_NMXRCkV1soxAx97r/view?usp=drive_link"}, {"texto": "Física y Química, 3.º ESO · Formulación inorgánica", "url": "https://drive.google.com/file/d/1V1zka9d4TOQu_ohf8t433SOLyoBh9J9L/view?usp=drive_link"}, {"texto": "Biology and Geology, 1.º ESO · Unit 1", "url": "https://drive.google.com/file/d/1i-93HH2Wqc_TbktEwPna08N9ccHt-i6v/view?usp=drive_link"}, {"texto": "Biology and Geology, 1.º ESO · Unit 2", "url": "https://drive.google.com/file/d/16K9Euv8zMgsu10yOheJ7efT_SB0oEmWz/view?usp=drive_link"}, {"texto": "Biology and Geology, 1.º ESO · Unit 3", "url": "https://drive.google.com/file/d/1sXMBXjFWFzmxTfKJDCAPpYenOLJHP7wS/view?usp=drive_link"}, {"texto": "Biology and Geology, 3.º ESO · Unit 1", "url": "https://drive.google.com/file/d/1JKnS0fEgHUesxcT2cILPBULQiWAls1oo/view?usp=drive_link"}, {"texto": "Biology and Geology, 3.º ESO · Units 3, 4 y 5", "url": "https://drive.google.com/file/d/1sGiHkAX8vgPytmSmIQCxTK0el4vzkRQF/view?usp=drive_link"}]
      }
    },
    {
      id: 'dep-tecnologia', slug: 'tecnologia', nombre: 'Tecnología y Digitalización', corto: 'Tecnología', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-cpu', color: 6,
      resumen: 'Robótica, programación e impresión 3D en el aula taller, dentro del programa Código Escuela 4.0.',
      defecto: {
        presentacion: 'Robótica, programación e impresión 3D en el aula taller, dentro del programa Código Escuela 4.0.',
        profesorado: ["Mónica Merino Polo · jefa del departamento", "Sergio Álvarez Blanco"],
        criterios_evaluacion: "El departamento publica sus criterios de evaluación en este documento: [Tecnología (2.º, 3.º y 4.º A de ESO)](https://drive.google.com/file/d/1KEgduDShGzdMz1kfljC8jSFweznRTlWq/view?usp=sharing).",
        programaciones: [{"titulo": "Programación didáctica de 2.º de ESO", "url": "https://drive.google.com/file/d/1e4TNME7wyQnyEbi45RDQssWnOfL0sZXo/view?usp=sharing"}],
        recursos: [{"texto": "Proyecto cohete: instrucciones", "url": "https://docs.google.com/document/d/1hD40PuxS_XEUtB-Vf3MnAsy1O07HfZJcirLRrq0oGTc/edit?usp=sharing"}]
      }
    },
    {
      id: 'dep-ingles', slug: 'ingles', nombre: 'Inglés', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-translate', color: 1,
      resumen: 'Programa Bilingüe oficial, con profesorado especialista y preparación de los exámenes de Cambridge.',
      defecto: {
        presentacion: 'Programa Bilingüe oficial de la Comunidad de Madrid, con profesorado especialista y auxiliares de conversación. El colegio es centro examinador autorizado de Cambridge.',
        cursos: ['1.º a 4.º de ESO'],
        profesorado: ["Raúl Herschel Junyent", "Virginia Tejedor Guillén", "Sergio Sandoval Canosa"],
        criterios_evaluacion: "El departamento publica sus criterios de evaluación en este documento: [Criterios de evaluación de Inglés](https://drive.google.com/file/d/1RtCMa_5nWhg7-9dQAnYju7NMtcbQ3jVA/view?usp=sharing).",
        programaciones: [{"titulo": "Programación didáctica de 1.º de ESO", "url": "https://docs.google.com/document/d/1s5Tzb2DbS0abnm9iE5xug_zH5ij4IImt/edit?usp=sharing"}, {"titulo": "Programación didáctica de 2.º de ESO", "url": "https://docs.google.com/document/d/16YiqGs_6gsSsSKdJzbSY3MEVXY_gytmN/edit?usp=sharing"}, {"titulo": "Programación didáctica de 3.º de ESO", "url": "https://docs.google.com/document/d/1oSDq8gEfTKx-cW3zAH2RF4ZWx1d5HVXZ/edit?usp=sharing"}, {"titulo": "Programación didáctica de 4.º de ESO", "url": "https://docs.google.com/document/d/1PrrnK2j4KGp4tdFmeibMUD0rKsYndVCf/edit?usp=sharing"}],
        recursos: [{"texto": "Recursos por curso · 1.º ESO", "url": "https://drive.google.com/file/d/1vK3DkTwQbxpeQEvCYyjOtwKb_WciRFRE/view?usp=sharing"}, {"texto": "Recursos por curso · 2.º ESO", "url": "https://drive.google.com/file/d/1CQYJPN7Iq_NRqjx7jUVSOA8NKqDk640B/view?usp=sharing"}, {"texto": "Recursos por curso · 3.º ESO", "url": "https://drive.google.com/file/d/1rDrRk6-8jM0J9ktFS3soywjFzwVbcpYF/view?usp=sharing"}, {"texto": "Recursos por curso · 4.º ESO", "url": "https://drive.google.com/file/d/1dkbFE8I56ggYom8lC5XR-XN8Z28xfxG1/view?usp=sharing"}]
      }
    },
    {
      id: 'dep-frances', slug: 'frances', nombre: 'Francés', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-chat-quote', color: 1,
      resumen: 'Segunda lengua extranjera en la ESO, con preparación de los exámenes oficiales DELF.',
      defecto: {
        presentacion: 'Segunda lengua extranjera en la ESO, con preparación de los exámenes oficiales DELF.',
        profesorado: ["Pilar Ayllón Prados · jefa del departamento"],
        recursos: [{"texto": "1.º ESO · La rutina (apuntes)", "url": "https://drive.google.com/file/d/1q6t5Zc-PNaR7PwBT24a92QHd6WFDRdLF/view?usp=sharing"}, {"texto": "1.º ESO · Verbos pronominales (apuntes)", "url": "https://drive.google.com/file/d/1iQimEaPd6SXxLcp_xDecVf61-XmKJtWt/view?usp=sharing"}, {"texto": "1.º ESO · Los artículos definidos", "url": "http://laprofdefle.blogspot.com/search/label/Articles%20d%C3%A9finis%20et%20ind%C3%A9finis"}, {"texto": "1.º ESO · El imperativo (vídeo)", "url": "https://www.youtube.com/watch?v=pNoAmERz81M"}, {"texto": "1.º ESO · La rutina diaria (vídeo)", "url": "https://www.youtube.com/watch?v=B3R2PxYXspo"}, {"texto": "1.º ESO · Las actividades cotidianas (vídeo)", "url": "https://www.youtube.com/watch?v=wnHEuH8vWMI"}, {"texto": "1.º ESO · Mi rutina (presentación)", "url": "https://www.slideshare.net/pakyrata/majournee"}, {"texto": "1.º ESO · Saber y pedir la hora (vídeo)", "url": "https://www.youtube.com/watch?v=Q9u6UaOvjMU"}, {"texto": "1.º ESO · Audio para indicar la hora", "url": "https://www.languageguide.org/french/telling-time/"}, {"texto": "1.º ESO · Las horas y las actividades cotidianas (vídeo)", "url": "https://www.youtube.com/watch?v=SlDKaCdTKmw"}, {"texto": "1.º ESO · La negación", "url": "https://learningapps.org/view4011960"}, {"texto": "1.º ESO · Ejercicio: la rutina por la mañana", "url": "https://www.languagesonline.org.uk/French/ET2/U3/Daily_Routine/681.htm"}, {"texto": "1.º ESO · Ejercicio: la rutina por la tarde", "url": "https://www.languagesonline.org.uk/French/ET2/U3/Daily_Routine/682.htm"}, {"texto": "1.º ESO · Ejercicio: verbo prendre", "url": "http://staffweb.hkbu.edu.hk/reyjeanl/hotpot/prendre-online.htm"}, {"texto": "1.º ESO · Ejercicio: verbo sortir", "url": "http://staffweb.hkbu.edu.hk/reyjeanl/hotpot/sortir-online.htm"}, {"texto": "1.º ESO · Ejercicio: verbos en imperativo", "url": "https://wordwall.net/it/resource/10907813/francese/trova-limperativo"}, {"texto": "1.º ESO · Ejercicio: la negación (1)", "url": "https://wordwall.net/resource/391584/francese/la-n%C3%A9gation"}, {"texto": "1.º ESO · Ejercicio: la negación (2)", "url": "http://platea.pntic.mec.es/cvera/hotpot/negation10.htm"}, {"texto": "1.º ESO · Ejercicio: la negación (3)", "url": "http://platea.pntic.mec.es/cvera/hotpot/negation6a.htm"}, {"texto": "1.º ESO · Vocabulario: la ciudad", "url": "https://fog.ccsf.edu/~creitan/vocabch3/index.htm"}, {"texto": "1.º ESO · Vocabulario: los medios de transporte (vídeo)", "url": "https://www.youtube.com/watch?v=bvKIqHbTN9g"}, {"texto": "1.º ESO · Canción del verbo venir", "url": "https://youtu.be/VXPEByw4ONY"}, {"texto": "1.º ESO · Indicar un itinerario", "url": "http://topfle.free.fr/3_savoirs/orientation.htm"}, {"texto": "1.º ESO · Ejercicio: la ciudad", "url": "http://resource.download.wjec.co.uk.s3.amazonaws.com/vtc/2013-14/wjec_02/eng/templates/multipleChoiceImage-Vocab/lc-town.html"}, {"texto": "1.º ESO · Ejercicio: los medios de transporte", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Transport/Images/moyens_transport_pop_up.htm"}, {"texto": "1.º ESO · Ejercicio: el verbo aller", "url": "http://www.bonjourdefrance.com/exercices/conjuguer-le-verbe-aller-au-present.html"}, {"texto": "1.º ESO · Más ejercicios del verbo aller", "url": "http://staffweb.hkbu.edu.hk/reyjeanl/hotpot/aller-online.htm"}, {"texto": "1.º ESO · Ejercicio: el verbo venir", "url": "https://www.lepointdufle.net/ressources_fle/present_venir.htm"}, {"texto": "1.º ESO · Ejercicio: el verbo devoir", "url": "http://staffweb.hkbu.edu.hk/reyjeanl/hotpot/devoir-online.htm"}, {"texto": "1.º ESO · Junio: los posesivos", "url": "http://staffweb.hkbu.edu.hk/reyjeanl/hotpot/poss1-1-onl.htm"}, {"texto": "1.º ESO · Junio: los números (escuchar y completar)", "url": "https://www.lepointdufle.net/ressources_fle/nombres.htm"}, {"texto": "1.º ESO · Junio: dictado de números", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Nombres/80-1000/Audio/80_1000_dictee_choisir.htm"}, {"texto": "1.º ESO · Junio: concordancia del adjetivo", "url": "http://staffweb.hkbu.edu.hk/reyjeanl/hotpot/ADJ1-1.htm"}, {"texto": "1.º ESO · Junio: la fecha", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Heure_Date/jours_semaines/Audio_ecrire_date/DatesEcouterChoisir_pop_ups.htm"}, {"texto": "1.º ESO · Junio: ordenar los días de la semana", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Heure_Date/jours_semaines/jumble/huit.htm"}, {"texto": "1.º ESO · Junio: la edad", "url": "https://www.education.vic.gov.au/languagesonline/french/sect07/no_1/no_1.htm"}, {"texto": "1.º ESO · Junio: la ropa", "url": "https://www.education.vic.gov.au/languagesonline/french/sect31/no_06/no_06.htm"}, {"texto": "1.º ESO · Junio: juego de memoria de la ropa", "url": "https://www.education.vic.gov.au/languagesonline/french/sect31/no_05/no_05.htm"}, {"texto": "1.º ESO · Junio: la comida", "url": "https://www.languageguide.org/french/vocabulary/food2_new/"}, {"texto": "2.º ESO · Il faut + infinitivo (vídeo)", "url": "https://www.youtube.com/watch?v=m7Z1QXdIclI"}, {"texto": "2.º ESO · Futuro simple (vídeo)", "url": "https://www.youtube.com/watch?v=y3pp_l1CV4g"}, {"texto": "2.º ESO · Ejercicios de futuro", "url": "https://coucoulafrance.com/futuro-simple-frances-ejercicios-futur-simple-exercices/"}, {"texto": "2.º ESO · Futuro del verbo aller (vídeo)", "url": "https://www.youtube.com/watch?v=xDE3G0qTzbc"}, {"texto": "2.º ESO · La météo (vídeo)", "url": "https://www.youtube.com/watch?v=JjUMtIHHzLg"}, {"texto": "2.º ESO · Canción de la météo", "url": "https://www.youtube.com/watch?v=eBvJVOuBPXI"}, {"texto": "2.º ESO · Ejercicios de la météo", "url": "https://www.allgemeinbildung.ch/fach=fra/Ciel_01a.htm"}, {"texto": "2.º ESO · Audio de la météo", "url": "https://www.languageguide.org/french/vocabulary/weather/"}, {"texto": "2.º ESO · Los medios de transporte (vídeo)", "url": "https://www.youtube.com/watch?v=bvKIqHbTN9g"}, {"texto": "2.º ESO · Los comparativos (vídeo)", "url": "https://www.youtube.com/watch?v=7vhz43hNGrI"}, {"texto": "2.º ESO · Ejercicio: comparativos", "url": "https://www.lepointdufle.net/ressources_fle/comparatifs.htm"}, {"texto": "2.º ESO · Ejercicio: comparativos II", "url": "https://www.lepointdufle.net/ressources_fle/comparatifs2.htm"}, {"texto": "2.º ESO · Ejercicio: verbos del 2.º grupo", "url": "https://www.ortholud.com/html5/conjugaison/choisir/deux.php"}, {"texto": "2.º ESO · Formación del plural (apuntes)", "url": "https://instruction2.mtsac.edu/french/jvb1/Chapter1/pluriel.htm"}, {"texto": "2.º ESO · Juego: plural en -s o -x", "url": "https://bescherelle.com/jeux/jeux_college/ex_basket.php?ex=1"}, {"texto": "2.º ESO · Ejercicio: concordancia del adjetivo", "url": "http://staffweb.hkbu.edu.hk/reyjeanl/hotpot/ADJ1-1.htm"}, {"texto": "2.º ESO · Los números del 60 al 80", "url": "https://trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Nombres/60-79/Audio/60_79_dictee_choisir.htm"}, {"texto": "2.º ESO · Los números del 80 al 1000", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Nombres/80-1000/Audio/80_1000_dictee_choisir.htm"}, {"texto": "2.º ESO · Junio: el desayuno", "url": "http://www.estudiodefrances.com/tbi/le-petit-dejeuner.html"}, {"texto": "2.º ESO · Junio: las frutas", "url": "https://www.languageguide.org/french/vocabulary/fruit/"}, {"texto": "2.º ESO · Junio: las bebidas", "url": "https://www.languageguide.org/french/vocabulary/drinks/"}, {"texto": "2.º ESO · Junio: los alimentos", "url": "https://www.languageguide.org/french/vocabulary/food2/"}, {"texto": "2.º ESO · Junio: escuchad y completad la conversación", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/RepasNourriture/AvoirFaim/audioFaim/Faim_Conversation_1.htm"}, {"texto": "2.º ESO · Junio: en una tienda de ropa", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Vetements/Audio/Conversation_au_magasin_Audio.htm"}, {"texto": "2.º ESO · Junio: los animales", "url": "http://www.trainfrench.com/French/Vocabulaire/Animaux.html"}, {"texto": "2.º ESO · Junio: las actividades", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Activites_Preferences/Activites_Images/Activites_ER_verbs_pop_up.htm"}, {"texto": "2.º ESO · Junio: el fin de semana y las vacaciones", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Loisirs/audioPlans/plans_we_qcm.htm"}, {"texto": "2.º ESO · Junio: proyecto de vacaciones", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Loisirs/audioPlans/plans_vacances_qcm.htm"}, {"texto": "3.º ESO · Futuro simple (vídeo)", "url": "https://www.youtube.com/watch?v=y3pp_l1CV4g"}, {"texto": "3.º ESO · Condicional (vídeo)", "url": "https://www.youtube.com/watch?v=51hU8V5v3w0"}, {"texto": "3.º ESO · Revisión del presente (vídeo)", "url": "https://www.youtube.com/watch?v=XYUfmDxkoKM"}, {"texto": "3.º ESO · Imperfecto (vídeo)", "url": "https://www.youtube.com/watch?v=saG7xkEega8"}, {"texto": "3.º ESO · Imperfecto y si + imperfecto + condicional (vídeo)", "url": "https://www.youtube.com/watch?v=j_nwzEspXZk"}, {"texto": "3.º ESO · Ejercicios: imperfecto", "url": "https://francais.lingolia.com/es/gramatica/tiempos-indicativo/l-imparfait/ejercicios"}, {"texto": "3.º ESO · Ejercicios: futuro", "url": "https://coucoulafrance.com/futuro-simple-frances-ejercicios-futur-simple-exercices/"}, {"texto": "3.º ESO · Ejercicios: condicional", "url": "https://coucoulafrance.com/los-condicionales-frances-ejercicios-conditionnels-exercices/"}, {"texto": "3.º ESO · Hipótesis real (presente y futuro)", "url": "http://platea.pntic.mec.es/~cvera/hotpot/futur3p.htm"}, {"texto": "3.º ESO · Hipótesis posible (imperfecto y condicional)", "url": "http://platea.pntic.mec.es/~cvera/hotpot/conditionnelles.htm"}, {"texto": "3.º ESO · Indicar una dirección (apuntes, PDF)", "url": "https://www.podcastfrancaisfacile.com/wp-content/uploads/files/planvocabulaire.pdf"}, {"texto": "3.º ESO · Indicaciones para orientarse", "url": "http://topfle.free.fr/3_savoirs/orientation.htm"}, {"texto": "3.º ESO · Ejercicio: vocabulario de la ciudad", "url": "http://resource.download.wjec.co.uk.s3.amazonaws.com/vtc/2013-14/wjec_02/eng/templates/multipleChoiceImage-Vocab/lc-town.html"}, {"texto": "3.º ESO · Ejercicio: los lugares de la ciudad", "url": "http://resource.download.wjec.co.uk.s3.amazonaws.com/vtc/2013-14/wjec_02/eng/templates/activityDragandDrop/lc-town3.html"}, {"texto": "3.º ESO · Diálogo: preguntar el camino", "url": "https://www.podcastfrancaisfacile.com/podcast/demander-son-chemin-dans-la-rue.html"}, {"texto": "3.º ESO · Preposición chez + tienda", "url": "http://www.trainfrench.com/French/Grammaire/Exos_grammaire/Articles/chez_versus_a_pop_up.htm"}, {"texto": "3.º ESO · Junio: canción de los alimentos", "url": "http://www.trainfrench.com/French/Chansons/Cake_amour_peau_ane/cake_amour_peau_ane.htm"}, {"texto": "3.º ESO · Junio: los alimentos (conversación)", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/RepasNourriture/AvoirFaim/audioFaim/Faim_Conversation_1.htm"}, {"texto": "3.º ESO · Junio: hablar de deseos (ordenar)", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Activites_Preferences/Souhaits/Jumble/un.htm"}, {"texto": "3.º ESO · Junio: hablar de deseos (escuchar)", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Activites_Preferences/Souhaits/audio/Souhaits_quiz.htm"}, {"texto": "3.º ESO · Junio: el fin de semana y las vacaciones", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Loisirs/audioPlans/plans_we_qcm.htm"}, {"texto": "3.º ESO · Junio: proyecto de vacaciones", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Loisirs/audioPlans/plans_vacances_qcm.htm"}]
      }
    },
    {
      id: 'dep-educacion-fisica', slug: 'educacion-fisica', nombre: 'Educación Física', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-bicycle', color: 3,
      resumen: 'Deporte escolar y hábitos saludables, con 1.500 m² de instalaciones deportivas.',
      defecto: {
        presentacion: 'Deporte escolar y hábitos saludables. Los 1.500 m² de instalaciones deportivas permiten trabajar baloncesto, voleibol, fútbol sala y otros deportes, a veces con varios grupos a la vez.',
        cursos: ['1.º a 4.º de ESO'],
        profesorado: ["Abraham Menés Medina · jefe del departamento"],
        programaciones: [{"titulo": "Programación didáctica de 1.º de ESO", "url": "https://drive.google.com/file/d/18QAgv0qS7Dr18n9-bJqRM0qouO6juU-0/view?usp=sharing"}, {"titulo": "Programación didáctica de 2.º de ESO", "url": "https://drive.google.com/file/d/1UoCIE-JvF34C_6ibzKPpotp2deEPY4Qz/view?usp=sharing"}, {"titulo": "Programación didáctica de 3.º de ESO", "url": "https://drive.google.com/file/d/1Qd0vHBPomncGnujD1P_H03WAim9YnOyR/view?usp=sharing"}, {"titulo": "Programación didáctica de 4.º de ESO", "url": "https://drive.google.com/file/d/1n_R-zhHLvWXymLP-x9zHt9nJvQCKWsIq/view?usp=sharing"}],
        recursos: [{"texto": "Blog de Educación Física de Abraham (deportes y juegos)", "url": "https://nsdoloresef.blogspot.com/"}]
      }
    },
    {
      id: 'dep-artistico', slug: 'artistico', nombre: 'Departamento Artístico', corto: 'Artístico', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-palette', color: 5,
      resumen: 'Música y Plástica, con proyectos que atraviesan las etapas y actividades en la Semana Cultural.',
      defecto: {
        cursos: ['Música', 'Educación Plástica, Visual y Audiovisual'],
        presentacion: "Las enseñanzas artísticas en Secundaria están representadas en el colegio por Plástica y Música. Su carácter práctico favorece la experimentación artística y permite conjugar los distintos aprendizajes del alumnado de forma más global: además de los contenidos de cada materia, el alumnado pone en práctica otras habilidades y competencias de manera muy natural.\n\nEl departamento coordina la propuesta y organización de actividades culturales en el colegio, para potenciar la creatividad y fomentar una actitud positiva ante las distintas manifestaciones artísticas.\n\n## Música\n\nSe imparte en 2.º y 3.º de ESO, con dos horas semanales. Más allá de los objetivos del currículo, la asignatura acerca al alumnado propuestas musicales variadas y de calidad, y busca formar un criterio propio basado en la audición atenta, el análisis de la composición (forma, armonía, melodía e instrumentación) y la valoración de la interpretación, fomentando el pensamiento crítico.\n\nEs una materia transversal: permite trabajar contenidos de otras asignaturas desde otra perspectiva, como las equivalencias matemáticas del lenguaje musical, la física del sonido o la historia a través de la historia de la música. Y es práctica: en clase se interpretan pequeños arreglos preparados por la profesora en los que participa todo el grupo, una forma de aplicar la teoría y de trabajar en equipo desde el respeto.\n\n## Educación Plástica\n\nSe imparte en 1.º, 2.º y 4.º de ESO, con dos horas semanales.",
        profesorado: ["Clara Berea Navamuel · Música", "Guillermo Fenoy Magán · Educación Plástica"],
        criterios_evaluacion: "Los criterios de evaluación de cada materia están en estos documentos:\n\n- [Música](https://docs.google.com/document/d/186tjrbloczmKwBGlaBmU2BZMC1GhqZKednNzd_m32gU/edit?usp=sharing)\n- [Educación Plástica](https://drive.google.com/file/d/1nj5BJTIHdMOaKKn3iaLbhH2U7M87aUjC/view?usp=sharing)",
        programaciones: [{"titulo": "Música · 2.º de ESO", "url": "https://docs.google.com/document/d/1ZUgi1OM2OmdCytGxv1Kw1F61pZDBLgmz/edit?usp=sharing"}, {"titulo": "Música · 3.º de ESO", "url": "https://docs.google.com/document/d/1sFbaA7A68x0X4d_WpMiaM_ecoukzwknR/edit?usp=sharing"}],
        recursos: [{"texto": "Blog de Música de 2.º de ESO", "url": "https://musica2nsd.blogspot.com/"}, {"texto": "Blog de Música de 3.º de ESO", "url": "https://musica3nsd.blogspot.com/"}]
      }
    },
    {
      id: 'dep-religion-valores', slug: 'religion-valores', nombre: 'Religión y Atención Educativa', corto: 'Religión y At. Educativa', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-signpost-split', color: 4,
      resumen: 'Religión, de oferta obligatoria para el centro y voluntaria para las familias, y su alternativa de Atención Educativa.',
      defecto: {
        cursos: ['Religión', 'Atención Educativa'],
        presentacion: "La ley obliga a todos los centros a ofrecer la asignatura de Religión, que es voluntaria para el alumnado. Quien no la elige cursa Atención Educativa. Esta oferta es compatible con el carácter laico del colegio, recogido en su ideario.\n\nEn Religión es obligatorio el libro de clase y un cuaderno exclusivo para la asignatura.",
        profesorado: ["Mónica Merino Polo · Religión", "Mariano Caballero Espericueta · Atención Educativa y Educación en Valores"],
        criterios_evaluacion: "Los criterios de evaluación de cada materia están en estos documentos:\n\n- [Religión](https://drive.google.com/file/d/1aTTGpp-UHWEdJJhnhlSJPSYHrm1l0dCZ/view?usp=drive_link)\n- [Atención Educativa y Educación en Valores](https://drive.google.com/file/d/1iJozCRGLeW3-Ph97ShmxhBNbf31qSMTK/view?usp=sharing)",
        programaciones: [{"titulo": "Atención Educativa y Educación en Valores", "url": "https://drive.google.com/drive/folders/1YOQcY8KzLGCdlPyyxFh-AO0DgKeBSVvC?usp=sharing"}],
        recursos: [{"texto": "Educación en Valores · Formulario 1", "url": "https://forms.gle/TSt3uRNfRAmn8Uqw5"}, {"texto": "Educación en Valores · Formulario 2", "url": "https://forms.gle/SynAU3pPbWwRhu9o9"}, {"texto": "Educación en Valores · Control de 2.º de ESO, tema 2", "url": "https://docs.google.com/forms/d/e/1FAIpQLSf5hHiLavAIWzVrTIpkuc0cFr-PSnw7YM8DJYVqaOQvTtVAYQ/viewform"}, {"texto": "Atención Educativa · La selva esmeralda (3.º de ESO)", "url": "https://docs.google.com/forms/d/e/1FAIpQLSf5hHiLavAIWzVrTIpkuc0cFr-PSnw7YM8DJYVqaOQvTtVAYQ/viewform"}, {"texto": "Atención Educativa · Declaración Universal de los Derechos Humanos (4.º de ESO)", "url": "https://forms.office.com/r/n0eEXZLiWt"}]
      }
    },
    {
      id: 'dep-diversificacion', slug: 'diversificacion', nombre: 'Diversificación Curricular', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-diagram-3', color: 6,
      resumen: 'Programa de 3.º y 4.º de ESO para que más alumnos obtengan el título (antes, PMAR).',
      defecto: {
        cursos: ['3.º y 4.º de ESO'],
        presentacion: "El Programa de Diversificación Curricular tiene como objetivo que el alumnado que se incorpora a él obtenga el título de Graduado en Educación Secundaria Obligatoria cursando 3.º y 4.º de ESO dentro del programa. Sus ejes son una metodología específica, la reorganización de los contenidos y los grupos reducidos, que permiten llegar a cada alumno de forma más personalizada y dar más peso a las actividades prácticas. Se desarrolla en dos niveles: Diversificación I (3.º de ESO) y Diversificación II (4.º de ESO). Sustituye a los antiguos Programas de Mejora del Aprendizaje (PMAR).\n\n## Quién puede incorporarse\n\nSe recurre al programa después de haber agotado las medidas generales de atención a la diversidad sin los resultados esperados. Pueden participar quienes al terminar 2.º de ESO no estén en condiciones de promocionar a 3.º, o quienes, una vez cursado 3.º, no reúnan las condiciones para pasar a 4.º (siempre que no hayan repetido ese curso). De forma excepcional, quien esté en 3.º sin requisitos para promocionar puede incorporarse para repetir 3.º, si no lo ha repetido antes. Además, el alumno debe presentar dificultades de aprendizaje que no se deban a falta de trabajo.\n\nEl procedimiento empieza con una propuesta del equipo docente, acompañada del acuerdo de la familia, un informe del orientador y la autorización del director del colegio.\n\n## Organización\n\nLas materias se agrupan en ámbitos impartidos por un mismo profesor, lo que facilita el seguimiento individual. El resto de materias se cursan con el grupo de referencia de 3.º o 4.º de ESO.\n\n- **Ámbito Científico-Tecnológico:** 10 periodos semanales en Diversificación I y 9 en Diversificación II.\n- **Ámbito Socio-Lingüístico:** 7 periodos semanales en Diversificación I y 10 en Diversificación II.",
        profesorado: ["Clara Berea Navamuel · Ámbito Socio-Lingüístico I", "Augusto Vilchez Sag · Ámbito Socio-Lingüístico II", "Tamara Villa Piña · Ámbito Científico-Tecnológico I", "Yésica Horcajada Domingo · Ámbito Científico-Tecnológico II"],
        criterios_evaluacion: "Los criterios de evaluación de cada materia están en estos documentos:\n\n- [Ámbito Científico-Tecnológico I y II](https://docs.google.com/document/d/1dfI71tlcWOAUlFFQ61noBbWDd6SW_xzx/edit?usp=drive_link)\n- [Ámbito Socio-Lingüístico I](https://docs.google.com/document/d/1m69ZFeKykPKyWYTlPMNsEQxayH-8dZDI/edit?usp=sharing)\n- [Ámbito Socio-Lingüístico II](https://docs.google.com/document/d/1t7tE6EDIfZqRFB3cTdr3s2EPqJHxCkzM/edit?usp=sharing)",
        programaciones: [{"titulo": "Ámbito Científico-Tecnológico I", "url": "https://drive.google.com/file/d/1xUWQEYN5Wn7uks8aYwXulCxNnckoq2cU/view?usp=drive_link"}, {"titulo": "Ámbito Científico-Tecnológico II", "url": "https://drive.google.com/file/d/1C-D6h4CuKgitoX5_9NxX-ZondBZm44Bn/view?usp=drive_link"}, {"titulo": "Ámbito Socio-Lingüístico I", "url": "https://docs.google.com/document/d/1X-j7ALfxWwTulTBXelMtk-U4MrxzUMUK/edit?usp=sharing"}, {"titulo": "Ámbito Socio-Lingüístico II", "url": "https://drive.google.com/file/d/1T9-9FzukcaqGDgBk7AirVlDP-EfrMx7x/view?usp=sharing"}]
      }
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
