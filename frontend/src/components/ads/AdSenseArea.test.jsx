import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import AdSenseArea, { isAdEligiblePath } from "./AdSenseArea";

describe("AdSense · colocación segura", () => {
  it("solo contempla portada editorial y evita pantallas sin contenido", () => {
    expect(isAdEligiblePath("/")).toBe(true);
    for(const path of ["/peliculas","/actores","/buscar","/login","/contacto",
      "/peliculas/4","/actores/2","/pagina-que-no-existe"]){
      expect(isAdEligiblePath(path),path).toBe(false);
    }
  });
  it("no muestra anuncios con la configuración de build por defecto", () => {
    const {container}=render(<MemoryRouter><AdSenseArea /></MemoryRouter>);
    expect(container.querySelector(".cinerd-ad")).toBeNull();
    expect(container.querySelector(".adsbygoogle")).toBeNull();
  });
});
