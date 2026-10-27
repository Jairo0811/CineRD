import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (clave, opciones = {}) => (opciones.count !== undefined ? `${clave}:${opciones.count}` : clave),
    i18n: { language: "es" },
  }),
}));

import CintaDecadas from "./CintaDecadas";
import LineaTiempoMini from "./LineaTiempoMini";

const envolver = (nodo) => render(<MemoryRouter>{nodo}</MemoryRouter>);

describe("CintaDecadas", () => {
  afterEach(cleanup);

  const peliculas = [
    { Id: 1, FechaEstreno: "1995-01-01" },
    { Id: 2, FechaEstreno: "2007-01-01" },
    { Id: 3, FechaEstreno: "2008-01-01" },
  ];

  it("enlaza cada década al catálogo filtrado y cuenta sus películas", () => {
    envolver(<CintaDecadas peliculas={peliculas} />);
    const enlace2000 = screen.getByText("2000s").closest("a");
    expect(enlace2000.getAttribute("href")).toBe("/peliculas?decada=2000");
    expect(enlace2000.textContent).toContain("history.films:2");
  });

  it("marca la década activa y muestra «todas» cuando se pide", () => {
    envolver(<CintaDecadas peliculas={peliculas} activa={1990} mostrarTodas />);
    expect(screen.getByText("1990s").closest("a").getAttribute("aria-current")).toBe("true");
    expect(screen.getByText("movies.allDecades").closest("a").getAttribute("aria-current")).toBeNull();
  });

  it("no renderiza nada si no hay películas con fecha", () => {
    const { container } = envolver(<CintaDecadas peliculas={[{ Id: 9, FechaEstreno: null }]} />);
    expect(container.querySelector(".decade-rail")).toBeNull();
  });
});

describe("LineaTiempoMini", () => {
  afterEach(cleanup);

  it("muestra seis paradas que enlazan a su hito en /historia", () => {
    envolver(<LineaTiempoMini />);
    const enlaces = screen.getAllByRole("link").filter((a) => a.getAttribute("href")?.startsWith("/historia#h-"));
    expect(enlaces).toHaveLength(6);
    expect(enlaces[0].getAttribute("href")).toBe("/historia#h-1922");
  });
});
