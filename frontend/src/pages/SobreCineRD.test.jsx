import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SobreCineRD from "./SobreCineRD";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: "es" } }),
}));
afterEach(() => cleanup());

describe("Acerca de CineRD", () => {
  it("explica su origen, sus límites y los canales de corrección", () => {
    render(<MemoryRouter><SobreCineRD /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Sobre CineRD" })).toBeTruthy();
    expect(screen.getByText(/comenzó en 2021 como una prueba técnica/i)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Lo que CineRD todavía no es" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Solicitar una corrección" }).getAttribute("href")).toBe("/contacto");
  });
});
