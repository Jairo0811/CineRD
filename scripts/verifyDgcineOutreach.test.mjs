import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readCsv } from "./verifyMediaRightsLedger.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const snapshot=load("database/seeds/catalog.snapshot.json").tables.Peliculas;
const matrix=load("docs/dgcine-afiches-contactos-46.json");
const rights=readCsv(fs.readFileSync(path.join(root,"docs/media-rights-ledger.csv"),"utf8"));

test("DGCINE: las 46 películas corresponden a los IDs/títulos/afiches del snapshot",()=>{
  assert.equal(matrix.version,1);
  assert.equal(snapshot.length,46);
  assert.equal(matrix.filas.length,snapshot.length);
  assert.equal(new Set(matrix.filas.map(x=>x.filmId)).size,46);
  const catalogue=new Map(snapshot.map(f=>[f.Id,f]));
  for(const x of matrix.filas){
    const f=catalogue.get(x.filmId);
    assert.ok(f,"Película ajena al catálogo: "+x.filmId);
    assert.equal(x.titulo,f.Titulo);
    assert.equal(x.posterEnLedger,f.Foto??null);
    assert.equal(x.productoraSegunCatalogo,f.Productora??null);
  }
});

test("DGCINE: el contacto candidato no se confunde con titularidad ni permiso",()=>{
  for(const x of matrix.filas){
    assert.equal(x.titularAfiche,"NO_IDENTIFICADO");
    assert.equal(x.derechosReproduccion,"NO_AUTORIZADOS");
    assert.equal(x.permisoUsoWebComercial,false);
    assert.equal(x.solicitudEstado,"NO_ENVIADA");
    assert.equal(x.solicitudFecha,null);
    assert.equal(x.respuesta,null);
    assert.equal(x.evidenciaPrivadaRef,null);
  }
  assert.equal(matrix.estado,"INVESTIGACION_NO_CONTACTADA");
});

test("DGCINE: fuentes, contactos e identidades tienen trazabilidad y advertencias",()=>{
  const leads=matrix.contactosPublicosCandidatos;
  const candidateKeys=Object.keys(leads);
  assert.ok(candidateKeys.length>=3,"Se esperaban contactos independientes de DGCINE/corporativo");
  for(const [key,lead] of Object.entries(leads)){
    assert.match(lead.directoryUrl,/^https:\/\//,"URL no segura en "+key);
    assert.match(lead.publicEmail,/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    assert.equal(lead.legalIdentityVerified,false);
    assert.equal(lead.authorizationCapacityVerified,false);
    assert.equal(lead.emailDeliverabilityVerified,false);
    assert.ok(lead.identificationCaveat.length>25);
  }
  for(const x of matrix.filas){
    for(const k of x.contactosCandidatos)assert.ok(leads[k],"Contacto inexistente "+k);
    if(x.estadoAsociacion==="FUENTE_DGCINE_PELICULA"){
      assert.ok(x.productorasCorroboradasPorDgcine.length>0);
      assert.ok(x.fuentesAsociacionProduccion.length>0);
      for(const url of x.fuentesAsociacionProduccion)
        assert.match(url,/^https:\/\/dgcine\.gob\.do\//);
    }
  }
});

test("DGCINE: las 46 rutas de afiches siguen en ledger sin permiso",()=>{
  const indexed=new Map(rights.map(x=>[x.file_path,x]));
  assert.equal(rights.length,128);
  for(const x of matrix.filas){
    assert.ok(x.posterEnLedger,"Falta ruta de afiche en "+x.filmId);
    const row=indexed.get(x.posterEnLedger);
    assert.ok(row,"Afiche sin trazabilidad: "+x.filmId);
    assert.equal(row.kind,"pelicula");
    assert.equal(row.entity_id,String(x.filmId));
    assert.equal(row.status,"PENDIENTE");
    assert.notEqual(row.commercial_use_authorized,"SI");
  }
});

test("DGCINE: cobertura de fuentes oficiales y próximos pasos por las 46 películas",()=>{
  assert.equal(matrix.filas.filter(x=>x.productoraSegunCatalogo).length,29);
  assert.equal(matrix.filas.filter(x=>x.productorasCorroboradasPorDgcine.length).length,6);
  assert.equal(matrix.filas.filter(x=>x.contactosCandidatos.length).length,11);
  for(const x of matrix.filas) assert.ok(x.siguienteAccion?.trim());
  assert.ok(!matrix.contactosPublicosCandidatos.PANAMERICANA_DGCINE.authorizationCapacityVerified);
});
