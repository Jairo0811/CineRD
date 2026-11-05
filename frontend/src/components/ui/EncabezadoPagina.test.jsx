import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EncabezadoPagina from "./EncabezadoPagina";

const montar = (props, hijos) =>
  render(
    <MemoryRouter>
      <EncabezadoPagina {...props}>{hijos}</EncabezadoPagina>
    </MemoryRouter>,
  );

describe("EncabezadoPagina", () => {
  it("muestra sobretítulo, título y descripción", () => {
    montar({ eyebrow: "CATÁLOGO", titulo: "Nueva película", descripcion: "Completa la ficha." });
    expect(screen.getByRole("heading", { level: 1, name: "Nueva película" })).toBeTruthy();
    expect(screen.getByText("CATÁLOGO")).toBeTruthy();
    expect(screen.getByText("Completa la ficha.")).toBeTruthy();
  });

  it("enlaza de vuelta solo cuando se indica destino", () => {
    montar({ titulo: "Sin enlace" });
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("incluye el enlace de vuelta y el contenido lateral", () => {
    montar({ titulo: "Reparto", volverA: "/peliculas", volverTexto: "← Volver" }, <button type="button">Filtrar</button>);
    expect(screen.getByRole("link", { name: "← Volver" }).getAttribute("href")).toBe("/peliculas");
    expect(screen.getByRole("button", { name: "Filtrar" })).toBeTruthy();
  });
});
