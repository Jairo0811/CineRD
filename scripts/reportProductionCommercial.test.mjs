import {test} from "node:test";
import assert from "node:assert/strict";
import {
  parseArgs,makeReport,inspectApi,inspectPublicSite,validateOrigin,
  commercialGate
} from "./reportProductionCommercial.mjs";

const mockJson=(data,status=200)=>({
  ok:status>=200&&status<300,status,
  headers:{get:()=> "application/json; charset=utf-8"},
  json:async()=>data
});
function goodFetch(url) {
  if(url.endsWith("/demo/deploy-status.json"))
    return Promise.resolve(mockJson({
      format:"CineRD.PublicDemoDeploy",mediaRightsMode:"review",
      mediaFilesCopied:0,sourceCommit:"cb2480d"
    }));
  if(url.endsWith("/demo/catalog.json"))
    return Promise.resolve(mockJson({
      format:"CineRD.PublicDemoCatalog",
      tables:{Peliculas:Array.from({length:46},()=>({Foto:null,Backdrop:null})),
        Actores:Array.from({length:83},()=>({Foto:null})),
        GaleriaMultimedia:[]}
    }));
  if(url.endsWith("/health"))
    return Promise.resolve(mockJson({status:"ok",service:"cinerd-api"}));
  if(url.endsWith("/ready"))
    return Promise.resolve(mockJson({status:"ready",database:"ok"}));
  throw Error("URL unexpected: "+url);
}

test("F-3/F-4: informe real offline mantiene los anuncios bloqueados",async()=>{
  const r=await makeReport({env:{},online:false});
  assert.equal(r.production.status,"CODE_READY");
  assert.equal(r.production.publicSite.status,"NOT_CHECKED");
  assert.equal(r.production.api.status,"NOT_CONFIGURED");
  assert.equal(r.monetization.adSenseStatus,"BLOCKED");
  assert.equal(r.monetization.documentaryAdSenseReadiness,false);
  assert.equal(r.publicationReady,false);
  assert.equal(r.adsEnabledByThisTool,false);
  assert.equal(r.currentCatalog.films,46);
  assert.equal(r.currentCatalog.people,83);
  assert.ok(r.monetization.blockers.some(s=>s.includes("128 archivos")));
});

test("F-3: prueba de sitio público exige review y cero medios sin licencia",async()=>{
  const s=await inspectPublicSite({fetchImpl:goodFetch});
  assert.equal(s.status,"PASS");
  assert.equal(s.mediaFilesCopied,0);
  await assert.rejects(()=>inspectPublicSite({
    fetchImpl:async url=>{
      const response=await goodFetch(url);
      if(url.endsWith("/demo/deploy-status.json"))return mockJson({
        format:"CineRD.PublicDemoDeploy",mediaRightsMode:"normal",
        mediaFilesCopied:128
      });
      return response;
    }
  }),/modo review/);
});

test("F-3: rechaza catálogo público con archivos sin permiso",async()=>{
  await assert.rejects(()=>inspectPublicSite({
    fetchImpl:async url=>{
      if(url.endsWith("/demo/deploy-status.json"))return mockJson({
        format:"CineRD.PublicDemoDeploy",mediaRightsMode:"review",mediaFilesCopied:1
      });
      return goodFetch(url);
    }
  }),/más medios que las licencias/);
});

test("F-3: API real solo pasa si /health y /ready confirman SQL",async()=>{
  const p=await inspectApi({url:"https://api.cinerd.example",fetchImpl:goodFetch});
  assert.equal(p.status,"PASS");
  assert.equal(p.database,"ok");
  await assert.rejects(()=>inspectApi({
    url:"https://api.cinerd.example",
    fetchImpl:async url=>url.endsWith("/ready") ?
      mockJson({status:"not-ready",database:"unavailable"},503):goodFetch(url)
  }),/HTTP 503/);
});

test("F-3: solo acepta orígenes HTTPS sin rutas o secretos",()=>{
  assert.equal(validateOrigin("https://api.cinerd.example/"),"https://api.cinerd.example");
  for(const u of [
    "http://api.cinerd.example",
    "https://u:p@api.cinerd.example",
    "https://api.cinerd.example/path",
    "https://localhost",
    "https://127.0.0.1",
    "https://api.cinerd.example?token=test"
  ])assert.throws(()=>validateOrigin(u));
});

test("F-3: en simulación online Cloudflare/API aprobadas no certifican producción",async()=>{
  const report=await makeReport({
    online:true,fetchImpl:goodFetch,env:{CINERD_API_ORIGIN:"https://api.cinerd.example"}
  });
  assert.equal(report.production.publicSite.status,"PASS");
  assert.equal(report.production.api.status,"PASS");
  assert.equal(report.publicationReady,false);
  assert.equal(report.monetization.adSenseStatus,"BLOCKED");
  assert.ok(report.blockers.some(b=>b.includes("backup SQL restaurado")));
});

test("F-3: sin API configurada jamás interpreta un sitio estático como backend listo",async()=>{
  const report=await makeReport({online:true,fetchImpl:goodFetch,env:{}});
  assert.equal(report.production.publicSite.status,"PASS");
  assert.equal(report.production.api.status,"NOT_CONFIGURED");
  assert.ok(report.blockers.some(b=>b.includes("API real")));
});

test("F-4: ni un informe documental simulado concede aprobación comercial",()=>{
  const gate=commercialGate({
    lanzamiento:{listaDeBloqueos:[],aptoParaActivacionDeAnunciosSegunDocumentos:true},
    derechos:{pendientes_o_restringidos:0}
  },{VITE_ADSENSE_ENABLED:"true"});
  assert.equal(gate.googleApprovalVerifiedByThisReport,false);
  assert.equal(gate.adSenseStatus,"BLOCKED");
  assert.equal(gate.adsRequestedByEnvironment,true);
});

test("F-3/F-4: rechaza opciones extra y distingue reporte de verificación",()=>{
  assert.deepEqual(parseArgs([]),{online:false,json:false,strict:false});
  assert.deepEqual(parseArgs(["--online","--strict"]),{online:true,json:false,strict:true});
  assert.throws(()=>parseArgs(["--apply"]),/Uso/);
  assert.throws(()=>parseArgs(["--online","--online"]),/Uso/);
});
