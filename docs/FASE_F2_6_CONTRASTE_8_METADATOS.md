# CineRD — F-2.6 · Contraste de fuentes para ocho observaciones altas de metadatos

**Fecha del contraste:** 8 de noviembre de 2026. **Tipo:** investigación documental asistida de fuentes abiertas, sin acceso a material de producción confidencial ni visionado verificado.  
**Base:** 18 incidencias ALTAS de F-2.5; este lote se enfoca en 8 registros (#27, #31, #36, #40, #42, #44, #47 y #56-contexto).

> Las seis fechas de abajo son **candidatas de corrección**, NO valores autorizados para SQL Server. El archivo `docs/editorial-metadata-candidates-f26.json` tiene `automaticApply:false`, todos los estados `PENDIENTE_DECISION_HUMANA` y `applyAuthorized:false`. Ni SQL, ni `database/seeds/catalog.snapshot.json`, ni `docs/catalog-corrections-e4.json` fueron modificados en este trabajo. El significado de `FechaEstreno` (estreno comercial RD, festival, premiere, edición internacional) debe confirmarse antes de aprobar.

## Resultado: seis candidatos de fecha; dos expedientes retenidos

| ID | Película / observación | Actual en snapshot | Candidato documental | Confianza | Dictamen |
|---:|---|---|---|---|---|
| 27 | Lotoman 003: Volando Bajito | 2014-03-15 | **2014-03-27** | Alta | Anuncio previo y ficha coinciden |
| 31 | Entiérrenlo Parao | 2025-06-05 | **Ninguno todavía** | Insuficiente | Fecha anunciada para 2025 no demuestra exhibición comercial real; festival de agosto 2026 tampoco |
| 36 | Nueba Yol 3: Bajo la Nueva Ley | 1997-10-31 | **1997-10-23** | Media | Dos fichas de origen editorial relacionado; hace falta fuente primaria independiente |
| 40 | Colao 2 | 2023-12-07 | **2023-11-30** | Alta | Fuente directa del exhibidor Caribbean Cinemas y prensa contemporánea |
| 42 | Andrea | 2005-08-16 | **2005-08-18** | Alta | Crónica contemporánea confirma premiere anterior y llegada a salas; nombre director todavía discutido |
| 44 | Playball / Play Ball | 2008-02-01 | **2008-02-14** | Alta | Premiere 11/13 febrero y fuentes de estreno comercial 14 febrero |
| 47 | Pimp Bullies | Género Acción | **Sin cambio automático** | Mixta | La plataforma ViX incluye *Acción*, además de *Drama* y *Crimen*; género único necesita criterio explícito |
| 56 (contexto) | La Lucha de Ana | 2012-04-13 | **2012-05-24** | Alta | Diario Libre anunció estreno el 17/05 y publicó reseña el 24/05 |

## Fuentes verificadas por película

### 27 — Lotoman 003
- Anuncio de producción/distribución publicado el **12/02/2014**, comunica estreno RD **27/03/2014**: https://cinedominicano.com/anuncian-estreno-de-lotoman-003-volando-bajito/
- Ficha y nota de Cinema Dominicano, publicadas en vísperas del estreno: https://cinemadominicano.com/lotoman-003-volando-bajito-2014/
**Recomendación:** alta confianza de cambio de fecha, supeditado a aprobación.

### 31 — Entiérrenlo Parao
- Agenda de 2025 de Acento menciona **5/06/2025** como una **proyección de calendario**: https://acento.com.do/cine/es-esto-lo-que-viene-en-el-cine-dominicano-en-2025-9446002.html
- El sitio oficial del DFFNYC confirma una **premiere internacional en agosto de 2026**, no apertura comercial dominicana: https://dominicanfilmfestivalny.com/noticia.php?lang=es&slug=entierrenlo-parao-dffnyc-2026
- La filmografía del director Ronni Castillo identifica la obra como **2025**, sin día de estreno comercial: https://ronnicastillo.com/
**Recomendación:** no modificar la fecha hasta cartelera local verificable o declaración directa de distribuidora.

### 36 — Nueba Yol 3
- Ficha Cinema Dominicano fecha estreno **23/10/1997**: https://cinemadominicano.com/nueba-yol-3-bajo-la-nueva-ley-1997/
- Ficha CineDominicano.com reproduce la misma fecha y atribuye información al portal anterior: https://cinedominicano.com/peliculasdominicanas/pelicula/nueba-yol-3-bajo-la-nueva-ley-1997/
- Ambas la titulan **Nueba Yol 3**, pero el argumento la llama **segunda parte**; no cambiar título ni ordinal sin verificar créditos originales.
**Recomendación:** fecha candidata de confianza media: no considerar dos portales relacionados como dos confirmaciones independientes.

### 40 — Colao 2
- Ficha del **exhibidor Caribbean Cinemas**: `Comedia / Romance`, **30/11/2023**: https://caribbeancinemas.com/es/movie/8897/
- Diario Libre (28/11/2023) anuncia llegada a cines **jueves 30/11** y la califica como comedia: https://www.diariolibre.com/revista/cine/2023/11/28/colao-2-llega-a-los-cines-esta-semana/2535792
**Recomendación:** fecha candidata de alta confianza. **Mantener género Comedia**; una clasificación aislada como Drama no prevalece sobre exhibidor contemporáneo.

### 42 — Andrea
- Diario Libre del propio **18/08/2005** describe gala premiere la noche anterior y llegada de la película a salas: https://www.diariolibre.com/amp/revista/expectativas-con-el-estreno-de-andrea-FYDL71689
- Ficha Cinema Dominicano: **18/08/2005**, director **Roger Bencosme**: https://cinemadominicano.com/andrea-la-venganza-de-un-espiritu-2005/
- IMDb acredita **Rogert Bencosme**: https://www.imdb.com/es/title/tt0493211/fullcredits/
**Recomendación:** candidato de fecha con alta confianza; **NO cambiar** director sin créditos originales o declaración comprobable de la producción.

### 44 — Playball
- Diario Libre (06/02/2008) recoge premiers 11/02 y 13/02: https://www.diariolibre.com/revista/jugadores-de-beisbol-debutarn-en-el-cine-con-playball-la-nueva-cinta-de-alfonso-rodrguez-1-BKDL4164
- Archivo Cinema Dominicano registra estreno **14/02/2008** y clasifica Drama: https://cinemadominicano.com/play-ball-2008/
- IMDb registra fecha de salida en RD **14/02/2008**: https://www.imdb.com/title/tt1165327/
**Recomendación:** candidato de fecha con alta confianza. La clasificación dramática no justifica por sí sola cambiar Comedia: otros reseñistas identifican elementos cómicos. Definir si CineRD representa género principal o multi-etiquetas; registrar título alternativo «Play Ball» sin sobrescribir el título base automáticamente.

### 47 — Pimp Bullies
- Cinema Dominicano: «Víctimas de un prostíbulo (Pimp Bullies)», **Drama/Thriller**, **22/09/2011**: https://cinemadominicano.com/victimas-de-un-prostibulo-pimp-bullies-2011-2/
- La ficha de la plataforma **ViX** enumera **Drama, Acción, Crimen**: https://vix.com/es-es/detail/video-3987340
- Cartelera contemporánea Diario Libre muestra comercialización bajo «PIMP BULLIES: VÍCTIMAS DE UN PROSTÍBULO»: https://www.diariolibre.com/amp/revista/cartelera-94-NLDL306391
**Recomendación:** conservar temporalmente `Genero: Acción`: no está inequívocamente refutado. Adoptar taxonomía estable de género principal/secundarios antes de corregir; revisar título oficial de créditos.

### 56 — La Lucha de Ana (contexto)
- Diario Libre del **17/05/2012** anuncia estreno próximo **24/05/2012**: https://www.diariolibre.com/revista/cine/la-lucha-por-un-mejor-cine-DIDL336401
- Reseña Diario Libre publicada el **24/05/2012** confirma evento: https://www.diariolibre.com/revista/cine/la-lucha-de-ana-FIDL337543
- Ibermedia solo identifica **año** 2012, no fecha comercial ni subvenciones de modo específico: https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/
**Recomendación:** fecha candidata de alta confianza; el contexto editorial debe conservar el matiz de Ibermedia, sin inventar ayudas financieras.

## Decisiones para cerrar el lote

1. Definir `FechaEstreno` como apertura comercial **en República Dominicana**, documentando premiere, festival o estreno internacional por separado.
2. Someter **cinco fechas de confianza alta** (#27, #40, #42, #44 y #56) y **una media** (#36) a aprobación real, comparando antes SQL y snapshot; si son idénticos a valores futuros, no reaplicar. En ningún caso ejecutar un `UPDATE` sin salvaguardas y respaldo restaurable.
3. Dejar #31 sin cambio hasta evidencia de exhibición comercial RD. Dejar #47 como clasificación mixta pendiente; no reemplazar por Drama por preferencia de un portal.
4. Mantener las 18 incidencias altas en `pendiente_verificacion` y los libros E-4/E-5 sin aprobaciones artificiales. Estos seis campos **no forman parte de la lista E-4 original de siete cambios**; son candidatos nuevos, sujetos a un procedimiento controlado independiente.

**Estado:** investigación y candidatos documentados; **0 modificaciones de SQL**, **0 cambios del snapshot**, **0 firmas/permissions inventadas**.
