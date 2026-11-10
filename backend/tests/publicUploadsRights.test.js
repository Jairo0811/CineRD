const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {
  safePath,createRightsAuthorizer,createPublicUploadGuard
}=require("../src/middlewares/publicUploadsRights");

function run(guard,url) {
  return new Promise(resolve=>{
    const res={statusCode:200,status(code){this.statusCode=code;return this;},
      end(){resolve({allowed:false,status:this.statusCode})}};
    guard({path:url},res,()=>resolve({allowed:true,status:res.statusCode}));
  });
}
const movie="/uploads/peliculas/1783263938713-Foto.jpeg";

test("public uploads: las rutas se limitan a medios del inventario",()=>{
  assert.equal(safePath(movie),true);
  assert.equal(safePath("/uploads/actores/personal.webp"),true);
  for(const p of [
    "/uploads/../secrets","/uploads/private/evidence.pdf",
    "/uploads/peliculas/..hidden","/uploads/peliculas/example/extra.png",
    "/uploads/actores/photo%2Ejpg","/uploads/peliculas/a\\b.jpg",
    "/admin/backup.bak"
  ])assert.equal(safePath(p),false,p);
});

test("public uploads: en producción niega rutas sin licencia y fallos del verificador",async()=>{
  const denied=createPublicUploadGuard({nodeEnv:"production",authorizePath:async()=>false});
  assert.deepEqual(await run(denied,"/peliculas/no-license.jpg"),
    {allowed:false,status:404});
  const broken=createPublicUploadGuard({nodeEnv:"production",authorizePath:async()=>{throw Error("ledger error")}});
  assert.deepEqual(await run(broken,"/actores/missing.jpg"),
    {allowed:false,status:404});
});

test("public uploads: solo permite el archivo de ruta exactamente autorizada",async()=>{
  const allowed=createPublicUploadGuard({
    nodeEnv:"production",authorizePath:async resource=>resource===movie
  });
  assert.deepEqual(await run(allowed,"/peliculas/1783263938713-Foto.jpeg"),{allowed:true,status:200});
  assert.deepEqual(await run(allowed,"/peliculas/1783263938713-Foto.jpeg.bak"),{allowed:false,status:404});
});

test("public uploads: desarrollo local mantiene el comportamiento previo",async()=>{
  const dev=createPublicUploadGuard({nodeEnv:"development",authorizePath:async()=>false});
  assert.deepEqual(await run(dev,"/peliculas/foto.jpg"),{allowed:true,status:200});
});

test("public uploads: el registro real de CineRD no autoriza todavía imágenes",async()=>{
  const authorize=createRightsAuthorizer();
  // El ledger actual registra las 128 imágenes como PENDIENTE.
  assert.equal(await authorize(movie),false);
  assert.equal(await authorize("/uploads/private/secret.txt"),false);
});

test("public uploads: una autorización validada se reevalúa cuando cambia el inventario",async()=>{
  let stamp=1,valid=true,loads=0;
  const row={file_path:movie,status:"AUTORIZADO"};
  const mockFs={
    statSync(){return {mtimeMs:stamp,size:100,isFile:()=>true}},
    readFileSync(f){return String(f).endsWith(".csv")?"CSV":"{}"}
  };
  const authorize=createRightsAuthorizer({
    fsApi:mockFs,csvFile:"rights.csv",catalogFile:"catalog.json",
    loadTools:async()=>{loads++;return {
      readCsv:()=>[row],
      auditRows:()=>({errors:[]}),
      isEffectiveCommercialLicense:()=>valid
    }}
  });
  assert.equal(await authorize(movie),true);
  assert.equal(loads,1);
  valid=false;
  assert.equal(await authorize(movie),false);
  assert.equal(loads,1);
  stamp++;
  assert.equal(await authorize(movie),false);
  assert.equal(loads,2);
});

test("public uploads: inconsistencias del registro fuerzan denegación",async()=>{
  const authorize=createRightsAuthorizer({
    fsApi:{
      statSync(){return {mtimeMs:1,size:55,isFile:()=>true}},
      readFileSync(p){return p.endsWith(".csv")?"CSV":"{}"}
    },
    csvFile:"rights.csv",catalogFile:"catalog.json",
    loadTools:async()=>({
      readCsv:()=>[{file_path:movie,status:"AUTORIZADO"}],
      auditRows:()=>({errors:["unlicensed"]}),
      isEffectiveCommercialLicense:()=>true
    })
  });
  await assert.rejects(()=>authorize(movie),/inconsistente/);
});
