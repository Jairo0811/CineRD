// Orden visible A-Z respetando el idioma de la interfaz, sin alterar los valores de la BD.
export function ordenarAlfabeticamente(items, obtenerEtiqueta = (item) => item, idioma = "es") {
  const collator = new Intl.Collator(idioma, { sensitivity: "base", numeric: true });
  return [...items].sort((a, b) =>
    collator.compare(String(obtenerEtiqueta(a) ?? ""), String(obtenerEtiqueta(b) ?? "")),
  );
}
