import { EDITORIAL_COVER_THEMES, PREMIUM_ORIGINAL_VARIANTS } from "../../data/posterCoverCatalog";
import { EDITORIAL_ARTWORKS } from "./EditorialCoverArtwork";
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import PosterOriginal, { POSTER_VARIANTS } from "./PosterOriginal";

afterEach(cleanup);

describe("CineRD / cubiertas originales premium", () => {
  it("asigna cuatro motivos diferenciados sin depender de imágenes de terceros", () => {
    const samples = [[16, "city"], [5, "rhythm"], [4, "coast"], [56, "bloom"]];
    expect(PREMIUM_ORIGINAL_VARIANTS).toEqual({ 4: "coast", 5: "rhythm", 16: "city", 56: "bloom" });
    expect(Object.keys(POSTER_VARIANTS)).toHaveLength(46);
    for (const [id, variant] of samples) {
      const { unmount, container } = render(
        <PosterOriginal titulo={"Película " + id} anio="2007" peliculaId={id} />
      );
      expect(container.firstChild.getAttribute("data-cover-variant")).toBe(variant);
      expect(container.querySelectorAll("svg").length).toBe(1);
      expect(container.querySelector("img")).toBeNull();
      expect(screen.queryByText("2007")).toBeNull();
      expect(screen.getByRole("img").getAttribute("aria-label")).toContain("2007");
      unmount();
    }
  });
  it("genera 42 identidades distintas con SVG propio, sin enlaces a medios de terceros", () => {
    const ids = Object.keys(EDITORIAL_COVER_THEMES).map(Number);
    expect(ids).toHaveLength(42);
    expect(Object.keys(EDITORIAL_ARTWORKS).map(Number).sort((a, b) => a-b))
      .toEqual(ids.sort((a, b) => a-b));
    expect(new Set(Object.values(POSTER_VARIANTS)).size).toBe(46);
    for (const id of ids) {
      const { container, unmount } = render(
        <PosterOriginal titulo={"CineRD edición " + id} peliculaId={id} anio="2014" />
      );
      const cover = container.querySelector(".cinerd-poster-original");
      expect(cover.dataset.coverVariant).toBe(POSTER_VARIANTS[id]);
      expect(cover.classList.contains("cinerd-poster-original--archive")).toBe(true);
      expect(cover.style.getPropertyValue("--co-back")).toMatch(/^#[0-9a-f]{6}$/i);
      expect(container.querySelectorAll("svg").length).toBe(1);
      expect(container.querySelectorAll("path, circle, rect, ellipse, line").length).toBeGreaterThanOrEqual(7);
      expect(container.querySelector("img, image, use, foreignObject")).toBeNull();
      expect(cover.getAttribute("aria-label")).toContain("No es el cartel oficial");
      unmount();
    }
  });
  it("reduce la tipografía en títulos largos sin mostrar el año dos veces", () => {
    const { container } = render(
      <PosterOriginal titulo="Los Rechazados 2: Operación Espacial" anio="2026" peliculaId={32} />
    );
    expect(container.firstChild.classList.contains("cinerd-poster-original--title-long")).toBe(true);
    expect(screen.queryByText("2026")).toBeNull();
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("2026");
  });
    it("usa motivo genérico y declara explícitamente que no es cartel oficial", () => {
    render(<PosterOriginal titulo="Una película sin póster" peliculaId={999} idioma="en" />);
    expect(screen.getByRole("img").getAttribute("data-cover-variant")).toBe("reel");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("Not an official movie poster");
    expect(screen.getByText("Una película sin póster")).toBeTruthy();
  });
});
