import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createLocalMediaServer, readLocalMediaItems, renderLocalMediaPage } from "./previewLocalMedia.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const snapshot=JSON.parse(fs.readFileSync(path.join(root,"database/seeds/catalog.snapshot.json"),"utf8"));

describe("CineRD visor local de medios sin licencia comercial", () => {
  it("lista los originales del snapshot, sin inventar fotos ni modificar derechos", () => {
    const items=readLocalMediaItems(snapshot);
    assert.equal(items.filter(x=>x.type==="talentos").length,82);
    assert.equal(items.filter(x=>x.type==="peliculas").length,46);
    assert.equal(items.length,128);
    assert.ok(items.every(x=>x.file.startsWith("/uploads/")));
    assert.ok(items.every(x=>x.hasFile === true));
  });

  it("rechaza una ruta manipulada en la fuente de datos", () => {
    const edited=structuredClone(snapshot);
    edited.tables.Peliculas[0].Foto="/uploads/peliculas/../private/secret.jpeg";
    assert.throws(()=>readLocalMediaItems(edited),/Ruta multimedia inválida/);
  });

  it("escapa títulos y nombres HTML y advierte que no se puede publicar", () => {
    const html=renderLocalMediaPage([{
      type:"talentos",id:1,name:'<script>alert("x")</script>',
      file:"/uploads/actores/example.jpeg",hasFile:true,
    }]);
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(!html.includes('<script>alert("x")</script>'));
    assert.ok(html.includes("sin licencia comercial documentada"));
    assert.ok(html.includes("Solo revisión en esta computadora"));
  });

  it("sirve únicamente el inventario por loopback; nunca carpetas privadas ni copias de producción", async t => {
    const {server,items}=createLocalMediaServer(snapshot);
    await new Promise((resolve,reject)=>{
      server.once("error",reject);
      server.listen(0,"127.0.0.1",resolve);
    });
    t.after(()=>new Promise(resolve=>server.close(resolve)));
    assert.equal(server.address().address,"127.0.0.1");
    const host="http://127.0.0.1:"+server.address().port;
    const page=await fetch(host+"/?tipo=peliculas");
    assert.equal(page.status,200);
    assert.equal(page.headers.get("cache-control"),"no-store");
    assert.match(page.headers.get("content-security-policy"),/default-src 'none'/);
    const html=await page.text();
    assert.ok(html.includes("Películas · 46"));
    assert.ok(!html.includes("backend/private"));
    assert.ok(html.includes("Fotografías y pósteres originales"));

    const original=items.find(x=>x.hasFile&&x.type==="peliculas");
    const asset=await fetch(host+original.file,{method:"HEAD"});
    assert.equal(asset.status,200);
    assert.match(asset.headers.get("content-type"),/^image\/(jpeg|webp|png)$/);

    assert.equal((await fetch(host+"/uploads/actores/no-registrado.jpeg")).status,404);
    assert.equal((await fetch(host+"/uploads/private/evidencia.jpeg")).status,404);
    assert.equal((await fetch(host+"/", {method:"POST"})).status,405);
  });
});
