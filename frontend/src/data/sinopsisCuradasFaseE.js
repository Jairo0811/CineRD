/**
 * CineRD · Fase E / sinopsis editoriales ORIGINALES.
 * Borradores basados en las fichas históricas citadas en editorialPeliculas.js.
 * No son las sinopsis oficiales de distribuidoras ni han sido aprobados por el titular.
 * SOLO se usan cuando el catálogo carece de sinopsis registrada y la editorial coincide
 * en ID, título y año. No sustituyen los valores del snapshot/SQL Server.
 */
import { getEditorialPelicula } from "./editorialPeliculas.js";
import { getSinopsisFaseE2 } from "./sinopsisCuradasFaseE2.js";

export const SINOPSIS_EDITORIALES_FASE_E = Object.freeze({
  4: {
    es: "Genaro busca escapar de las dificultades económicas que vive con su madre. Animado por la idea de encontrar oportunidades entre los turistas extranjeros, deja su entorno habitual y se traslada a un complejo hotelero, donde sus planes de mejorar de vida se cruzan con el amor, los malentendidos culturales y el humor.",
    en: "Genaro hopes to escape the financial difficulties he shares with his mother. Convinced that encounters with foreign tourists could open new doors, he leaves home for a resort. His attempt to improve his circumstances leads to romantic hopes, cultural misunderstandings and comedy.",
  },
  5: {
    es: "Tres hombres permanecen encarcelados durante años por delitos menores y una cadena de negligencias burocráticas. Cuando consiguen escapar, emprenden el viaje para reencontrarse con sus familias llevando consigo una güira, un tambor y un acordeón. Su recorrido transforma una injusticia institucional en una aventura atravesada por música y humor.",
    en: "Three men spend years in prison for minor offenses because of bureaucratic neglect. After escaping, they set out to find their families with a güira, a drum and an accordion. Music and comedy accompany their journey through a story rooted in institutional injustice.",
  },
  6: {
    es: "Bruno, profesor universitario y padre de familia, busca otra manera de costear los estudios de su hija cuando desaparece la posibilidad de una beca. Acepta un segundo trabajo vinculado al transporte de valores, pero acaba envuelto en una operación peligrosa. Su esfuerzo por progresar se enfrenta a una trama marcada por la corrupción.",
    en: "Bruno, a university lecturer and father, needs another way to finance his daughter's education after a scholarship becomes unavailable. He takes a second job involving armored cash transport but becomes caught in a dangerous scheme. His effort to provide for his family collides with corruption.",
  },
  9: {
    es: "Modesto y Manuel son dos amigos de origen humilde cuyas vidas cambian cuando ganan un premio de lotería. La nueva fortuna les ofrece posibilidades que antes parecían lejanas, pero también pone a prueba sus costumbres, sus relaciones y las decisiones que toman frente al dinero.",
    en: "Modesto and Manuel are two friends from modest backgrounds whose lives change when they win the lottery. Their sudden fortune offers opportunities they never expected, while challenging their habits, relationships and decisions about money.",
  },
  10: {
    es: "Michael, Pedro, Mateo y Antonio trabajan en el área de fiscalización de un banco. Una noche desaparece una gran suma de dinero de la bóveda y los cuatro quedan bajo sospecha por encontrarse en el lugar. Entre presiones, desconfianza y situaciones disparatadas, intentan aclarar lo ocurrido.",
    en: "Michael, Pedro, Mateo and Antonio work in a bank's auditing department. When a large sum disappears from the vault one night, the four become suspects because they were present. Pressure, mistrust and comic complications surround their attempt to clear their names.",
  },
  11: {
    es: "Nicolás pierde su empleo en plena temporada navideña y atraviesa una crisis familiar. Para salir adelante consigue trabajo representando a Santa Claus en un centro comercial, pero el hallazgo accidental de una bolsa de dinero altera sus planes y lo arrastra a nuevas complicaciones.",
    en: "Nicolás loses his job during the Christmas season and faces a family crisis. Trying to make ends meet, he finds work portraying Santa Claus at a shopping center. An accidental discovery of a bag of money upends his plans and brings unexpected complications.",
  },
  12: {
    es: "Marcos vende discos, Tommy trabaja como mecánico y Carlitos estudia chelo. Aunque tienen trayectorias muy distintas, comparten la ilusión de formar un grupo de bachata y abrirse paso en la música. Sus aspiraciones artísticas se enfrentan a obstáculos personales y profesionales.",
    en: "Marcos sells records, Tommy works as a mechanic and Carlitos studies the cello. Despite their different backgrounds, they share a dream of forming a bachata group and making a name in music. Personal and professional challenges complicate their ambition.",
  },
  13: {
    es: "Eddy ha practicado su fe cristiana desde la infancia. Al llegar a una nueva etapa de su vida decide ocultar esa identidad fuera de su comunidad religiosa, convencido de que así podrá vivir experiencias diferentes. La doble vida desencadena una cadena de mentiras y enredos cómicos.",
    en: "Eddy has practiced his Christian faith since childhood. At a new stage in life, he decides to conceal that identity outside his religious community, believing this will allow him different experiences. His double life produces a chain of lies and comic misunderstandings.",
  },
  16: {
    es: "Tras la muerte de su esposa, Balbuena decide viajar de República Dominicana a Nueva York con la esperanza de mejorar su futuro. Al llegar, descubre que la vida como inmigrante es muy distinta de la ciudad que había imaginado. Los encuentros familiares y los choques culturales marcan su experiencia.",
    en: "After his wife's death, Balbuena leaves the Dominican Republic for New York, hoping for a better future. On arrival, he finds immigrant life very different from the city he imagined. Family encounters and cultural clashes shape his experience.",
  },
  39: {
    es: "Antonio ha dedicado su vida al cultivo de café en Jarabacoa. Cerca de cumplir cuarenta años decide viajar a Santo Domingo para buscar el amor y conquistar a Laura. Sus primos capitaleños intentan ayudarlo, aunque sus consejos y el contraste entre campo y ciudad complican el romance.",
    en: "Antonio has devoted his life to growing coffee in Jarabacoa. As he approaches forty, he travels to Santo Domingo hoping to find love and win Laura's affection. His cousins in the capital try to help, but their advice and the contrast between rural and urban life complicate his romance.",
  },
  45: {
    es: "Gracias a una beca, Yuniol, un joven de escasos recursos, puede estudiar en la misma universidad que Junior, integrante de una familia adinerada. Su encuentro abre paso a una amistad entre mundos sociales muy distintos y sitúa las oportunidades educativas y las desigualdades en el centro de la historia.",
    en: "A scholarship allows Yuniol, a young man with limited resources, to attend the same university as Junior, who comes from a wealthy family. Their meeting develops into a friendship across social divides, placing educational opportunity and inequality at the heart of the story.",
  },
  56: {
    es: "Ana mantiene a su hijo vendiendo flores en un mercado de Santo Domingo. Cuando el joven muere de forma violenta, la madre busca respuestas y justicia por las vías institucionales. Ante los obstáculos que encuentra, emprende una lucha personal que pone a prueba su resistencia.",
    en: "Ana supports her son by selling flowers at a market in Santo Domingo. After the young man is violently killed, she seeks answers and justice through official channels. Faced with obstacles, she begins a personal struggle that tests her resolve.",
  },
});

export function getSinopsisEditorial(pelicula) {
  const editorial = getEditorialPelicula(pelicula);
  const texto = SINOPSIS_EDITORIALES_FASE_E[Number(pelicula?.Id)];
  if (editorial && texto) {
    return { ...texto, estado: editorial.estado, fuentes: editorial.fuentes };
  }
  return getSinopsisFaseE2(pelicula);
}
