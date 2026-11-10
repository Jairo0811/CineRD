/** Verifica coherencia documental offline; nunca conecta a SQL Server. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const first = JSON.parse(read('docs/f23-approved-release-dates-2026-11-09.json'));
const second = JSON.parse(read('docs/f23-approved-remaining-5-dates-2026-11-09.json'));
const query = read('database/scripts/f23_postmigration_8_readonly.sql');
const dossier = read('docs/FASE_F2_3_PAQUETE_DECISIONES_8_FECHAS_2026-11-09.md');
const expected = [
  [10,'Vamos de robo','2014-01-16'],
  [27,'Lotoman 003: Volando Bajito','2014-03-27'],
  [36,'Nueba Yol 3: Bajo la Nueva Ley','1997-10-23'],
  [40,'Colao 2','2023-11-30'],
  [42,'Andrea','2005-08-18'],
  [44,'Playball','2008-02-14'],
  [55,'El Plan Perfecto','2017-01-19'],
  [56,'La Lucha de Ana','2012-05-24']
];

test('ambos expedientes documentan el mismo SELECT independiente 8/8', () => {
  for (const m of [first, second]) {
    assert.equal(m.independentPostMigrationSqlSelectVerified, true);
    const e = m.independentPostMigrationSqlSelectEvidence;
    assert.equal(e.verificationDateLocal, '2026-11-10');
    assert.equal(e.database, 'CRUDPeliculas');
    assert.equal(e.result, '8/8 CORRECTO');
    assert.equal(e.expectedCount, 8);
    assert.equal(e.matchedCount, 8);
    assert.deepEqual(e.affectedIds, expected.map(row => row[0]));
    assert.equal(e.queryReference, 'database/scripts/f23_postmigration_8_readonly.sql');
    assert.match(e.source, /no archivada en el repositorio/);
  }
  assert.equal(second.executionEvidence.verifiedByIndependentRead, true);
  assert.ok(!second.decisionStatus.includes('SNAPSHOT_PENDIENTE'));
  assert.match(dossier, /8\/8 CORRECTO/);
  assert.equal(second.decisions.find(d => d.filmId === 36).independentCommercialEvidenceVerified, false);
});

test('consulta de auditoría es reproducible, y contiene solo instrucciones de lectura', () => {
  assert.ok(query.includes('USE [CRUDPeliculas];'));
  assert.ok(query.includes('LEFT JOIN dbo.Peliculas'));
  for (const [id, title, date] of expected) {
    assert.ok(query.includes(`(${id}, N'${title}', '${date}')`));
  }
  assert.doesNotMatch(query, /\b(?:INSERT|UPDATE|DELETE|MERGE|ALTER|DROP|TRUNCATE|EXEC|EXECUTE|BACKUP|RESTORE)\b/i);
  assert.equal((query.match(/\(\d+, N'/g) ?? []).length, 8);
});
