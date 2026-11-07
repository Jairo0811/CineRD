import { describe, expect, it } from "vitest";
import snapshot from "../../../database/seeds/catalog.snapshot.json";
import { crearPerfilDocumentalTalento } from "./perfilProfesionalTalento.js";

const { Actores: actores, Peliculas: peliculas, ActoresPeliculas: relaciones, PeliculaCreditos: creditos } = snapshot.tables;
const film = id => peliculas.find(p=>p.Id===id);
const norm = x => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g," ").trim().toLowerCase();
const dataFor = a => ({
  reparto: relaciones.filter(x=>x.ActorId===a.Id).map(x=>({...film(x.PeliculaId),...x,Id:x.PeliculaId})),
  direccion: peliculas.filter(p=>norm(p.Director) && [norm(a.NombreCompleto),norm(a.NombreArtistico)].includes(norm(p.Director))),
  otros: creditos.filter(x=>x.ActorId===a.Id).map(x=>({...film(x.PeliculaId),...x,Id:x.PeliculaId})),
});

describe("Fase E-3 / perfiles profesionales documentales",()=>{
  it("ofrece un resumen y obras para los 83 talentos del catálogo",()=>{
    expect(actores).toHaveLength(83);
    for(const actor of actores){
      const {reparto,direccion,otros}=dataFor(actor);
      const r=crearPerfilDocumentalTalento(actor,reparto,direccion,otros);
      expect(r).toBeTruthy();
      expect(r.total).toBeGreaterThan(0);
      expect(r.texto).toContain("CineRD");
      expect(r.obras.every(o=>Boolean(o.Titulo))).toBe(true);
    }
  });
  it("no inventa profesión para los cinco perfiles incompletos",()=>{
    const unknown=actores.filter(a=>!a.Profesion);
    expect(unknown).toHaveLength(5);
    for(const actor of unknown){
      const {reparto,direccion,otros}=dataFor(actor);
      const r=crearPerfilDocumentalTalento(actor,reparto,direccion,otros);
      expect(r.notaProfesion).toMatch(/no documentada/);
      expect(r.texto).not.toContain("nació");
    }
  });
  it("no duplica obras presentes en reparto, dirección y créditos",()=>{
    const a=actores.find(a=>a.Id===35);
    const {reparto,direccion,otros}=dataFor(a);
    const result=crearPerfilDocumentalTalento(a,reparto,direccion,otros,"en");
    expect(result.total).toBe(new Set([...reparto,...direccion,...otros].map(x=>x.Id)).size);
    expect(result.texto).toContain("CineRD currently links");
  });
  it("sin registros deja claro que el archivo no tiene vínculos",()=>{
    const r=crearPerfilDocumentalTalento({Id:999,NombreCompleto:"Ejemplo"},[],[],[]);
    expect(r.total).toBe(0);
    expect(r.obras).toEqual([]);
    expect(r.texto).toContain("0 producciones");
  });
});
