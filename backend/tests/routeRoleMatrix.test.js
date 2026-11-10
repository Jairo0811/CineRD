/**
 * Integration tests of actual Express routers + real JWT middleware.
 * Controllers & SQL are stubbed to prevent any persistent writes.
 * This verifies route-level access, NOT email delivery or SQL transactions.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const jwt = require("jsonwebtoken");

const originalSecret=process.env.JWT_ACCESS_SECRET;
process.env.JWT_ACCESS_SECRET="cinerd-ci-test-secret-for-roles-only";

const ctrlPaths = [
  "authController", "accountSecurityController", "actoresController",
  "peliculasController", "actoresPeliculasController", "peliculasPerfilController",
  "peliculasTraduccionesController", "peliculaCreditosController",
  "galeriaController", "verificacionController", "solicitudesCreditoController",
];
const saved=new Map();
const handler = (req,res) => res.status(200).json({ routed: true, path: req.path });
for (const name of ctrlPaths) {
  const id=require.resolve("../src/controllers/"+name);
  saved.set(id, require.cache[id]);
  require.cache[id]={id,filename:id,loaded:true,exports:new Proxy({}, { get:()=>handler })};
}

const databaseRole=new Map([[1,"ADMINISTRADOR"],[2,"TALENTO_VERIFICADO"],[3,"USUARIO"]]);
const databaseState=new Map([[1,"ACTIVO"],[2,"ACTIVO"],[3,"ACTIVO"]]);
const databaseVersion=new Map([[1,1],[2,1],[3,1]]);
const dbPath=require.resolve("../src/config/db");
saved.set(dbPath,require.cache[dbPath]);
require.cache[dbPath]={
  id:dbPath,filename:dbPath,loaded:true,exports:{
    sql:{Int:"INT"},
    poolPromise:Promise.resolve({
      request(){
        const vars={};
        return {
          input(n,t,v){vars[n]=v;return this;},
          async query(q){
            if(q.includes("FROM dbo.Usuarios WHERE Id=@UsuarioId")) {
              const id=Number(vars.UsuarioId);
              const role=databaseRole.get(id);
              return {recordset:role?[{Rol:role,Estado:databaseState.get(id),SesionVersion:databaseVersion.get(id)}]:[]};
            }
            assert.match(q,/TU.Estado = N'ACTIVO'/);
            const ok = Number(vars.UsuarioId)===2 && Number(vars.ActorId)===11
              && databaseRole.get(2)==="TALENTO_VERIFICADO" && databaseState.get(2)==="ACTIVO";
            return {recordset:ok?[{ActorId:11}]:[]};
          },
        };
      },
    }),
  },
};

const app=express();
app.use(express.json());
app.use("/api/auth",require("../src/routes/authRoutes"));
app.use("/api/actores",require("../src/routes/actoresRoutes"));
app.use("/api/peliculas",require("../src/routes/peliculasRoutes"));
app.use("/api/actores-peliculas",require("../src/routes/actoresPeliculasRoutes"));
app.use("/api/galeria",require("../src/routes/galeriaRoutes"));
app.use("/api/verificaciones",require("../src/routes/verificacionRoutes"));
app.use("/api/solicitudes-creditos",require("../src/routes/solicitudesCreditoRoutes"));
const server=app.listen(0,"127.0.0.1");
const ready=new Promise(resolve=>server.once("listening",resolve));
const url=(p)=>"http://127.0.0.1:"+server.address().port+p;
const token=(role,id,sv=1)=>jwt.sign({id,rol:role,sv},process.env.JWT_ACCESS_SECRET,{expiresIn:"5m"});
const tAdmin=token("ADMINISTRADOR",1);
const tUser=token("USUARIO",3);
const tTalent=token("TALENTO_VERIFICADO",2);

async function call(method,path,tkn) {
  await ready;
  const response=await fetch(url(path),{
    method,headers:tkn?{Authorization:"Bearer "+tkn}:{},
  });
  return {status:response.status,body:await response.json()};
}

test("rutas reales: anónimo y usuarios sin rol no pueden mutar catálogo, galería ni revisar",async()=>{
  const endpoints=[
    ["POST","/api/peliculas"],["PUT","/api/peliculas/3"],
    ["DELETE","/api/peliculas/3"],
    ["POST","/api/actores"],["DELETE","/api/actores/11"],
    ["POST","/api/actores-peliculas"],["PUT","/api/actores-peliculas/3/11"],
    ["DELETE","/api/actores-peliculas/3/11"],
    ["POST","/api/galeria"],["PUT","/api/galeria/1"],["DELETE","/api/galeria/1"],
    ["GET","/api/verificaciones/admin/pendientes"],
    ["PATCH","/api/verificaciones/admin/1/revisar"],
    ["GET","/api/solicitudes-creditos/admin"],
    ["PATCH","/api/solicitudes-creditos/1/revision"],
  ];
  for(const [method,p] of endpoints){
    assert.equal((await call(method,p,null)).status,401, "anónimo "+method+" "+p);
    assert.equal((await call(method,p,tUser)).status,403, "USUARIO "+method+" "+p);
    assert.equal((await call(method,p,tTalent)).status,403, "TALENTO "+method+" "+p);
    assert.equal((await call(method,p,tAdmin)).status,200, "ADMIN "+method+" "+p);
  }
});

test("la ruta de edición permite ADMIN y TALENTO titular pero no otras identidades",async()=>{
  assert.equal((await call("PUT","/api/actores/11",tAdmin)).status,200);
  assert.equal((await call("PUT","/api/actores/11",tTalent)).status,200);
  assert.equal((await call("PUT","/api/actores/12",tTalent)).status,403);
  assert.equal((await call("PUT","/api/actores/11",tUser)).status,403);
  assert.equal((await call("PUT","/api/actores/11",null)).status,401);
});

test("solicitud de verificación solo USUARIO; perfil y reclamación solo TALENTO",async()=>{
  assert.equal((await call("POST","/api/verificaciones/actor/11",tUser)).status,200);
  assert.equal((await call("POST","/api/verificaciones/actor/11",tTalent)).status,403);
  assert.equal((await call("POST","/api/verificaciones/actor/11",tAdmin)).status,403);
  assert.equal((await call("GET","/api/verificaciones/mi-perfil",tTalent)).status,200);
  assert.equal((await call("GET","/api/verificaciones/mi-perfil",tUser)).status,403);
  assert.equal((await call("GET","/api/solicitudes-creditos/mias",tTalent)).status,200);
  assert.equal((await call("GET","/api/solicitudes-creditos/mias",tUser)).status,403);
  assert.equal((await call("GET","/api/solicitudes-creditos/mias",null)).status,401);
});

test("un JWT válido pierde autorización inmediatamente tras bloqueo o revocación en SQL",async()=>{
  databaseRole.set(1,"USUARIO");
  assert.equal((await call("DELETE","/api/peliculas/3",tAdmin)).status,403);
  assert.equal((await call("PUT","/api/actores/11",tAdmin)).status,403);
  databaseRole.set(1,"ADMINISTRADOR");

  databaseState.set(1,"BLOQUEADO");
  assert.equal((await call("POST","/api/galeria",tAdmin)).status,403);
  databaseState.set(1,"ACTIVO");

  databaseRole.set(2,"USUARIO");
  assert.equal((await call("PUT","/api/actores/11",tTalent)).status,403);
  assert.equal((await call("GET","/api/verificaciones/mi-perfil",tTalent)).status,403);
  databaseRole.set(2,"TALENTO_VERIFICADO");
});

test("cuenta BLOQUEADA no puede consultar rutas solo autenticadas con JWT anterior",async()=>{
  databaseState.set(3,"BLOQUEADO");
  try {
    for (const path of ["/api/auth/perfil","/api/verificaciones/mis-solicitudes"]) {
      assert.equal((await call("GET",path,tUser)).status,403,"BLOQUEADO "+path);
    }
    assert.equal((await call("GET","/api/verificaciones/mi-perfil",tUser)).status,403);
  } finally {
    databaseState.set(3,"ACTIVO");
  }
});

test("cambio de rol invalida JWT viejo incluso para rutas sin restriccion de rol",async()=>{
  databaseRole.set(3,"ADMINISTRADOR");
  try {
    assert.equal((await call("GET","/api/auth/perfil",tUser)).status,403);
    assert.equal((await call("GET","/api/verificaciones/mis-solicitudes",tUser)).status,403);
  } finally {
    databaseRole.set(3,"USUARIO");
  }
});

test("cuenta eliminada deja de autenticar con JWT existente",async()=>{
  databaseRole.delete(3);
  try {
    assert.equal((await call("GET","/api/auth/perfil",tUser)).status,403);
  } finally {
    databaseRole.set(3,"USUARIO");
  }
});

test("reset de password invalida access JWT vigente mediante version de sesion",async()=>{
  const tokenAnterior=tUser;
  databaseVersion.set(3,2);
  try {
    assert.equal((await call("GET","/api/auth/perfil",tokenAnterior)).status,403);
    assert.equal((await call("GET","/api/verificaciones/mis-solicitudes",tokenAnterior)).status,403);
    const tokenNuevo=token("USUARIO",3,2);
    assert.equal((await call("GET","/api/auth/perfil",tokenNuevo)).status,200);
    assert.equal((await call("GET","/api/verificaciones/mis-solicitudes",tokenNuevo)).status,200);
  } finally {
    databaseVersion.set(3,1);
  }
});

test("tokens sin version de sesion se rechazan durante migracion de seguridad",async()=>{
  const legado=jwt.sign({id:3,rol:"USUARIO"},process.env.JWT_ACCESS_SECRET,{expiresIn:"5m"});
  assert.equal((await call("GET","/api/auth/perfil",legado)).status,401);
});

test("token falso y expirado retornan 401; no se ejecuta controlador",async()=>{
  const expired=jwt.sign({id:1,rol:"ADMINISTRADOR"},process.env.JWT_ACCESS_SECRET,{expiresIn:-1});
  for(const bad of ["aaa.bbb.ccc",expired]) {
    assert.equal((await call("DELETE","/api/peliculas/3",bad)).status,401);
  }
});

test.after(async()=>{
  await new Promise(resolve=>server.close(resolve));
  for(const [id,previous] of saved) {
    if(previous) require.cache[id]=previous;
    else delete require.cache[id];
  }
  if(originalSecret===undefined)delete process.env.JWT_ACCESS_SECRET;
  else process.env.JWT_ACCESS_SECRET=originalSecret;
});
