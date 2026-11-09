import {describe, expect, it} from "vitest";
import {REVISIONES_PUBLICAS, obtenerAvisoRevision} from "./revisionCatalogo";

describe("CineRD · avisos de integridad editorial pública",()=>{
  it("solo cubre ocho expedientes F-2.6 documentados",()=>{
    expect(Object.keys(REVISIONES_PUBLICAS).map(Number).sort((a,b)=>a-b))
      .toEqual([27,31,36,40,42,44,47,56]);
    expect(Object.values(REVISIONES_PUBLICAS).filter(x=>x.tipo==="fecha"))
      .toHaveLength(6);
    expect(Object.values(REVISIONES_PUBLICAS).filter(x=>x.tipo==="fecha_sin_confirmar"))
      .toHaveLength(1);
    expect(Object.values(REVISIONES_PUBLICAS).filter(x=>x.tipo==="genero"))
      .toHaveLength(1);
  });
  it("avisa de una fecha en revisión, sin presentar la propuesta como aplicada",()=>{
    const f={Id:40,Titulo:"Colao 2",FechaEstreno:"2023-12-07T00:00:00Z"};
    expect(obtenerAvisoRevision(f,"es")).toMatch(/fecha de estreno mostrada está en revisión/);
    expect(obtenerAvisoRevision(f,"en")).toMatch(/release date displayed is under editorial verification/);
    expect(obtenerAvisoRevision(f,"es")).not.toContain("2023-11-30");
  });
  it("conserva el aviso si SQL cambió, hasta revisión humana real",()=>{
    expect(obtenerAvisoRevision({
      Id:40,Titulo:"Colao 2",FechaEstreno:"2023-11-30T00:00:00Z"
    })).toMatch(/revisión/);
  });
  it("evita avisos en películas ajenas o con título incorrecto",()=>{
    expect(obtenerAvisoRevision({Id:40,Titulo:"Otra película"})).toBeNull();
    expect(obtenerAvisoRevision({Id:999,Titulo:"Colao 2"})).toBeNull();
    expect(obtenerAvisoRevision(null)).toBeNull();
  });
  it("distingue los casos retenidos por fecha y género",()=>{
    expect(obtenerAvisoRevision({Id:31,Titulo:"Entiérrenlo Parao"}))
      .toMatch(/no está confirmada como estreno comercial/);
    expect(obtenerAvisoRevision({Id:47,Titulo:"Pimp Bullies: Víctimas de un Prostíbulo"}))
      .toMatch(/clasificación de género/);
  });
});
