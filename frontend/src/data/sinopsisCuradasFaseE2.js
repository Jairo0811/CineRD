/**
 * CineRD · Fase E-2: sinopsis de nueva redacción, ES/EN, basadas en fichas
 * históricas contrastables; NO son resúmenes oficiales ni reseñas de visionado.
 * En producción se muestran como borradores para películas sin Sinopsis SQL.
 * El candado de identidad ID + título + año evita mezclar fichas incorrectas.
 */
import { getSinopsisFaseE2Final } from "./sinopsisCuradasFaseE2Final.js";

export const SINOPSIS_EDITORIALES_FASE_E2 = Object.freeze({
  "15": {
    "tituloReferencia": "Tubérculo Gourmet",
    "anioReferencia": 2015,
    "estado": "pendiente_revision",
    "es": "Una confusión separa durante dos décadas a Tubérculo y Tirson, amigos desde la infancia. El reencuentro inesperado los obliga a revisar el pasado y decidir si pueden reconstruir el vínculo que perdieron. La historia convierte el perdón y la amistad en el centro de una comedia de personajes.",
    "en": "A misunderstanding separates childhood friends Tubérculo and Tirson for two decades. When unforeseen circumstances bring them together again, they must confront the past and decide whether their friendship can be repaired. Forgiveness and loyalty drive this character-based comedy.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/tuberculo-gourmet-2015/"
      }
    ]
  },
  "17": {
    "tituloReferencia": "Profe por Accidente",
    "anioReferencia": 2013,
    "estado": "pendiente_revision",
    "es": "Francisco pierde su empleo conduciendo el tren del zoológico y, poco después, un incendio acaba con sus pertenencias. Busca refugio en casa de su amigo Mon, pero la convivencia genera problemas. Una oportunidad para trabajar en un colegio bilingüe lo introduce en un ambiente para el que no parece preparado.",
    "en": "Francisco loses his job driving the zoo's train, and a fire subsequently destroys his belongings. He moves in with his friend Mon, whose everyday life becomes increasingly complicated. An opportunity to work at a bilingual school draws Francisco into an unfamiliar environment.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/profe-por-accidente-2013/"
      }
    ]
  },
  "18": {
    "tituloReferencia": "Lotoman 2.0",
    "anioReferencia": 2012,
    "estado": "pendiente_revision",
    "es": "Después de ganar la lotería, Modesto y Manuel siguen intentando adaptarse a la riqueza y a los cambios que ha traído a sus vidas. La enfermedad de Mamá Susana altera las prioridades de la familia y los enfrenta a preocupaciones que el dinero, por sí solo, no puede resolver.",
    "en": "Having won the lottery, Modesto and Manuel continue adapting to wealth and the changes it has brought to their lives. Mamá Susana's illness shifts the family's priorities and confronts them with troubles that money alone cannot solve.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/lotoman-2-0-2012/"
      }
    ]
  },
  "20": {
    "tituloReferencia": "Un Macho de Mujer",
    "anioReferencia": 2006,
    "estado": "pendiente_revision",
    "es": "Ramón suele salir de fiesta con sus compañeros después del trabajo, ignorando el malestar que esa rutina causa en su matrimonio. Un extraño amuleto desencadena un intercambio de papeles familiares que lo obliga a experimentar un hogar organizado de manera muy distinta a la que conoce.",
    "en": "Ramón routinely goes out drinking with coworkers after work, disregarding how this affects his marriage. A mysterious amulet brings about a reversal of family roles and forces him to experience a household arranged very differently from the one he knows.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/un-macho-de-mujer-2006/"
      }
    ]
  },
  "23": {
    "tituloReferencia": "Sanky Panky 2",
    "anioReferencia": 2013,
    "estado": "pendiente_revision",
    "es": "Genaro continúa trabajando en un hotel y persiste en su afán de conquistar a turistas, mientras Morena intenta dar estabilidad a su relación. La llegada de una familia italiana y el regreso de Martha, quien tiene una sorpresa para él, desencadenan nuevos enredos entre los huéspedes y los empleados.",
    "en": "Genaro still works at a hotel and pursues foreign tourists, while Morena hopes to bring stability to their relationship. The arrival of an Italian family and the unexpected return of Martha, who has news for him, set off new misunderstandings among guests and staff.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/sanky-panky-2-2013/"
      }
    ]
  },
  "24": {
    "tituloReferencia": "Sanky Panky 3",
    "anioReferencia": 2018,
    "estado": "pendiente_revision",
    "es": "Después de la separación entre Genaro y Morena, Genaro, Chelo y Carlitos viajan a Puerto Rico en busca de oportunidades. Sus planes se complican cuando Genaro se enamora de una ejecutiva puertorriqueña y reaparecen asuntos sentimentales del pasado. La aventura lleva la comedia fuera de República Dominicana.",
    "en": "Following Genaro's separation from Morena, he travels to Puerto Rico with Chelo and Carlitos in search of opportunities. Their plans become tangled when Genaro falls for a Puerto Rican executive and unresolved romantic matters resurface. The comedy takes their adventures beyond the Dominican Republic.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/sanky-panky-3-29-marzo/"
      }
    ]
  },
  "25": {
    "tituloReferencia": "Sanky Panky 4: De Safari",
    "anioReferencia": 2025,
    "estado": "pendiente_revision",
    "es": "Genaro, Chelo y Carlitos trabajan en una finca dedicada al cacao cuando Carlitos gana un viaje para visitar un safari africano. Los tres aprovechan la oportunidad, pero se separan por accidente una vez que llegan. Cada uno termina viviendo una aventura distinta lejos de sus compañeros.",
    "en": "Genaro, Chelo and Carlitos work on a cacao farm when Carlitos wins a trip to an African safari. The friends take the opportunity to travel together, only to become separated by accident after arriving. Each faces an unexpected adventure away from the others.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/sanky-panky-4-de-safari-2025/"
      }
    ]
  },
  "26": {
    "tituloReferencia": "Feo de día, Lindo de noche",
    "anioReferencia": 2012,
    "estado": "pendiente_revision",
    "es": "Un hombre acostumbrado a recibir poca atención por su aspecto físico obtiene, gracias a un hechizo, una apariencia diferente cada noche, desde las ocho de la noche hasta la medianoche. La transformación parece abrirle nuevas posibilidades amorosas, pero se vuelve un problema cuando comienza a sentir un afecto genuino.",
    "en": "A man who feels overlooked because of his appearance is transformed by a spell into a handsome version of himself each night from 8 p.m. until midnight. What initially seems like a chance at romance becomes complicated when he develops genuine feelings for someone.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/feo-de-dia-lindo-de-noche-2012/"
      }
    ]
  },
  "27": {
    "tituloReferencia": "Lotoman 003: Volando Bajito",
    "anioReferencia": 2014,
    "estado": "pendiente_revision",
    "es": "Modesto y Manuel aceptan colaborar con una unidad policial especial y terminan envueltos en una misión de investigación. Su tarea consiste en identificar a posibles miembros de una organización clandestina, pero la aventura pone a prueba su criterio, su honestidad y su capacidad para tomar decisiones difíciles.",
    "en": "Modesto and Manuel agree to help a special police unit and find themselves caught up in an investigation. Tasked with identifying suspected members of a clandestine organization, they discover that the mission tests their judgment, honesty and ability to make difficult choices.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/lotoman-003-volando-bajito-2014/"
      }
    ]
  },
  "28": {
    "tituloReferencia": "Teacher Mechy",
    "anioReferencia": 2023,
    "estado": "pendiente_revision",
    "es": "Mercedes regresa a Santo Domingo desde Nueva York cuando descubre que su hija Saray está embarazada. Necesita trabajo para ayudar a su familia y consigue un puesto como profesora de danza moderna en un colegio privado. El reto es que no domina esa disciplina y deberá encontrar la manera de salir adelante.",
    "en": "Mercedes returns to Santo Domingo from New York after learning that her daughter Saray is pregnant. Looking for work to support her family, she accepts a position teaching modern dance at an exclusive school. The challenge is that she has no experience with that type of dance.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://caribbeancinemas.com/es/movie/8592/"
      }
    ]
  },
  "29": {
    "tituloReferencia": "Baño de Mujeres",
    "anioReferencia": 2025,
    "estado": "pendiente_revision",
    "es": "Tres amigas interrumpen un viaje por carretera para detenerse en un parador. En el baño, Johanna encuentra mensajes que apuntan a una red de trata de personas y a una víctima que intenta ayudar a su hermana. La parada se transforma en una experiencia de peligro que obliga a las mujeres a actuar.",
    "en": "Three friends stop at a roadside establishment during a trip. In the restroom, Johanna discovers messages pointing to a human-trafficking operation and a victim attempting to help her sister. Their routine stop turns dangerous, forcing the travelers to decide how to respond.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/bano-de-mujeres-2025/"
      }
    ]
  },
  "33": {
    "tituloReferencia": "Pueto Pa' Mi",
    "anioReferencia": 2015,
    "estado": "pendiente_revision",
    "es": "Dos jóvenes artistas de música urbana se abren paso en un entorno de dificultades económicas y recursos limitados. Pese a los obstáculos personales y profesionales, se mantienen decididos a desarrollar sus carreras y alcanzar el reconocimiento con el que sueñan.",
    "en": "Two aspiring urban-music performers struggle to build careers despite financial hardship and limited resources. Personal and professional setbacks challenge them, but both remain determined to pursue the recognition and future they envision through music.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/pueto-pami-2015/"
      }
    ]
  },
  "34": {
    "tituloReferencia": "Los Super",
    "anioReferencia": 2013,
    "estado": "pendiente_revision",
    "es": "Cristina, una exatleta y madre soltera, une fuerzas con Belisario, vendedor ambulante, y Benito, técnico aficionado a inventar. Ante los problemas de delincuencia de su barrio, los tres deciden actuar como defensores de la comunidad. Sus esfuerzos los enfrentan a Vandomal, un político con un plan peligroso.",
    "en": "Cristina, a former athlete and single mother, joins forces with street vendor Belisario and inventor-minded technician Benito. Alarmed by crime in their neighborhood, they decide to protect their community. Their improvised efforts place them against Vandomal, a politician pursuing a dangerous scheme.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/los-super-2013/"
      }
    ]
  },
  "36": {
    "tituloReferencia": "Nueba Yol 3: Bajo la Nueva Ley",
    "anioReferencia": 1997,
    "estado": "pendiente_revision",
    "es": "Balbuena vuelve a afrontar las dificultades de la vida migrante en Nueva York durante las semanas previas a la entrada en vigor de una ley de inmigración más estricta. La incertidumbre afecta sus planes y los de muchos otros residentes, convirtiendo la nueva regulación en el centro de esta continuación.",
    "en": "Balbuena once again faces the challenges of immigrant life in New York, this time as a stricter immigration law approaches. Uncertainty about the new regulations disrupts his plans and those of other residents, shaping the conflict of this sequel.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/nueba-yol-3-bajo-la-nueva-ley-1997/"
      }
    ]
  },
  "38": {
    "tituloReferencia": "La casa del kilómetro 5",
    "anioReferencia": 2012,
    "estado": "pendiente_revision",
    "es": "Una emisora de radio ofrece un premio en efectivo a quien resista una noche en una casa supuestamente embrujada de La Vega. Jóvenes y periodistas se interesan en el desafío, ignorando los relatos sobre el antiguo propietario y el oscuro origen de la vivienda. El concurso termina convirtiéndose en una prueba de terror.",
    "en": "A radio station offers a cash prize to anyone who can spend a night inside a supposedly haunted house in La Vega. Young contestants and journalists are drawn to the challenge, unaware of the disturbing stories linked to the house's former owner. A publicity stunt becomes a terrifying ordeal.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/la-casa-del-kilometro-5-2012/"
      }
    ]
  },
  "40": {
    "tituloReferencia": "Colao 2",
    "anioReferencia": 2023,
    "estado": "pendiente_revision",
    "es": "Antonio, caficultor de Jarabacoa, intenta iniciar un proyecto que ayude a su esposa Laura a adaptarse a la vida en el campo. Cuando una antigua novia reaparece con la intención de intervenir en su matrimonio, los planes de la pareja y su convivencia quedan bajo presión.",
    "en": "Antonio, a coffee grower from Jarabacoa, hopes a new project will help his wife Laura settle into rural life. The couple's plans become strained when an old girlfriend reappears and tries to interfere in their marriage.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/colao-2-2023/"
      }
    ]
  },
  "42": {
    "tituloReferencia": "Andrea",
    "anioReferencia": 2005,
    "estado": "pendiente_revision",
    "es": "Andrea retira una cruz de una tumba y, sin saberlo, desencadena el regreso de un espíritu que permanecía atrapado allí. La presencia sobrenatural busca vengar un agravio del pasado, mientras los personajes intentan comprender los sucesos inquietantes que comienzan a rodearlos.",
    "en": "Andrea removes a cross from a grave and unknowingly releases a spirit that had been confined there. The supernatural presence seeks revenge for events in the past, while those around Andrea try to make sense of the increasingly disturbing occurrences.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/andrea-la-venganza-de-un-espiritu-2005/"
      }
    ]
  },
  "44": {
    "tituloReferencia": "Playball",
    "anioReferencia": 2008,
    "estado": "pendiente_revision",
    "es": "Álex Durán, un joven pelotero con futuro prometedor en las Grandes Ligas, ve derrumbarse su carrera al verse envuelto en el consumo de esteroides. De regreso a República Dominicana, recibe una oportunidad en la liga profesional local y debe afrontar las consecuencias de sus decisiones anteriores.",
    "en": "Álex Durán, a young baseball player with a promising Major League career, sees his future unravel after becoming involved with performance-enhancing drugs. Back in the Dominican Republic, he gets an opportunity in the local professional league and must face the consequences of earlier choices.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/play-ball-2008/"
      }
    ]
  },
  "49": {
    "tituloReferencia": "Los Locos también Piensan",
    "anioReferencia": 2005,
    "estado": "pendiente_revision",
    "es": "Filomeno sueña con escribir para el cine después de perder su trabajo en el teatro. Su primo Balbuena lo anima a presentar un guion a un productor, pero la propuesta es rechazada. Lejos de rendirse, Filomeno organiza un plan ingenioso para demostrar que su historia merece ser contada.",
    "en": "Filomeno hopes to write for the movies after losing his job in the theater. His cousin Balbuena persuades him to show a screenplay to a film producer, but the project is rejected. Refusing to give up, Filomeno devises an elaborate plan to prove the value of his story.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/los-locos-tambien-piensan-2005/"
      }
    ]
  },
  "50": {
    "tituloReferencia": "Hermanos",
    "anioReferencia": 2018,
    "estado": "pendiente_revision",
    "es": "Dos gemelos separados al nacer crecen en entornos opuestos: uno lleva una vida religiosa y el otro se dedica a pequeños robos. Cuando sus caminos se cruzan, el hermano ladrón provoca accidentalmente que el otro caiga en coma. Aprovecha su parecido para hacerse pasar por él frente a una familia que cree que perdió la memoria.",
    "en": "Twin brothers separated at birth grow up in very different circumstances: one is deeply religious, while the other becomes a petty thief. When they meet, an accident leaves the religious brother in a coma. The other assumes his identity among relatives who believe he has lost his memory.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/hermanos-2018/"
      }
    ]
  },
  "51": {
    "tituloReferencia": "Tubérculo Presidente",
    "anioReferencia": 2016,
    "estado": "pendiente_revision",
    "es": "Tubérculo y Tirson llegan a la presidencia y vicepresidencia de República Dominicana. Sus políticas de alimentación popular y combate a la corrupción les ganan respaldo ciudadano, pero despiertan la oposición de quienes pretenden obtener beneficios indebidos aprovechándose del nuevo gobierno.",
    "en": "Tubérculo and Tirson become president and vice president of the Dominican Republic. Programs supporting food access and efforts to fight corruption earn public support, but people hoping to profit from the new administration begin working against them.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/tuberculo-presidente-2016/"
      }
    ]
  },
  "52": {
    "tituloReferencia": "Dos policías en apuros",
    "anioReferencia": 2016,
    "estado": "pendiente_revision",
    "es": "Dos policías dominicanos de temperamentos poco convencionales deben colaborar con un agente del FBI metódico y disciplinado. El equipo investiga una organización criminal internacional, pero la diferencia entre sus maneras de trabajar provoca conflictos y situaciones absurdas que complican la misión.",
    "en": "Two unconventional Dominican police officers must work with a methodical, disciplined FBI agent. The team investigates an international criminal organization, but their clashing approaches create confusion and comic mishaps that make the assignment more difficult.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/dos-policias-en-apuros-2016/"
      }
    ]
  },
  "53": {
    "tituloReferencia": "La Musiquita por Dentro",
    "anioReferencia": 2019,
    "estado": "pendiente_revision",
    "es": "Ariel, un joven tímido, se enamora de Mar mientras ambos realizan una pasantía en una empresa. La amistad crece, pero sus inseguridades y la presencia de Vanessa complican el acercamiento. Para expresar sus sentimientos, Ariel tendrá que encontrar el valor que le ha faltado.",
    "en": "Ariel, a shy young man, falls for Mar while they are interns at the same company. Their friendship grows, but his insecurities and Vanessa's involvement complicate the relationship. Ariel must find the courage to express how he truly feels.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/la-musiquita-por-dentro-2019/"
      }
    ]
  },
  "54": {
    "tituloReferencia": "Los Paracaidistas",
    "anioReferencia": 2015,
    "estado": "pendiente_revision",
    "es": "Cuatro empleados de una fábrica de colchones se proponen asistir sin invitación a cien fiestas. Quieren distraer a Leo de una ruptura sentimental y ganar fama con la hazaña. Sin embargo, la diversión y las decisiones que toman amenazan con afectar sus empleos, sus relaciones y la amistad del grupo.",
    "en": "Four workers at a mattress factory decide to crash one hundred parties. They hope to distract their friend Leo from a breakup and perhaps become famous. As the challenge progresses, their choices put their jobs, relationships and friendship at risk.",
    "fuentes": [
      {
        "titulo": "Ficha histórica / fuente del argumento",
        "url": "https://cinemadominicano.com/los-paracaidistas-2015/"
      }
    ]
  }
});

const normalizar = (s) => String(s ?? "").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function getSinopsisFaseE2(pelicula) {
  if (!pelicula) return null;
  const item = SINOPSIS_EDITORIALES_FASE_E2[Number(pelicula.Id)];
  if (!item) return getSinopsisFaseE2Final(pelicula);
  if (normalizar(item.tituloReferencia) !== normalizar(pelicula.Titulo)) return null;
  if (Number(String(pelicula.FechaEstreno ?? "").slice(0, 4)) !== item.anioReferencia) return null;
  return item;
}
