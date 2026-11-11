import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sweetalert2", () => {
  const fire = vi.fn();
  const mixin = vi.fn(() => ({ fire }));
  return { default: { mixin, fire } };
});
import Swal from "sweetalert2";
import {
  confirmarAccion, mostrarAdvertencia, mostrarError, mostrarExito, solicitarTexto,
} from "./dialogos";

const fire = Swal.mixin.mock.results[0].value.fire;

describe("CineRD SweetAlert2", () => {
  beforeEach(() => { fire.mockReset(); });

  it("respeta Cancelar, Esc y confirmación antes de eliminar", async () => {
    fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await confirmarAccion("¿Borrar?")).toBe(false);
    expect(fire.mock.calls[0][0]).toMatchObject({
      icon: "warning", showCancelButton: true, cancelButtonText: "Cancelar",
      focusCancel: true, text: "¿Borrar?",
    });
    fire.mockResolvedValueOnce({ isConfirmed: true });
    expect(await confirmarAccion("¿Borrar?")).toBe(true);
  });

  it("solicita observaciones sin confundir Cancelar con texto vacío", async () => {
    fire.mockResolvedValueOnce({ isDismissed: true });
    expect(await solicitarTexto("Observaciones")).toBeNull();
    fire.mockResolvedValueOnce({ isConfirmed: true, value: "  Nota aprobada  " });
    expect(await solicitarTexto("Observaciones")).toBe("Nota aprobada");
  });

  it("exige un motivo no vacío cuando la revisión lo requiere", async () => {
    fire.mockResolvedValueOnce({ isConfirmed: false });
    await solicitarTexto("Motivo", { requerido: true, valorInicial: "Prueba" });
    const opts = fire.mock.calls[0][0];
    expect(opts.input).toBe("textarea");
    expect(opts.inputValidator("  ")).toMatch(/motivo/);
    expect(opts.inputValidator("Corrección administrativa")).toBeUndefined();
  });

  it("usa texto, jamás HTML, para mensajes de la API", async () => {
    fire.mockResolvedValue({});
    await mostrarError("<img src=x onerror=alert(1)>");
    await mostrarAdvertencia("Revisa los datos");
    await mostrarExito("Guardado");
    for (const [opts] of fire.mock.calls) {
      expect(opts).toHaveProperty("text");
      expect(opts).not.toHaveProperty("html");
    }
    expect(fire.mock.calls.map(([opts]) => opts.icon)).toEqual(["error", "warning", "success"]);
  });
});
