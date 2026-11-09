import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import api from "../services/api";
import AvancesCineRD from "./AvancesCineRD";

vi.mock("../services/api", () => ({ default: { get: vi.fn() } }));
vi.mock("../config/api", () => ({ DEMO_MODE: true }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "es" } }) }));
vi.mock("../utils/talentoPlaceholder", () => ({
  obtenerFotoTalento: vi.fn((item) => item.Foto || (item.Id === 3 ? "https://commons.wikimedia.org/wiki/Special:FilePath/Fausto_Mata.jpg" : "data:image/svg+xml,portrait")),
  manejarErrorFotoTalento: vi.fn(),
}));
vi.mock("../data/fotosLibresTalentos", () => ({
  obtenerFotoLibreTalento: vi.fn((id) => Number(id) === 3 ? { licencia: "CC BY 2.0" } : null),
}));
vi.mock("../components/media/PosterOriginal", () => ({
  default: ({ peliculaId, titulo }) => <div data-testid={"poster-original-" + peliculaId} role="img" aria-label={"Cubierta original de " + titulo} />,
}));

const movies = [
  { Id: 4, Titulo: "Sanky Panky", Director: "José Pintor", FechaEstreno: "2007-07-03", Foto: "/uploads/peliculas/no-publicar.jpeg", CantidadActores: 2 },
  { Id: 5, Titulo: "Perico Ripiao", Director: "Ángel Muñiz", FechaEstreno: "2003-04-09", Foto: "/uploads/peliculas/otro-no-publicar.jpeg", CantidadActores: 1 },
];
const talents = [
  { Id: 3, NombreCompleto: "Fausto Mata", NombreArtistico: "Boca de Piano", Foto: null, Sexo: "Masculino", Profesion: "Comediante", CantidadPeliculas: 2 },
  { Id: 39, NombreCompleto: "Nashla Bogaert", Foto: null, Sexo: "Femenino", Profesion: "Actriz", CantidadPeliculas: 1 },
];

beforeEach(() => {
  api.get.mockReset();
  api.get.mockImplementation((url) => Promise.resolve({ data: url === "/peliculas" ? movies : talents }));
});
afterEach(cleanup);

const montar = () => render(<MemoryRouter><AvancesCineRD /></MemoryRouter>);

describe("CineRD / galería de avances pública", () => {
  it("muestra métricas reales del catálogo, portada y estado de demo", async () => {
    montar();
    expect(await screen.findByText("Películas catalogadas")).toBeTruthy();
    expect(screen.getByAltText("Logo oficial de CineRD").getAttribute("src")).toBe("/logo-cinerd.webp");
    expect(screen.queryByText("RD", { selector: ".cinerd-avances-side strong" })).toBeNull();
    expect(screen.getAllByText("2")).toHaveLength(2);
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText(/Catálogo de consulta y solo lectura/)).toBeTruthy();
    expect(api.get).toHaveBeenCalledWith("/peliculas");
    expect(api.get).toHaveBeenCalledWith("/actores");
  });

  it("siempre usa cubiertas originales en lugar de publicar carteles antiguos", async () => {
    const { container } = montar();
    await screen.findByTestId("poster-original-4");
    expect(screen.getByTestId("poster-original-5")).toBeTruthy();
    expect(container.querySelector('img[src*="/uploads/peliculas/"]')).toBeNull();
    expect(screen.getAllByText("Cubierta editorial original")).toHaveLength(2);
  });

  it("permite cambiar a talentos y distingue foto con licencia de retrato ilustrado", async () => {
    montar();
    await screen.findByText("Sanky Panky");
    fireEvent.click(screen.getByRole("button", { name: "Talentos del cine" }));
    expect(await screen.findByText("Boca de Piano")).toBeTruthy();
    expect(screen.getByText("Fotografía Creative Commons")).toBeTruthy();
    expect(screen.getByText("Retrato editorial ilustrado")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Boca de Piano" }).getAttribute("src")).toContain("commons.wikimedia.org");
  });

  it("filtra títulos sin subir archivos y conserva enlaces a fichas", async () => {
    const { container } = montar();
    await screen.findByText("Sanky Panky");
    fireEvent.change(screen.getByPlaceholderText("Buscar por título, nombre o profesión"), { target: { value: "PERICO" } });
    await waitFor(() => expect(screen.getByText("Perico Ripiao")).toBeTruthy());
    expect(screen.queryByText("Sanky Panky")).toBeNull();
    expect(within(container.querySelector(".cinerd-avances-grid")).getAllByRole("link").some(x => x.getAttribute("href") === "/peliculas/5")).toBe(true);
  });

  it("informa cuando la API falla sin presentar datos inventados", async () => {
    api.get.mockRejectedValue(new Error("Network error"));
    montar();
    expect((await screen.findByRole("alert")).textContent).toContain("No fue posible cargar el catálogo público.");
  });
});
