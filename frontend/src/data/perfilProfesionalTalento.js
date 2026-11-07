/**
 * E-3: descriptive professional summary derived strictly from CineRD records.
 * Never infers biography, career start dates, official recognition or birthplace.
 */
const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();
const filmId = item => Number(item?.PeliculaId ?? item?.Id);

export function crearPerfilDocumentalTalento(talento, reparto = [], direccion = [], creditos = [], idioma = "es") {
  if (!talento || !talento.NombreCompleto) return null;
  const uniqueCount = records => new Set(records.map(filmId).filter(id => Number.isInteger(id) && id > 0)).size;
  const items = new Map();
  for (const item of [...reparto, ...direccion, ...creditos]) {
    const id = filmId(item);
    if (!Number.isInteger(id) || id <= 0 || !clean(item?.Titulo)) continue;
    if (!items.has(id)) items.set(id, {
      Id: id, Titulo: clean(item.Titulo), FechaEstreno: item.FechaEstreno || null,
    });
  }
  const obras = [...items.values()].sort((a,b) =>
    String(b.FechaEstreno || "").localeCompare(String(a.FechaEstreno || "")) ||
    a.Titulo.localeCompare(b.Titulo, "es"));
  const total = obras.length, actuaciones = uniqueCount(reparto);
  const dirigidas = uniqueCount(direccion), registrosProfesionales = creditos.length;
  const nombre = clean(talento.NombreArtistico) || clean(talento.NombreCompleto);
  const profesion = clean(talento.Profesion);
  const en = idioma === "en";
  const texto = en
    ? "CineRD currently links " + nombre + " to " + total + (total===1?" production":" productions") +
      ": " + actuaciones + " cast participations, " + dirigidas + " titles identified in direction and " +
      registrosProfesionales + " recorded professional credits. Figures describe this partial archive only and may not represent a complete career."
    : "El catálogo de CineRD vincula a " + nombre + " con " + total + (total===1?" producción":" producciones") +
      ": " + actuaciones + " participaciones de reparto, " + dirigidas + " obras identificadas en dirección y " +
      registrosProfesionales + " créditos profesionales registrados. Son cifras de este archivo parcial, no necesariamente de toda su trayectoria.";
  return {
    nombre, profesion, texto,
    notaProfesion: profesion ? null : (en
      ? "Profession not documented in this profile. Film credits do not assign it automatically."
      : "Profesión no documentada en la ficha. Los créditos no permiten asignarla automáticamente."),
    obras, total, actuaciones, dirigidas, registrosProfesionales,
  };
}
