/**
 * Cronología de referencia del cine dominicano.
 *
 * Cada hito fue contrastado con fuentes públicas (ver FUENTES). Donde las fuentes
 * difieren (por ejemplo, quién figura como director de la primera película o en qué
 * sala se estrenó «La silla»), el texto se mantiene neutral en vez de elegir una versión.
 *
 * `catalogo` lista películas que, si existen en la base de datos de CineRD, se enlazan
 * desde el hito. Se emparejan por título (comienzo del título normalizado) y año.
 */

export const ERAS = [
  { id: "origenes", desde: 1900, hasta: 1929 },
  { id: "dictadura", desde: 1930, hasta: 1961 },
  { id: "reapertura", desde: 1962, hasta: 1994 },
  { id: "comercial", desde: 1995, hasta: 2009 },
  { id: "ley", desde: 2010, hasta: null },
];

export const ERAS_TEXTO = {
  origenes: {
    es: { nombre: "Orígenes", resumen: "Del cinematógrafo a la primera ficción dominicana." },
    en: { nombre: "Origins", resumen: "From the cinematograph to the first Dominican fiction film." },
  },
  dictadura: {
    es: { nombre: "Cine bajo la dictadura", resumen: "Una pantalla controlada: el cine como propaganda." },
    en: { nombre: "Cinema under the dictatorship", resumen: "A controlled screen: film as propaganda." },
  },
  reapertura: {
    es: { nombre: "Reapertura", resumen: "El cine vuelve a mirar al país tras la caída del régimen." },
    en: { nombre: "Reopening", resumen: "Film looks at the country again after the regime falls." },
  },
  comercial: {
    es: { nombre: "Cine comercial", resumen: "Taquilla, comedias populares y el «año cero»." },
    en: { nombre: "Commercial cinema", resumen: "Box office, popular comedies and the “year zero”." },
  },
  ley: {
    es: { nombre: "Ley de Cine y expansión", resumen: "Incentivos, institucionalidad y una industria en crecimiento." },
    en: { nombre: "Film Law and expansion", resumen: "Incentives, institutions and a growing industry." },
  },
};

export const HITOS = [
  {
    id: "1900",
    anio: 1900,
    era: "origenes",
    es: {
      titulo: "Llega el cinematógrafo",
      texto: "Se presentan las primeras proyecciones de cine en el país, pocos años después de las exhibiciones de los hermanos Lumière.",
    },
    en: {
      titulo: "The cinematograph arrives",
      texto: "The first film screenings are held in the country, only a few years after the Lumière brothers' exhibitions.",
    },
  },
  {
    id: "1915",
    anio: 1915,
    era: "origenes",
    es: {
      titulo: "Primer registro filmado conocido",
      texto: "El documental «La excursión de José de Diego», del fotógrafo puertorriqueño Rafael Coronado, es la primera obra cinematográfica de la que se tiene conocimiento en el país.",
    },
    en: {
      titulo: "First known filmed record",
      texto: "The documentary “La excursión de José de Diego”, by Puerto Rican photographer Rafael Coronado, is the earliest known film work in the country.",
    },
  },
  {
    id: "1922",
    anio: 1922,
    etiquetaAnio: "1922–23",
    era: "origenes",
    destacado: true,
    es: {
      titulo: "La leyenda de la Virgen de la Altagracia",
      texto: "Francisco Palau, Juan B. Alfonseca y Tuto Báez filman la primera película de ficción dominicana, con guion del historiador Bernardo Pichardo. Se estrena el 16 de febrero de 1923.",
    },
    en: {
      titulo: "La leyenda de la Virgen de la Altagracia",
      texto: "Francisco Palau, Juan B. Alfonseca and Tuto Báez shoot the first Dominican fiction film, written by historian Bernardo Pichardo. It premieres on 16 February 1923.",
    },
  },
  {
    id: "1930",
    anio: 1930,
    etiquetaAnio: "1930–61",
    era: "dictadura",
    es: {
      titulo: "Una pantalla controlada",
      texto: "Durante el régimen de Trujillo el cine pierde iniciativa y creatividad y pasa a ser, sobre todo, un instrumento de propaganda. En 1953, la compañía Cine Dominicano, con Rafael Augusto Sánchez Sanlley «Pupito», realiza 13 producciones que exaltan al régimen.",
    },
    en: {
      titulo: "A controlled screen",
      texto: "Under the Trujillo regime, film loses initiative and creativity and becomes mostly a propaganda tool. In 1953 the company Cine Dominicano, with Rafael Augusto Sánchez Sanlley “Pupito”, makes 13 productions praising the regime.",
    },
  },
  {
    id: "1963",
    anio: 1963,
    era: "reapertura",
    destacado: true,
    es: {
      titulo: "«La silla», de Franklin Domínguez",
      texto: "Se estrena la que es considerada la primera producción dominicana realizada tras la caída del régimen; denuncia los horrores de la dictadura trujillista.",
    },
    en: {
      titulo: "“La silla”, by Franklin Domínguez",
      texto: "Premieres as the first Dominican production made after the fall of the regime; it condemns the horrors of the Trujillo dictatorship.",
    },
  },
  {
    id: "1995",
    anio: 1995,
    era: "comercial",
    destacado: true,
    es: {
      titulo: "«Nueba Yol» y el cine comercial",
      texto: "Con la película de Ángel Muñiz surge en el país una cinematografía de carácter comercial.",
    },
    en: {
      titulo: "“Nueba Yol” and commercial cinema",
      texto: "With Ángel Muñiz's film, a commercial cinema emerges in the country.",
    },
    catalogo: [{ titulo: "nueba yol", anio: 1995 }],
  },
  {
    id: "2003",
    anio: 2003,
    era: "comercial",
    es: {
      titulo: "El «año cero»",
      texto: "Se le considera el «año cero» del cine dominicano: la producción y la exhibición de ficción, comedia y documental se vuelven constantes.",
    },
    en: {
      titulo: "The “year zero”",
      texto: "Regarded as the “year zero” of Dominican cinema: production and exhibition of fiction, comedy and documentary become steady.",
    },
    catalogo: [{ titulo: "perico ripiao", anio: 2003 }],
  },
  {
    id: "2009",
    anio: 2009,
    era: "comercial",
    es: {
      titulo: "El cine antes de la Ley",
      texto: "Se estrenan, entre otras, «Cristiano de la secreta», «Mega diva», «Bosch: presidente en la frontera imperial» e «Historia del béisbol dominicano».",
    },
    en: {
      titulo: "Cinema before the Law",
      texto: "Releases include “Cristiano de la secreta”, “Mega diva”, “Bosch: presidente en la frontera imperial” and “Historia del béisbol dominicano”.",
    },
    catalogo: [{ titulo: "cristiano de la secreta", anio: 2009 }],
  },
  {
    id: "2010",
    anio: 2010,
    era: "ley",
    destacado: true,
    es: {
      titulo: "Ley 108-10 de Fomento de la Actividad Cinematográfica",
      texto: "El 29 de julio se promulga la Ley de Cine, que estructura la DGCINE, la Cinemateca Dominicana y el CIPAC, e introduce incentivos a la inversión. Entre 1922 y 2010 se habían estrenado 46 películas a cargo de 31 directores.",
    },
    en: {
      titulo: "Law 108-10 for the Promotion of Film Activity",
      texto: "On 29 July the Film Law is enacted. It structures the DGCINE, the Dominican Cinematheque and the CIPAC, and introduces investment incentives. Between 1922 and 2010, 46 films by 31 directors had premiered.",
    },
  },
  {
    id: "2025",
    anio: 2025,
    era: "ley",
    es: {
      titulo: "Quince años de Ley de Cine",
      texto: "La DGCINE celebra los 15 años de la Ley 108-10, el eje del desarrollo sostenido de la industria cinematográfica dominicana.",
    },
    en: {
      titulo: "Fifteen years of the Film Law",
      texto: "The DGCINE celebrates 15 years of Law 108-10, the backbone of the sustained development of the Dominican film industry.",
    },
  },
];

export const FUENTES = [
  {
    nombre: "DGCINE, «Antología de largometrajes dominicanos 1963-2019» (citada por Acento)",
    url: "https://acento.com.do/cine/republica-dominicana-escenario-de-peliculas-desde-el-siglo-xx-9530209.html",
  },
  {
    nombre: "elDinero: «En RD se hicieron 46 películas antes de la Ley de Cine»",
    url: "https://eldinero.com.do/240897/en-rd-hicieron-46-peliculas-antes-de-la-ley-de-cine/",
  },
  {
    nombre: "Acento: «La historia del documental en República Dominicana»",
    url: "https://acento.com.do/cine/la-historia-del-documental-republica-dominicana-8415557.html",
  },
  {
    nombre: "El Caribe: «Iconos del cine dominicano»",
    url: "https://www.elcaribe.com.do/sin-categoria/iconos-del-cine-dominicano/",
  },
  {
    nombre: "Ley 108-10 (WIPO Lex)",
    url: "https://www.wipo.int/wipolex/en/legislation/details/13346",
  },
  {
    nombre: "Presidencia: 15 años de la Ley 108-10",
    url: "https://presidencia.gob.do/noticias/direccion-general-de-cine-celebra-15-anos-de-la-promulgacion-de-la-ley-108-10",
  },
];

/* ---------- utilidades ---------- */

export const normalizarTitulo = (valor) =>
  String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const anioDe = (fecha) => {
  const anio = Number(String(fecha || "").substring(0, 4));
  return Number.isInteger(anio) && anio > 1800 ? anio : null;
};

export const decadaDe = (anio) => (anio ? Math.floor(anio / 10) * 10 : null);

/** Devuelve las películas del catálogo que corresponden a un hito. */
export const peliculasDelHito = (hito, peliculas = []) =>
  (hito.catalogo || [])
    .map(({ titulo, anio }) =>
      peliculas.find(
        (p) => anioDe(p.FechaEstreno) === anio && normalizarTitulo(p.Titulo).startsWith(normalizarTitulo(titulo)),
      ),
    )
    .filter(Boolean);

/** Agrupa las películas por década, de la más antigua a la más reciente. */
export const agruparPorDecada = (peliculas = []) => {
  const mapa = new Map();
  peliculas.forEach((pelicula) => {
    const decada = decadaDe(anioDe(pelicula.FechaEstreno));
    if (!decada) return;
    if (!mapa.has(decada)) mapa.set(decada, []);
    mapa.get(decada).push(pelicula);
  });
  return [...mapa.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([decada, items]) => ({
      decada,
      items: [...items].sort((a, b) => String(a.FechaEstreno).localeCompare(String(b.FechaEstreno))),
    }));
};

export const etiquetaDecada = (decada, idioma = "es") => {
  if (idioma === "en") return `${decada}s`;
  return decada >= 2000 ? `Años ${decada}` : `Años ${decada % 100}`;
};
