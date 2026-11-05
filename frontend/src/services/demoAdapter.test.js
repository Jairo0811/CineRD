import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const tables = {
  Actores: [{ Id: 2, NombreCompleto: "Talento Ejemplo" }],
  Peliculas: [{ Id: 1, Titulo: "Película Ejemplo", FechaEstreno: "2025-01-01" }],
  ActoresPeliculas: [], PeliculaCreditos: [], PeliculaTraducciones: [],
  Premios: [{ Id: 3, Nombre: "Premios del Cine", Organizacion: "Entidad cultural" }],
  Nominaciones: [{ Id: 4, PremioId: 3, PeliculaId: 1, ActorId: null, Categoria: "Música", Anio: 2025, Resultado: "GANADOR" }],
  GaleriaMultimedia: [
    { Id: 5, PeliculaId: 1, Tipo: "FOTO_RODAJE", Archivo: "/uploads/galerias/foto.jpg", EsDestacada: false, Orden: 1 },
    { Id: 6, PeliculaId: 1, Tipo: "BANDA_SONORA", Proveedor: "SPOTIFY", AudioUrl: "https://open.spotify.com/album/example", EsDestacada: true, Orden: 2 },
    { Id: 7, PeliculaId: 1, Tipo: "SCORE", Proveedor: "YOUTUBE", AudioUrl: "https://www.youtube.com/watch?v=example", Orden: 3 },
    { Id: 8, PeliculaId: 1, Tipo: "TRAILER", VideoUrl: "https://www.youtube.com/watch?v=trailer", Orden: 4 },
  ],
};

describe("Netlify public catalog demo", () => {
  let adapter;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ format: "CineRD.PublicDemoCatalog", tables }),
    })));
    adapter = (await import("./demoAdapter.js")).default;
  });
  afterEach(() => vi.unstubAllGlobals());

  const request = async (adapterFn, route, params = {}) =>
    (await adapterFn({ method: "get", url: `/api${route}`, params })).data;

  it("muestra el OST y score de Spotify/YouTube en la ficha pública", async () => {
    const songs = await request(adapter, "/galeria", { peliculaId: 1, musica: true, incluirExternos: true });
    expect(songs.map(x => x.Tipo)).toEqual(["BANDA_SONORA", "SCORE"]);
    expect(songs[0].AudioUrl).toContain("spotify.com");
  });

  it("mantiene la galería visual separada de música y tráileres", async () => {
    const images = await request(adapter, "/galeria", { peliculaId: 1 });
    expect(images.map(x => x.Tipo)).toEqual(["FOTO_RODAJE"]);
    expect(images[0].Archivo).toContain("/uploads/galerias/");
  });

  it("publica nominaciones con los nombres relacionados y filtros correctos", async () => {
    const awards = await request(adapter, "/premios/nominaciones", { peliculaId: 1 });
    expect(awards).toHaveLength(1);
    expect(awards[0]).toMatchObject({ Premio: "Premios del Cine", Pelicula: "Película Ejemplo", Resultado: "GANADOR" });
    expect(await request(adapter, "/premios/nominaciones", { actorId: 2 })).toEqual([]);
  });

  it("retorna agregados de premios y detalles públicos", async () => {
    const awards = await request(adapter, "/premios");
    expect(awards[0]).toMatchObject({ CantidadNominaciones: 1, CantidadGanadores: 1 });
    expect((await request(adapter, "/premios/3")).Nombre).toBe("Premios del Cine");
  });

  it("solo expone debuts cinematográficos marcados, con el talento y la película relacionados", async () => {
    const catalogo = {
      ...tables,
      Actores: [
        { Id: 2, NombreCompleto: "Talento Debut", NombreArtistico: "Debutante", Foto: "/uploads/actores/actor.jpg", Sexo: "Masculino" },
        { Id: 3, NombreCompleto: "Talento Otro" },
      ],
      Peliculas: [
        { Id: 1, Titulo: "Primera película", FechaEstreno: "2003-01-01", Foto: "/uploads/peliculas/film.jpg" },
        { Id: 2, Titulo: "Otra película", FechaEstreno: "2025-01-01" },
      ],
      ActoresPeliculas: [
        { ActorId: 2, PeliculaId: 1, Personaje: "El protagonista", TipoParticipacion: "Debut cinematográfico" },
        { ActorId: 3, PeliculaId: 2, TipoParticipacion: "Principal" },
      ],
    };
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ format: "CineRD.PublicDemoCatalog", tables: catalogo }),
    })));
    vi.resetModules();
    const testAdapter = (await import("./demoAdapter.js")).default;
    const resultado = await request(testAdapter, "/actores-peliculas/debuts");
    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toMatchObject({
      ActorId: 2,
      NombreArtistico: "Debutante",
      FotoTalento: "/uploads/actores/actor.jpg",
      PeliculaId: 1,
      PeliculaTitulo: "Primera película",
      Personaje: "El protagonista",
    });
  });

  it("no admite escritura en la demo", async () => {
    await expect(adapter({ method: "post", url: "/api/galeria" }))
      .rejects.toMatchObject({ response: { status: 403 } });
  });
});
