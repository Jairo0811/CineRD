/**
 * CineRD F-2.3: validate a traceable, non-approving issue matrix.
 * The matrix does NOT certify factual accuracy, sources, permissions or rights.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inventory } from './editorialReviewAudit.mjs';

/**
 * An issue may be marked resolved only by an attributed review with citations
 * and a fingerprint of the CURRENT editorial item. This is NOT an E-5 approval
 * or evidence of ownership/permission: those are separately checked.
 */
const decisions = new Set([
  "sin_cambio_justificado",
  "correccion_verificada",
  "incidencia_descartada"
]);
const isHttps = url => {
  try { return typeof url === "string" && new URL(url).protocol === "https:"; }
  catch { return false; }
};
function validateResolution(item, current, key) {
  const errors = [];
  if (item.status === "pendiente_verificacion") {
    if (Object.hasOwn(item, "resolution"))
      errors.push(`Resolucion no permitida para incidencia pendiente: ${key}`);
  } else if (item.status === "resuelta") {
    const r = item.resolution;
    if (!r || typeof r !== "object" || Array.isArray(r)) {
      errors.push(`Falta resolucion humana documentada: ${key}`);
      return errors;
    }
    if (!decisions.has(r.decision))
      errors.push(`Decision de resolucion invalida: ${key}`);
    if (typeof r.reviewedBy !== "string" || r.reviewedBy.trim().length < 3)
      errors.push(`Revisor no identificado: ${key}`);
    if (typeof r.reviewedAt !== "string" ||
        !/T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(r.reviewedAt) ||
        Number.isNaN(Date.parse(r.reviewedAt)))
      errors.push(`Fecha de revision con zona horaria invalida: ${key}`);
    if (typeof r.notes !== "string" || r.notes.trim().length < 30)
      errors.push(`Motivo de resolucion insuficiente: ${key}`);
    if (!Array.isArray(r.evidenceUrls) || !r.evidenceUrls.length ||
        new Set(r.evidenceUrls).size !== r.evidenceUrls.length ||
        !r.evidenceUrls.every(isHttps))
      errors.push(`Evidencia HTTPS ausente o invalida: ${key}`);
    if (!current || typeof current.fingerprint !== "string" ||
        r.contentFingerprint !== current.fingerprint ||
        !/^[a-f0-9]{64}$/.test(r.contentFingerprint))
      errors.push(`Huella editorial desactualizada o invalida: ${key}`);
    if (r.decision === "correccion_verificada" && !isHttps(r.changeRef))
      errors.push(`Falta referencia HTTPS al cambio editorial: ${key}`);
    if (Object.hasOwn(r, "approved") || Object.hasOwn(r, "permissionGranted"))
      errors.push(`La resolucion no puede declarar aprobacion ni licencia: ${key}`);
  } else errors.push(`Estado no permitido: ${key}`);
  return errors;
}

export function validateEditorialIssueMatrix(matrix, inventoryItems, reportExists = () => true, proposalExists = () => true) {
  const errors = [];
  const priorities = { alta: 0, media: 0, baja: 0 };
  const types = { sinopsis: 0, contexto: 0 };
  const states = { pending: 0, resolved: 0 };
  if (!matrix || matrix.version !== 1 || !Array.isArray(matrix.items)) {
    return { errors: ['Formato de matriz F-2.3 invalido'], priorities, types, states, total: 0 };
  }
  const expected = new Map(inventoryItems.map(item => [`${item.kind}:${item.filmId}`, item]));
  const seen = new Set();
  for (const [idx, item] of matrix.items.entries()) {
    if (!item || !Number.isInteger(item.filmId) || item.filmId < 1 ||
        !['sinopsis', 'contexto'].includes(item.kind)) {
      errors.push(`Identidad invalida en fila ${idx + 1}`);
      continue;
    }
    const key = `${item.kind}:${item.filmId}`;
    if (seen.has(key)) errors.push(`Duplicado: ${key}`);
    seen.add(key);
    if (!expected.has(key)) errors.push(`Fuera del inventario: ${key}`);
    else if (expected.get(key).titulo && item.title !== expected.get(key).titulo.trim())
      errors.push(`Titulo no coincide: ${key}`);
    if (!['alta', 'media', 'baja'].includes(item.priority)) errors.push(`Prioridad invalida: ${key}`);
    else priorities[item.priority]++;
    types[item.kind]++;
    if (item.status === 'pendiente_verificacion') states.pending++;
    if (item.status === 'resuelta') states.resolved++;
    errors.push(...validateResolution(item, expected.get(key), key));
    if (typeof item.observation !== 'string' || item.observation.trim().length < 20)
      errors.push(`Observacion incompleta: ${key}`);
    if (typeof item.sourceReport !== 'string' ||
        !/^docs\/FASE_F2_2_AUDITORIA_(SQL|ES_EN_LOTE[1-5]|CONTEXTOS_12)\.md$/.test(item.sourceReport) ||
        !reportExists(item.sourceReport)) errors.push(`Informe de origen no encontrado: ${key}`);
    if (typeof item.title !== 'string' || !item.title.trim()) errors.push(`Titulo vacio: ${key}`);
    if (item.e4Proposals !== undefined) {
      if (!Array.isArray(item.e4Proposals) || !item.e4Proposals.length ||
          item.e4Proposals.some(field => !['Genero', 'FechaEstreno', 'Director'].includes(field) || !proposalExists(item.filmId, field)))
        errors.push(`Referencia a E-4 invalida: ${key}`);
    }
  }
  for (const key of expected.keys()) if (!seen.has(key)) errors.push(`Falta del inventario: ${key}`);
  return { errors, priorities, types, states, total: matrix.items.length };
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const matrix = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'editorial-issues-f2.json'), 'utf8'));
  const e4 = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'catalog-corrections-e4.json'), 'utf8'));
  const result = validateEditorialIssueMatrix(matrix, inventory(),
    report => fs.existsSync(path.join(root, report)),
    (filmId, field) => e4.rows.some(row => row.filmId === filmId && row.field === field));
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`CineRD F-2.3: ${result.total} observaciones, ${result.types.sinopsis} sinopsis y ${result.types.contexto} contextos.`);
    console.log(`Prioridades: alta=${result.priorities.alta}; media=${result.priorities.media}; baja=${result.priorities.baja}.`);
    console.log(`Estados: pendientes=${result.states.pending}; resueltas=${result.states.resolved}.`);
    if (result.errors.length) for (const e of result.errors) console.error(`✗ ${e}`);
    else console.log('✓ Cobertura completa y trazabilidad de incidencias. Las resoluciones no aprueban contenido E-5.');
  }
  if (result.errors.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
