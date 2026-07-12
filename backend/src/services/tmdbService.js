const axios = require("axios");

const accessToken = process.env.TMDB_ACCESS_TOKEN?.trim();

if (!accessToken) {
  throw new Error(
    "TMDB_ACCESS_TOKEN no está configurado en el archivo backend/.env",
  );
}

const tmdbApi = axios.create({
  baseURL: process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3",
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  },
});

const construirUrlImagen = (ruta, tamano = "w500") => {
  if (!ruta) return null;

  const baseUrl =
    process.env.TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";

  return `${baseUrl}/${tamano}${ruta}`;
};

const buscarPeliculas = async ({ titulo, anio = null }) => {
  const params = {
    query: titulo,
    language: "es-DO",
    include_adult: false,
    page: 1,
  };

  if (anio) {
    params.year = anio;
  }

  const response = await tmdbApi.get("/search/movie", { params });

  return (response.data.results || []).map((pelicula) => ({
    TmdbId: pelicula.id,
    Titulo: pelicula.title || pelicula.original_title || "",
    TituloOriginal: pelicula.original_title || "",
    FechaEstreno: pelicula.release_date || "",
    Sinopsis: pelicula.overview || "",
    PosterUrl: construirUrlImagen(pelicula.poster_path, "w342"),
  }));
};

const obtenerCreditosPelicula = async (tmdbId) => {
  const response = await tmdbApi.get(`/movie/${tmdbId}/credits`, {
    params: {
      language: "es-DO  ",
    },
  });

  const creditos = response.data;

  return {
    Reparto: (creditos.cast || []).map((persona) => ({
      TmdbId: persona.id,
      NombreCompleto: persona.name || "",
      NombreOriginal: persona.original_name || "",
      Personaje: persona.character || "",
      Orden: persona.order ?? null,
      Departamento: persona.known_for_department || "Acting",
      FotoUrl: construirUrlImagen(persona.profile_path, "w185"),
    })),

    Equipo: (creditos.crew || []).map((persona) => ({
      TmdbId: persona.id,
      NombreCompleto: persona.name || "",
      Departamento: persona.department || "",
      Trabajo: persona.job || "",
      FotoUrl: construirUrlImagen(persona.profile_path, "w185"),
    })),
  };
};

const obtenerDetallesPelicula = async (tmdbId) => {
  const [detalleResponse, creditos] = await Promise.all([
    tmdbApi.get(`/movie/${tmdbId}`, {
      params: {
        language: "es-ES",
      },
    }),

    obtenerCreditosPelicula(tmdbId),
  ]);

  const pelicula = detalleResponse.data;

  const director = creditos.Equipo.find(
    (persona) => persona.Trabajo === "Director",
  );

  return {
    TmdbId: pelicula.id,
    Titulo: pelicula.title || pelicula.original_title || "",
    TituloOriginal: pelicula.original_title || "",
    Sinopsis: pelicula.overview || "",
    FechaEstreno: pelicula.release_date || "",
    Genero: pelicula.genres?.[0]?.name || "",
    Generos: pelicula.genres || [],
    Director: director?.NombreCompleto || "",
    Duracion: pelicula.runtime || null,
    Estado: pelicula.status || "",
    IdiomaOriginal: pelicula.original_language || "",
    PosterUrl: construirUrlImagen(pelicula.poster_path, "w500"),
    FondoUrl: construirUrlImagen(pelicula.backdrop_path, "w1280"),
    Reparto: creditos.Reparto.slice(0, 30),
  };
};

const buscarPersonas = async (nombre) => {
  const response = await tmdbApi.get("/search/person", {
    params: {
      query: nombre,
      language: "es-DO",
      include_adult: false,
      page: 1,
    },
  });

  return (response.data.results || []).map((persona) => ({
    TmdbId: persona.id,
    NombreCompleto: persona.name || "",
    NombreOriginal: persona.original_name || "",
    Departamento: persona.known_for_department || "",
    Popularidad: persona.popularity || 0,
    FotoUrl: construirUrlImagen(persona.profile_path, "w185"),

    TrabajosConocidos: (persona.known_for || [])
      .slice(0, 5)
      .map((trabajo) => ({
        TmdbId: trabajo.id,
        Tipo: trabajo.media_type || "",
        Titulo:
          trabajo.title ||
          trabajo.name ||
          trabajo.original_title ||
          trabajo.original_name ||
          "",
        Fecha:
          trabajo.release_date ||
          trabajo.first_air_date ||
          "",
        PosterUrl: construirUrlImagen(trabajo.poster_path, "w185"),
      })),
  }));
};

const obtenerDetallesPersona = async (tmdbId) => {
  const [detalleResponse, creditosResponse] = await Promise.all([
    tmdbApi.get(`/person/${tmdbId}`, {
      params: {
        language: "es-DO",
      },
    }),

    tmdbApi.get(`/person/${tmdbId}/movie_credits`, {
      params: {
        language: "es-DO",
      },
    }),
  ]);

  const persona = detalleResponse.data;
  const creditos = creditosResponse.data;

  return {
    TmdbId: persona.id,
    NombreCompleto: persona.name || "",
    NombreArtistico: persona.also_known_as?.[0] || "",
    Departamento: persona.known_for_department || "",
    Biografia: persona.biography || "",
    FechaNacimiento: persona.birthday || "",
    FechaFallecimiento: persona.deathday || "",
    LugarNacimiento: persona.place_of_birth || "",
    SexoTmdb: persona.gender || 0,
    FotoUrl: construirUrlImagen(persona.profile_path, "w500"),

    PeliculasComoActor: (creditos.cast || [])
      .sort((a, b) => {
        const fechaA = a.release_date || "";
        const fechaB = b.release_date || "";
        return fechaB.localeCompare(fechaA);
      })
      .slice(0, 30)
      .map((pelicula) => ({
        TmdbId: pelicula.id,
        Titulo: pelicula.title || pelicula.original_title || "",
        Personaje: pelicula.character || "",
        FechaEstreno: pelicula.release_date || "",
        PosterUrl: construirUrlImagen(pelicula.poster_path, "w185"),
      })),

    PeliculasComoDirector: (creditos.crew || [])
      .filter((pelicula) => pelicula.job === "Director")
      .sort((a, b) => {
        const fechaA = a.release_date || "";
        const fechaB = b.release_date || "";
        return fechaB.localeCompare(fechaA);
      })
      .map((pelicula) => ({
        TmdbId: pelicula.id,
        Titulo: pelicula.title || pelicula.original_title || "",
        FechaEstreno: pelicula.release_date || "",
        PosterUrl: construirUrlImagen(pelicula.poster_path, "w185"),
      })),
  };
};

module.exports = {
  buscarPeliculas,
  obtenerDetallesPelicula,
  obtenerCreditosPelicula,
  buscarPersonas,
  obtenerDetallesPersona,
};