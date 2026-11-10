import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const sql=read("database/scripts/f23_e4_sinopsis_preflight_readonly.sql");
const rows=JSON.parse(read("docs/catalog-corrections-e4.json")).rows;
const drafts=Object.values(JSON.parse(read("docs/editorial-sql-replacement-drafts-f23.json")).entries);
test("preflight nunca modifica SQL y usa la base CRUDPeliculas original",()=>{
  assert.ok(sql.includes("USE [CRUDPeliculas];"));
  assert.ok(sql.includes("IF DB_NAME() <> N'CRUDPeliculas'"));
  const statements=sql.replace(/\/\*[\s\S]*?\*\//g,"").replace(/--[^\n]*/g,"");
  for(const forbidden of [
    /\bUPDATE\b/i,/\bDELETE\b/i,/\bMERGE\b/i,
    /\bDROP\b/i,/\bALTER\b/i,/\bTRUNCATE\b/i,
    /\bINSERT\s+INTO\s+dbo\./i,/\bEXEC(?:UTE)?\b/i
  ]) assert.equal(forbidden.test(statements),false,String(forbidden));
  assert.match(statements,/FROM\s+@Cambios\s+AS\s+C/);
  assert.match(statements,/FROM\s+@SqlSynopsis\s+AS\s+S/);
  assert.match(statements,/HASHBYTES\('SHA2_256'/);
});
test("siete propuestas E4 se cotejan por identidad campo y ambos valores",()=>{
  assert.equal(rows.length,7);
  for(const r of rows){
    const q=x=>x==null?"CAST(NULL AS NVARCHAR(255))":
      "N'"+x.replace(/'/g,"''")+"'";
    const literal=`(${r.filmId}, ${q(r.title)}, ${q(r.field)}, ${q(r.expected)}, ${q(r.proposed)})`;
    assert.ok(sql.includes(literal),"Propuesta E4 no coincide: "+r.filmId+":"+r.field);
  }
  assert.match(sql,/CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4/);
});
test("cinco sinopsis se leen por ID, sin publicar el texto completo",()=>{
  assert.equal(drafts.length,5);
  for(const d of drafts)
    assert.ok(sql.includes(`(${d.filmId},N'${d.title}')`),"Falta sinopsis #"+d.filmId);
  assert.ok(sql.includes("BytesSinopsisSql"));
  assert.ok(sql.includes("Sha256SinopsisSql"));
  assert.equal(/\bAS\s+SinopsisTextoCompleto\b/.test(sql),false);
});
