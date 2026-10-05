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
        presentacion: "La Educación Infantil es una etapa con identidad propia. Su finalidad es contribuir al desarrollo físico, afectivo, social e intelectual de los niños y niñas de 3 a 6 años: el desarrollo afectivo, el movimiento y el control corporal, la comunicación y el lenguaje, las pautas elementales de convivencia y el descubrimiento del entorno. También que cada niño elabore una imagen de sí mismo positiva y equilibrada y gane autonomía personal. Para ello es fundamental la colaboración estrecha entre las familias y las profesoras de la etapa.\n\nLos contenidos se organizan en áreas y se trabajan con actividades globalizadas que tengan interés y significado para los niños, a través de la experiencia, las actividades y el juego, en un ambiente de afecto y confianza. Desde los 3 años cada niño inicia la lectura respetando su propio ritmo: el objetivo es que antes de empezar Primaria lea con comprensión en español y haya iniciado la lectura en inglés. La grafomotricidad se trabaja de forma gradual, de modo que a los 5 años escriben copiando de la pizarra y al dictado. También se inician las habilidades numéricas básicas, las tecnologías de la información y la expresión artística, visual y musical.\n\n## El inglés en Infantil\n\nEl 65 % del tiempo de clase es en inglés. Los auxiliares de conversación y el profesorado especialista se dirigen a los niños en inglés en todas las situaciones del día a día, y las sesiones se reparten de forma natural a lo largo de la semana. Aprenden de manera oral y, al terminar la etapa, comprenden, hablan e incluso han iniciado la lectura en inglés.\n\nEl primer ciclo (0 a 3 años) tiene su propia web: [Escuela Infantil NSD](https://infantil-nsd.vercel.app).",
        areas: ["Crecimiento en Armonía", "Descubrimiento y Exploración del Entorno", "Comunicación y Representación de la Realidad"],
        recursos: [{"texto": "Página de la etapa", "url": "/etapas/infantil-3-6"}],
        profesorado: ["Laura Ruiz Yerpes · coordinadora", "Noelia del Burgo Rodríguez", "M.ª Carmen Caballero Puerto", "Yolanda González Burgos", "Elena Peinado del Río", "Jennifer Soto Genova"]
      }
    },
    {
      id: 'etapa-primaria', slug: 'primaria', nombre: 'Educación Primaria', corto: 'Primaria', grupo: 'Infantil y Primaria',
      esquema: 'etapa', icono: 'bi-book', color: 2,
      resumen: 'De 1.º a 6.º: criterios de evaluación, calificación y promoción y programaciones de cada área.',
      defecto: {
        presentacion: "La Educación Primaria va de 1.º a 6.º y se organiza en tres ciclos de dos cursos. El equipo docente de cada ciclo coordina la programación de las áreas y la evaluación del alumnado.",
        areas: ["Lengua Castellana y Literatura", "Matemáticas", "Ciencias de la Naturaleza", "Ciencias Sociales", "Lengua Extranjera: Inglés", "Educación Artística", "Educación Física", "Religión o Atención Educativa", "Educación en Valores Cívicos y Éticos (en el tercer ciclo)"],
        recursos: [{"texto": "Página de la etapa", "url": "/etapas/primaria"}, {"texto": "Evaluación, promoción y reclamaciones", "url": "/familias/evaluacion"}, {"texto": "Normas para la reclamación de notas", "url": "https://drive.google.com/file/d/1TsKhD1s-yNMkWm0bWv6a9VyRjlFpErpd/view?usp=sharing"}, {"texto": "Matemáticas 4.º · Fracciones (ampliación, test)", "url": "https://es.educaplay.com/recursos-educativos/8054108-las_fracciones.html"}, {"texto": "Matemáticas 5.º y 6.º · Test sobre fracciones", "url": "https://es.educaplay.com/recursos-educativos/7987008-las_fracciones.html"}, {"texto": "Matemáticas 5.º y 6.º · Multiplicación de fracciones (vídeo)", "url": "https://www.youtube.com/watch?v=pHWhPo4_21s"}, {"texto": "Matemáticas 5.º y 6.º · División de fracciones (vídeo)", "url": "https://www.youtube.com/watch?v=qJb7zc8NX-s"}, {"texto": "Inglés 3.º · Grammar Unit 1", "url": "https://es.liveworksheets.com/al3211395fz"}, {"texto": "Inglés 3.º · Grammar and Vocabulary Unit 2", "url": "https://es.liveworksheets.com/ls3236949jn"}, {"texto": "Inglés 3.º · Grammar Unit 2", "url": "https://es.liveworksheets.com/gv3236894lv"}, {"texto": "Inglés 3.º · Grammar Unit 3", "url": "https://es.liveworksheets.com/cv3262196bh"}, {"texto": "Inglés 3.º · Grammar Unit 4", "url": "https://es.liveworksheets.com/cy3316679lf"}, {"texto": "Inglés 3.º · Grammar Unit 5", "url": "https://es.liveworksheets.com/iv53769vo"}, {"texto": "Inglés 3.º · Grammar Unit 5 (parte 2)", "url": "https://es.liveworksheets.com/yr18112if"}, {"texto": "Inglés 3.º · Grammar Unit 5 (parte 3)", "url": "https://es.liveworksheets.com/tx3051863qs"}, {"texto": "Inglés 3.º · Grammar Unit 6", "url": "https://es.liveworksheets.com/ca3358845fc"}, {"texto": "Inglés 3.º · Grammar Unit 7", "url": "https://www.liveworksheets.com/fv1415177et"}, {"texto": "Inglés 3.º · Verbos irregulares 1-14 (práctica)", "url": "https://wordwall.net/es/resource/56174461"}, {"texto": "Inglés 3.º · Verbos irregulares 1-21 (juego)", "url": "https://wordwall.net/resource/56540093"}, {"texto": "Inglés 3.º · Verbos irregulares 21-45 (práctica)", "url": "https://wordwall.net/es/resource/56807517"}]
      }
    },
    {
      id: 'dep-matematicas', slug: 'matematicas', nombre: 'Matemáticas', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-calculator', color: 2,
      resumen: 'Resolución de problemas y razonamiento lógico, con material manipulativo desde los primeros cursos.',
      defecto: {
        presentacion: 'Metodología manipulativa, resolución de problemas y razonamiento lógico desde los primeros cursos.',
        cursos: ['1.º a 4.º de ESO'],
        profesorado: ["Marga Orell Cernuda · jefa del departamento", "Mónica Merino Polo", "Pablo Martínez Carreño", "Sergio Álvarez Blanco", "Tamara Villa Piña", "Yésica Horcajada Domingo"]
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
        recuperacion: "Contenidos para recuperar la materia pendiente de cursos anteriores: [pendientes de 1.º y 2.º de ESO](https://drive.google.com/file/d/1oj7-EVhgVNK9nTn-0XpSqmLGJBAgFh98/view?usp=sharing)."
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
        recursos: [{"texto": "Cultura Clásica · página de Mariano Caballero", "url": "https://forms.office.com/r/qNdBagfg03"}]
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
        recursos: [{"texto": "Física y Química, 3.º ESO · Unidad 0", "url": "https://drive.google.com/file/d/1jDGzgih1cBmcmY_KHD3o_BEippu0FNJO/view?usp=drive_link"}, {"texto": "Biology and Geology, 3.º ESO · Unit 1", "url": "https://drive.google.com/file/d/1JKnS0fEgHUesxcT2cILPBULQiWAls1oo/view?usp=drive_link"}]
      }
    },
    {
      id: 'dep-tecnologia', slug: 'tecnologia', nombre: 'Tecnología y Digitalización', corto: 'Tecnología', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-cpu', color: 6,
      resumen: 'Robótica, programación e impresión 3D en el aula taller, dentro del programa Código Escuela 4.0.',
      defecto: {
        presentacion: 'Robótica, programación e impresión 3D en el aula taller, dentro del programa Código Escuela 4.0.',
        profesorado: ["Mónica Merino Polo · jefa del departamento", "Sergio Álvarez Blanco"],
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
        recursos: [{"texto": "1.º ESO · Los artículos definidos", "url": "http://laprofdefle.blogspot.com/search/label/Articles%20d%C3%A9finis%20et%20ind%C3%A9finis"}, {"texto": "1.º ESO · El imperativo (vídeo)", "url": "https://www.youtube.com/watch?v=pNoAmERz81M"}, {"texto": "1.º ESO · La rutina diaria (vídeo)", "url": "https://www.youtube.com/watch?v=B3R2PxYXspo"}, {"texto": "1.º ESO · Las actividades cotidianas (vídeo)", "url": "https://www.youtube.com/watch?v=wnHEuH8vWMI"}, {"texto": "1.º ESO · Mi rutina (presentación)", "url": "https://www.slideshare.net/pakyrata/majournee"}, {"texto": "1.º ESO · Saber y pedir la hora (vídeo)", "url": "https://www.youtube.com/watch?v=Q9u6UaOvjMU"}, {"texto": "1.º ESO · Audio para indicar la hora", "url": "https://www.languageguide.org/french/telling-time/"}, {"texto": "1.º ESO · La negación", "url": "https://learningapps.org/view4011960"}, {"texto": "1.º ESO · Ejercicio: la rutina por la mañana", "url": "https://www.languagesonline.org.uk/French/ET2/U3/Daily_Routine/681.htm"}, {"texto": "1.º ESO · Ejercicio: la rutina por la tarde", "url": "https://www.languagesonline.org.uk/French/ET2/U3/Daily_Routine/682.htm"}, {"texto": "1.º ESO · Ejercicio: verbos en imperativo", "url": "https://wordwall.net/it/resource/10907813/francese/trova-limperativo"}, {"texto": "1.º ESO · Ejercicio: la negación (1)", "url": "https://wordwall.net/resource/391584/francese/la-n%C3%A9gation"}, {"texto": "1.º ESO · Vocabulario: la ciudad", "url": "https://fog.ccsf.edu/~creitan/vocabch3/index.htm"}, {"texto": "1.º ESO · Vocabulario: los medios de transporte (vídeo)", "url": "https://www.youtube.com/watch?v=bvKIqHbTN9g"}, {"texto": "1.º ESO · Canción del verbo venir", "url": "https://youtu.be/VXPEByw4ONY"}, {"texto": "1.º ESO · Ejercicio: los medios de transporte", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Transport/Images/moyens_transport_pop_up.htm"}, {"texto": "1.º ESO · Ejercicio: el verbo venir", "url": "https://www.lepointdufle.net/ressources_fle/present_venir.htm"}, {"texto": "1.º ESO · Junio: los números (escuchar y completar)", "url": "https://www.lepointdufle.net/ressources_fle/nombres.htm"}, {"texto": "1.º ESO · Junio: dictado de números", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Nombres/80-1000/Audio/80_1000_dictee_choisir.htm"}, {"texto": "1.º ESO · Junio: la fecha", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Heure_Date/jours_semaines/Audio_ecrire_date/DatesEcouterChoisir_pop_ups.htm"}, {"texto": "1.º ESO · Junio: ordenar los días de la semana", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Heure_Date/jours_semaines/jumble/huit.htm"}, {"texto": "1.º ESO · Junio: la comida", "url": "https://www.languageguide.org/french/vocabulary/food2_new/"}, {"texto": "2.º ESO · Il faut + infinitivo (vídeo)", "url": "https://www.youtube.com/watch?v=m7Z1QXdIclI"}, {"texto": "2.º ESO · Futuro simple (vídeo)", "url": "https://www.youtube.com/watch?v=y3pp_l1CV4g"}, {"texto": "2.º ESO · Ejercicios de futuro", "url": "https://coucoulafrance.com/futuro-simple-frances-ejercicios-futur-simple-exercices/"}, {"texto": "2.º ESO · La météo (vídeo)", "url": "https://www.youtube.com/watch?v=JjUMtIHHzLg"}, {"texto": "2.º ESO · Canción de la météo", "url": "https://www.youtube.com/watch?v=eBvJVOuBPXI"}, {"texto": "2.º ESO · Ejercicios de la météo", "url": "https://www.allgemeinbildung.ch/fach=fra/Ciel_01a.htm"}, {"texto": "2.º ESO · Audio de la météo", "url": "https://www.languageguide.org/french/vocabulary/weather/"}, {"texto": "2.º ESO · Los medios de transporte (vídeo)", "url": "https://www.youtube.com/watch?v=bvKIqHbTN9g"}, {"texto": "2.º ESO · Los comparativos (vídeo)", "url": "https://www.youtube.com/watch?v=7vhz43hNGrI"}, {"texto": "2.º ESO · Ejercicio: comparativos", "url": "https://www.lepointdufle.net/ressources_fle/comparatifs.htm"}, {"texto": "2.º ESO · Ejercicio: comparativos II", "url": "https://www.lepointdufle.net/ressources_fle/comparatifs2.htm"}, {"texto": "2.º ESO · Ejercicio: verbos del 2.º grupo", "url": "https://www.ortholud.com/html5/conjugaison/choisir/deux.php"}, {"texto": "2.º ESO · Formación del plural (apuntes)", "url": "https://instruction2.mtsac.edu/french/jvb1/Chapter1/pluriel.htm"}, {"texto": "2.º ESO · Los números del 60 al 80", "url": "https://trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Nombres/60-79/Audio/60_79_dictee_choisir.htm"}, {"texto": "2.º ESO · Los números del 80 al 1000", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Nombres/80-1000/Audio/80_1000_dictee_choisir.htm"}, {"texto": "2.º ESO · Junio: las frutas", "url": "https://www.languageguide.org/french/vocabulary/fruit/"}, {"texto": "2.º ESO · Junio: las bebidas", "url": "https://www.languageguide.org/french/vocabulary/drinks/"}, {"texto": "2.º ESO · Junio: los alimentos", "url": "https://www.languageguide.org/french/vocabulary/food2/"}, {"texto": "2.º ESO · Junio: escuchad y completad la conversación", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/RepasNourriture/AvoirFaim/audioFaim/Faim_Conversation_1.htm"}, {"texto": "2.º ESO · Junio: en una tienda de ropa", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Vetements/Audio/Conversation_au_magasin_Audio.htm"}, {"texto": "2.º ESO · Junio: los animales", "url": "http://www.trainfrench.com/French/Vocabulaire/Animaux.html"}, {"texto": "2.º ESO · Junio: las actividades", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Activites_Preferences/Activites_Images/Activites_ER_verbs_pop_up.htm"}, {"texto": "2.º ESO · Junio: el fin de semana y las vacaciones", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Loisirs/audioPlans/plans_we_qcm.htm"}, {"texto": "2.º ESO · Junio: proyecto de vacaciones", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Loisirs/audioPlans/plans_vacances_qcm.htm"}, {"texto": "3.º ESO · Futuro simple (vídeo)", "url": "https://www.youtube.com/watch?v=y3pp_l1CV4g"}, {"texto": "3.º ESO · Condicional (vídeo)", "url": "https://www.youtube.com/watch?v=51hU8V5v3w0"}, {"texto": "3.º ESO · Revisión del presente (vídeo)", "url": "https://www.youtube.com/watch?v=XYUfmDxkoKM"}, {"texto": "3.º ESO · Imperfecto (vídeo)", "url": "https://www.youtube.com/watch?v=saG7xkEega8"}, {"texto": "3.º ESO · Imperfecto y si + imperfecto + condicional (vídeo)", "url": "https://www.youtube.com/watch?v=j_nwzEspXZk"}, {"texto": "3.º ESO · Ejercicios: imperfecto", "url": "https://francais.lingolia.com/es/gramatica/tiempos-indicativo/l-imparfait/ejercicios"}, {"texto": "3.º ESO · Ejercicios: futuro", "url": "https://coucoulafrance.com/futuro-simple-frances-ejercicios-futur-simple-exercices/"}, {"texto": "3.º ESO · Indicar una dirección (apuntes, PDF)", "url": "https://www.podcastfrancaisfacile.com/wp-content/uploads/files/planvocabulaire.pdf"}, {"texto": "3.º ESO · Diálogo: preguntar el camino", "url": "https://www.podcastfrancaisfacile.com/podcast/demander-son-chemin-dans-la-rue.html"}, {"texto": "3.º ESO · Preposición chez + tienda", "url": "http://www.trainfrench.com/French/Grammaire/Exos_grammaire/Articles/chez_versus_a_pop_up.htm"}, {"texto": "3.º ESO · Junio: canción de los alimentos", "url": "http://www.trainfrench.com/French/Chansons/Cake_amour_peau_ane/cake_amour_peau_ane.htm"}, {"texto": "3.º ESO · Junio: los alimentos (conversación)", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/RepasNourriture/AvoirFaim/audioFaim/Faim_Conversation_1.htm"}, {"texto": "3.º ESO · Junio: hablar de deseos (ordenar)", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Activites_Preferences/Souhaits/Jumble/un.htm"}, {"texto": "3.º ESO · Junio: hablar de deseos (escuchar)", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Activites_Preferences/Souhaits/audio/Souhaits_quiz.htm"}, {"texto": "3.º ESO · Junio: el fin de semana y las vacaciones", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Loisirs/audioPlans/plans_we_qcm.htm"}, {"texto": "3.º ESO · Junio: proyecto de vacaciones", "url": "http://www.trainfrench.com/French/Vocabulaire/Exos_vocabulaire/Loisirs/audioPlans/plans_vacances_qcm.htm"}]
      }
    },
    {
      id: 'dep-educacion-fisica', slug: 'educacion-fisica', nombre: 'Educación Física', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-bicycle', color: 3,
      resumen: 'Deporte escolar y hábitos saludables, con 1.500 m² de instalaciones deportivas.',
      defecto: {
        presentacion: 'Deporte escolar y hábitos saludables. Los 1.500 m² de instalaciones deportivas permiten trabajar baloncesto, voleibol, fútbol sala y otros deportes, a veces con varios grupos a la vez.',
        cursos: ['1.º a 4.º de ESO'],
        profesorado: ["Abraham Menés Medina · jefe del departamento"]
      }
    },
    {
      id: 'dep-artistico', slug: 'artistico', nombre: 'Departamento Artístico', corto: 'Artístico', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-palette', color: 5,
      resumen: 'Música y Plástica, con proyectos que atraviesan las etapas y actividades en la Semana Cultural.',
      defecto: {
        cursos: ['Música', 'Educación Plástica, Visual y Audiovisual'],
        presentacion: "Las enseñanzas artísticas en Secundaria están representadas en el colegio por Plástica y Música. Su carácter práctico favorece la experimentación artística y permite conjugar los distintos aprendizajes del alumnado de forma más global: además de los contenidos de cada materia, el alumnado pone en práctica otras habilidades y competencias de manera muy natural.\n\nEl departamento coordina la propuesta y organización de actividades culturales en el colegio, para potenciar la creatividad y fomentar una actitud positiva ante las distintas manifestaciones artísticas.\n\n## Música\n\nSe imparte en 2.º y 3.º de ESO, con dos horas semanales. Más allá de los objetivos del currículo, la asignatura acerca al alumnado propuestas musicales variadas y de calidad, y busca formar un criterio propio basado en la audición atenta, el análisis de la composición (forma, armonía, melodía e instrumentación) y la valoración de la interpretación, fomentando el pensamiento crítico.\n\nEs una materia transversal: permite trabajar contenidos de otras asignaturas desde otra perspectiva, como las equivalencias matemáticas del lenguaje musical, la física del sonido o la historia a través de la historia de la música. Y es práctica: en clase se interpretan pequeños arreglos preparados por la profesora en los que participa todo el grupo, una forma de aplicar la teoría y de trabajar en equipo desde el respeto.\n\n## Educación Plástica\n\nSe imparte en 1.º, 2.º y 4.º de ESO, con dos horas semanales.",
        profesorado: ["Clara Berea Navamuel · Música", "Guillermo Fenoy Magán · Educación Plástica"]
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
        recursos: [{"texto": "Educación en Valores · Formulario 1", "url": "https://forms.gle/TSt3uRNfRAmn8Uqw5"}, {"texto": "Educación en Valores · Formulario 2", "url": "https://forms.gle/SynAU3pPbWwRhu9o9"}, {"texto": "Educación en Valores · Control de 2.º de ESO, tema 2", "url": "https://docs.google.com/forms/d/e/1FAIpQLSf5hHiLavAIWzVrTIpkuc0cFr-PSnw7YM8DJYVqaOQvTtVAYQ/viewform"}, {"texto": "Atención Educativa · La selva esmeralda (3.º de ESO)", "url": "https://docs.google.com/forms/d/e/1FAIpQLSf5hHiLavAIWzVrTIpkuc0cFr-PSnw7YM8DJYVqaOQvTtVAYQ/viewform"}]
      }
    },
    {
      id: 'dep-diversificacion', slug: 'diversificacion', nombre: 'Diversificación Curricular', grupo: 'ESO', esquema: 'departamento',
      icono: 'bi-diagram-3', color: 6,
      resumen: 'Programa de 3.º y 4.º de ESO para que más alumnos obtengan el título (antes, PMAR).',
      defecto: {
        cursos: ['3.º y 4.º de ESO'],
        presentacion: "El Programa de Diversificación Curricular tiene como objetivo que el alumnado que se incorpora a él obtenga el título de Graduado en Educación Secundaria Obligatoria cursando 3.º y 4.º de ESO dentro del programa. Sus ejes son una metodología específica, la reorganización de los contenidos y los grupos reducidos, que permiten llegar a cada alumno de forma más personalizada y dar más peso a las actividades prácticas. Se desarrolla en dos niveles: Diversificación I (3.º de ESO) y Diversificación II (4.º de ESO). Sustituye a los antiguos Programas de Mejora del Aprendizaje (PMAR).\n\n## Quién puede incorporarse\n\nSe recurre al programa después de haber agotado las medidas generales de atención a la diversidad sin los resultados esperados. Pueden participar quienes al terminar 2.º de ESO no estén en condiciones de promocionar a 3.º, o quienes, una vez cursado 3.º, no reúnan las condiciones para pasar a 4.º (siempre que no hayan repetido ese curso). De forma excepcional, quien esté en 3.º sin requisitos para promocionar puede incorporarse para repetir 3.º, si no lo ha repetido antes. Además, el alumno debe presentar dificultades de aprendizaje que no se deban a falta de trabajo.\n\nEl procedimiento empieza con una propuesta del equipo docente, acompañada del acuerdo de la familia, un informe del orientador y la autorización del director del colegio.\n\n## Organización\n\nLas materias se agrupan en ámbitos impartidos por un mismo profesor, lo que facilita el seguimiento individual. El resto de materias se cursan con el grupo de referencia de 3.º o 4.º de ESO.\n\n- **Ámbito Científico-Tecnológico:** 10 periodos semanales en Diversificación I y 9 en Diversificación II.\n- **Ámbito Socio-Lingüístico:** 7 periodos semanales en Diversificación I y 10 en Diversificación II.",
        profesorado: ["Clara Berea Navamuel · Ámbito Socio-Lingüístico I", "Augusto Vilchez Sag · Ámbito Socio-Lingüístico II", "Tamara Villa Piña · Ámbito Científico-Tecnológico I", "Yésica Horcajada Domingo · Ámbito Científico-Tecnológico II"]
      }
    },
    {
      id: 'dep-orientacion', slug: 'orientacion', nombre: 'Orientación', grupo: 'Orientación y apoyo', esquema: 'orientacion',
      icono: 'bi-compass', color: 4,
      resumen: 'Detección temprana de dificultades, atención a la diversidad y orientación académica y profesional.',
      defecto: {
        presentacion: "La orientación y el asesoramiento psicopedagógico forman parte del organigrama del colegio. Desde hace años, un equipo psicopedagógico trabaja de forma permanente con el alumnado, las familias y el profesorado para mejorar la calidad educativa del centro.\n\nLa orientación acompaña todo el recorrido escolar, de Educación Infantil a 4.º de ESO, con momentos de especial atención: el inicio y el final de la Primaria y el final del primer y del segundo ciclo de la ESO. De cada periodo se recoge la información psicotécnica en un informe individual, que sirve para orientar al alumno, a su familia y al profesorado.\n\nAl terminar la ESO, a partir del historial académico, las pruebas psicopedagógicas y la aportación de la familia y del profesorado (en especial del tutor o la tutora), se ofrece a cada alumno un informe orientativo sobre la modalidad de Bachillerato más aconsejable, con información sobre los estudios, el acceso, los lugares donde cursarlos y sus salidas profesionales. La decisión final es siempre del alumno y de su familia.\n\nPara pedir cita con el departamento, dirigíos a secretaría en su horario habitual.\n\n## Con las familias\n\n- Entrevistas individuales cuando las pide el alumno o la familia, con pautas de actuación psicopedagógica y seguimiento de cada derivación a especialistas.\n- Las entrevistas tratan temas propios del departamento y del ámbito escolar. La normativa no permite que el departamento haga terapia familiar ni psicoterapia clínica. Conviene que el tutor o la tutora esté siempre al día.\n- Pautas y materiales para el profesorado sobre habilidades sociales, cohesión de grupo, resolución de conflictos, aceptación de la diversidad e inteligencia emocional.\n\n## Prevención y coordinación\n\n- Coordinación con educadores de absentismo, agentes tutores, el Centro de Atención a la Familia (CAF) y Servicios Sociales.\n- Coordinación con equipos educativos, Consejería, Dirección de Área Territorial, Ayuntamiento, Inspección, EOEP, EAT, Centro de Salud Mental, CAI, SAED y otros servicios.\n\n## Convivencia\n\n- Participación y seguimiento de los protocolos contra el acoso escolar.\n- Actividades de sensibilización y dinámicas para toda la comunidad educativa.",
        funciones: ["Atención y apoyo al proceso de enseñanza y aprendizaje del alumnado.", "Apoyo y asesoramiento al plan de acción tutorial y a la formación personal del alumnado, las familias y los tutores.", "Orientación académica y profesional.", "Coordinación con los Servicios Sociales y las aulas específicas.", "Asesoramiento al profesorado sobre las medidas de individualización más adecuadas.", "Planes de atención a la diversidad y seguimiento del alumnado con necesidades educativas especiales (ACNEE), junto con la profesora de Pedagogía Terapéutica."],
        atencion_diversidad: "El departamento sigue un plan específico y ampliado de medidas de atención a la diversidad, según la normativa vigente: refuerzos, adaptaciones, planes individualizados y seguimiento del alumnado con necesidades educativas especiales, con la profesora de Pedagogía Terapéutica y en coordinación con las familias y los servicios externos.",
        materias: ["[Diversificación Curricular](/centro/departamentos/diversificacion) (antes PMAR)", "Iniciación a la Actividad Emprendedora y Empresarial", "Pedagogía Terapéutica"],
        profesorado: ["Augusto Vilchez Sag · jefe del departamento y orientador de ESO", "Rosario Molinera Caracuel · orientadora de Primaria", "Nerea Domaica Alarcón · Pedagogía Terapéutica"]
      }
    },
    {
      id: 'dep-bilinguismo', slug: 'bilinguismo', nombre: 'Bilingüismo', grupo: 'Bilingüismo', esquema: 'bilinguismo',
      icono: 'bi-translate', color: 1,
      resumen: 'Centro bilingüe de la Comunidad de Madrid desde el curso 2014-2015 (Orden 2476/2014), de Infantil a 4.º de ESO.',
      defecto: {
        presentacion: "El colegio forma parte del Programa Bilingüe de la Comunidad de Madrid desde el curso 2014-2015 (centro concertado bilingüe, B.O.C.M. Orden 2476/2014, de 31 de julio).",
        certificaciones: ["Cambridge Assessment English (centro examinador autorizado)", "Programa BEDA y BEDA Kids"],
        infantil_primaria: "El proyecto bilingüe oficial en Primaria comenzó en el curso 2014-2015 y hoy se desarrolla en todos los cursos de la etapa. Lo imparte profesorado habilitado para dar clase en inglés, con dos auxiliares de conversación que refuerzan la expresión oral. Además del área de Inglés, se dan en inglés Educación Física, Música y Ciencias: en total, 11 horas a la semana. En Infantil y en el primer ciclo de Primaria se trabaja con el método Phonics.\n\nEn Infantil, el segundo ciclo (3 a 6 años) es totalmente bilingüe, con auxiliar de conversación dos horas a la semana en 5 años, y el primer ciclo (0 a 3 años) aumenta de forma notable las actividades en inglés.\n\nEl nivel del alumnado se evalúa según el Marco Común Europeo de Referencia para las Lenguas, con pruebas externas del Programa BEDA y exámenes de Cambridge. En 6.º de Primaria, la Comunidad de Madrid hace además una prueba final de nivel. El proyecto y las medidas de mejora se evalúan y revisan de forma continua en los equipos docentes.",
        eso: "El proyecto bilingüe de Secundaria prepara al alumnado para una sociedad global en la que los idiomas forman parte de la vida diaria. Comenzó en el curso 2020-2021, cuando llegó a la ESO la primera promoción bilingüe de la Primaria del colegio. En inglés se imparten Physical Education, Biology and Geology y Technology.\n\nEl objetivo es que el alumnado termine la etapa obligatoria con un nivel de inglés B2 o C1 (MCER) que le permita desenvolverse en un mundo multicultural y plurilingüe, sin que se resientan sus conocimientos de las materias. Aprender un segundo idioma desde pequeños mejora además la creatividad, el razonamiento y la memoria, y facilita aprender otros idiomas.\n\nEl nivel se evalúa con pruebas externas del Programa BEDA y exámenes de Cambridge, y la Comunidad de Madrid hace una prueba final de nivel en 4.º de ESO.\n\nEl éxito del proyecto es una tarea colectiva en la que las familias tienen un papel esencial: podéis hacernos llegar vuestras impresiones y sugerencias, y resolveremos cualquier duda. Más información sobre el [Programa BEDA](https://ecmadrid.org/programas/programa-beda).",
        profesorado: ["Primaria · Maite Somoza Gragera (coordinadora)", "Primaria · Sonia Hervás García", "Primaria · Noelia del Burgo Rodríguez", "Primaria · Raquel Gómez Cabrerizo", "Primaria · Raquel Muñoz Romero", "Primaria · Jennifer Soto Génova", "Primaria · Javier Ramiro Cintero", "ESO · Raúl Herschel Junyent (coordinador)", "ESO · Sergio Álvarez Blanco", "ESO · Yésica Horcajada Domingo", "ESO · Abraham Menés Medina", "ESO · Sergio Sandoval Canosa", "ESO · Virginia Tejedor Guillén", "Auxiliares de conversación · Eirene Penina", "Auxiliares de conversación · Thomas Oliver Garner"]
      }
    }
  ];

  // Equipo directivo y cargos que no salen de ningún departamento. Los
  // nombres son los que publica el centro (ver centro/equipo-directivo).
  const DIRECCION = {
    direccion: [
      { nombre: 'Jesús Blázquez del Mazo', cargo: 'Director pedagógico', ambito: 'Infantil y Primaria' },
      { nombre: 'Jesús Romero Domínguez', cargo: 'Director pedagógico', ambito: 'E.S.O.' }
    ],
    gestion: [
      { nombre: 'Mariano Caballero Espericueta', cargo: 'Jefe de estudios', ambito: 'Las tres etapas' },
      { nombre: 'Laura Hidalgo Macías', cargo: 'Secretaria', ambito: 'Secretaría y administración' }
    ],
    otros: [
      { nombre: 'Sergio del Pino Díaz', cargo: 'Coordinador TIC', ambito: 'Código Escuela 4.0 y Plan Digital' }
    ]
  };

  const api = { GRUPOS, DEPARTAMENTOS: D, DIRECCION };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.NSD_DEPARTAMENTOS = api;
})(typeof window !== 'undefined' ? window : globalThis);
