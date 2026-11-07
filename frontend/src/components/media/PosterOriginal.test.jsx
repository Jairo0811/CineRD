import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import PosterOriginal, { POSTER_VARIANTS } from "./PosterOriginal";

afterEach(cleanup);

describe("CineRD / cubiertas originales premium", () => {
  it("asigna cuatro motivos diferenciados sin depender de imágenes de terceros", () => {
    const samples = [[16, "city"], [5, "rhythm"], [4, "coast"], [56, "bloom"]];
    expect(POSTER_VARIANTS).toEqual({ 4: "coast", 5: "rhythm", 16: "city", 56: "bloom" });
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
  it("usa motivo genérico y declara explícitamente que no es cartel oficial", () => {
    render(<PosterOriginal titulo="Una película sin póster" peliculaId={999} idioma="en" />);
    expect(screen.getByRole("img").getAttribute("data-cover-variant")).toBe("reel");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("Not an official movie poster");
    expect(screen.getByText("Una película sin póster")).toBeTruthy();
  });
});
