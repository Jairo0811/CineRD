import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../../services/api", () => ({
  limpiarSesion: vi.fn(() => {
    localStorage.removeItem("cineRdAccessToken");
    localStorage.removeItem("cineRdUsuario");
  }),
  renovarSesion: vi.fn(),
}));

import { renovarSesion } from "../../services/api";
import ProtectedRoute from "./ProtectedRoute";

const base64url = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const crearToken = (exp) => `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url({ exp })}.firma`;
const ahora = () => Math.floor(Date.now() / 1000);
const guardarSesion = ({ exp, rol = "ADMINISTRADOR" }) => {
  localStorage.setItem("cineRdAccessToken", crearToken(exp));
  localStorage.setItem("cineRdUsuario", JSON.stringify({ id: 1, nombre: "Test", rol }));
};
const renderizar = (roles) => render(
  <MemoryRouter initialEntries={["/privada"]}>
    <Routes>
      <Route path="/privada" element={<ProtectedRoute roles={roles}><p>contenido privado</p></ProtectedRoute>} />
      <Route path="/login" element={<p>pantalla login</p>} />
      <Route path="/dashboard" element={<p>pantalla dashboard</p>} />
    </Routes>
  </MemoryRouter>,
);

describe("ProtectedRoute", () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
  afterEach(cleanup);

  it("redirige al login cuando no hay sesión", () => {
    renderizar();
    expect(screen.getByText("pantalla login")).toBeTruthy();
    expect(renovarSesion).not.toHaveBeenCalled();
  });

  it("muestra el contenido con un access token vigente", () => {
    guardarSesion({ exp: ahora() + 600 });
    renderizar(["ADMINISTRADOR"]);
    expect(screen.getByText("contenido privado")).toBeTruthy();
  });

  it("redirige al dashboard si el rol no está permitido", () => {
    guardarSesion({ exp: ahora() + 600, rol: "USUARIO" });
    renderizar(["ADMINISTRADOR"]);
    expect(screen.getByText("pantalla dashboard")).toBeTruthy();
  });

  it("renueva una sesión cuyo access token venció", async () => {
    guardarSesion({ exp: ahora() - 60 });
    renovarSesion.mockImplementation(async () => {
      guardarSesion({ exp: ahora() + 900 });
      return "nuevo-token";
    });
    renderizar(["ADMINISTRADOR"]);
    expect(screen.queryByText("pantalla login")).toBeNull();
    await waitFor(() => expect(screen.getByText("contenido privado")).toBeTruthy());
    expect(renovarSesion).toHaveBeenCalledTimes(1);
  });

  it("redirige al login cuando el refresh es inválido", async () => {
    guardarSesion({ exp: ahora() - 60 });
    renovarSesion.mockRejectedValue(new Error("401"));
    renderizar(["ADMINISTRADOR"]);
    await waitFor(() => expect(screen.getByText("pantalla login")).toBeTruthy());
    expect(localStorage.getItem("cineRdAccessToken")).toBeNull();
  });

  it("no entra en bucle si el refresh no deja una sesión válida", async () => {
    guardarSesion({ exp: ahora() - 60 });
    renovarSesion.mockResolvedValue("token-que-no-se-guardo");
    renderizar(["ADMINISTRADOR"]);
    await waitFor(() => expect(screen.getByText("pantalla login")).toBeTruthy());
    expect(renovarSesion).toHaveBeenCalledTimes(1);
  });
});
