import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach } from "vitest";
import { Contact, PrivacyPolicy, TermsOfUse } from "./PublicInfoPage";
import { isAdEligiblePath } from "../components/ads/AdSenseArea";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: "es" } }),
}));

afterEach(() => {
  cleanup();
  document.title = "";
});

function mount(Component) {
  return render(<MemoryRouter><Component /></MemoryRouter>);
}

describe("Páginas informativas públicas", () => {
  it("muestra la Política de Privacidad y las divulgaciones sobre AdSense", () => {
    mount(PrivacyPolicy);
    expect(screen.getByRole("heading", { name: "Política de Privacidad" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "5. Publicidad de terceros" })).toBeTruthy();
    expect(document.title).toContain("Política de Privacidad");
  });
  it("muestra los términos, incluyendo derechos de terceros y ausencia de streaming", () => {
    mount(TermsOfUse);
    expect(screen.getByRole("heading", { name: "Términos de Uso" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "4. Propiedad intelectual" })).toBeTruthy();
  });
  it("ofrece un canal público real y advierte que no es privado", () => {
    mount(Contact);
    expect(screen.getByRole("heading", { name: "Contacto" })).toBeTruthy();
    const issue = screen.getByRole("link", { name: "Abrir incidencia en GitHub" });
    expect(issue.getAttribute("href")).toBe("https://github.com/Jairo0811/CineRD/issues/new");
    expect(screen.getByText(/las incidencias de GitHub son públicas/i)).toBeTruthy();
    const email = screen.getByRole("link", { name: "jairo_1829@hotmail.com" });
    expect(email.getAttribute("href")).toBe("mailto:jairo_1829@hotmail.com");
  });
  it("excluye rutas legales, búsquedas y fichas sin revisión editorial de publicidad", () => {
    for (const path of ["/privacidad", "/terminos", "/contacto", "/buscar", "/buscar?q=pelicula", "/actores/2", "/peliculas/1", "/admin"]) {
      expect(isAdEligiblePath(path)).toBe(false);
    }
    for (const path of ["/", "/peliculas", "/actores"]) {
      expect(isAdEligiblePath(path)).toBe(true);
    }
  });
});
