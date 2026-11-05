import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: "es" } }),
}));

import NotFound from "./NotFound";

const abrirRuta = (ruta) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Página de error en Netlify", () => {
  afterEach(cleanup);

  it("muestra un error útil en vez de dejar la pantalla en blanco", () => {
    abrirRuta("/ruta-inexistente");
    expect(screen.getByRole("heading", { name: "No encontramos esta página" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Volver al inicio" }).getAttribute("href")).toBe("/");
  });

  it("explica por qué una ruta JSON ausente no muestra el estado del despliegue", () => {
    abrirRuta("/demo/deploy-status.json");
    expect(screen.getByRole("heading", { name: "El archivo solicitado no está disponible" })).toBeTruthy();
    expect(screen.getByText(/último despliegue de producción/)).toBeTruthy();
  });
});
