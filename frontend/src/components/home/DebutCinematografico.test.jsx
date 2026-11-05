import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, params = {}) => ({
      "home.debutsEyebrow": "PRIMEROS PASOS",
      "home.debutsTitle": "Debut Cinematográfico",
      "home.debutsDescription": "Primera aparición en el cine",
      "home.debutsBadge": "Debut",
      "home.debutsFirstFilm": "Primera película",
      "home.debutsAsCharacter": `Interpretó a ${params.character}`,
      "home.debutsViewTalent": `Ver perfil de ${params.name}`,
      "home.debutsLoading": "Cargando debuts",
      "home.debutsEmpty": "Sin debuts",
      "home.debutsError": "Error de carga",
      "home.debutsNote": "Solo participaciones identificadas.",
      "home.viewTalents": "Ver talentos",
    })[key] || key,
  }),
}));

import DebutCinematografico from "./DebutCinematografico";

const montar = (props) => render(
  <MemoryRouter><DebutCinematografico {...props} /></MemoryRouter>,
);

describe("Debut Cinematográfico en la portada", () => {
  afterEach(cleanup);

  it("muestra el nombre del talento, personaje, año y enlaces a las fichas", () => {
    montar({ debuts: [{
      ActorId: 3,
      NombreArtistico: "Boca de Piano",
      NombreCompleto: "Fausto Mata",
      FotoTalento: "/uploads/actores/foto.jpeg",
      Sexo: "Masculino",
      PeliculaId: 5,
      PeliculaTitulo: "Perico Ripiao",
      FechaEstreno: "2003-04-09T00:00:00",
      Personaje: "Gengibrero",
    }] });
    expect(screen.getByRole("heading", { level: 2, name: "Debut Cinematográfico" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: "Boca de Piano" })).toBeTruthy();
    expect(screen.getByText("Interpretó a Gengibrero")).toBeTruthy();
    expect(screen.getByText("2003")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Perico Ripiao" }).getAttribute("href")).toBe("/peliculas/5");
    expect(screen.getByRole("link", { name: "Boca de Piano" }).getAttribute("href")).toBe("/actores/3");
  });

  it("no inventa debuts cuando el catálogo aún no registra ninguno", () => {
    montar({ debuts: [] });
    expect(screen.getByRole("status").textContent).toBe("Sin debuts");
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
  });

  it("distingue un fallo de carga de un catálogo vacío", () => {
    montar({ debuts: [], error: true });
    expect(screen.getByRole("status").textContent).toBe("Error de carga");
  });

  it("muestra un mensaje de carga sin inventar datos", () => {
    montar({ debuts: [], cargando: true });
    expect(screen.getByRole("status").textContent).toBe("Cargando debuts");
  });
});
