const IMG = {
  jordan:   "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Michael_Jordan_in_2014.jpg/400px-Michael_Jordan_in_2014.jpg",
  kobe:     "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Kobe_Bryant_2014.jpg/400px-Kobe_Bryant_2014.jpg",
  lebron:   "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/LeBron_James_crop.jpg/400px-LeBron_James_crop.jpg",
  magic:    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Magic_Johnson_2016.jpg/400px-Magic_Johnson_2016.jpg",
  bird:     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Larry_Bird_1979.jpg/400px-Larry_Bird_1979.jpg",
  shaq:     "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Shaquille_O%27Neal_2014.jpg/400px-Shaquille_O%27Neal_2014.jpg",
  curry:    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Stephen_Curry_2019.jpg/400px-Stephen_Curry_2019.jpg",
  durant:   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Kevin_Durant_2016.jpg/400px-Kevin_Durant_2016.jpg",
  duncan:   "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tim_Duncan_2014.jpg/400px-Tim_Duncan_2014.jpg",
  russell:  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Bill_Russell_1956.jpg/400px-Bill_Russell_1956.jpg",
  kareem:   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Kareem_Abdul-Jabbar_1974.jpg/400px-Kareem_Abdul-Jabbar_1974.jpg",
  wooden:   "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/John_Wooden_1972.jpg/400px-John_Wooden_1972.jpg",
  riley:    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Pat_Riley_2010.jpg/400px-Pat_Riley_2010.jpg",
  jackson:  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Phil_Jackson_2010.jpg/400px-Phil_Jackson_2010.jpg",
  popovich: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Gregg_Popovich_2019.jpg/400px-Gregg_Popovich_2019.jpg",
  rivers:   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Doc_Rivers_2013.jpg/400px-Doc_Rivers_2013.jpg",
  barkley:  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Charles_Barkley_2014.jpg/400px-Charles_Barkley_2014.jpg",
  iverson:  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Allen_Iverson_2016.jpg/400px-Allen_Iverson_2016.jpg",
  dirk:     "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Nowitzki_2011.jpg/400px-Nowitzki_2011.jpg",
  giannis:  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Giannis_Antetokounmpo_2019.jpg/400px-Giannis_Antetokounmpo_2019.jpg",
  jokic:    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nikola_Joki%C4%87_2019.jpg/400px-Nikola_Joki%C4%87_2019.jpg",
  luka:     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Luka_Don%C4%8Di%C4%87_2019.jpg/400px-Luka_Don%C4%8Di%C4%87_2019.jpg",
  pau:      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Pau_Gasol_2015.jpg/400px-Pau_Gasol_2015.jpg",
  rubio:    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Ricky_Rubio_2019.jpg/400px-Ricky_Rubio_2019.jpg",
  rudy:     "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Rudy_Fern%C3%A1ndez_2019.jpg/400px-Rudy_Fern%C3%A1ndez_2019.jpg",
  llull:    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sergio_Llull_2019.jpg/400px-Sergio_Llull_2019.jpg",
  reyes:    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Felipe_Reyes_2019.jpg/400px-Felipe_Reyes_2019.jpg",
  court:    "https://images.unsplash.com/photo-1546519638405-a9f168416bb2?w=600&q=60&blur=4",
};

export const EMAIL_QUOTES: { text: string; author: string; image: string }[] = [
  // Michael Jordan
  { text: "He fallado m&#225;s de 9.000 tiros en mi carrera. He perdido casi 300 partidos. Por eso he tenido &#233;xito.", author: "Michael Jordan", image: IMG.jordan },
  { text: "El talento gana partidos, pero el trabajo en equipo y la inteligencia ganan campeonatos.", author: "Michael Jordan", image: IMG.jordan },
  { text: "Puedes practicar tiros perfectos ocho horas al d&#237;a, pero si tu t&#233;cnica es incorrecta solo te vuelves mejor en hacer las cosas mal.", author: "Michael Jordan", image: IMG.jordan },
  { text: "Siempre paso el bal&#243;n al compa&#241;ero que est&#225; libre. Si ese compa&#241;ero soy yo, me lo quedo.", author: "Michael Jordan", image: IMG.jordan },
  { text: "Los l&#237;mites, como los miedos, son a menudo solo una ilusi&#243;n.", author: "Michael Jordan", image: IMG.jordan },
  { text: "Hay que aceptar que no siempre podr&#225;s ser perfecto, pero hay que hacer el esfuerzo de intentarlo.", author: "Michael Jordan", image: IMG.jordan },
  { text: "Si lo aceptas, te ponen en ventaja. Si te niegas, te ponen en desventaja.", author: "Michael Jordan", image: IMG.jordan },
  { text: "Para aprender a tener &#233;xito hay que aprender primero a fracasar.", author: "Michael Jordan", image: IMG.jordan },
  { text: "El trabajo duro sin talento es una l&#225;stima, pero el talento sin trabajo duro es una tragedia.", author: "Michael Jordan", image: IMG.jordan },
  { text: "Mi actitud es que si me empujas hacia algo que consideras una debilidad, voy a convertir esa debilidad en fortaleza.", author: "Michael Jordan", image: IMG.jordan },
  { text: "Nunca pens&#233; en las consecuencias de fallar un gran tiro. Si piensas en las consecuencias, siempre piensas en algo negativo.", author: "Michael Jordan", image: IMG.jordan },
  { text: "Algunos quieren que ocurra, otros desean que ocurra, otros hacen que ocurra.", author: "Michael Jordan", image: IMG.jordan },
  { text: "El coraz&#243;n de un campe&#243;n late con una pasi&#243;n inigualable antes de cada partido.", author: "Michael Jordan", image: IMG.jordan },
  { text: "Hay que tener coraje para entrar a la cancha y dar el 100 por cien cada vez.", author: "Michael Jordan", image: IMG.jordan },
  { text: "No me importa cu&#225;ntos campeonatos gane, siempre quiero m&#225;s.", author: "Michael Jordan", image: IMG.jordan },

  // Kobe Bryant
  { text: "No hay atajos hacia ning&#250;n lugar que valga la pena ir.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Los h&#233;roes llegan y se van, pero las leyendas son para siempre.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "El dolor es temporal. Rendirse dura para siempre.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Mamba Mentality: ser mejor hoy que ayer.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Si tienes miedo de fallar, no mereces tener &#233;xito.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Estudio al oponente en busca de sus debilidades. Eso es lo que hacen los asesinos.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Lo que me separa del resto es que me obsesiono con los detalles peque&#241;os.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Trabaja duro en silencio. Deja que tu &#233;xito haga el ruido.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "La grandeza no es gratis. La pagas con dedicaci&#243;n, sacrificio y esfuerzo.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Yo he visto lo que el trabajo duro puede hacer. Transforma a la gente.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Mientras los dem&#225;s duermen, yo entreno. Por eso soy diferente.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Las mejores armas contra el miedo son la preparaci&#243;n y la confianza.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Nunca abandones lo que quieres ser. El tiempo pasa de todos modos.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "La mentalidad de Mamba es sobre foco y estar presente en el momento.", author: "Kobe Bryant", image: IMG.kobe },
  { text: "Amar&#233; este juego hasta el &#250;ltimo d&#237;a de mi vida.", author: "Kobe Bryant", image: IMG.kobe },

  // LeBron James
  { text: "Llego preparado. Cuando la oportunidad llega, ya es demasiado tarde para prepararse.", author: "LeBron James", image: IMG.lebron },
  { text: "No hay nada como el trabajo duro. Nada puede reemplazar el trabajo duro.", author: "LeBron James", image: IMG.lebron },
  { text: "El &#233;xito no llega de la nada. Es el resultado de un trabajo constante.", author: "LeBron James", image: IMG.lebron },
  { text: "Cada vez que salgo a la cancha doy el m&#225;ximo que tengo.", author: "LeBron James", image: IMG.lebron },
  { text: "Mi mayor motivaci&#243;n es demostrar que me equivoco cada vez que alguien duda de m&#237;.", author: "LeBron James", image: IMG.lebron },
  { text: "Prefiero morir de agotamiento que de aburrimiento.", author: "LeBron James", image: IMG.lebron },
  { text: "Nunca dejar&#233; de mejorar. Ese es mi compromiso conmigo mismo.", author: "LeBron James", image: IMG.lebron },
  { text: "El equipo que juega junto, gana junto.", author: "LeBron James", image: IMG.lebron },
  { text: "Quiero ser conocido como alguien que cambi&#243; el juego para siempre.", author: "LeBron James", image: IMG.lebron },
  { text: "Mi legado es hacer que el baloncesto sea un deporte global.", author: "LeBron James", image: IMG.lebron },

  // Magic Johnson
  { text: "No te preocupes por el fracaso, prep&#225;rate para el &#233;xito.", author: "Magic Johnson", image: IMG.magic },
  { text: "Un buen jugador puede hacer que el equipo sea mejor. Un gran jugador hace que todo el mundo sea mejor.", author: "Magic Johnson", image: IMG.magic },
  { text: "Pasa el bal&#243;n. El baloncesto es un deporte de equipo.", author: "Magic Johnson", image: IMG.magic },
  { text: "La magia no ocurre por s&#237; sola. Hay que crearla.", author: "Magic Johnson", image: IMG.magic },
  { text: "Cuando juegas con pasi&#243;n, el mundo se levanta para verte.", author: "Magic Johnson", image: IMG.magic },
  { text: "No se trata solo de ganar. Se trata de c&#243;mo juegas el partido.", author: "Magic Johnson", image: IMG.magic },
  { text: "El mejor regalo que puedes darle al equipo es tu mejor versi&#243;n cada d&#237;a.", author: "Magic Johnson", image: IMG.magic },

  // Larry Bird
  { text: "Primera regla del baloncesto: haz que tu compa&#241;ero parezca bueno.", author: "Larry Bird", image: IMG.bird },
  { text: "No me importa qui&#233;n defiende. Solo me importa hacer el tiro.", author: "Larry Bird", image: IMG.bird },
  { text: "El trabajo duro bate al talento cuando el talento no trabaja duro.", author: "Larry Bird", image: IMG.bird },
  { text: "Soy el jugador m&#225;s consistente del mundo porque trabajo m&#225;s que nadie.", author: "Larry Bird", image: IMG.bird },
  { text: "Si no est&#225;s practicando, alguien en alguna parte s&#237; lo est&#225;. Y te ganar&#225; cuando os enfront&#233;is.", author: "Larry Bird", image: IMG.bird },

  // Shaquille O'Neal
  { text: "Excelencia no es un destino sino un camino continuo que nunca termina.", author: "Shaquille O'Neal", image: IMG.shaq },
  { text: "Trabaja duro, s&#233; humilde y nunca dejes de aprender.", author: "Shaquille O'Neal", image: IMG.shaq },
  { text: "El respeto se gana en la pista, no con palabras.", author: "Shaquille O'Neal", image: IMG.shaq },
  { text: "Si est&#225;s en el equipo correcto, la cancha se hace m&#225;s grande.", author: "Shaquille O'Neal", image: IMG.shaq },

  // Stephen Curry
  { text: "El tiro m&#225;s importante es el siguiente.", author: "Stephen Curry", image: IMG.curry },
  { text: "Sigue trabajando. No te rindas. Las cosas buenas toman tiempo.", author: "Stephen Curry", image: IMG.curry },
  { text: "La confianza es contagiosa. Tambi&#233;n lo es la falta de confianza.", author: "Stephen Curry", image: IMG.curry },
  { text: "Cada tiro que no tiras es un tiro que seguro fallas.", author: "Stephen Curry", image: IMG.curry },
  { text: "No somos perfectos, pero podemos aspirar a serlo.", author: "Stephen Curry", image: IMG.curry },
  { text: "El &#233;xito es una mentalidad antes que una realidad.", author: "Stephen Curry", image: IMG.curry },
  { text: "Cada d&#237;a es una nueva oportunidad para mejorar tu juego.", author: "Stephen Curry", image: IMG.curry },

  // Kevin Durant
  { text: "El trabajo duro supera al talento cuando el talento no trabaja.", author: "Kevin Durant", image: IMG.durant },
  { text: "Sigo hambriento de mejorar cada d&#237;a.", author: "Kevin Durant", image: IMG.durant },
  { text: "La mejor manera de predecir el futuro es crearlo.", author: "Kevin Durant", image: IMG.durant },
  { text: "Los grandes jugadores se crean en los momentos dif&#237;ciles.", author: "Kevin Durant", image: IMG.durant },
  { text: "No juego para la historia. Juego para ganar.", author: "Kevin Durant", image: IMG.durant },
  { text: "Si el plan no funciona, cambia el plan, no el objetivo.", author: "Kevin Durant", image: IMG.durant },

  // Tim Duncan
  { text: "Buenos jugadores quieren ser entrenados. Los grandes jugadores quieren ser retados.", author: "Tim Duncan", image: IMG.duncan },
  { text: "La consistencia es la clave de la grandeza.", author: "Tim Duncan", image: IMG.duncan },
  { text: "No hay atajos. Solo hay trabajo duro y resultados.", author: "Tim Duncan", image: IMG.duncan },

  // Bill Russell
  { text: "La medida de la grandeza de un equipo es qu&#233; tan bien juegan juntos cuando las cosas van mal.", author: "Bill Russell", image: IMG.russell },
  { text: "Ganar es un h&#225;bito. Desgraciadamente, perder tambi&#233;n lo es.", author: "Bill Russell", image: IMG.russell },
  { text: "No hay sustituci&#243;n para el trabajo de equipo.", author: "Bill Russell", image: IMG.russell },

  // Kareem Abdul-Jabbar
  { text: "No puedes ganar si no est&#225;s dispuesto a perder.", author: "Kareem Abdul-Jabbar", image: IMG.kareem },
  { text: "Un equipo unido puede superar cualquier adversidad.", author: "Kareem Abdul-Jabbar", image: IMG.kareem },
  { text: "La disciplina es el puente entre las metas y los logros.", author: "Kareem Abdul-Jabbar", image: IMG.kareem },
  { text: "Tu mente es tu arma m&#225;s poderosa en la cancha.", author: "Kareem Abdul-Jabbar", image: IMG.kareem },

  // John Wooden
  { text: "Haz que cada d&#237;a sea tu obra maestra.", author: "John Wooden", image: IMG.wooden },
  { text: "El &#233;xito es la paz mental que resulta de saber que hiciste tu mejor esfuerzo.", author: "John Wooden", image: IMG.wooden },
  { text: "No te preocupes por ser mejor que los dem&#225;s. Conc&#233;ntrate en ser mejor de lo que eras ayer.", author: "John Wooden", image: IMG.wooden },
  { text: "El jugador que da el mayor esfuerzo es el que m&#225;s merece ganar.", author: "John Wooden", image: IMG.wooden },
  { text: "El talento te hace bueno. El trabajo en equipo te hace grande.", author: "John Wooden", image: IMG.wooden },
  { text: "Es lo que aprendes despu&#233;s de saberlo todo lo que marca la diferencia.", author: "John Wooden", image: IMG.wooden },
  { text: "La fortaleza del equipo viene de la individualidad de cada miembro.", author: "John Wooden", image: IMG.wooden },

  // Pat Riley
  { text: "La excelencia no es un logro. Es un esp&#237;ritu, un h&#225;bito del car&#225;cter.", author: "Pat Riley", image: IMG.riley },
  { text: "Hay una diferencia entre los que dicen que quieren ganar y los que hacen lo que se necesita para ganar.", author: "Pat Riley", image: IMG.riley },
  { text: "Los campeones se hacen en los momentos de dificultad, no de facilidad.", author: "Pat Riley", image: IMG.riley },
  { text: "Cuando un equipo trabaja como uno, se vuelve invencible.", author: "Pat Riley", image: IMG.riley },

  // Phil Jackson
  { text: "Los campeones se hacen, no nacen.", author: "Phil Jackson", image: IMG.jackson },
  { text: "El baloncesto es un deporte donde la voluntad del equipo supera la voluntad individual.", author: "Phil Jackson", image: IMG.jackson },
  { text: "Si est&#225;s presente en el momento, el &#233;xito viene solo.", author: "Phil Jackson", image: IMG.jackson },
  { text: "Un equipo alineado puede lograr lo imposible.", author: "Phil Jackson", image: IMG.jackson },

  // Gregg Popovich
  { text: "La cultura del equipo lo es todo. Sin cultura no hay equipo.", author: "Gregg Popovich", image: IMG.popovich },
  { text: "El respeto mutuo dentro del equipo es la base del &#233;xito.", author: "Gregg Popovich", image: IMG.popovich },
  { text: "Juega duro, juega inteligente, cuida al compa&#241;ero.", author: "Gregg Popovich", image: IMG.popovich },

  // Doc Rivers
  { text: "Ubuntu: yo soy porque nosotros somos.", author: "Doc Rivers", image: IMG.rivers },
  { text: "Cuando el equipo gana, todos ganan. Cuando el equipo pierde, todos aprendemos.", author: "Doc Rivers", image: IMG.rivers },

  // Charles Barkley
  { text: "Nunca te rindas. El momento en que te rindes es el momento en que fallas.", author: "Charles Barkley", image: IMG.barkley },
  { text: "El talento sin trabajo duro es nada.", author: "Charles Barkley", image: IMG.barkley },

  // Allen Iverson
  { text: "Todos los d&#237;as salgo a la cancha y lo doy todo.", author: "Allen Iverson", image: IMG.iverson },
  { text: "El coraz&#243;n de un guerrero no conoce el cansancio.", author: "Allen Iverson", image: IMG.iverson },

  // Dirk Nowitzki
  { text: "El trabajo duro siempre paga. No siempre cuando t&#250; quieres, pero siempre paga.", author: "Dirk Nowitzki", image: IMG.dirk },
  { text: "Nunca me permit&#237; sentirme satisfecho. Siempre quise m&#225;s.", author: "Dirk Nowitzki", image: IMG.dirk },
  { text: "Los campeones trabajan cuando nadie mira.", author: "Dirk Nowitzki", image: IMG.dirk },

  // Giannis
  { text: "No miro hacia atr&#225;s. Solo miro hacia adelante.", author: "Giannis Antetokounmpo", image: IMG.giannis },
  { text: "Cada fracaso es un peldaño hacia el &#233;xito.", author: "Giannis Antetokounmpo", image: IMG.giannis },
  { text: "Trabajo todos los d&#237;as para ser mejor que ayer.", author: "Giannis Antetokounmpo", image: IMG.giannis },
  { text: "El sue&#241;o no se acaba hasta que t&#250; lo dejas.", author: "Giannis Antetokounmpo", image: IMG.giannis },
  { text: "Vine de la nada. Por eso nunca dar&#233; nada por sentado.", author: "Giannis Antetokounmpo", image: IMG.giannis },

  // Nikola Jokic
  { text: "Si juegas para el equipo, el equipo juega para ti.", author: "Nikola Jokic", image: IMG.jokic },
  { text: "El baloncesto es divertido cuando todos est&#225;n en la misma p&#225;gina.", author: "Nikola Jokic", image: IMG.jokic },

  // Luka Doncic
  { text: "Cada juego es una oportunidad de demostrar qui&#233;n eres.", author: "Luka Doncic", image: IMG.luka },
  { text: "Nunca dejes de creer en ti mismo.", author: "Luka Doncic", image: IMG.luka },
  { text: "El baloncesto no tiene fronteras. Solo tiene pasi&#243;n.", author: "Luka Doncic", image: IMG.luka },

  // Pau Gasol
  { text: "El trabajo duro, la dedicaci&#243;n y el amor por el juego son la clave del &#233;xito.", author: "Pau Gasol", image: IMG.pau },
  { text: "Cada vez que salgo a la pista, quiero ser el mejor jugador que puedo ser.", author: "Pau Gasol", image: IMG.pau },
  { text: "El equipo siempre est&#225; por encima del individuo.", author: "Pau Gasol", image: IMG.pau },
  { text: "No hay atajos. Solo hay trabajo duro y sacrificio.", author: "Pau Gasol", image: IMG.pau },
  { text: "El baloncesto me ense&#241;&#243; que los sue&#241;os se pueden hacer realidad.", author: "Pau Gasol", image: IMG.pau },

  // Ricky Rubio
  { text: "Juega con el coraz&#243;n y el cerebro te seguir&#225;.", author: "Ricky Rubio", image: IMG.rubio },
  { text: "El pase es la jugada m&#225;s inteligente del baloncesto.", author: "Ricky Rubio", image: IMG.rubio },

  // Rudy Fernandez
  { text: "Cada entrenamiento es una oportunidad de mejorar.", author: "Rudy Fern&#225;ndez", image: IMG.rudy },
  { text: "La Selecci&#243;n Espa&#241;ola me ense&#241;&#243; que juntos somos invencibles.", author: "Rudy Fern&#225;ndez", image: IMG.rudy },

  // Sergio Llull
  { text: "El esfuerzo diario es lo que te lleva a lo m&#225;s alto.", author: "Sergio Llull", image: IMG.llull },
  { text: "Cuando juegas para ganar, cada entrenamiento importa.", author: "Sergio Llull", image: IMG.llull },

  // Felipe Reyes
  { text: "La pista es mi oficina y cada partido es mi mejor trabajo.", author: "Felipe Reyes", image: IMG.reyes },
  { text: "Con esfuerzo y sacrificio todo es posible.", author: "Felipe Reyes", image: IMG.reyes },

  // Genéricas
  { text: "El baloncesto no construye el car&#225;cter. Lo revela.", author: "unknown", image: IMG.court },
  { text: "El equipo que m&#225;s trabaja gana. Siempre.", author: "unknown", image: IMG.court },
  { text: "No hay derrota permanente. Solo hay lecciones.", author: "unknown", image: IMG.court },
  { text: "La pista no miente. Lo que metes en el entrenamiento, lo sacas en el partido.", author: "unknown", image: IMG.court },
  { text: "El baloncesto es 10% f&#237;sico y 90% mental.", author: "unknown", image: IMG.court },
  { text: "No puedes controlar el resultado. Solo puedes controlar el esfuerzo.", author: "unknown", image: IMG.court },
  { text: "Los campeones entrenan cuando no tienen ganas.", author: "unknown", image: IMG.court },
  { text: "Gana el entrenamiento. Gana el partido.", author: "unknown", image: IMG.court },
  { text: "La grandeza est&#225; a un entrenamiento de distancia. Siempre.", author: "unknown", image: IMG.court },
  { text: "El verdadero competidor no necesita motivaci&#243;n. La lleva dentro.", author: "unknown", image: IMG.court },
  { text: "La diferencia entre ordinario y extraordinario es ese peque&#241;o extra.", author: "unknown", image: IMG.court },
  { text: "El &#233;xito es la suma de peque&#241;os esfuerzos repetidos d&#237;a tras d&#237;a.", author: "unknown", image: IMG.court },
  { text: "Cinco jugadores, un coraz&#243;n.", author: "unknown", image: IMG.court },
  { text: "Cuando el equipo cree, el equipo logra.", author: "unknown", image: IMG.court },
  { text: "La pista de baloncesto es el lugar donde los sue&#241;os se convierten en realidad.", author: "unknown", image: IMG.court },
  { text: "Los campeones hacen en el entrenamiento lo que otros hacen solo en el partido.", author: "unknown", image: IMG.court },
  { text: "La presi&#243;n hace diamantes.", author: "unknown", image: IMG.court },
  { text: "Juega cada partido como si fuera el &#250;ltimo.", author: "unknown", image: IMG.court },
  { text: "Un equipo que se une por un objetivo, se vuelve imparable.", author: "unknown", image: IMG.court },
  { text: "La confianza se construye en el entrenamiento, no en el partido.", author: "unknown", image: IMG.court },
  { text: "Nadie recuerda el esfuerzo. Todos recuerdan el resultado. Por eso hay que dar los dos.", author: "unknown", image: IMG.court },
];
