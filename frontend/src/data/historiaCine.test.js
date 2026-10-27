import { describe, expect, it } from "vitest";
import {
  ERAS,
  ERAS_TEXTO,
  FUENTES,
  HITOS,
  agruparPorDecada,
  anioDe,
  decadaDe,
  etiquetaDecada,
  normalizarTitulo,
  peliculasDelHito,
} from "./historiaCine";

describe("cronología del cine dominicano", () => {
  it("cada hito pertenece a una época existente y cae dentro de su rango", () => {
    HITOS.forEach((hito) => {
      const era = ERAS.find((e) => e.id === hito.era);
      expect(era, `época de ${hito.id}`).toBeTruthy();
      expect(hito.anio).toBeGreaterThanOrEqual(era.desde);
      if (era.hasta) expect(hito.anio).toBeLessThanOrEqual(era.hasta);
    });
  });

  it("los hitos están en orden cronológico y con ids únicos", () => {
    const anios = HITOS.map((h) => h.anio);
    expect(anios).toEqual([...anios].sort((a, b) => a - b));
    expect(new Set(HITOS.map((h) => h.id)).size).toBe(HITOS.length);
  });

  it("todo el contenido está en español e inglés", () => {
    HITOS.forEach((hito) => {
      ["es", "en"].forEach((idioma) => {
        expect(hito[idioma]?.titulo, `${hito.id} ${idioma} título`).toBeTruthy();
        expect(hito[idioma]?.texto, `${hito.id} ${idioma} texto`).toBeTruthy();
      });
    });
    ERAS.forEach((era) => {
      expect(ERAS_TEXTO[era.id].es.nombre).toBeTruthy();
      expect(ERAS_TEXTO[era.id].en.nombre).toBeTruthy();
    });
  });

  it("toda época tiene al menos un hito y las fuentes usan https", () => {
    ERAS.forEach((era) => expect(HITOS.some((h) => h.era === era.id)).toBe(true));
    expect(FUENTES.length).toBeGreaterThan(0);
    FUENTES.forEach((f) => expect(f.url.startsWith("https://")).toBe(true));
  });
});

describe("utilidades de fechas y catálogo", () => {
  it("calcula año y década, y rechaza fechas inválidas", () => {
    expect(anioDe("2007-02-01T00:00:00.000Z")).toBe(2007);
    expect(anioDe(null)).toBeNull();
    expect(anioDe("sin fecha")).toBeNull();
    expect(decadaDe(1995)).toBe(1990);
    expect(decadaDe(2020)).toBe(2020);
    expect(decadaDe(null)).toBeNull();
  });

  it("etiqueta las décadas según el idioma", () => {
    expect(etiquetaDecada(1990, "es")).toBe("Años 90");
    expect(etiquetaDecada(2000, "es")).toBe("Años 2000");
    expect(etiquetaDecada(1990, "en")).toBe("1990s");
  });

  it("normaliza títulos sin tildes ni signos", () => {
    expect(normalizarTitulo("¡Nueba Yol: Por Fin Llegó!")).toBe("nueba yol por fin llego");
  });

  it("agrupa por década en orden y ordena cada grupo por fecha", () => {
    const grupos = agruparPorDecada([
      { Id: 1, FechaEstreno: "2011-05-01" },
      { Id: 2, FechaEstreno: "1995-03-01" },
      { Id: 3, FechaEstreno: "2010-01-01" },
      { Id: 4, FechaEstreno: null },
    ]);
    expect(grupos.map((g) => g.decada)).toEqual([1990, 2010]);
    expect(grupos[1].items.map((p) => p.Id)).toEqual([3, 1]);
  });

  it("enlaza un hito con películas del catálogo por título y año", () => {
    const hito = { catalogo: [{ titulo: "nueba yol", anio: 1995 }] };
    const peliculas = [
      { Id: 1, Titulo: "Nueba Yol 3: Bajo la nueva ley", FechaEstreno: "1997-01-01" },
      { Id: 2, Titulo: "Nueba Yol: ¡Por Fin Llegó Balbuena!", FechaEstreno: "1995-06-01" },
    ];
    expect(peliculasDelHito(hito, peliculas).map((p) => p.Id)).toEqual([2]);
    expect(peliculasDelHito(hito, [])).toEqual([]);
    expect(peliculasDelHito({}, peliculas)).toEqual([]);
  });
});
