import { describe, expect, it, vi } from "vitest";
import { CREDITOS_FOTOGRAFICOS, obtenerFotoLibreTalento } from "./fotosLibresTalentos";

vi.mock("../config/api", () => ({
  API_URL: "https://cinerd.pages.dev",
  DEMO_MODE: true,
}));

import { obtenerFotoTalento } from "../utils/talentoPlaceholder";

describe("Fotografías de talentos con licencia comercial documentada", () => {
  it("solo habilita las seis entradas con licencias, autores y fuentes de Commons", () => {
    expect(CREDITOS_FOTOGRAFICOS.map((x) => x.id).sort((a,b)=>a-b))
      .toEqual([3,8,9,10,14,17]);
    for (const foto of CREDITOS_FOTOGRAFICOS) {
      expect(foto.autor.length).toBeGreaterThan(3);
      expect(foto.licencia).toMatch(/^CC BY(?:-SA)? (?:2\.0|3\.0)$/);
      expect(foto.fuente).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(foto.imagen).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);
      expect(foto.enlaceLicencia).toMatch(/^https:\/\/creativecommons\.org\/licenses\//);
    }
    expect(obtenerFotoLibreTalento(39)).toBeNull();
    expect(obtenerFotoLibreTalento(45)).toBeNull();
    expect(obtenerFotoLibreTalento(56)).toBeNull();
    expect(obtenerFotoLibreTalento(18)).toBeNull();
  });

  it("la demo elige la foto libre cuando el modo review retiró la foto sin licencia", () => {
    for (const foto of CREDITOS_FOTOGRAFICOS) {
      expect(obtenerFotoTalento({ Id: foto.id, Foto: null, Sexo: "Masculino" }))
        .toBe(foto.imagen);
    }
  });

  it("no sustituye una imagen existente y conserva el respaldo SVG si no hay licencia abierta", () => {
    expect(obtenerFotoTalento({ Id: 3, Foto: "/uploads/actores/foto-con-licencia.jpeg" }))
      .toBe("https://cinerd.pages.dev/uploads/actores/foto-con-licencia.jpeg");
    expect(obtenerFotoTalento({ Id: 39, Foto: null, Sexo: "Femenino" }))
      .toMatch(/^data:image\/svg\+xml/);
  });
});
