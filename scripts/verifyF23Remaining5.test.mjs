/**
 * F-2.3 / segundo lote (5): puertas offline, sin SQL ni aprobaciones automáticas.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const approved=JSON.parse(read('docs/f23-approved-remaining-5-dates-2026-11-09.json'));
const oldBatch=JSON.parse(read('docs/f23-approved-release-dates-2026-11-09.json'));
const dossier=JSON.parse(read('docs/editorial-metadata-candidates-f26.json'));
const snapshot=JSON.parse(read('database/seeds/catalog.snapshot.json'));
const sql=read('database/scripts/f23_fechas_5_aprobadas_manual_up_down.sql');
const backup=read('database/scripts/f23_backup_nuevas_5_fechas_manual.sql');
const expected=[
 [27,'Lotoman 003: Volando Bajito','2014-03-15','2014-03-27'],
 [36,'Nueba Yol 3: Bajo la Nueva Ley','1997-10-31','1997-10-23'],
 [42,'Andrea','2005-08-16','2005-08-18'],
 [44,'Playball','2008-02-01','2008-02-14'],
 [56,'La Lucha de Ana','2012-04-13','2012-05-24']
];

test('el titular aprobó las cinco fechas; SSMS reportó aplicación y respaldo verificado',()=>{
  assert.equal(approved.version,1);
  assert.equal(approved.consentRecordedDate,'2026-11-09');
  assert.match(approved.consentSource,/apruebalas todas/);
  assert.deepEqual(approved.decisions.map(x=>x.filmId),expected.map(x=>x[0]));
  assert.equal(approved.humanApprovalByOwner,true);
  assert.equal(approved.sqlApplied,true);
  assert.equal(approved.backupForThisBatchVerified,true);
  assert.equal(approved.executionEvidence.reportedResult,'EJECUCION_MANUAL_CONFIRMADA');
  assert.deepEqual(approved.executionEvidence.affectedIds,[27,36,42,44,56]);
  assert.equal(approved.independentPostMigrationSqlSelectVerified,false);
  assert.equal(approved.snapshotSynchronized,true);
  assert.equal(approved.snapshotExportEvidence.sourceDatabase,'CRUDPeliculas');
  assert.equal(approved.snapshotExportEvidence.verificationResult,
    '5/5 fechas; SOLO FechaEstreno #27,#36,#42,#44,#56 y generatedAtUtc');
  assert.equal(approved.snapshotExportEvidence.gitCommit,
    '864d26a9217bba529329802d23b0724df6813ce9');
  assert.equal(approved.snapshotExportEvidence.gitPath,'database/seeds/catalog.snapshot.json');
  assert.equal(approved.reviewerFullName,null);
  assert.equal(approved.reviewedAtExactUtc,null);
  assert.equal(oldBatch.executableChangesApplied,true);
  assert.equal(oldBatch.otherFiveDatesApprovedPendingSql,false);
  assert.equal(oldBatch.otherFiveDatesAppliedAccordingToSsms,true);
  assert.deepEqual(oldBatch.decisions.map(x=>x.filmId),[10,40,55]);
});

test('5 decisiones casan exactamente con fecha histórica y candidata en expediente F-2.6',()=>{
  for(const [id,title,previous,candidate] of expected){
    const d=approved.decisions.find(x=>x.filmId===id);
    assert.ok(d);
    assert.equal(d.title,title);
    assert.equal(d.field,'FechaEstreno');
    assert.equal(d.currentSql,previous);
    assert.equal(d.approvedNewValue,candidate);
    assert.equal(d.decision,'APROBAR_CANDIDATA');
    assert.ok(d.sourceUrls.length>=2);
    assert.ok(d.sourceUrls.every(s=>new URL(s).protocol==='https:'));
    const f=snapshot.tables.Peliculas.find(x=>x.Id===id);
    assert.equal(f.Titulo,title);
    assert.equal(f.FechaEstreno.slice(0,10),candidate,
      'El snapshot sincronizado debe reflejar la fecha aprobada');
    const p=dossier.items.find(x=>x.filmId===id)?.proposals[0];
    assert.equal(p.field,'FechaEstreno');
    assert.equal(p.from,previous);
    assert.equal(p.to,candidate);
    assert.ok(sql.includes(`(${id},N'${title}',`));
    assert.ok(sql.includes(`CASE WHEN @Direction=N'UP' THEN '${previous}' ELSE '${candidate}' END`));
    assert.ok(sql.includes(`CASE WHEN @Direction=N'UP' THEN '${candidate}' ELSE '${previous}' END`));
  }
  const uncertain=approved.decisions.find(x=>x.filmId===36);
  assert.equal(uncertain.independentCommercialEvidenceVerified,false);
  assert.equal(uncertain.sourceConfidence,'sin_fuente_primaria_independiente');
  assert.match(approved.scientificCaveat,/Nueba Yol 3/);
});

test('migración fail-closed: 5 filas, respaldo nuevo y transacción, cero permisos implícitos',()=>{
  for(const needle of [
    'USE [CRUDPeliculas];','DECLARE @Apply BIT = 0;',
    'DECLARE @ConfirmedManualReview BIT = 0;',
    "DECLARE @Direction NVARCHAR(4) = N'UP';",
    'IF @Apply=0','CERO ACTUALIZACIONES',
    'RESTORE VERIFYONLY FROM DISK=@BackupFile WITH CHECKSUM;',
    "AND B.type='D' AND B.is_copy_only=1 AND B.has_backup_checksums=1",
    "F.physical_device_name LIKE N'%CRUDPeliculas[_]F23[_]5[_]%.bak'",
    'IF @Matched<>5','IF @@ROWCOUNT<>5',
    'WITH (UPDLOCK,HOLDLOCK)',
    'BEGIN TRANSACTION;',
    'COMMIT TRANSACTION;',
    'IF XACT_STATE()<>0 ROLLBACK TRANSACTION;'
  ]) assert.ok(sql.includes(needle),`Falta protección: ${needle}`);
  assert.ok(sql.indexOf('IF @Apply=0')<sql.indexOf('UPDATE P'));
  assert.ok(sql.indexOf('RESTORE VERIFYONLY')<sql.indexOf('BEGIN TRANSACTION'));
  assert.ok(sql.includes('NO tocar los IDs 10,40,55 ya corregidos'));
  for(const x of [10,40,55])assert.ok(!sql.includes(`(${x},N'`));
  assert.ok(!sql.includes('CRUDPeliculas_E2E];'));
});

test('nuevo backup es manual, de base original, full copy-only y con checksum',()=>{
  for(const needle of [
    'USE [master];','DB_ID(N\'CRUDPeliculas\')',
    'BACKUP DATABASE [CRUDPeliculas]','COPY_ONLY,CHECKSUM',
    'RESTORE VERIFYONLY FROM DISK=@File WITH CHECKSUM;',
    'CRUDPeliculas_F23_5_','BACKUP_F23_5_VERIFICADO'
  ])assert.ok(backup.includes(needle),`Falta regla de backup: ${needle}`);
  assert.ok(!backup.includes('CRUDPeliculas_E2E'));
  assert.ok(!/\bUPDATE\s+dbo\.Peliculas\b/i.test(backup));
});

test('las 5 fechas constan aplicadas y el snapshot versionado ya las contiene',()=>{
  const report=read('docs/FASE_F2_3_PAQUETE_DECISIONES_8_FECHAS_2026-11-09.md');
  assert.ok(report.includes('5 FECHAS APROBADAS Y APLICADAS SEGÚN CAPTURA SSMS'));
  for(const [id] of expected){
    const line=report.split('\n').find(x=>x.startsWith(`| ${id} |`));
    assert.ok(line?.endsWith('APROBADA Y APLICADA SEGÚN SSMS; SNAPSHOT SINCRONIZADO |'));
  }
});
