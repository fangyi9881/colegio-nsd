export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const BASKETBALL_QUESTIONS: Question[] = [
  // REGLAS Y CONCEPTOS BÁSICOS
  { id: 1, question: "¿Cuántos jugadores hay en pista por equipo en un partido oficial?", options: ["4", "5", "6", "7"], correctAnswer: 1 },
  { id: 2, question: "¿Cuánto tiempo tiene un equipo para pasar de pista trasera a delantera?", options: ["5 segundos", "8 segundos", "10 segundos", "24 segundos"], correctAnswer: 1 },
  { id: 3, question: "¿A qué altura está situado el aro de baloncesto?", options: ["2.95 metros", "3.00 metros", "3.05 metros", "3.10 metros"], correctAnswer: 2 },
  { id: 4, question: "¿Cuántas faltas personales suponen la expulsión en la FIBA?", options: ["4", "5", "6", "7"], correctAnswer: 1 },
  { id: 5, question: "¿Cuánto dura un cuarto en un partido FIBA?", options: ["8 minutos", "10 minutos", "12 minutos", "15 minutos"], correctAnswer: 1 },
  { id: 6, question: "¿Cuánto dura un cuarto en la NBA?", options: ["10 minutos", "12 minutos", "15 minutos", "20 minutos"], correctAnswer: 1 },
  { id: 7, question: "¿A qué distancia está la línea de 3 puntos en la FIBA?", options: ["6.25 metros", "6.75 metros", "7.00 metros", "7.24 metros"], correctAnswer: 1 },
  { id: 8, question: "¿A qué distancia está la línea de 3 puntos en la NBA (frontal)?", options: ["6.75 metros", "7.00 metros", "7.24 metros", "7.50 metros"], correctAnswer: 2 },
  { id: 9, question: "¿Cuánto tiempo de posesión tiene un equipo tras un rebote ofensivo en FIBA?", options: ["10 segundos", "14 segundos", "24 segundos", "No se reinicia"], correctAnswer: 1 },
  { id: 10, question: "¿Qué significa la regla de los 3 segundos?", options: ["Tiempo máximo para tirar", "Tiempo máximo de un atacante en la zona", "Tiempo para sacar de banda", "Tiempo para pedir tiempo muerto"], correctAnswer: 1 },
  
  // HISTORIA Y NBA
  { id: 11, question: "¿Quién es el máximo anotador histórico de la NBA?", options: ["Michael Jordan", "Kareem Abdul-Jabbar", "LeBron James", "Kobe Bryant"], correctAnswer: 2 },
  { id: 12, question: "¿Qué equipo ha ganado más anillos de la NBA?", options: ["Los Angeles Lakers", "Boston Celtics", "Chicago Bulls", "Golden State Warriors"], correctAnswer: 1 },
  { id: 13, question: "¿Qué jugador es apodado 'Air'?", options: ["Magic Johnson", "Larry Bird", "Michael Jordan", "Shaquille O'Neal"], correctAnswer: 2 },
  { id: 14, question: "¿Quién anotó 100 puntos en un solo partido de la NBA?", options: ["Wilt Chamberlain", "Kobe Bryant", "Michael Jordan", "Elgin Baylor"], correctAnswer: 0 },
  { id: 15, question: "¿Qué jugador tiene el récord de más asistencias en la historia de la NBA?", options: ["Magic Johnson", "John Stockton", "Jason Kidd", "Steve Nash"], correctAnswer: 1 },
  { id: 16, question: "¿A qué jugador se le conoce como 'The Black Mamba'?", options: ["LeBron James", "Kevin Durant", "Kobe Bryant", "Allen Iverson"], correctAnswer: 2 },
  { id: 17, question: "¿Quién es el jugador con más anillos de campeón de la NBA como jugador?", options: ["Michael Jordan", "Bill Russell", "Robert Horry", "Kareem Abdul-Jabbar"], correctAnswer: 1 },
  { id: 18, question: "¿Qué equipo drafteó a Kobe Bryant en 1996?", options: ["Los Angeles Lakers", "Charlotte Hornets", "Philadelphia 76ers", "Boston Celtics"], correctAnswer: 1 },
  { id: 19, question: "¿Quién es el inventor del baloncesto?", options: ["James Naismith", "William G. Morgan", "Abner Doubleday", "Walter Camp"], correctAnswer: 0 },
  { id: 20, question: "¿En qué año se inventó el baloncesto?", options: ["1885", "1891", "1905", "1932"], correctAnswer: 1 },

  // BALONCESTO ESPAÑOL Y FIBA
  { id: 21, question: "¿Qué jugador español fue el primero en jugar en la NBA?", options: ["Pau Gasol", "Fernando Martín", "Juan Carlos Navarro", "José Manuel Calderón"], correctAnswer: 1 },
  { id: 22, question: "¿En qué año ganó España su primer Mundial de Baloncesto?", options: ["2002", "2006", "2010", "2019"], correctAnswer: 1 },
  { id: 23, question: "¿Qué equipo español ha ganado más Copas de Europa (Euroligas)?", options: ["FC Barcelona", "Real Madrid", "Joventut Badalona", "Baskonia"], correctAnswer: 1 },
  { id: 24, question: "¿Quién es el máximo anotador histórico de la Selección Española?", options: ["Juan Antonio San Epifanio 'Epi'", "Pau Gasol", "Juan Carlos Navarro", "Rudy Fernández"], correctAnswer: 1 },
  { id: 25, question: "¿Qué jugadora española es considerada una de las mejores de la historia y jugó en la WNBA?", options: ["Laia Palau", "Amaya Valdemoro", "Alba Torrens", "Marta Xargay"], correctAnswer: 1 },
  { id: 26, question: "¿En qué ciudad ganó España el Mundial de 2006?", options: ["Pekín", "Saitama", "Atenas", "Madrid"], correctAnswer: 1 },
  { id: 27, question: "¿Qué país ha ganado más medallas de oro olímpicas en baloncesto masculino?", options: ["Unión Soviética", "Yugoslavia", "Estados Unidos", "Argentina"], correctAnswer: 2 },
  { id: 28, question: "¿Quién fue el MVP del Mundial de Baloncesto 2019?", options: ["Marc Gasol", "Ricky Rubio", "Luis Scola", "Bogdan Bogdanovic"], correctAnswer: 1 },
  { id: 29, question: "¿Qué equipo ganó la primera edición de la Liga ACB (1983-84)?", options: ["FC Barcelona", "Real Madrid", "Joventut", "Estudiantes"], correctAnswer: 1 },
  { id: 30, question: "¿Qué jugador español tiene el récord de asistencias en un partido de la NBA (24)?", options: ["Ricky Rubio", "José Manuel Calderón", "Sergio Rodríguez", "Pau Gasol"], correctAnswer: 0 },

  // CURIOSIDADES Y TÉCNICA
  { id: 31, question: "¿Cómo se llama el movimiento donde un jugador pivota sobre un pie sin moverlo?", options: ["Reverso", "Pivote", "Finta", "Traspiés"], correctAnswer: 1 },
  { id: 32, question: "¿Qué es un 'Alley-oop'?", options: ["Un tiro de 3 puntos", "Un pase que se coge en el aire y se machaca", "Un robo de balón", "Una falta antideportiva"], correctAnswer: 1 },
  { id: 33, question: "¿Qué significa 'Triple-Doble'?", options: ["Anotar 3 triples seguidos", "Llegar a dobles dígitos en 3 estadísticas", "Ganar 3 partidos por el doble de puntos", "Hacer 3 faltas en el segundo cuarto"], correctAnswer: 1 },
  { id: 34, question: "¿Cuánto pesa aproximadamente un balón de baloncesto oficial masculino (Talla 7)?", options: ["400-450g", "500-550g", "567-650g", "700-750g"], correctAnswer: 2 },
  { id: 35, question: "¿De qué material estaban hechas las primeras canastas de baloncesto?", options: ["Aros de metal", "Cestas de melocotones", "Cajas de madera", "Redes de pesca"], correctAnswer: 1 },
  { id: 36, question: "¿Qué jugador es famoso por su tiro 'Skyhook' (Gancho del cielo)?", options: ["Magic Johnson", "Kareem Abdul-Jabbar", "Hakeem Olajuwon", "Tim Duncan"], correctAnswer: 1 },
  { id: 37, question: "¿Qué es un 'Buzzer Beater'?", options: ["Un jugador muy rápido", "Un tiro que entra justo cuando suena la bocina final", "Una falta técnica", "Un tipo de defensa en zona"], correctAnswer: 1 },
  { id: 38, question: "¿Qué jugador tiene el récord de más triples anotados en la historia de la NBA?", options: ["Ray Allen", "Reggie Miller", "Stephen Curry", "Klay Thompson"], correctAnswer: 2 },
  { id: 39, question: "¿Cómo se llama la infracción por botar el balón con ambas manos a la vez?", options: ["Pasos", "Dobles", "Acompañamiento", "Campo atrás"], correctAnswer: 1 },
  { id: 40, question: "¿Qué equipo de exhibición es famoso por sus trucos y comedia en la pista?", options: ["Harlem Globetrotters", "Washington Generals", "And1 Mixtape Tour", "Court Kingz"], correctAnswer: 0 },

  // MÁS NBA Y ACTUALIDAD
  { id: 41, question: "¿Quién fue elegido número 1 del Draft de la NBA en 2023?", options: ["Scoot Henderson", "Brandon Miller", "Victor Wembanyama", "Chet Holmgren"], correctAnswer: 2 },
  { id: 42, question: "¿Qué jugador europeo ha ganado múltiples premios MVP en la NBA recientemente jugando para los Nuggets?", options: ["Luka Doncic", "Giannis Antetokounmpo", "Nikola Jokic", "Domantas Sabonis"], correctAnswer: 2 },
  { id: 43, question: "¿En qué equipo jugó toda su carrera en la NBA Dirk Nowitzki?", options: ["San Antonio Spurs", "Dallas Mavericks", "Houston Rockets", "Miami Heat"], correctAnswer: 1 },
  { id: 44, question: "¿Qué jugador es conocido como 'The Greek Freak'?", options: ["Kostas Papanikolaou", "Vassilis Spanoulis", "Giannis Antetokounmpo", "Nick Calathes"], correctAnswer: 2 },
  { id: 45, question: "¿Quién es el único jugador en promediar un triple-doble en múltiples temporadas?", options: ["Oscar Robertson", "Magic Johnson", "Russell Westbrook", "LeBron James"], correctAnswer: 2 },
  { id: 46, question: "¿Qué entrenador tiene más victorias en la historia de la NBA?", options: ["Phil Jackson", "Gregg Popovich", "Don Nelson", "Pat Riley"], correctAnswer: 1 },
  { id: 47, question: "¿Qué jugador anotó 81 puntos en un partido contra los Toronto Raptors en 2006?", options: ["Allen Iverson", "Tracy McGrady", "Kobe Bryant", "LeBron James"], correctAnswer: 2 },
  { id: 48, question: "¿Qué franquicia de la NBA se encuentra en Canadá?", options: ["Vancouver Grizzlies", "Toronto Huskies", "Montreal Expos", "Toronto Raptors"], correctAnswer: 3 },
  { id: 49, question: "¿Qué jugador es el logo de la NBA?", options: ["Michael Jordan", "Jerry West", "Bob Cousy", "Wilt Chamberlain"], correctAnswer: 1 },
  { id: 50, question: "¿Qué equipo remontó un 3-1 en las Finales de la NBA de 2016?", options: ["Golden State Warriors", "Cleveland Cavaliers", "Miami Heat", "San Antonio Spurs"], correctAnswer: 1 }
];
