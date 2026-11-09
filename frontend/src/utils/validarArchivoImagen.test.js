import { describe, expect, it } from "vitest";
import { MAX_IMAGEN_BYTES, TIPOS_IMAGEN, validarArchivoImagen } from "./validarArchivoImagen";

describe("CineRD / imágenes antes de subir", () => {
  it("acepta JPG, PNG o WEBP en el rango del backend", () => {
    for (const type of TIPOS_IMAGEN) {
      expect(validarArchivoImagen({ type, size: MAX_IMAGEN_BYTES })).toBeNull();
    }
  });

  it("rechaza archivos vacíos, otros formatos y mayores de 8 MB", () => {
    expect(validarArchivoImagen(null)).toContain("Selecciona");
    expect(validarArchivoImagen({ type: "image/svg+xml", size: 30 })).toContain("JPG");
    expect(validarArchivoImagen({ type: "application/pdf", size: 200 })).toContain("JPG");
    expect(validarArchivoImagen({ type: "image/jpeg", size: 0 })).toContain("vacía");
    expect(validarArchivoImagen({ type: "image/png", size: MAX_IMAGEN_BYTES + 1 })).toContain("8 MB");
  });
});
