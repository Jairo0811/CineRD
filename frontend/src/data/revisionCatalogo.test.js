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
  it("retira el aviso de Colao 2 solo cuando la fecha aprobada está publicada",()=>{
    expect(REVISIONES_PUBLICAS[40].fechaActual).toBe("2023-12-07");
    expect(REVISIONES_PUBLICAS[40].fechaAprobada).toBe("2023-11-30");
    expect(obtenerAvisoRevision({
      Id:40,Titulo:"Colao 2",FechaEstreno:"2023-11-30T00:00:00Z"
    },"es")).toBeNull();
    expect(obtenerAvisoRevision({
      Id:40,Titulo:"Colao 2",FechaEstreno:"2023-11-30T00:00:00Z"
    },"en")).toBeNull();
    expect(obtenerAvisoRevision({
      Id:40,Titulo:"Colao 2",FechaEstreno:"2023-12-01T00:00:00Z"
    },"es")).toMatch(/revisión/);
  });
  it("las cuatro fechas F23 con respaldo mantienen aviso antiguo y lo retiran con la aprobada",()=>{
    const rows=[
      [27,"Lotoman 003: Volando Bajito","2014-03-15","2014-03-27"],
      [42,"Andrea","2005-08-16","2005-08-18"],
      [44,"Playball","2008-02-01","2008-02-14"],
      [56,"La Lucha de Ana","2012-04-13","2012-05-24"]
    ];
    for(const [Id,Titulo,previous,approved] of rows){
      expect(REVISIONES_PUBLICAS[Id].fechaActual).toBe(previous);
      expect(REVISIONES_PUBLICAS[Id].fechaAprobada).toBe(approved);
      expect(obtenerAvisoRevision({Id,Titulo,FechaEstreno:previous+"T00:00:00.000Z"},"es"))
        .toMatch(/revisión editorial/);
      expect(obtenerAvisoRevision({Id,Titulo,FechaEstreno:approved+"T00:00:00.000Z"},"es")).toBeNull();
      expect(obtenerAvisoRevision({Id,Titulo,FechaEstreno:approved+"T00:00:00.000Z"},"en")).toBeNull();
      expect(obtenerAvisoRevision({Id,Titulo,FechaEstreno:"2000-01-01T00:00:00.000Z"},"es"))
        .toMatch(/revisión editorial/);
    }
  });
  it("Nueba Yol 3 mantiene advertencia histórica incluso con fecha aprobada",()=>{
    const Id=36,Titulo="Nueba Yol 3: Bajo la Nueva Ley";
    expect(REVISIONES_PUBLICAS[36].fechaAprobada).toBe("1997-10-23");
    expect(REVISIONES_PUBLICAS[36].evidenciaIndependientePendiente).toBe(true);
    for(const FechaEstreno of ["1997-10-31T00:00:00Z","1997-10-23T00:00:00Z"]){
      expect(obtenerAvisoRevision({Id,Titulo,FechaEstreno},"es")).toMatch(/revisión editorial/);
      expect(obtenerAvisoRevision({Id,Titulo,FechaEstreno},"en")).toMatch(/editorial verification/);
    }
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
