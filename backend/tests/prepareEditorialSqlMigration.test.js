const {test}=require("node:test");
const assert=require("node:assert/strict");
const {
  fingerprint,validateDraft,validateApproval,sqlScript,createBundle,parseArgs,
}=require("../scripts/prepareEditorialSqlMigration");
const film={Id:55,Titulo:"El Plan Perfecto",FechaEstreno:"2017-01-17T00:00:00.000Z",
  Sinopsis:"Los trabajadores del almacén dicen: 'no'.\r\nOtra línea."};
const draft={
  filmId:55,title:film.Titulo,year:2017,status:"pendiente_revision",
  deployment:"manual_only",reviewedBy:null,reviewedAt:null,
  es:"Unos empleados de un almacén de Santo Domingo enfrentan una reorganización inesperada del negocio, nuevas amenazas y una cadena de conflictos que ponen en riesgo su estabilidad. La historia sigue sus decisiones ante un entorno cada vez más complicado.",
  en:"Workers at a Santo Domingo warehouse confront an unexpected change of management and growing uncertainty. As new threats emerge, their livelihoods become vulnerable and they must find a way to protect their interests during the turmoil.",
  sources:["https://cinemadominicano.com/el-plan-perfecto-2017/"]
};
const approval=()=>({
  filmId:55,status:"aprobado",fingerprint:fingerprint(film,draft),
  reviewer:"Revisión Editorial Ejemplo",reviewedAt:"2026-11-07T19:00:00-04:00",
  sourcesChecked:true,esReviewed:true,enReviewed:true,
  originalityReviewed:true,rightsReviewed:true,releaseAuthorized:true,
  notes:"Se verificó la autoría de la redacción y su adaptación bilingüe."
});
test("F-2.3 preview de borrador sin aprobación no concede autorización",()=>{
  assert.equal(validateDraft(film,draft),true);
  assert.throws(()=>createBundle(film,draft,null),/aprobacion humana/i);
});
test("F-2.3 cambio en cualquier texto, fuentes o SQL invalida la huella",()=>{
  const fp=fingerprint(film,draft);
  assert.notEqual(fp,fingerprint(film,{...draft,en:draft.en+" Extra."}));
  assert.notEqual(fp,fingerprint(film,{...draft,sources:[...draft.sources,"https://example.org"]}));
  assert.notEqual(fp,fingerprint({...film,Sinopsis:film.Sinopsis+"."},draft));
  assert.throws(()=>validateApproval(film,{...draft,es:draft.es+"."},approval()),/huella/i);
});
test("F-2.3 aprobación atribuida genera UP y DOWN transaccionales reversibles",()=>{
  const bundle=createBundle(film,draft,approval());
  assert.match(bundle.up,/BEGIN TRANSACTION/);
  assert.match(bundle.up,/COMMIT TRANSACTION/);
  assert.match(bundle.up,/ROLLBACK TRANSACTION/);
  assert.match(bundle.up,/CONVERT\(VARBINARY\(MAX\),@actual\)/);
  assert.match(bundle.up,/UPDATE dbo.Peliculas SET Sinopsis=@replacement WHERE Id=@id/);
  assert.match(bundle.up,/N'Los trabajadores del almacén dicen: ''no''\./);
  assert.match(bundle.down,/N'Unos empleados de un almacén/);
  assert.match(bundle.down,/N'Los trabajadores del almacén dicen: ''no''\./);
  assert.equal(bundle.meta.filmId,55);
});
test("F-2.3 fuente no humana no puede generar scripts",()=>{
  const a=approval();a.reviewer="";assert.throws(()=>createBundle(film,draft,a),/revisor/i);
  const b=approval();b.releaseAuthorized=false;assert.throws(()=>createBundle(film,draft,b),/releaseAuthorized/);
  const c=approval();c.notes="ok";assert.throws(()=>createBundle(film,draft,c),/justificacion/);
});
test("F-2.3 rechazo de mutación de identidad, estado y SQL idéntico",()=>{
  assert.throws(()=>validateDraft({...film,Titulo:"Otro"},draft),/Identidad/);
  assert.throws(()=>validateDraft(film,{...draft,deployment:"auto"}),/revision manual/);
  assert.throws(()=>validateDraft(film,{...draft,es:film.Sinopsis}),/textos ES\/EN/);
});
test("F-2.3 CLI exige id numérico y copia de seguridad",()=>{
  assert.deepEqual(parseArgs(["--film-id","55"]),{generate:false,filmId:55,backupFile:null});
  assert.deepEqual(parseArgs(["--generate","--film-id","55","--backup-file","C:\\sql\\copia.bak"]),
    {generate:true,filmId:55,backupFile:"C:\\sql\\copia.bak"});
  assert.throws(()=>parseArgs(["--film-id","../55"]),/invalido/);
  assert.throws(()=>parseArgs(["--apply"]),/Argumento desconocido/);
});
test("F-2.3 libro real inicia vacío y ninguna aprobación es inventada",()=>{
  const ledger=require("../../docs/editorial-sql-migration-approvals-f23.json");
  assert.equal(ledger.version,1);
  assert.deepEqual(ledger.approvals,[]);
});
