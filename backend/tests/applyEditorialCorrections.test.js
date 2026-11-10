const {test}=require("node:test");
const assert=require("node:assert/strict");
const ledger=require("../../docs/catalog-corrections-e4.json");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const {validate}=require("../scripts/applyEditorialCorrections");

test("E-4: 7 ajustes y 4 obras respaldados en el snapshot",()=>{
  const all=validate(ledger,snapshot);
  assert.equal(all.length,7);
  assert.deepEqual([...new Set(all.map(x=>x.filmId))].sort((a,b)=>a-b),[9,24,30,32]);
});
test("E-4: rechaza datos modificados, campos fuera de alcance y duplicados",()=>{
  const duplicate={...ledger,rows:[...ledger.rows,ledger.rows[0]]};
  assert.throws(()=>validate(duplicate,snapshot),/duplicada/);
  // E-4 permite snapshots ya corregidos: el catálogo actual tiene Comedia.
  // Para verificar la preimagen mutada, partimos del estado original Infantil.
  const historical=structuredClone(snapshot);
  historical.tables.Peliculas.find(p=>p.Id===9).Genero="Infantil";
  assert.equal(validate(ledger,historical).length,7);
  const mutated={...ledger,rows:[{...ledger.rows[0],expected:"Drama"},...ledger.rows.slice(1)]};
  assert.throws(()=>validate(mutated,historical),/difiere/);
  // La misma defensa debe detectar un tercer valor no autorizado incluso
  // cuando las siete propuestas ya figuran en el snapshot exportado.
  const drifted=structuredClone(snapshot);
  drifted.tables.Peliculas.find(p=>p.Id===9).Genero="Thriller";
  assert.throws(()=>validate(ledger,drifted),/difiere/);
  const unsafe={...ledger,rows:[{...ledger.rows[0],field:"Foto"},...ledger.rows.slice(1)]};
  assert.throws(()=>validate(unsafe,snapshot),/inválido/);
});
