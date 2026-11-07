import { describe, expect, it } from "vitest";
import { EDITORIALES_PELICULAS, editorialesDestacados, getEditorialPelicula } from "./editorialPeliculas";

describe("CineRD · fichas con contexto editorial", () => {
  it("mantiene 12 fichas identificables y pendientes de revisión final", () => {
    expect(editorialesDestacados.map((e) => e.id).sort((a,b) => a-b)).toEqual([4, 5, 6, 9, 10, 11, 12, 13, 16, 39, 45, 56]);
    for (const e of editorialesDestacados) {
      expect(e.estado).toBe("pendiente_revision");
      expect(e.es.parrafos.length).toBeGreaterThanOrEqual(2);
      expect(e.en.parrafos.length).toBe(e.es.parrafos.length);
      expect(e.fuentes.length).toBeGreaterThanOrEqual(1);
      for (const f of e.fuentes) {
        expect(f.titulo.length).toBeGreaterThan(10);
        expect(new URL(f.url).protocol).toBe("https:");
      }
    }
    expect(Object.keys(EDITORIALES_PELICULAS).length).toBe(12);
  });
  it("no atribuye una editorial a la ficha incorrecta ni a un año diferente", () => {
    const good = { Id: 16, Titulo: "NUEBA YOL: ¡POR FIN LLEGÓ BALBUENA!", FechaEstreno: "1995-08-17T00:00:00.000Z" };
    expect(getEditorialPelicula(good)?.anioReferencia).toBe(1995);
    expect(getEditorialPelicula({ ...good, Titulo: "Otra película" })).toBeNull();
    expect(getEditorialPelicula({ ...good, FechaEstreno: "1997-08-17" })).toBeNull();
    expect(getEditorialPelicula({ ...good, Id: 999 })).toBeNull();
  });
});
