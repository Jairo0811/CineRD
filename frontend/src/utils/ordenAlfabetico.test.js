import { describe, expect, it } from "vitest";
import { ordenarAlfabeticamente } from "./ordenAlfabetico";

describe("ordenarAlfabeticamente", () => {
  it("ordena A-Z en español sin depender de mayúsculas ni acentos", () => {
    const original = ["Terror", "Drama", "Acción", "Comedia", "Ánimas"];
    expect(ordenarAlfabeticamente(original)).toEqual(["Acción", "Ánimas", "Comedia", "Drama", "Terror"]);
    expect(original[0]).toBe("Terror");
  });

  it("ordena por la etiqueta visible sin cambiar el valor seleccionado", () => {
    const original = [["en", "Inglés"], ["es", "Español"], ["de", "Alemán"]];
    expect(ordenarAlfabeticamente(original, ([, etiqueta]) => etiqueta)).toEqual([
      ["de", "Alemán"], ["es", "Español"], ["en", "Inglés"],
    ]);
  });

  it("no muta los objetos de las opciones", () => {
    const opciones = [{ Id: 2, Nombre: "Zoe" }, { Id: 1, Nombre: "Álvaro" }];
    expect(ordenarAlfabeticamente(opciones, x => x.Nombre).map(x => x.Id)).toEqual([1, 2]);
    expect(opciones[0].Id).toBe(2);
  });
});
