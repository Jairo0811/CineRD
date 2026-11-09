/**
 * CineRD — paquete privado de revisión E-4 (7) / E-5 (58).
 * Las casillas permanecen vacías; nunca crea aprobaciones o cambia SQL.
 * node scripts/prepareClosureEditorial.mjs
 * node scripts/prepareClosureEditorial.mjs --create
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inventory } from "./editorialReviewAudit.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const privateFile=path.join(root,"backend/private/editorial/CIERRE_E4_E5_REVISION_HUMANA.md");
const priority={alta:0,media:1,baja:2};
const text=x=>String(x??"").replace(/[\r\n|]/g," ").trim();

export function buildEditorialPacket({changes,items,issues,approvedE4=[],approvedE5=[]}) {
  if(!Array.isArray(changes)||!Array.isArray(items)||!Array.isArray(issues)||
      !Array.isArray(approvedE4)||!Array.isArray(approvedE5)) {
    throw Error("Los documentos editoriales deben incluir los arreglos exigidos");
  }
  const e4Keys=new Set(changes.map(x=>x.filmId+":"+x.field));
  const e5Keys=new Set(items.map(x=>x.filmId+":"+x.kind));
  if(e4Keys.size!==changes.length||e5Keys.size!==items.length)
    throw Error("Propuestas E-4 o piezas E-5 duplicadas");
  const byIssue=new Map(issues.map(i=>[i.filmId+":"+i.kind,i]));
  if(byIssue.size!==issues.length||items.length!==issues.length)
    throw Error("La matriz F-2.3 no coincide con inventario E-5");
  if(!changes.every(x=>Number.isInteger(x.filmId)&&x.title&&x.field&&Array.isArray(x.sources))||
     !items.every(x=>x.fingerprint&&byIssue.has(x.filmId+":"+x.kind))) {
    throw Error("Faltan identidades u observaciones editoriales");
  }
  const signedE4=new Set(approvedE4.map(x=>x.filmId+":"+x.field));
  const signedE5=new Set(approvedE5.map(x=>x.filmId+":"+x.kind));
  const pendingE4=changes.filter(x=>!signedE4.has(x.filmId+":"+x.field));
  const pendingE5=items.filter(x=>!signedE5.has(x.filmId+":"+x.kind));
  const lines=[
    "# CineRD — cola de revisión HUMANA E-4 y E-5",
    "",
    "Documento privado de trabajo. TODAS las casillas están sin marcar.",
    "Este archivo no constituye aprobación ni prueba de derechos; nunca altera",
    "los libros de decisiones ni el catálogo SQL.",
    "",
    "## Resumen",
    "",
    "- Cambios E-4 pendientes: "+pendingE4.length+" / "+changes.length,
    "- Piezas E-5 pendientes: "+pendingE5.length+" / "+items.length,
    "- Los derechos comerciales de 128 imágenes antiguas se gestionan aparte.",
    "",
    "## E-4 — datos del catálogo, sin aplicar cambios SQL",
    "",
  ];
  for(const c of pendingE4) {
    lines.push("### [ ] "+c.filmId+" · "+text(c.title)+" — "+c.field);
    lines.push("");
    lines.push("- Valor actual: "+text(c.expected));
    lines.push("- Propuesta: "+text(c.proposed));
    if(c.field==="FechaEstreno")lines.push("- Confirmar criterio: estreno comercial en cines dominicanos (no premiere)");
    for(const source of c.sources)lines.push("- Fuente por comprobar: "+source);
    lines.push("- [ ] Hechos y fuentes contrastados manualmente");
    lines.push("- [ ] Nombre, fecha y significado del campo validados");
    lines.push("- [ ] Decisión humana registrada de forma atribuida en el libro E-4");
    lines.push("- Revisor: __________ Fecha/zona: __________ Evidencia/Notas: __________");
    lines.push("");
  }
  lines.push("## E-5 — sinopsis y contextos, sin aprobación automática","");
  const sorted=pendingE5.map(i=>({...i,issue:byIssue.get(i.filmId+":"+i.kind)}))
    .sort((a,b)=>(priority[a.issue.priority]??9)-(priority[b.issue.priority]??9) ||
      a.filmId-b.filmId || a.kind.localeCompare(b.kind));
  for(const item of sorted) {
    lines.push("### [ ] "+item.filmId+" · "+text(item.titulo)+" — "+item.kind+" ("+item.issue.priority+")");
    lines.push("");
    lines.push("- Estado: "+text(item.issue.status));
    lines.push("- Observación: "+text(item.issue.observation));
    lines.push("- Informe: "+text(item.issue.sourceReport));
    lines.push("- Fingerprint SHA-256 de la pieza vigente: "+item.fingerprint);
    lines.push("- Fuentes: "+item.fuentes+" / caracteres ES: "+item.caracteresEs+" / EN: "+item.caracteresEn);
    if(item.faltanFuentes)lines.push("- ADVERTENCIA: no hay fuente HTTPS registrada");
    lines.push("- [ ] Revisar trama y hechos en fuente primaria");
    lines.push("- [ ] Revisar los textos ES/EN y sus inferencias");
    lines.push("- [ ] Revisar derechos, atribución y versión publicada");
    lines.push("- [ ] Registrar decisión humana atribuida en el libro E-5");
    lines.push("- Revisor: __________ Fecha/zona: __________ Evidencia/Notas: __________");
    lines.push("");
  }
  return {markdown:lines.join("\n")+"\n",
    summary:{e4Total:changes.length,e4Pending:pendingE4.length,e5Total:items.length,
      e5Pending:pendingE5.length,highPriority:sorted.filter(x=>x.issue.priority==="alta").length}};
}

export function writePrivatePacket(file,markdown) {
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,markdown,{encoding:"utf8",flag:"wx",mode:0o600});
  return file;
}

function main(argv=process.argv.slice(2)) {
  if(argv.length>1||argv.some(a=>!["--show","--create"].includes(a)))throw Error("Solo --show o --create");
  const {markdown,summary}=buildEditorialPacket({
    changes:read("docs/catalog-corrections-e4.json").rows,
    items:inventory(),
    issues:read("docs/editorial-issues-f2.json").items,
    approvedE4:read("docs/catalog-corrections-e4-approvals.json").approvals,
    approvedE5:read("docs/editorial-approvals-e5.json").approvals,
  });
  if(argv.includes("--create")) {
    console.log("Paquete privado creado: "+writePrivatePacket(privateFile,markdown));
  } else {
    console.log(JSON.stringify({...summary,status:"AWAITING_HUMAN_REVIEW",
      sqlApplied:false,approvalsCreated:false,privatePacketExists:fs.existsSync(privateFile)},null,2));
    console.log("Generar cola privada: node scripts/prepareClosureEditorial.mjs --create");
  }
  return summary;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{main();}catch(e){console.error("Cierre E-4/E-5: "+e.message);process.exitCode=1;}
}
export {main};
