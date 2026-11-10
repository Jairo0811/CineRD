# CineRD F-2.3 — contraste documental del lote de cinco fechas
**Fecha de revisión documental:** 2026-11-09 · **Estado:** SIN DECISIONES NUEVAS.  
**Criterio:** primera exhibición comercial en salas de República Dominicana; distinguirla de gala premiere, festival, fecha de noticia y estreno internacional.

## Estado técnico real comprobado por el titular

El titular ejecutó `node backend/scripts/previewEditorialMetadataLive.js` sobre `DB_DATABASE=CRUDPeliculas`: cinco registros en `ORIGINAL` (#27, #36, #42, #44, #56), uno en `ALREADY` (#40 *Colao 2*), **0 DRIFT, 0 MISSING, 0 desacuerdos SQL/snapshot**. Esto verifica identidad y sincronización, NO comprueba la veracidad histórica de las cinco fechas ni otorga aprobación editorial. La #40 fue autorizada en F-2.3, no en el expediente F-2.6 anterior. No repetir UP.

## Fuentes por película (documentación; NO aprobación)

| ID | Película | Fecha SQL | Propuesta | Evidencia / evaluación | Decisión |
|---:|---|---|---|---|---|
| 27 | Lotoman 003: Volando Bajito | 2014-03-15 | **2014-03-27** | [Diario Libre, 24/03/2014](https://www.diariolibre.com/revista/cine/orange-cinemas-har-hoy-gala-premier-de-lotoman-003-IODL539111): anuncia exhibición en todas las salas desde jueves 27; [Diario Libre, 26/03/2014](https://www.diariolibre.com/amp/revista/cine/orange-cinema-realiz-la-gala-premier-de-lotoman-003-en-el-teatro-nacional-GJDL542411): repite estreno comercial al día siguiente, distinto de gala del 24. **Contemporáneas, concordantes.** | PENDIENTE |
| 36 | Nueba Yol 3: Bajo la Nueva Ley | 1997-10-31 | **1997-10-23** | [Cinema Dominicano, ficha histórica de 2012](https://cinemadominicano.com/nueba-yol-3-bajo-la-nueva-ley-1997/) y [CineDominicano catálogo digital](https://cinedominicano.com/peliculasdominicanas/pelicula/nueba-yol-3-bajo-la-nueva-ley-1997/) mencionan el 23/10/1997, **pero el segundo reconoce información del portal hermano**. Fuentes NO independientes; falta cartelera de octubre de 1997, distribuidor, afiche con fecha, hemeroteca o comprobante de estreno comercial. | PENDIENTE (evidencia independiente insuficiente) |
| 42 | Andrea | 2005-08-16 | **2005-08-18** | [Diario Libre, 02/08/2005](https://www.diariolibre.com/revista/andrea-un-film-de-bajo-costo-y-alta-expectativa-CADL70488) señala premiere distinta del estreno comercial del 18; [Diario Libre, 15/08/2005](https://www.diariolibre.com/revista/pelculas-BYDL71470) anuncia llegada a cines del país el 18; [17/08/2005](https://www.diariolibre.com/revista/en-pantallas-andrea-primer-filme-dominicano-de-suspenso-EYDL71622) anuncia gala ese día y salas comerciales después. **Alta confianza**. | PENDIENTE |
| 44 | Playball | 2008-02-01 | **2008-02-14** | [Diario Libre, 06/02/2008](https://www.diariolibre.com/revista/jugadores-de-bisbol-debutarn-en-el-cine-con-playball-la-nueva-cinta-de-alfonso-rodrguez-1-BKDL4164) distingue premieres del 11 y 13; [Cinema Dominicano](https://cinemadominicano.com/play-ball-2008/) fija 14 de febrero; [Duarte101, 15/02/2008](https://duarte101.com/2008/02/) documenta película en salas, y un artículo del [festival del 14/02/2008](https://www.festivaldecineglobal.org/drgff2007/site/noticias005.asp) coincide con la ventana. **Alta confianza, con cautela:** las noticias contemporáneas sostienen el período y las premieres, la fecha exacta 14 consta en ficha archivística; buscar cartelera del jueves 14 si se quiere máxima certeza. | PENDIENTE |
| 56 | La Lucha de Ana | 2012-04-13 | **2012-05-24** | [Diario Libre, 17/05/2012](https://www.diariolibre.com/amp/revista/cine/la-lucha-por-un-mejor-cine-DIDL336401) anuncia explícitamente estreno el 24; [Diario Libre, 24/05/2012](https://www.diariolibre.com/revista/cine/la-lucha-de-ana-FIDL337543) publica reseña contemporánea de la película estrenada. **Alta confianza**. | PENDIENTE |

## Recomendación editorial

Poner a **decisión individual del titular** las candidatas de #27, #42, #44 y #56, respaldadas por evidencia contemporánea y el expediente. Para #36, NO proponer aplicación SQL hasta obtener una fuente independiente; puede mantenerse la fecha anterior mientras se documenta la incertidumbre, pero eso no equivale a certificar que 31/10/1997 sea correcta.

Ninguna de estas cinco propuestas se marca aprobada por este documento. No cambiar `docs/editorial-metadata-candidates-f26.json`, `docs/catalog-corrections-e4-approvals.json`, las 58 autorizaciones E-5, SQL o el snapshot; tampoco dar permisos a los 128 medios. La PR #55 permanece DRAFT y AdSense desactivado.
