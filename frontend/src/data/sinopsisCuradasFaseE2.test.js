import { describe, expect, it } from "vitest";
import catalog from "../../../database/seeds/catalog.snapshot.json";
import { getSinopsisEditorial } from "./sinopsisCuradasFaseE.js";
import { SINOPSIS_EDITORIALES_FASE_E2, getSinopsisFaseE2 } from "./sinopsisCuradasFaseE2.js";
const films = catalog.tables.Peliculas;
const ids = [15,17,18,20,23,24,25,26,27,28,29,33,34,36,38,40,42,44,49,50,51,52,53,54];

describe("CineRD · Fase E-2 / segunda tanda documentada", () => {
  it("contiene 24 resúmenes bilingües exclusivos para títulos existentes", () => {
    expect(Object.keys(SINOPSIS_EDITORIALES_FASE_E2).map(Number).sort((a,b)=>a-b))
      .toEqual([...ids].sort((a,b)=>a-b));
    const originalText = new Set();
    for(const id of ids) {
      const film = films.find(f=>f.Id === id);
      expect(film, "No existe película con ID " + id).toBeTruthy();
      expect(film.Sinopsis).toBeNull();
      const item = getSinopsisEditorial(film);
      expect(item).toBeTruthy();
      expect(item.estado).toBe("pendiente_revision");
      expect(item.es.length).toBeGreaterThan(125);
      expect(item.en.length).toBeGreaterThan(105);
      expect(originalText.has(item.es)).toBe(false);
      originalText.add(item.es);
      expect(item.fuentes).toHaveLength(1);
      const source = item.fuentes[0].url;
      expect(new URL(source).protocol).toBe("https:");
      expect(item.tituloReferencia).toBe(film.Titulo);
    }
  });

  it("rechaza fichas cuyo ID, título o año no coincide", () => {
    const film = films.find(f=>f.Id===24);
    expect(getSinopsisFaseE2({ ...film, Id:999 })).toBeNull();
    expect(getSinopsisFaseE2({ ...film, Titulo:"Una película diferente" })).toBeNull();
    expect(getSinopsisFaseE2({ ...film, FechaEstreno:"2017-10-11" })).toBeNull();
    expect(getSinopsisFaseE2(film).es).toContain("Puerto Rico");
  });

  it("precisa la transformación nocturna de Lorenzo sin aprobar el borrador", () => {
    const film = films.find(f => f.Id === 26);
    const item = getSinopsisFaseE2(film);
    expect(item).toBeTruthy();
    expect(item.es).toContain("ocho de la noche hasta la medianoche");
    expect(item.en).toContain("8 p.m. until midnight");
    expect(item.es).not.toContain("ciertas horas del día");
    expect(item.en).not.toContain("each day");
    expect(item.estado).toBe("pendiente_revision");
  });

  it("la tanda de 24 contribuye al total de 41 borradores de respaldo", () => {
    const fallback = films.filter(f=>!String(f.Sinopsis||"").trim() && getSinopsisEditorial(f));
    const missing = films.filter(f=>!String(f.Sinopsis||"").trim() && !getSinopsisEditorial(f));
    expect(fallback).toHaveLength(41);
    expect(missing).toHaveLength(0);
  });
});
