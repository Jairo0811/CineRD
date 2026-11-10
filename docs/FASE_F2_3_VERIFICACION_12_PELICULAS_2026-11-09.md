# CineRD — F-2.3: cotejo documental de 12 películas de prioridad alta

**Fecha:** 2026-11-09 · **PR:** #55 · **Rama:** `feat/f2-editorial-review`  
**Ámbito:** películas #6, #10, #26, #27, #31, #36, #40, #42, #44, #47, #55 y #56; **13 observaciones altas** (12 sinopsis y un contexto adicional para #56).  
**Estado:** expediente de investigación y propuestas **NO aprobadas**. No cambia SQL ni el snapshot. No representa visionado de las películas ni autorización para reproducir sinopsis o imágenes.

## Base verificada y política editorial

El propietario obtuvo en SSMS una consulta SELECT, sobre **`CRUDPeliculas` original** (2026-11-09), con las doce películas y sus columnas `Id`, `Titulo`, `Genero`, `Director` y `FechaEstreno`. El cotejo con `database/seeds/catalog.snapshot.json` (`generatedAtUtc=2026-11-08T10:36:30.957Z`) arroja valores equivalentes en los doce registros. **Igualdad SQL/snapshot no demuestra corrección histórica ni aprobación editorial.**

`FechaEstreno` debe referirse al **estreno comercial en salas dominicanas**. Diferenciarlo de gala, premiere de festival, publicación de noticia, lanzamiento en otro país o ficha de agregador. Fuentes externas abajo respaldan **candidatos para revisar**; ningún cambio se autoriza ni se aplica automáticamente.

## Matriz de prioridades y decisiones propuestas (sin ejecutar)

| ID | Película | Fecha SQL original | Evidencia para contrastar / discrepancia | Decisión técnica recomendada |
| --- | --- | --- | --- | --- |
| 6 | Ladrones a Domicilio | 2008-08-14 | Cinema Dominicano registra 14/08/2008, comedia/aventura y Ángel Muñiz. Su ficha describe a Bruno como **guardia de seguridad**; borrador de reemplazo F-2.3 habla de conductor de transporte de valores. | **Mantener metadatos**; revisar descripción del empleo mediante fuente de producción o visionado y comprobar traducción ES/EN; sin aprobación de la sinopsis. |
| 10 | Vamos de robo | 2014-01-15 | Diario Libre (anuncio anterior de 2013 y crónica de enero 2014) documenta estreno comercial **2014-01-16**; posible confusión con gala previa. Existe borrador ES/EN original por riesgo de reproducción de terceros. | **Candidato fecha 2014-01-16**; exigir decisión humana/documentada, consulta de origen y cotejo final antes de cambiar SQL; revisar autoría/derechos de sinopsis. |
| 26 | Feo de día, Lindo de noche | 2012-09-13 | Cinema Dominicano coincide en fecha y comedia; precisa que la transformación sucede **de las 20:00 a medianoche**, no durante el día. | **Mantener fecha y género**; revisar precisión factual de borradores ES/EN ya ajustados y validación humana de texto. |
| 27 | Lotoman 003: Volando Bajito | 2014-03-15 | Cinema Dominicano documenta **2014-03-27** como estreno comercial; una crónica de gala del 25/03 anuncia funciones en salas el jueves 27. | **Candidato fecha 2014-03-27**; decidir y registrar corrección por procedimiento editorial/SQL; no alterar por esta investigación. |
| 31 | Entiérrenlo Parao | 2025-06-05 | No se identificó prueba primaria suficiente de estreno comercial dominicano **en esa fecha**. Festival DFFNYC confirma premiere internacional en agosto **2026**; una función en festival no valida ni invalida por sí sola un estreno comercial anterior. | **Fecha no acreditada**; mantener aviso de revisión y solicitar distribuidor, cartelera contemporánea o registro DGCINE que precise estreno en salas RD. **No asignar 2026 como fecha**. |
| 36 | Nueba Yol 3: Bajo la Nueva Ley | 1997-10-31 | Cinema Dominicano registra **1997-10-23** y describe la cinta como segunda entrega de `Nueba Yol`, pese al título `Nueba Yol 3`. | **Candidato fecha 1997-10-23**; corroborar con archivo de distribuidor/cartelera; no renombrar ni renumerar sin fuente primaria. |
| 40 | Colao 2 | 2023-12-07 | Nota de lanzamiento citando Caribbean Cinemas anuncia **2023-11-30** en RD. En el propio Cinema Dominicano una ficha la etiqueta **Drama**, pero la publicación de estreno la clasifica **Comedia**. | **Candidato fecha 2023-11-30**. **Mantener género Comedia temporalmente**, sin imponer Drama: fuentes del mismo sitio difieren; revisar taxonomía (comedia/drama). |
| 42 | Andrea | 2005-08-16 | Ficha Cinema Dominicano registra **2005-08-18**; dice **Roger Bencosme** en dirección/edición y **Rogert** en productores, mientras catálogo usa Rogert como director. Otra entrada histórica menciona Rogert en dirección. | **Candidato fecha 2005-08-18**; nombre director **no resuelto**: verificar créditos originales antes de editar `Rogert`/ `Roger`. |
| 44 | Playball | 2008-02-01 | Cinema Dominicano registra `Play Ball`, **2008-02-14** y género **Drama**, frente a `Playball` / Comedia en SQL. | **Candidato fecha 2008-02-14**; proponer revisión de `Genero=Drama` y título alternativo solo tras contraste adicional y decisión taxonómica. |
| 47 | Pimp Bullies: Victimas de un Prostibulo | 2011-09-22 | La fecha coincide con Cinema Dominicano; identifica `Víctimas de un prostíbulo (Pimp Bullies)` como **Drama/Thriller**, frente a **Acción** en SQL. | **Mantener fecha**; revisar clasificación primaria y títulos alternativos (tildes, orden) sin sobrescribir `Acción` automáticamente. |
| 55 | El Plan Perfecto | 2017-01-17 | **DGCINE (fuente institucional)** confirma estreno en todos los cines el **2017-01-19**, coincidente con Cinema Dominicano. Hay borrador ES/EN nuevo para reemplazar sinopsis SQL de procedencia no acreditada. | **Candidato fecha 2017-01-19** (evidencia fuerte); verificar si día 17 corresponde a premiere; aprobar expresamente antes de corregir SQL. |
| 56 | La Lucha de Ana | 2012-04-13 | Cinema Dominicano registra **2012-05-24**; coincide en director Bladimir Abud y Drama. El contexto y la sinopsis tienen observaciones propias; Ibermedia no acredita el día exacto. | **Candidato fecha 2012-05-24**; revisar tanto sinopsis como contexto ES/EN, fuentes y permisos; aprobar por separado. |

### Fuentes documentales consultadas

- **#6**: [Cinema Dominicano, ficha](https://cinemadominicano.com/ladrones-a-domicilio-2008/).
- **#10**: [Diario Libre, anuncio de 2013](https://www.diariolibre.com/revista/vamos-de-robo-a-las-salas-de-cines-en-enero-BMDL406632); [Diario Libre, crónica posterior](https://www.diariolibre.com/amp/revista/cine/vamos-de-robo-DIDL447141).
- **#26**: [Cinema Dominicano, ficha](https://cinemadominicano.com/feo-de-dia-lindo-de-noche-2012/).
- **#27**: [Cinema Dominicano, ficha](https://cinemadominicano.com/lotoman-003-volando-bajito-2014/); [crónica de premiere](https://cinemadominicano.com/orange-cinema-realiza-gala-premier-de-lotoman-003/).
- **#31**: [Dominican Film Festival in New York, noticia oficial agosto 2026](https://dominicanfilmfestivalny.com/noticia.php?lang=es&slug=entierrenlo-parao-dffnyc-2026). **No certifica la fecha de estreno comercial RD**.
- **#36**: [Cinema Dominicano, ficha](https://cinemadominicano.com/nueba-yol-3-bajo-la-nueva-ley-1997/).
- **#40**: [Cinema Dominicano, anuncio comercial](https://cinemadominicano.com/colao-2-llega-a-los-cines-dominicanos/); [ficha técnica que indica Drama](https://cinemadominicano.com/colao-2-2023/); [ficha de estreno que indica Comedia](https://cinemadominicano.com/colao-2-estreno-30-noviembre/).
- **#42**: [Cinema Dominicano, ficha](https://cinemadominicano.com/andrea-la-venganza-de-un-espiritu-2005/); [registro histórico que usa Rogert](https://cinemadominicano.com/cine-provincial/).
- **#44**: [Cinema Dominicano, ficha](https://cinemadominicano.com/play-ball-2008/).
- **#47**: [Cinema Dominicano, ficha](https://cinemadominicano.com/victimas-de-un-prostibulo-pimp-bullies-2011-2/).
- **#55**: [DGCINE, primera semana en taquilla](https://dgcine.gob.do/mas-de-50-mil-personas-han-visto-el-plan-perfecto/); [Cinema Dominicano, ficha](https://cinemadominicano.com/el-plan-perfecto-2017/).
- **#56**: [Cinema Dominicano, ficha](https://cinemadominicano.com/la-lucha-de-ana-2012/); [Programa Ibermedia, proyecto](https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/).

## Balance sin falsos cierres

- **Doce películas** analizadas; **trece observaciones editoriales altas** del conjunto de 18 altas (la película #56 tiene dos: sinopsis y contexto).
- **Ocho fechas candidatas de reemplazo**: #10, #27, #36, #40, #42, #44, #55, #56. Son propuestas sujetas a revisión; **0 cambios SQL** autorizados o aplicados por esta investigación.
- **Una fecha sin evidencia suficiente**: #31; **no proponer sustitución**.
- **Dos géneros con reclasificación a investigar**: #44 y #47; además, #40 exhibe fuentes contradictorias Comedia/Drama.
- **Una identidad de director con grafías contradictorias**: #42, Roger/Rogert.
- **Dos casos centrales de precisión de textos**: #6 (empleo del personaje) y #26 (horas nocturnas); más cinco sinopsis SQL con origen pendiente, entre las que están #6, #10, #55 y #56.
- **No confundir:** la coincidencia del snapshot y SQL original tampoco supone que la obra o texto ha sido visionado/revisado. El número de incidencias abiertas de `docs/editorial-issues-f2.json` debe mantenerse hasta que un responsable registre las decisiones reales.

## Flujo recomendado de cierre

1. Validar con fuentes primarias las ocho fechas candidatas y el caso #31 sin fecha comercial confirmada.
2. Resolver taxonomía de géneros (#40, #44, #47), título y grafía de dirección (#42), sin establecer hechos no documentados.
3. Revisar procedencia/licencia y redacción ES/EN de las sinopsis, incluidos los borradores SQL de #6, #10, #55 y #56, y el contexto de #56.
4. Registrar aprobación humana por campo o pieza, con revisor, fecha, fuentes y huella, usando los mecanismos existentes y **sin autocompletar aprobaciones**.
5. Aplicar eventuales cambios en SQL por un script revisado con respaldo, transacción, exact match de valor previo y `OUTPUT`, solo después de autorización real.
6. Mantener `VITE_MEDIA_RIGHTS_MODE=review`, anuncios desactivados y PR #55 DRAFT hasta cumplir derechos/editorial/operación.

**Nota de revisión del repositorio:** Los 12 valores consultados en `CRUDPeliculas` coinciden con las filas versionadas en `database/seeds/catalog.snapshot.json`; por ello no se recomienda una migración de sincronización SQL/snapshot. Las diferencias documentadas son entre la fuente histórica y el catálogo existente.
