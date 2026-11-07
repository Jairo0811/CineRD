import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import FilmSectionHeading from "./FilmSectionHeading";

afterEach(cleanup);

describe("Encabezados de secciones de películas", () => {
  it.each([
    ["CRÉDITOS", "Créditos profesionales"],
    ["RECONOCIMIENTOS", "🏆 Premios y nominaciones"],
    ["ARCHIVO VISUAL", "🖼️ Galería multimedia"],
    ["AUDIOVISUAL", "Tráiler"],
  ])("mantiene '%s' unido visualmente a '%s'", (eyebrow, title) => {
    const { container } = render(<FilmSectionHeading eyebrow={eyebrow} title={title} />);
    const header = container.querySelector(".film-section-head");
    const titleWrapper = header.querySelector(".film-section-heading-copy");
    expect(titleWrapper).toBeTruthy();
    expect(titleWrapper.querySelector(".catalog-eyebrow")?.textContent).toBe(eyebrow);
    expect(titleWrapper.querySelector("h2")?.textContent).toBe(title);
    expect(header.children).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: title })).toBeTruthy();
  });
});
