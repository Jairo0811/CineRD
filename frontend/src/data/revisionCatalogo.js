/**
 * Avisos factuales del catálogo. Son avisos de incertidumbre, NO certificados,
 * autorizaciones editoriales ni indicaciones de actualizar SQL Server.
 *
 * Cambiar este inventario únicamente tras modificar y contrastar
 * docs/editorial-metadata-candidates-f26.json y registrar revisión real.
 */
export const REVISIONES_PUBLICAS = Object.freeze({
  27: { titulo:"Lotoman 003: Volando Bajito", tipo:"fecha", fechaActual:"2014-03-15", fechaAprobada:"2014-03-27" },
  31: { titulo:"Entiérrenlo Parao", tipo:"fecha_sin_confirmar", fechaActual:"2025-06-05" },
  36: { titulo:"Nueba Yol 3: Bajo la Nueva Ley", tipo:"fecha", fechaActual:"1997-10-31", fechaAprobada:"1997-10-23", evidenciaIndependientePendiente:true },
  40: { titulo:"Colao 2", tipo:"fecha", fechaActual:"2023-12-07", fechaAprobada:"2023-11-30" },
  42: { titulo:"Andrea", tipo:"fecha", fechaActual:"2005-08-16", fechaAprobada:"2005-08-18" },
  44: { titulo:"Playball", tipo:"fecha", fechaActual:"2008-02-01", fechaAprobada:"2008-02-14" },
  47: { titulo:"Pimp Bullies: Victimas de un Prostibulo", tipo:"genero", fechaActual:"2011-09-22" },
  56: { titulo:"La Lucha de Ana", tipo:"fecha", fechaActual:"2012-04-13", fechaAprobada:"2012-05-24" },
});

const normaliza = value => String(value ?? "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function obtenerAvisoRevision(pelicula, idioma="es") {
  const revision=REVISIONES_PUBLICAS[Number(pelicula?.Id)];
  if(!revision || normaliza(pelicula?.Titulo)!==normaliza(revision.titulo))return null;
  // F-2.3: dejar de mostrar avisos de FECHA solo cuando la ficha publicada
  // tenga exactamente su fecha aprobada; la fecha antigua o un tercer valor
  // nunca retiran el aviso. #36 (Nueba Yol 3) conserva aviso porque sigue
  // faltando corroboración documental independiente del estreno RD de 1997.
  if(revision.fechaAprobada && !revision.evidenciaIndependientePendiente &&
     String(pelicula?.FechaEstreno ?? "").slice(0,10)===revision.fechaAprobada)return null;
  const english=String(idioma).startsWith("en");
  // Otros avisos no se retiran automáticamente: los derechos y la evidencia
  // histórica se evalúan por separado de la aprobación de FechaEstreno.
  if(revision.tipo==="genero")return english
    ? "Film genre classification is under editorial review; references use different categories."
    : "La clasificación de género está en revisión editorial; las fuentes utilizan categorías diferentes.";
  if(revision.tipo==="fecha_sin_confirmar")return english
    ? "The catalogued release date is not independently confirmed as a theatrical release in the Dominican Republic."
    : "La fecha registrada no está confirmada como estreno comercial en salas de República Dominicana.";
  return english
    ? "The release date displayed is under editorial verification against historical sources."
    : "La fecha de estreno mostrada está en revisión editorial frente a fuentes históricas.";
}
