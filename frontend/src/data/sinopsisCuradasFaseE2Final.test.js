import { describe, expect, it } from "vitest";
import catalog from "../../../database/seeds/catalog.snapshot.json";
import { getSinopsisEditorial } from "./sinopsisCuradasFaseE.js";
import { SINOPSIS_EDITORIALES_FASE_E2_FINAL, getSinopsisFaseE2Final } from "./sinopsisCuradasFaseE2Final.js";

const peliculas = catalog.tables.Peliculas;
const ids = [14,19,21,30,31,32,41,47,48];

describe("CineRD · Fase E-2 / cierre del catálogo con fuentes", () => {
  it("tiene nueve sinopsis originales ES/EN basadas en fuentes para el catálogo real", () => {
    expect(Object.keys(SINOPSIS_EDITORIALES_FASE_E2_FINAL).map(Number).sort((a,b)=>a-b)).toEqual(ids);
    for(const id of ids) {
      const film = peliculas.find(p=>p.Id===id);
      const item = getSinopsisEditorial(film);
      expect(film).toBeTruthy();
      expect(film.Sinopsis).toBeNull();
      expect(item).toBeTruthy();
      expect(item.estado).toBe("pendiente_revision");
      expect(item.es.length).toBeGreaterThan(150);
      expect(item.en.length).toBeGreaterThan(135);
      expect(item.fuentes).toHaveLength(1);
      expect(new URL(item.fuentes[0].url).protocol).toBe("https:");
    }
  });
  it("bloquea sinopsis cruzadas y tolera solo espacios decorativos en los títulos", () => {
    const film = peliculas.find(f=>f.Id===32);
    expect(getSinopsisFaseE2Final(film)).not.toBeNull();
    expect(getSinopsisFaseE2Final({ ...film, Titulo:"Distinto" })).toBeNull();
    expect(getSinopsisFaseE2Final({ ...film, FechaEstreno:"2025-08-13" })).toBeNull();
    expect(getSinopsisFaseE2Final({ ...film, Id:999 })).toBeNull();
  });
  it("completa las 46 películas sin sobrescribir las cinco sinopsis SQL", () => {
    const sql = peliculas.filter(p=>String(p.Sinopsis||"").trim());
    const fallback = peliculas.filter(p=>!String(p.Sinopsis||"").trim() && getSinopsisEditorial(p));
    const sinResumen = peliculas.filter(p=>!String(p.Sinopsis||"").trim() && !getSinopsisEditorial(p));
    expect(sql).toHaveLength(5);
    expect(fallback).toHaveLength(41);
    expect(sinResumen).toEqual([]);
    expect(sql.find(p=>p.Id===5).Sinopsis).toContain("güira");
  });
});
