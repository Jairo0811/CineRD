import {describe, expect, it} from "vitest";
import {
  construirUrlFoto, esSexoFemenino, manejarErrorFotoTalento,
  obtenerFotoTalento, obtenerPlaceholderPorSexo
} from "./talentoPlaceholder";

describe("CineRD · retratos vectoriales originales para derechos pendientes",()=>{
  it("utiliza SVG incrustado sin imágenes o dominios de terceros",()=>{
    for(const sexo of ["Masculino","Femenino",null]){
      const fallback=obtenerPlaceholderPorSexo(sexo);
      expect(fallback).toMatch(/^data:image\/svg\+xml;charset=UTF-8,/);
      const svg=decodeURIComponent(fallback.split(",")[1]);
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('viewBox="0 0 320 400"');
      expect(svg).not.toMatch(/<(?:image|foreignObject|script)\b/i);
      expect(svg).not.toMatch(/https?:\/\/(?!www\.w3\.org\/2000\/svg)/i);
    }
  });
  it("respeta la variante pero no usa fotografías por defecto",()=>{
    expect(esSexoFemenino("Actriz")).toBe(true);
    expect(esSexoFemenino("Masculino")).toBe(false);
    expect(obtenerPlaceholderPorSexo("Femenino"))
      .not.toBe(obtenerPlaceholderPorSexo("Masculino"));
    expect(obtenerFotoTalento({Sexo:"Femenino",Foto:null}))
      .toBe(obtenerPlaceholderPorSexo("Femenino"));
  });
  it("preserva imágenes permitidas que el catálogo le entrega; autorización pertenece al build",()=>{
    expect(obtenerFotoTalento({Foto:"/uploads/actores/retrato.jpg"}))
      .toMatch(/\/uploads\/actores\/retrato.jpg$/);
    expect(construirUrlFoto("https://example.org/foto.jpg"))
      .toBe("https://example.org/foto.jpg");
  });
  it("sustituye imágenes rotas por la silueta y evita bucles de error",()=>{
    const currentTarget={src:"https://example.org/broken.png",onerror:()=>{}};
    manejarErrorFotoTalento({currentTarget},"Femenino");
    expect(currentTarget.onerror).toBeNull();
    expect(currentTarget.src).toBe(obtenerPlaceholderPorSexo("Femenino"));
  });
});
