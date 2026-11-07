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
  const mutated={...ledger,rows:[{...ledger.rows[0],expected:"Drama"},...ledger.rows.slice(1)]};
  assert.throws(()=>validate(mutated,snapshot),/difiere/);
  const unsafe={...ledger,rows:[{...ledger.rows[0],field:"Foto"},...ledger.rows.slice(1)]};
  assert.throws(()=>validate(unsafe,snapshot),/inválido/);
});
