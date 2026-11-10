/**
 * CineRD F-2.3: offline review packets for five legacy SQL synopses.
 * Default preview does not write. --film-id N --show prints a packet;
 * --film-id N --write creates it in a gitignored folder.
 * No approval, DB write, migration, deployment, or rights adjudication.
 */
const fs = require("node:fs");
const path = require("node:path");
const { fingerprint, validateDraft } = require("./prepareEditorialSqlMigration");

const root = path.resolve(__dirname, "../..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const REVIEW_DIR = path.join(root, "backend", "backups", "editorial", "review-f23");
const fail = message => { throw new Error(message); };

function collectPackets(catalog, drafts, provenance, issues, sqlSources) {
  if (!Array.isArray(catalog?.tables?.Peliculas) || drafts?.version !== 1 ||
      drafts.autoPublish !== false || !drafts.entries ||
      Array.isArray(drafts.entries) || provenance?.version !== 1 ||
      !provenance.entries || issues?.version !== 1 ||
      !Array.isArray(issues.items) || sqlSources?.version !== 1 ||
      !sqlSources.entries)
    fail("Datos de expediente F-2.3 incompletos");

  const films = catalog.tables.Peliculas.filter(f => String(f.Sinopsis ?? "").trim());
  const ids = new Set(films.map(f => String(f.Id)));
  if (films.length !== 5 || ids.size !== 5 ||
      Object.keys(drafts.entries).length !== films.length ||
      Object.keys(provenance.entries).length !== films.length)
    fail("Los cinco registros SQL no coinciden con los libros de revisión");

  return films.sort((a,b) => a.Id-b.Id).map(film => {
    const key=String(film.Id), draft=drafts.entries[key];
    validateDraft(film,draft);
    const origin=provenance.entries[key], sources=sqlSources.entries[key];
    const issueRows=issues.items.filter(x => Number(x.filmId)===film.Id && x.kind==="sinopsis");
    if (!origin || origin.filmId!==film.Id ||
        origin.reusePermissionStatus!=="sin_evidencia_registrada" ||
        !sources || sources.title!==film.Titulo || Number(sources.year)!==draft.year ||
        issueRows.length!==1 || issueRows[0].status!=="pendiente_verificacion" ||
        !Array.isArray(draft.openQuestions) || draft.openQuestions.length===0 ||
        draft.openQuestions.some(q=>typeof q!=="string" || !q.trim()))
      fail("Procedencia o incidencia no conciliada para película "+key);
    const urls=new Set(sources.fuentes.map(x=>x.url));
    if (!draft.sources.every(url=>urls.has(url)))
      fail("Fuentes no registradas para película "+key);
    return {film,draft,origin,issue:issueRows[0],fingerprint:fingerprint(film,draft)};
  });
}

function createReviewPacket({film,draft,origin,issue,fingerprint:fp}) {
  const bullet=list=>list.map(x=>"- "+x).join("\n");
  const fence=s=>"````text\n"+String(s).replace(/\r\n/g,"\n")+"\n````";
  return [
    "# CineRD — F-2.3: expediente de revisión humana",
    "",
    "**PELÍCULA:** "+film.Titulo+" ("+draft.year+") · ID "+film.Id,
    "**ESTADO:** BORRADOR / PENDIENTE — NO aprueba ni publica textos.",
    "**Huella del borrador para migración:** `"+fp+"`",
    "**Procedencia SQL:** "+origin.textOriginStatus,
    "**Permiso de reutilización registrado:** "+origin.reusePermissionStatus,
    "**Prioridad de revisión:** "+issue.priority,
    "",
    "## A. Sinopsis SQL existente — referencia histórica sin aprobación",
    "",fence(film.Sinopsis),"",
    "## B. Propuesta ES — texto candidato NO publicado",
    "",fence(draft.es),"",
    "## C. Propuesta EN — traducción candidata NO publicada",
    "",fence(draft.en),"",
    "## D. Fuentes de argumento y contexto",
    "",bullet(draft.sources),"",
    "Estas URLs no constituyen una cesión ni una licencia de reproducción.",
    "",
    "## E. Incidencias y preguntas pendientes",
    "",
    "**Observación F-2.3:** "+issue.observation,
    "",
    "**Procedencia del texto SQL:** "+origin.researchNote,
    "",bullet(draft.openQuestions),"",
    "## F. Lista del revisor humano — SIN COMPLETAR",
    "",
    "- [ ] Contrasté la trama con fuentes primarias o visionado identificado.",
    "- [ ] Verifiqué nombres, fechas, hechos y atribuciones de la versión ES.",
    "- [ ] Revisé la equivalencia y el estilo de la versión EN.",
    "- [ ] Verifiqué procedencia y originalidad del candidato.",
    "- [ ] Revisé por separado la situación jurídica del texto SQL anterior.",
    "- [ ] Comprobé reclamaciones, permisos y restricciones pendientes.",
    "- [ ] Documenté correcciones y referencias necesarias.",
    "- [ ] Decidí si corresponde solicitar autorización para una migración.",
    "",
    "**Responsable real:** [PENDIENTE]",
    "**Fecha y zona horaria:** [PENDIENTE]",
    "**Decisión motivada:** [PENDIENTE]",
    "**Evidencias/documentos:** [PENDIENTE]",
    "",
    "## G. Límites técnicos",
    "",
    "Completar esta hoja NO genera aprobaciones. Solo una revisión humana",
    "atribuida podrá documentarse posteriormente en los libros correspondientes.",
    "El preparador SQL verifica nuevamente la huella y autorización explícita.",
    "",
    "CineRD: SQL Server, snapshot, interfaz y AdSense sin cambios.",
    ""
  ].join("\n");
}

function parseArgs(argv) {
  const opts={filmId:null,show:false,write:false};
  for(let i=0;i<argv.length;i++){
    if(argv[i]==="--film-id"){
      const val=argv[++i];
      if(!val || !/^\d+$/.test(val) || Number(val)<1)
        fail("--film-id requiere un número positivo");
      opts.filmId=Number(val);
    } else if(argv[i]==="--show")opts.show=true;
    else if(argv[i]==="--write")opts.write=true;
    else fail("Argumento desconocido: "+argv[i]);
  }
  if((opts.show||opts.write) && !opts.filmId)
    fail("--show y --write requieren --film-id N");
  if(opts.show && opts.write)fail("--show y --write no se combinan");
  return opts;
}

function main(argv=process.argv.slice(2)){
  const opts=parseArgs(argv);
  const packets=collectPackets(
    read("database/seeds/catalog.snapshot.json"),
    read("docs/editorial-sql-replacement-drafts-f23.json"),
    read("docs/editorial-provenance-sql-f23.json"),
    read("docs/editorial-issues-f2.json"),
    read("docs/editorial-sources-sql-f2.json")
  );
  if(!opts.filmId){
    console.log("CineRD F-2.3 — 5 expedientes pendientes de revisión humana (SOLO LECTURA)");
    for(const row of packets)
      console.log("  #"+row.film.Id+" "+row.film.Titulo+" | "+
        row.issue.priority+" | "+row.fingerprint);
    console.log("✓ Vista previa sin archivos, aprobaciones ni SQL ejecutado.");
    return;
  }
  const row=packets.find(x=>x.film.Id===opts.filmId);
  if(!row)fail("El ID no corresponde a una sinopsis SQL pendiente");
  if(!opts.show && !opts.write){
    console.log("#"+row.film.Id+" "+row.film.Titulo+" — PENDIENTE");
    console.log("fingerprint="+row.fingerprint);
    return;
  }
  const md=createReviewPacket(row);
  if(opts.show){console.log(md);return;}
  fs.mkdirSync(REVIEW_DIR,{recursive:true});
  const target=path.join(REVIEW_DIR,"film-"+row.film.Id+"-"+row.fingerprint.slice(0,12)+".md");
  fs.writeFileSync(target,md,{flag:"wx",mode:0o600});
  console.log("✓ Expediente local: "+path.relative(root,target));
  console.log("No se aprobó ni publicó ningún texto.");
}
if(require.main===module){
  try{main()}catch(err){console.error("✗ "+err.message);process.exitCode=1;}
}
module.exports={collectPackets,createReviewPacket,parseArgs};
