/**
 * CineRD: segundo pase editorial F2.3 / E4 / E5.
 * Sólo lectura de fuentes locales. No ejecuta SQL, ni cambia aprobaciones.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));

test('F2.3 #55 mantiene borrador ES/EN con recontratación respaldada y sin permiso',()=>{
  const drafts=json('docs/editorial-sql-replacement-drafts-f23.json');
  const x=drafts.entries['55'];
  const approvals=json('docs/editorial-sql-migration-approvals-f23.json');
  assert.equal(drafts.autoPublish,false);
  assert.deepEqual(Object.keys(drafts.entries).sort(),['10','5','55','56','6'].sort());
  assert.equal(x.filmId,55);
  assert.equal(x.status,'pendiente_revision');
  assert.equal(x.deployment,'manual_only');
  assert.equal(x.sourcePermissionStatus,'sin_evidencia_registrada');
  assert.equal(x.reviewedBy,null);
  assert.equal(x.reviewedAt,null);
  assert.match(x.es,/contrata nuevamente/);
  assert.match(x.en,/rehires/);
  assert.ok(x.es.length>200 && x.en.length>200);
  assert.ok(x.sources.includes('https://lacronica.do/roberto-angel-salcedo-inicia-2017-estreno-plan-perfecto/'));
  assert.ok(x.sources.includes('https://www.elcaribe.com.do/sin-categoria/el-plan-perfecto-en-gala-premier/'));
  assert.equal(approvals.approvals.length,0);
  const report=read('docs/FASE_F23_REVISION_PRELIMINAR_5_SINOPSIS_2026-11-10.md');
  assert.ok(report.includes('Rectificación del análisis inicial'));
  assert.ok(!report.includes('no está acreditada aquí la recontratación explícita'));
});

test('F2.3 sólo modifica preguntas históricas: fechas ya aprobadas no se reabren',()=>{
  const x=json('docs/editorial-sql-replacement-drafts-f23.json').entries;
  assert.match(x['10'].openQuestions.join(' '),/2014-01-16/);
  assert.match(x['55'].openQuestions.join(' '),/2017-01-19/);
  assert.match(x['56'].openQuestions.join(' '),/2012-05-24/);
  assert.ok(Object.values(x).every(d=>d.status==='pendiente_revision' && d.deployment==='manual_only'));
});

test('E4 documenta siete decisiones individuales sin registrar aprobaciones',()=>{
  const e4=json('docs/catalog-corrections-e4.json');
  const approvals=json('docs/catalog-corrections-e4-approvals.json');
  const doc=read('docs/FASE_E4_MATRIZ_DECISIONES_7_CAMPOS_2026-11-10.md');
  const keys=e4.rows.map(r=>r.filmId+':'+r.field);
  assert.equal(keys.length,7);
  assert.equal(new Set(keys).size,7);
  assert.equal(approvals.approvals.length,0);
  assert.equal((doc.match(/^### \[ \] E4-/gm)||[]).length,7);
  for(const r of e4.rows)
    assert.ok(doc.includes('### [ ] E4-'+r.filmId+'-'+r.field+': '+r.title));
  assert.match(doc,/7\/7 valores candidatos presentes/);
  assert.match(doc,/0\/7 aprobaciones/);
});

test('E5 primera oleada corresponde exactamente a 18 claves altas del inventario',()=>{
  const issues=json('docs/editorial-issues-f2.json').items;
  const approvals=json('docs/editorial-approvals-e5.json');
  const doc=read('docs/FASE_E5_OLEADA_ALTA_18_REVISION_2026-11-10.md');
  const high=issues.filter(i=>i.priority==='alta');
  assert.equal(issues.length,58);
  assert.equal(high.length,18);
  assert.equal(issues.filter(i=>i.priority==='media').length,18);
  assert.equal(issues.filter(i=>i.priority==='baja').length,22);
  assert.equal(approvals.approvals.length,0);
  assert.equal((doc.match(/^### \[ \] E5-/gm)||[]).length,18);
  for(const i of high)
    assert.ok(doc.includes('### [ ] E5-'+i.filmId+'-'+i.kind+' — '+i.title),
      'Falta '+i.filmId+':'+i.kind);
});
