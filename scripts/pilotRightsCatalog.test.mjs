import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRightsReviewCatalog, PILOT_FILM_IDS } from "./pilotRightsCatalog.mjs";

const tables = {
  Actores: [{ Id: 7, NombreCompleto: "Actriz", Foto: "/uploads/actores/persona.jpg" }],
  Peliculas: [
    { Id: 4, Titulo: "Sanky Panky", Foto: "/uploads/peliculas/sanky.jpg", Backdrop: null },
    { Id: 16, Titulo: "Nueba Yol", Foto: "/uploads/peliculas/nueba.jpg", Backdrop: "/uploads/peliculas/nueba-backdrop.jpg" },
    { Id: 56, Titulo: "La Lucha de Ana", Foto: "/uploads/peliculas/ana.jpg" },
    { Id: 5, Titulo: "Perico Ripiao", Foto: "/uploads/peliculas/perico.jpg" },
    { Id: 52, Titulo: "Otra película", Foto: "/uploads/peliculas/otra.jpg" },
  ],
  GaleriaMultimedia: [{ Id: 40, Archivo: "/uploads/galerias/galeria.jpg" }],
};
function license(kind, filmId, path, field = "Foto", extra = {}) {
  return { file_path: path, kind, entity_id: String(filmId), field,
    status: "AUTORIZADO", rights_holder: "Titular", permission_basis: "PERMISO",
    evidence_ref: "DOCUMENTO-PRIVADO-1", commercial_use_authorized: "SI",
    license_scope: "WEB_MONETIZADA", license_until: "SIN_VENCIMIENTO",
    reviewed_on: "2026-11-07", reviewed_by: "Editor responsable", ...extra };
}

describe("CineRD / publicación individual de medios", () => {
  it("conserva los datos por defecto y las imágenes de terceros no restringidas", () => {
    const out = createRightsReviewCatalog(tables);
    assert.strictEqual(out.tables, tables);
    assert.deepEqual(out.excludedPaths, []);
  });
  it("pilot oculta los cuatro afiches sin alterar otros medios", () => {
    assert.deepEqual(PILOT_FILM_IDS, [4, 5, 16, 56]);
    const out = createRightsReviewCatalog(tables, "pilot");
    assert.equal(out.excludedPaths.length, 5);
    assert.equal(out.tables.Peliculas.find(x=>x.Id===52).Foto, "/uploads/peliculas/otra.jpg");
    assert.equal(out.tables.Actores[0].Foto, "/uploads/actores/persona.jpg");
    assert.equal(tables.Peliculas[0].Foto, "/uploads/peliculas/sanky.jpg");
  });
  it("review evita distribuir ninguna imagen sin licencia, incluida galería", () => {
    const out = createRightsReviewCatalog(tables, "review");
    assert.equal(out.excludedPaths.length, 8);
    assert.equal(out.tables.Actores[0].Foto, null);
    assert.equal(out.tables.GaleriaMultimedia[0].Archivo, null);
    assert.ok(out.tables.Peliculas.every(p=>!p.Foto&&!p.Backdrop));
  });
  it("un archivo autorizado se recupera solamente para su ficha y campo", () => {
    const allowed = license("pelicula",4,"/uploads/peliculas/sanky.jpg");
    const out = createRightsReviewCatalog(tables,"review",[allowed]);
    assert.equal(out.tables.Peliculas.find(p=>p.Id===4).Foto, allowed.file_path);
    assert.equal(out.tables.Peliculas.find(p=>p.Id===16).Foto, null);
    assert.deepEqual(out.authorizedPaths, [allowed.file_path]);
    assert.equal(out.excludedPaths.length, 7);
  });
  it("puede autorizar un talento sin autorizar una galería", () => {
    const allowed = license("talento",7,"/uploads/actores/persona.jpg");
    const out = createRightsReviewCatalog(tables,"review",[allowed]);
    assert.equal(out.tables.Actores[0].Foto, allowed.file_path);
    assert.equal(out.tables.GaleriaMultimedia[0].Archivo, null);
  });
  it("un permiso de Foto no autoriza Backdrop", () => {
    const allowed = license("pelicula",16,"/uploads/peliculas/nueba.jpg");
    const out = createRightsReviewCatalog(tables,"pilot",[allowed]);
    assert.equal(out.tables.Peliculas.find(p=>p.Id===16).Foto,allowed.file_path);
    assert.equal(out.tables.Peliculas.find(p=>p.Id===16).Backdrop,null);
  });
  it("rechaza permisos asignados a otra entidad, caducados y rutas inseguras", () => {
    assert.throws(()=>createRightsReviewCatalog(tables,"review",[
      license("pelicula",5,"/uploads/peliculas/sanky.jpg")
    ]),/incorrecto/);
    assert.throws(()=>createRightsReviewCatalog(tables,"review",[
      license("pelicula",4,"/uploads/peliculas/sanky.jpg","Foto",{license_until:"2020-01-01"})
    ]),/vencida/);
    assert.throws(()=>createRightsReviewCatalog({Peliculas:[{Id:4,Foto:"/uploads/peliculas/../private.jpg"}]},
      "review"),/insegura/);
    assert.throws(()=>createRightsReviewCatalog(tables,"invalid"),/inválido/);
  });
  it("RETIRAR y RESTRINGIDO ocultan imágenes también en modo normal", () => {
    const out = createRightsReviewCatalog(tables,"",[
      license("talento",7,"/uploads/actores/persona.jpg","Foto",{status:"RETIRAR"}),
      license("pelicula",52,"/uploads/peliculas/otra.jpg","Foto",{status:"RESTRINGIDO"}),
    ]);
    assert.equal(out.tables.Actores[0].Foto,null);
    assert.equal(out.tables.Peliculas.find(p=>p.Id===52).Foto,null);
  });
});
