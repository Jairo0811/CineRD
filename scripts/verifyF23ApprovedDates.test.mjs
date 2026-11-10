/**
 * F-2.3 approved release dates: offline safety checks.
 * No SQL connection. Never applies changes or simulates human attestations.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('docs/f23-approved-release-dates-2026-11-09.json'));
const sql=read('database/scripts/f23_fechas_3_aprobadas_manual_up_down.sql');
const otherLedger=JSON.parse(read('docs/catalog-corrections-e4-approvals.json'));

test('3 fechas del primer lote aplicadas; 5 aprobaciones registradas por separado',()=>{
  assert.equal(manifest.version,1);
  assert.equal(manifest.consentRecordedDate,'2026-11-09');
  assert.deepEqual(manifest.decisions.map(x=>x.filmId),[10,40,55]);
  assert.ok(manifest.decisions.every(x=>x.decision==='APROBAR_CANDIDATA' && x.field==='FechaEstreno'));
  assert.ok(manifest.decisions.every(x=>x.evidenceUrls.length>=1 && x.evidenceUrls.every(u=>new URL(u).protocol==='https:')));
  assert.equal(manifest.reviewerFullName,null);
  assert.equal(manifest.reviewedAtExactUtc,null);
  assert.equal(manifest.executableChangesApplied,true);
  assert.equal(manifest.databaseBackupVerified,true);
  assert.equal(manifest.executionEvidence.type,'Capturas de resultados SQL Server Management Studio proporcionadas por el titular');
  assert.equal(manifest.executionEvidence.reportedResult,'EJECUCION_MANUAL_CONFIRMADA');
  assert.deepEqual(manifest.executionEvidence.affectedIds,[10,40,55]);
  assert.equal(manifest.independentPostMigrationSqlSelectVerified,false);
  assert.equal(manifest.snapshotExportSynchronized,true);
  assert.equal(manifest.snapshotExportEvidence.sourceDatabase,'CRUDPeliculas');
  assert.equal(manifest.snapshotExportEvidence.verificationResult,
    '3/3 fechas, solo FechaEstreno #10, #40, #55 y generatedAtUtc');
  assert.match(manifest.snapshotExportEvidence.gitCommit,/^[a-f0-9]{40}$/);
  assert.equal(manifest.snapshotExportEvidence.gitPath,'database/seeds/catalog.snapshot.json');
  assert.equal(manifest.originalSevenE4ApprovalsUnaffected,true);
  assert.equal(manifest.otherFiveDatesStillPending,false);
  assert.equal(manifest.otherFiveDatesApprovedPendingSql,false);
  assert.equal(manifest.otherFiveDatesAppliedAccordingToSsms,true);
  assert.equal(manifest.secondBatchApprovalRecord,'docs/f23-approved-remaining-5-dates-2026-11-09.json');
  assert.equal(otherLedger.approvals.length,0);
});

test('las tres transiciones UP/DOWN coinciden exactamente con la aprobación',()=>{
  const expected=[
    [10,'Vamos de robo','2014-01-15','2014-01-16'],
    [40,'Colao 2','2023-12-07','2023-11-30'],
    [55,'El Plan Perfecto','2017-01-17','2017-01-19']
  ];
  for(const [filmId,title,oldDate,newDate] of expected) {
    assert.deepEqual(manifest.decisions.find(x=>x.filmId===filmId),{
      filmId,title,field:'FechaEstreno',currentSql:oldDate,
      approvedNewValue:newDate,decision:'APROBAR_CANDIDATA',
      evidenceUrls:manifest.decisions.find(x=>x.filmId===filmId).evidenceUrls
    });
    assert.ok(sql.includes(`(${filmId}, N'${title}',`));
    assert.ok(sql.includes(`CASE WHEN @Direction=N'UP' THEN '${oldDate}' ELSE '${newDate}' END`));
    assert.ok(sql.includes(`CASE WHEN @Direction=N'UP' THEN '${newDate}' ELSE '${oldDate}' END`));
  }
  assert.ok(!sql.includes("(27, N'Lotoman"));
  assert.ok(!sql.includes("(36, N'Nueba"));
  assert.ok(!sql.includes("(42, N'Andrea"));
  assert.ok(!sql.includes("(44, N'Playball"));
  assert.ok(!sql.includes("(56, N'La Lucha"));
});

test('script manual falla cerrado por defecto y protege integridad/reversión',()=>{
  for(const safety of [
    'USE [CRUDPeliculas];',
    'DECLARE @Direction NVARCHAR(4) = N\'UP\';',
    'DECLARE @Apply BIT = 0;',
    'DECLARE @ConfirmedManualReview BIT = 0;',
    'IF @Apply = 0',
    'CERO ACTUALIZACIONES SQL',
    'DECLARE @BackupFile NVARCHAR(4000)',
    "AND B.type='D'",
    'AND B.has_backup_checksums=1',
    'RESTORE VERIFYONLY FROM DISK = @BackupFile WITH CHECKSUM;',
    'BEGIN TRANSACTION;',
    'WITH (UPDLOCK, HOLDLOCK)',
    'IF @Matched <> 3',
    'IF @@ROWCOUNT <> 3',
    'OUTPUT inserted.Id, inserted.Titulo, deleted.FechaEstreno, inserted.FechaEstreno',
    'COMMIT TRANSACTION;',
    'IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;'
  ]) assert.ok(sql.includes(safety),`Falta salvaguarda: ${safety}`);
  assert.ok(sql.indexOf('IF @Apply = 0') < sql.indexOf('UPDATE P'));
  assert.ok(sql.indexOf('RESTORE VERIFYONLY') < sql.indexOf('BEGIN TRANSACTION'));
  assert.ok(!sql.includes('CRUDPeliculas_E2E];'));
});

test('informe refleja ocho fechas aplicadas y ambos snapshots sincronizados',()=>{
  const report=read('docs/FASE_F2_3_PAQUETE_DECISIONES_8_FECHAS_2026-11-09.md');
  assert.ok(report.includes('3 FECHAS APROBADAS POR EL TITULAR'));
  assert.ok(report.includes('5 FECHAS APROBADAS Y APLICADAS SEGÚN CAPTURA SSMS'));
  assert.ok(report.includes('3 CAMBIOS SQL APLICADOS SEGÚN CAPTURA SSMS'));
  for(const id of [10,40,55]){
    const line=report.split('\n').find(x=>x.startsWith(`| ${id} |`));
    assert.ok(line?.includes('APROBADA Y APLICADA SEGÚN SSMS'));
  }
  for(const id of [27,36,42,44,56]){
    const line=report.split('\n').find(x=>x.startsWith(`| ${id} |`));
    assert.ok(line?.endsWith('APROBADA Y APLICADA SEGÚN SSMS; SNAPSHOT SINCRONIZADO |'));
  }
});
