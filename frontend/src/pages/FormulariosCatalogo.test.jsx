import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import api from "../services/api";
import { resolveMediaUrl } from "../config/api";
import FormularioActor from "./FormularioActor";
import FormularioPelicula from "./FormularioPelicula";

vi.mock("../services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));
vi.mock("../config/api", () => ({
  resolveMediaUrl: vi.fn((value) => value ? `https://media.example.test${value}` : null),
}));
vi.mock("../components/peliculas/PeliculaTraduccionesPanel", () => ({ default: () => null }));
vi.mock("../components/peliculas/PeliculaCreditosPanel", () => ({ default: () => null }));

function renderRoute(path, pattern, element) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={element} />
        <Route path="/peliculas" element={<div>Películas</div>} />
        <Route path="/actores" element={<div>Talentos</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("alert", vi.fn());
  api.get.mockReset();
  api.post.mockReset();
  api.put.mockReset();
  resolveMediaUrl.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CineRD / formularios locales de catálogo", () => {
  it("muestra la fotografía editada utilizando el origen configurado, no localhost fijo", async () => {
    api.get.mockResolvedValue({
      data: { Nombres: "María", Sexo: "Femenino", EstaVivo: true, Foto: "/uploads/actores/maria.webp" },
    });
    renderRoute("/actores/8", "/actores/:id", <FormularioActor />);

    await waitFor(() => {
      expect(screen.getByAltText("Vista previa del talento").getAttribute("src"))
        .toBe("https://media.example.test/uploads/actores/maria.webp");
    });
    expect(resolveMediaUrl).toHaveBeenCalledWith("/uploads/actores/maria.webp");
  });

  it("muestra la portada editada utilizando el origen configurado", async () => {
    api.get.mockImplementation((url) => Promise.resolve({
      data: url === "/actores" ? [] : {
        Titulo: "Película de prueba", Genero: "Drama", FechaEstreno: "2020-01-05",
        Foto: "/uploads/peliculas/portada.jpg",
      },
    }));
    renderRoute("/peliculas/9", "/peliculas/:id", <FormularioPelicula />);

    await waitFor(() => {
      expect(screen.getByAltText("Vista previa de la película").getAttribute("src"))
        .toBe("https://media.example.test/uploads/peliculas/portada.jpg");
    });
    expect(resolveMediaUrl).toHaveBeenCalledWith("/uploads/peliculas/portada.jpg");
  });

  it("evita crear dos películas si se envía el formulario dos veces mientras se guarda", async () => {
    api.get.mockResolvedValue({ data: [] });
    api.post.mockReturnValue(new Promise(() => {}));
    const { container } = renderRoute("/peliculas/nueva", "/peliculas/nueva", <FormularioPelicula />);
    fireEvent.change(container.querySelector('[name="Titulo"]'), { target: { value: "Prueba local" } });
    fireEvent.change(container.querySelector('[name="Genero"]'), { target: { value: "Drama" } });
    fireEvent.change(container.querySelector('[name="FechaEstreno"]'), { target: { value: "2020-01-05" } });

    const form = container.querySelector("form.card");
    fireEvent.submit(form);
    fireEvent.submit(form);
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Guardando..." }).disabled).toBe(true);
  });

  it("titular verificado solo edita su presencia profesional, no datos de identidad", async () => {
    window.localStorage.setItem("cineRdUsuario", JSON.stringify({ rol: "TALENTO_VERIFICADO" }));
    api.get.mockResolvedValue({
      data: {
        Id: 8, Nombres: "María", Apellidos: "Rodríguez",
        Sexo: "Femenino", EstaVivo: true,
        FechaNacimiento: "1990-01-01", NombreArtistico: "María",
        Profesion: "Actriz", InstagramUrl: "https://instagram.com/maria",
      },
    });
    const { container } = renderRoute("/actores/8", "/actores/:id", <FormularioActor />);
    await waitFor(() => expect(container.querySelector('[name="Nombres"]').value).toBe("María"));
    for (const campo of ["Nombres", "Apellidos", "FechaNacimiento", "AnioNacimiento", "Sexo", "EstaVivo"]) {
      expect(container.querySelector(`[name="${campo}"]`).disabled).toBe(true);
    }
    for (const campo of ["NombreArtistico", "Profesion", "InstagramUrl", "Foto"]) {
      expect(container.querySelector(`[name="${campo}"]`).disabled).toBe(false);
    }
    expect(screen.getByText(/Los datos de identidad necesitan revisión editorial/)).toBeTruthy();
  });

  it("evita crear dos talentos si se envía el formulario dos veces mientras se guarda", async () => {
    api.post.mockReturnValue(new Promise(() => {}));
    const { container } = renderRoute("/actores/nuevo", "/actores/nuevo", <FormularioActor />);
    fireEvent.change(container.querySelector('[name="Nombres"]'), { target: { value: "Pedro" } });

    const form = container.querySelector("form.card");
    fireEvent.submit(form);
    fireEvent.submit(form);
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Guardando..." }).disabled).toBe(true);
  });
});
