import { describe,it } from "node:test";
import assert from "node:assert/strict";
import { createReadinessReport } from "./reportAdSenseReadiness.mjs";
import { validateAdsActivation } from "./checkAdActivation.mjs";

describe("CineRD F-1 / no confundir cobertura con aprobación AdSense",()=>{
  it("cuenta el estado editorial y SQL actual sin falsos positivos",()=>{
    const r=createReadinessReport();
    assert.equal(r.catalogo.peliculas,46);
    assert.equal(r.catalogo.talentos,83);
    assert.equal(r.catalogo.conSinopsisRegistrada,5);
    assert.equal(r.catalogo.conSinopsisEditorialBorrador,41);
    assert.equal(r.editorial.total,58);
    assert.equal(r.editorial.aprobados+r.editorial.pendientesRevision,58);
    assert.equal(r.datosSql.correccionesPropuestas,7);
    assert.equal(r.datosSql.pendientes+r.datosSql.aplicadasEnSnapshot+r.datosSql.divergentes,7);
    assert.equal(r.derechos.autorizados+r.derechos.pendientes_o_restringidos,r.derechos.total);
  });
  it("no activa publicidad por tener CLIENT/SLOT",()=>{
    const report=createReadinessReport();
    assert.deepEqual(validateAdsActivation({
      VITE_ADSENSE_CLIENT:"ca-pub-123456",VITE_ADSENSE_SLOT:"123456",
    },report,"review"),[]);
  });
  it("bloquea una activación accidental con 58 revisiones sin completar",()=>{
    const env={VITE_ADSENSE_ENABLED:"true",VITE_ADSENSE_CLIENT:"ca-pub-123456",VITE_ADSENSE_SLOT:"123456"};
    const simulated={lanzamiento:{
      aptoParaActivacionDeAnunciosSegunDocumentos:false,
      listaDeBloqueos:["58 piezas editoriales pendientes de revisión humana",
        "7 correcciones de datos aún no aplicadas al snapshot SQL",
        "Falta cierre manual de Search Console, consentimiento, accesibilidad y estado de AdSense"],
    }};
    const errors=validateAdsActivation(env,simulated,"review");
    assert.ok(errors.some(x=>x.includes("58 piezas")));
    assert.ok(errors.some(x=>x.includes("7 correcciones")));
    assert.ok(errors.some(x=>x.includes("Search Console")));
  });
  it("rechaza modo inseguro e IDs inválidos incluso en reporte aprobado",()=>{
    const fake={lanzamiento:{aptoParaActivacionDeAnunciosSegunDocumentos:true,listaDeBloqueos:[]}};
    const errors=validateAdsActivation({VITE_ADSENSE_ENABLED:"true",VITE_ADSENSE_CLIENT:"incorrecto",VITE_ADSENSE_SLOT:""},fake,"normal");
    assert.equal(errors.length,3);
    const env={VITE_ADSENSE_ENABLED:"true",VITE_ADSENSE_CLIENT:"ca-pub-123",VITE_ADSENSE_SLOT:"123"};
    assert.deepEqual(validateAdsActivation(env,fake,"review"),[]);
  });
});
