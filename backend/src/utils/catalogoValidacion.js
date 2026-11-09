/**
 * IDs externos de TMDb son enteros positivos de SQL INT.
 * "" significa desvinculación explícita; undefined significa que un cliente
 * antiguo no envió el campo y NO debe borrarse la vinculación previa.
 */
class ErrorValidacionCatalogo extends Error {
  constructor(mensaje) { super(mensaje); this.name = "ErrorValidacionCatalogo"; }
}

function normalizarTmdbId(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  const texto = typeof valor === "string" ? valor.trim() : String(valor);
  if (texto === "") return null;
  if (!/^\d+$/.test(texto)) throw new ErrorValidacionCatalogo("El identificador de TMDb debe ser un número entero positivo");
  const n = Number(texto);
  if (!Number.isSafeInteger(n) || n <= 0 || n > 2147483647) {
    throw new ErrorValidacionCatalogo("El identificador de TMDb está fuera de rango");
  }
  return n;
}

function resolverTmdbIdEdicion(valor, anterior) {
  return valor === undefined ? (anterior ?? null) : normalizarTmdbId(valor);
}

module.exports = { ErrorValidacionCatalogo, normalizarTmdbId, resolverTmdbIdEdicion };
