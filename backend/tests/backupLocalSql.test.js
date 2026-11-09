const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseArgs, validateBackupGate, assertBackupFile, quoteSqlIdentifier, describeSqlError, verifyExistingBackup, runBackup,
} = require("../scripts/backupLocalSql");

const env = {
  NODE_ENV: "development",
  DB_DATABASE: "CRUDPeliculas",
  DB_SERVER: "localhost", DB_USER: "example", DB_PASSWORD: "not-a-secret",
  CINERD_SQL_BACKUP_CONFIRM: "YES",
};
const request = { apply: true, confirm: true, verify: false, database: "CRUDPeliculas",
  file: "D:\\SQLBackups\\CineRD-20990101-120000.bak" };

test("backup default es preview sin SQL ni archivos", () => {
  assert.deepEqual(validateBackupGate(parseArgs([]), {}), { mode: "PREVIEW" });
  assert.deepEqual(parseArgs(["--database", "CRUDPeliculas"]).apply, false);
});

test("backup no inicia sin opt-in, rol de entorno local y base exacta", () => {
  for (const [patch, envPatch] of [
    [{ confirm: false }, {}],
    [{}, { CINERD_SQL_BACKUP_CONFIRM: "" }],
    [{}, { NODE_ENV: "production" }],
    [{ database: "master" }, {}],
    [{ database: "OtraBase" }, {}],
    [{}, { DB_DATABASE: "OtraBase" }],
    [{}, { DB_PASSWORD: "" }],
    [{ file: "relative.bak" }, {}],
    [{ file: "D:\\backups\\archivo.txt" }, {}],
    [{ file: "\\\\server\\share\\abc.bak" }, {}],
  ]) {
    assert.throws(() => validateBackupGate({ ...request, ...patch }, { ...env, ...envPatch }),
      /Backup bloqueado|La base|Faltan|ruta absoluta|seguridad/i);
  }
});

test("ruta local Windows y protección ante nombres SQL maliciosos", () => {
  assert.equal(assertBackupFile("D:\\SQLBackups\\CineRD-20990101.bak"),
    "D:\\SQLBackups\\CineRD-20990101.bak");
  assert.equal(quoteSqlIdentifier("CineRD_Test"), "[CineRD_Test]");
  assert.equal(quoteSqlIdentifier("Safe]Id"), "[Safe]]Id]");
  assert.throws(() => quoteSqlIdentifier(""), /inválido/);
});

test("argumentos son explícitos y no permiten opción de restauración o destrucción", () => {
  assert.deepEqual(parseArgs([
    "--backup", "--confirm-backup", "--database", "CRUDPeliculas",
    "--file", "D:\\SQLBackups\\CineRD-20990101.bak",
  ]), { ...request, file:"D:\\SQLBackups\\CineRD-20990101.bak" });
  assert.throws(() => parseArgs(["--restore"]), /no admitido/);
  assert.throws(() => parseArgs(["--file"]), /Falta valor/);
});


function fakeBackupDb({wrongDatabase=false,wrongHeader=false}={}) {
  const events=[];
  let closed=false;
  const pool={
    request(){
      const values={};
      return {
        input(name,type,value){values[name]=value;return this;},
        async query(query) {
          events.push({query,values});
          if(query.includes("SELECT DB_NAME"))return {recordset:[{Nombre:wrongDatabase?"OtraBase":"CRUDPeliculas",Estado:"ONLINE"}]};
          if(query.startsWith("BACKUP DATABASE"))return {recordset:[]};
          if(query.startsWith("RESTORE HEADERONLY"))return {recordset:[{
            DatabaseName:wrongHeader?"OtraBase":"CRUDPeliculas",BackupType:1,Position:1,
          }]};
          if(query.startsWith("RESTORE VERIFYONLY"))return {recordset:[]};
          throw Error("Consulta inesperada: "+query);
        },
      };
    },
    async close(){closed=true;},
  };
  return {getDb:()=>({sql:{NVarChar:n=>"nvarchar("+n+")",Int:"int"},poolPromise:Promise.resolve(pool)}),
    events,closed:()=>closed};
}

test("BACKUP real utiliza COPY_ONLY CHECKSUM NOINIT y VERIFYONLY; nunca RESTORE DATABASE",async()=>{
  const db=fakeBackupDb();
  const report=await runBackup({mode:"BACKUP",database:"CRUDPeliculas",
    file:"D:\\SQLBackups\\prueba.bak"},{getDb:db.getDb});
  assert.equal(report.verified,true);
  assert.equal(report.restoreTested,false);
  assert.equal(db.closed(),true);
  assert.equal(db.events.length,4);
  assert.match(db.events[1].query,/BACKUP DATABASE \[CRUDPeliculas\]/);
  assert.match(db.events[1].query,/COPY_ONLY, CHECKSUM, NOINIT/);
  assert.match(db.events[2].query,/RESTORE HEADERONLY/);
  assert.match(db.events[3].query,/RESTORE VERIFYONLY/);
  assert.doesNotMatch(db.events.map(x=>x.query).join(" "),/RESTORE DATABASE/i);
});

test("BACKUP se bloquea si el pool apunta a otra base; cierra el pool",async()=>{
  const db=fakeBackupDb({wrongDatabase:true});
  await assert.rejects(()=>runBackup({mode:"BACKUP",database:"CRUDPeliculas",file:"D:\\bk.bak"},
    {getDb:db.getDb}),/no apunta a la base esperada/);
  assert.equal(db.events.length,1);
  assert.equal(db.closed(),true);
});

test("RESTORE VERIFYONLY no se ejecuta ni marca éxito si cabecera no coincide",async()=>{
  const db=fakeBackupDb({wrongHeader:true});
  await assert.rejects(()=>runBackup({mode:"BACKUP",database:"CRUDPeliculas",file:"D:\\bk.bak"},
    {getDb:db.getDb}),/cabecera del respaldo no corresponde/);
  assert.equal(db.events.length,3);
  assert.equal(db.closed(),true);
});


test("verificar .bak existente exige nombre de base y no solicita backup nuevo", () => {
  const args = parseArgs(["--verify-existing", "--database", "CRUDPeliculas",
    "--file", "D:\\SQLBackups\\CineRD-20990101-120000.bak"]);
  assert.deepEqual(validateBackupGate(args, env), {
    mode: "VERIFY_EXISTING",
    database: "CRUDPeliculas", file: args.file,
  });
  assert.throws(() => validateBackupGate({...args, apply: true}, env), /bloqueada/);
  assert.throws(() => validateBackupGate({...args, confirm: true}, env), /bloqueada/);
  assert.throws(() => validateBackupGate(args, {...env, NODE_ENV:"production"}), /bloqueada/);
  assert.throws(() => validateBackupGate(args, {...env, DB_DATABASE:"master"}), /La base/);
});

test("verificación existente solo usa SELECT, HEADERONLY y VERIFYONLY (sin BACKUP ni escrituras)", async () => {
  const db=fakeBackupDb();
  const report=await verifyExistingBackup({
    mode:"VERIFY_EXISTING", database:"CRUDPeliculas",
    file:"D:\\SQLBackups\\respaldo-existente.bak",
  },{getDb:db.getDb});
  assert.equal(report.verified,true);
  assert.equal(db.closed(),true);
  assert.equal(db.events.length,3);
  assert.ok(db.events.every(x=>!x.query.startsWith("BACKUP DATABASE")));
  assert.match(db.events[1].query,/RESTORE HEADERONLY/);
  assert.match(db.events[2].query,/RESTORE VERIFYONLY/);
});

test("errores SQL preservan detalles previos al mensaje 3013",()=>{
  const e=new Error("RESTORE HEADERONLY is terminating abnormally.");
  e.number=3013;
  e.precedingErrors=[Object.assign(new Error("CREATE DATABASE permission denied"),{number:262})];
  assert.match(describeSqlError(e),/SQL 3013/);
  assert.match(describeSqlError(e),/SQL 262.*CREATE DATABASE permission denied/);
});

test("verificación existente también rechaza cabecera de otra base",async()=>{
  const db=fakeBackupDb({wrongHeader:true});
  await assert.rejects(()=>verifyExistingBackup({
    mode:"VERIFY_EXISTING",database:"CRUDPeliculas",file:"D:\\bk.bak"
  },{getDb:db.getDb}),/cabecera del respaldo/);
  assert.equal(db.closed(),true);
  assert.equal(db.events.length,2);
});
