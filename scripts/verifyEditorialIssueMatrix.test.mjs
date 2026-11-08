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
});
