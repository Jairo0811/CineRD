import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateEditorialIssueMatrix as validate } from './verifyEditorialIssueMatrix.mjs';

const sample = () => ({ version: 1, items: [
  { filmId: 5, kind: 'sinopsis', title: 'Perico Ripiao', priority: 'alta',
    status: 'pendiente_verificacion', observation: 'Comprobar procedencia del texto SQL.',
    sourceReport: 'docs/FASE_F2_2_AUDITORIA_SQL.md' },
  { filmId: 5, kind: 'contexto', title: 'Perico Ripiao', priority: 'baja',
    status: 'pendiente_verificacion', observation: 'Distinguir argumento de interpretación.',
    sourceReport: 'docs/FASE_F2_2_AUDITORIA_CONTEXTOS_12.md' }
] });
const inventario = [{filmId:5, kind:'sinopsis'}, {filmId:5,kind:'contexto'}];

describe('CineRD / integridad de matriz F-2.3', () => {
  it('acepta 1:1 sin aprobar contenido', () => {
    const result = validate(sample(), inventario);
    assert.deepEqual(result.errors, []);
    assert.equal(result.total, 2);
    assert.equal(result.priorities.alta, 1);
    assert.equal(result.types.contexto, 1);
  });
  it('detecta faltantes y duplicados sin confundir sinopsis con contexto', () => {
    const m = sample();m.items[1] = { ...m.items[0] };
    const errors = validate(m, inventario).errors.join(' | ');
    assert.match(errors, /Duplicado/);
    assert.match(errors, /Falta del inventario: contexto:5/);
  });
  it('rechaza aprobaciones ficticias y prioridades invalidas', () => {
    const m = sample();m.items[0].status = 'aprobado';m.items[1].priority = 'critica';
    const errors = validate(m, inventario).errors.join(' | ');
    assert.match(errors, /Estado no permitido/);
    assert.match(errors, /Prioridad invalida/);
  });
  it('detecta referencias E-4 inexistentes y titulo inconsistente', () => {
    const m = sample();m.items[0].e4Proposals = ['FechaEstreno'];
    m.items[0].title = 'Otro nombre';
    const result = validate(m, inventario.map(x => ({ ...x, titulo: 'Perico Ripiao' })), () => true, () => false);
    assert.match(result.errors.join(' | '), /Referencia a E-4 invalida/);
    assert.match(result.errors.join(' | '), /Titulo no coincide/);
  });
  it('rechaza referencias que no existen o salen del conjunto auditado', () => {
    const m = sample();m.items[0].sourceReport = '../otro.md';
    assert.match(validate(m, inventario).errors.join(' | '), /Informe de origen/);
    m.items[0].sourceReport = 'docs/FASE_F2_2_AUDITORIA_SQL.md';
    assert.match(validate(m, inventario, () => false).errors.join(' | '), /Informe de origen/);
  });
  const reviewFixture = () => ({
    decision: 'sin_cambio_justificado',
    reviewedBy: 'Revisor de ejemplo — solo prueba',
    reviewedAt: '2026-11-07T15:00:00-04:00',
    notes: 'Caso sintético para comprobar trazabilidad, sin autorización real de publicación.',
    evidenceUrls: ['https://example.org/review-evidence'],
    contentFingerprint: 'a'.repeat(64)
  });
  const inventoryWithFingerprints = () => inventario.map(x => ({
    ...x, fingerprint: 'a'.repeat(64)
  }));

  it('permite resolver una observación solo con decisión humana documentada y huella vigente', () => {
    const m = sample();
    m.items[0].status = 'resuelta';
    m.items[0].resolution = reviewFixture();
    const result = validate(m, inventoryWithFingerprints());
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.states, { pending: 1, resolved: 1 });
    assert.equal(result.total, 2);
  });
  it('rechaza un cierre sin responsable o sin decisión sustentada', () => {
    const m = sample();
    m.items[0].status = 'resuelta';
    m.items[0].resolution = {
      ...reviewFixture(), reviewedBy: '', decision: 'aprobado', notes: 'ok'
    };
    const errors = validate(m, inventoryWithFingerprints()).errors.join(' | ');
    assert.match(errors, /Revisor no identificado/);
    assert.match(errors, /Decision de resolucion invalida/);
    assert.match(errors, /Motivo de resolucion insuficiente/);
  });
  it('rechaza una resolución con evidencia ausente, HTTP o fecha sin zona', () => {
    const m = sample();
    m.items[0].status = 'resuelta';
    m.items[0].resolution = {
      ...reviewFixture(), evidenceUrls: ['http://example.org/sin-seguridad'],
      reviewedAt: '2026-11-07'
    };
    const errors = validate(m, inventoryWithFingerprints()).errors.join(' | ');
    assert.match(errors, /Evidencia HTTPS ausente o invalida/);
    assert.match(errors, /Fecha de revision con zona horaria invalida/);
  });
  it('una huella obsoleta invalida la resolución aun si hay revisión atribuida', () => {
    const m = sample();m.items[0].status = 'resuelta';
    m.items[0].resolution = reviewFixture();
    const changed = inventoryWithFingerprints();
    changed[0].fingerprint = 'b'.repeat(64);
    assert.match(validate(m, changed).errors.join(' | '), /Huella editorial desactualizada/);
  });
  it('una corrección exige referencia de cambio, no solo justificación narrativa', () => {
    const m = sample();m.items[0].status = 'resuelta';
    m.items[0].resolution = {...reviewFixture(), decision: 'correccion_verificada'};
    assert.match(validate(m, inventoryWithFingerprints()).errors.join(' | '), /Falta referencia HTTPS al cambio/);
    m.items[0].resolution.changeRef='https://github.com/ejemplo/commit/123';
    assert.deepEqual(validate(m,inventoryWithFingerprints()).errors, []);
  });
  it('pendiente no puede tener resolución y resuelta no equivale a aprobar contenido', () => {
    const m = sample();m.items[0].resolution = reviewFixture();
    assert.match(validate(m,inventoryWithFingerprints()).errors.join(' | '), /Resolucion no permitida/);
    m.items[0].status = 'resuelta';
    m.items[0].resolution.approved = true;
    assert.match(validate(m,inventoryWithFingerprints()).errors.join(' | '), /no puede declarar aprobacion/);
  });

});
