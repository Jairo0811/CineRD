const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("bootstrap de esquema Azure no cambia base ni crea DB o datos",()=>{
  const sql=fs.readFileSync(path.join(__dirname,"../../database/scripts/azure_schema_bootstrap.sql"),"utf8");
  const active=sql.replace(/\/\*[\s\S]*?\*\//g,"").replace(/--[^\r\n]*/g,"");
  for(const forbidden of [
    /^\s*USE\b/gim,
    /\bCREATE\s+DATABASE\b/gim,
    /\bDROP\s+DATABASE\b/gim,
    /^\s*(?:UPDATE|INSERT|DELETE|MERGE)\b/gim,
    /\bBACKUP\s+DATABASE\b/gim
  ]) assert.doesNotMatch(active,forbidden);
  for(const required of ["dbo.Actores","dbo.Peliculas","dbo.ActoresPeliculas","DB_NAME()"])
    assert.ok(sql.includes(required),required);
  assert.match(sql,/THROW 51051/);
  assert.match(sql,/\bGO\b/);
});

test("bootstrap no es una migración automática del runner",()=>{
  const fs=require("node:fs");
  const p=path.join(__dirname,"../../database/migrations");
  const names=fs.readdirSync(p).filter(x=>/^\d{3}_.*\.sql$/i.test(x));
  assert.equal(names.length,15);
  assert.ok(!names.some(x=>x.includes("bootstrap")));
});
