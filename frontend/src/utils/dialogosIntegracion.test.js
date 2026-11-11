import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const folders = [path.join(root, "pages"), path.join(root, "components")];

function allSourceFiles(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) return allSourceFiles(full);
    return /\.(jsx|js)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name) ? [full] : [];
  });
}

describe("Diálogos CineRD — integración del catálogo", () => {
  it("no deja alert/confirm/prompt nativos en páginas ni componentes", () => {
    const sources = folders.flatMap(allSourceFiles);
    expect(sources.length).toBeGreaterThan(30);
    for (const file of sources) {
      const content = fs.readFileSync(file, "utf8");
      expect(content, path.relative(root, file))
        .not.toMatch(/\b(?:window\.)?(?:alert|confirm|prompt)\s*\(/);
    }
  });

  it("los borrados importantes dependen de confirmación asíncrona", () => {
    for (const file of [
      "pages/Actores.jsx", "pages/Peliculas.jsx", "pages/AdminGaleria.jsx",
      "pages/AdminPremios.jsx", "pages/AdminVerificaciones.jsx",
      "pages/RepartoPelicula.jsx", "components/peliculas/PeliculaCreditosPanel.jsx",
      "components/reparto/CreditosProfesionalesPelicula.jsx",
    ]) {
      expect(fs.readFileSync(path.join(root, file), "utf8")).toMatch(/await confirmarAccion\(/);
    }
  });

  it("Cancelar en observaciones o revocación detiene la petición administrativa", () => {
    const source = fs.readFileSync(path.join(root, "pages/AdminVerificaciones.jsx"), "utf8");
    expect(source).toContain("if (observaciones === null) return;");
    expect(source).toContain("if (motivo === null) return;");
    expect(source).toContain("requerido: true");
  });
});
