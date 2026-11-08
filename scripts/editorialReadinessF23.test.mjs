import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { assessEditorialReadiness } from "./editorialReadinessF23.mjs";
import { inventory } from "./editorialReviewAudit.mjs";
import { SINOPSIS_EDITORIALES_FASE_E } from "../frontend/src/data/sinopsisCuradasFaseE.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const original=()=>({
  inventoryItems:inventory(),
  snapshot:read("database/seeds/catalog.snapshot.json"),
  issues:read("docs/editorial-issues-f2.json"),
  provenance:read("docs/editorial-provenance-sql-f23.json"),
  drafts:read("docs/editorial-sql-replacement-drafts-f23.json"),
  approvals:read("docs/editorial-approvals-e5.json"),
  migrationApprovals:read("docs/editorial-sql-migration-approvals-f23.json"),
  e4:read("docs/catalog-corrections-e4.json"),
  sqlSources:read("docs/editorial-sources-sql-f2.json"),
  curatedDrafts:SINOPSIS_EDITORIALES_FASE_E,
  reportExists:p=>fs.existsSync(path.join(root,p))
});

describe("CineRD F-2.3 / diagnóstico de preparación editorial",()=>{
  it("resume los bloqueos reales sin aprobar ni publicar contenido",()=>{
    const r=assessEditorialReadiness(original());
    assert.equal(r.ready,false);
    assert.deepEqual(r.errors,[]);
    assert.equal(r.summary.editorial.total,58);
    assert.equal(r.summary.editorial.approved,0);
    assert.equal(r.summary.editorial.pending,58);
    assert.equal(r.summary.issues.total,58);
    assert.equal(r.summary.issues.pending,58);
    assert.deepEqual(r.summary.issues.priorities,{alta:18,media:18,baja:22});
    assert.equal(r.summary.sqlProvenance.withoutEvidence,5);
    assert.equal(r.summary.sqlReplacementDrafts.pending,5);
    assert.equal(r.summary.sqlMigration.validHumanReviewRecords,0);
    assert.equal(r.summary.e4.pending,7);
    assert.equal(r.summary.e4.appliedInSnapshot,0);
    assert.equal(r.documentaryOnly,true);
  });
  it("detecta matriz con duplicados y entradas omitidas",()=>{
    const c=original();
    c.issues.items[1]={...c.issues.items[0]};
    const r=assessEditorialReadiness(c);
    assert.equal(r.ready,false);
    assert.match(r.errors.join(" | "),/Duplicado/);
    assert.match(r.errors.join(" | "),/Falta del inventario/);
  });
  it("rechaza una aprobación E-5 inventada o con huella incorrecta",()=>{
    const c=original();
    c.approvals.approvals=[{filmId:5,kind:"sinopsis",status:"aprobado",reviewer:"X",
      reviewedAt:"2026-11-08T00:00:00-04:00",sourcesChecked:true,
      notes:"Aprobación inventada",fingerprint:"no_coincide"}];
    const r=assessEditorialReadiness(c);
    assert.match(r.errors.join(" | "),/Contenido modificado tras la aprobación/);
    assert.equal(r.summary.editorial.approved,0);
  });
  it("no acepta autorización de migración sin evidencia y huella válida",()=>{
    const c=original();
    c.migrationApprovals.approvals=[{filmId:55,status:"aprobado",reviewer:"Ejemplo",
      reviewedAt:"2026-11-08T00:00:00-04:00",fingerprint:"falsa",
      sourcesChecked:true,esReviewed:true,enReviewed:true,originalityReviewed:true,
      rightsReviewed:true,releaseAuthorized:true,notes:"Esta revisión nunca ocurrió"}];
    const r=assessEditorialReadiness(c);
    assert.match(r.errors.join(" | "),/Aprobación SQL sin sustento/);
    assert.equal(r.summary.sqlMigration.validHumanReviewRecords,0);
  });
  it("detecta drift del catálogo respecto de E-4",()=>{
    const c=original();
    c.snapshot.tables.Peliculas.find(p=>p.Id===9).Genero="Terror";
    const r=assessEditorialReadiness(c);
    assert.match(r.errors.join(" | "),/E-4 ha cambiado sin coincidencia/);
  });
  it("sin datos críticos no devuelve un resultado positivo",()=>{
    const c=original();delete c.issues;
    const r=assessEditorialReadiness(c);
    assert.equal(r.ready,false);
    assert.match(r.errors.join(" | "),/incompletos/);
  });
  it("CLI predeterminado solo informa; --strict bloquea cierre pendiente",()=>{
    const script=path.join(root,"scripts/editorialReadinessF23.mjs");
    const preview=spawnSync(process.execPath,[script,"--json"],{encoding:"utf8"});
    assert.equal(preview.status,0,preview.stderr);
    const r=JSON.parse(preview.stdout);
    assert.equal(r.ready,false);
    assert.equal(r.summary.issues.pending,58);
    const strict=spawnSync(process.execPath,[script,"--strict"],{encoding:"utf8"});
    assert.equal(strict.status,1);
    assert.match(strict.stdout,/NO ESTA LISTA/);
  });
  it("una resolución humana de F-2.3 reduce pendientes, sin aprobar textos E-5",()=>{
    const c=original();
    const issue=c.issues.items.find(x=>x.filmId===5 && x.kind==="sinopsis");
    const current=c.inventoryItems.find(x=>x.filmId===5 && x.kind==="sinopsis");
    issue.status="resuelta";
    issue.resolution={
      decision:"sin_cambio_justificado",
      reviewedBy:"Revisor de prueba (sin firma real)",
      reviewedAt:"2026-11-07T15:00:00-04:00",
      notes:"Ejemplo exclusivo de regresión para verificar que la incidencia es independiente de la aprobación E-5.",
      evidenceUrls:["https://example.org/review-evidence"],
      contentFingerprint:current.fingerprint
    };
    const r=assessEditorialReadiness(c);
    assert.deepEqual(r.errors,[]);
    assert.equal(r.summary.issues.pending,57);
    assert.equal(r.summary.issues.resolved,1);
    assert.equal(r.summary.editorial.approved,0);
    assert.equal(r.summary.editorial.pending,58);
    assert.equal(r.ready,false);
    assert.ok(r.blockers.some(x=>x.includes("Faltan aprobaciones E-5: 58")));
  });

});
