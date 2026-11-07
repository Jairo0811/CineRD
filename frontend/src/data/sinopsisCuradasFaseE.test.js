import { describe, expect, it } from "vitest";
import { getSinopsisEditorial, SINOPSIS_EDITORIALES_FASE_E } from "./sinopsisCuradasFaseE.js";
import snapshot from "../../../database/seeds/catalog.snapshot.json";

describe("CineRD · Fase E / sinopsis editoriales", () => {
  const films = snapshot.tables.Peliculas;
  const ids = [4, 5, 6, 9, 10, 11, 12, 13, 16, 39, 45, 56];

  it("tiene 12 resúmenes inéditos con versión ES/EN y fuentes vinculadas", () => {
    expect(Object.keys(SINOPSIS_EDITORIALES_FASE_E).map(Number).sort((a,b)=>a-b)).toEqual(ids);
    for (const id of ids) {
      const film = films.find(p=>p.Id === id);
      expect(film, "La película debe existir: " + id).toBeTruthy();
      const synopsis = getSinopsisEditorial(film);
      expect(synopsis).toBeTruthy();
      expect(synopsis.estado).toBe("pendiente_revision");
      expect(synopsis.es.length).toBeGreaterThan(130);
      expect(synopsis.en.length).toBeGreaterThan(100);
      expect(synopsis.fuentes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("no asigna una sinopsis de una película a otra, ni cambia el año de referencia", () => {
    const lotoman = films.find(p=>p.Id===9);
    expect(getSinopsisEditorial({ ...lotoman, Titulo: "Otra producción" })).toBeNull();
    expect(getSinopsisEditorial({ ...lotoman, FechaEstreno: "2012-01-01" })).toBeNull();
    expect(getSinopsisEditorial({ ...lotoman, Id: 999 })).toBeNull();
  });

  it("permite ofrecer una sinopsis original cuando falta la registrada, sin sobrescribir el snapshot", () => {
    const lotoman = films.find(p=>p.Id===9);
    expect(lotoman.Sinopsis).toBeNull();
    expect(getSinopsisEditorial(lotoman).es).toContain("Modesto y Manuel");
    expect(films.find(p=>p.Id===5).Sinopsis).toBeTruthy();
  });
});
