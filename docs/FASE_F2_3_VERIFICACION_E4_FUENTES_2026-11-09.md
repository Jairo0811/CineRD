# CineRD — F-2.3: contraste documental de siete correcciones E-4

**Fecha de investigación:** 9 de noviembre de 2026  
**Rama:** `feat/f2-editorial-review` · **PR:** #55  
**Ámbito:** cuatro películas, siete campos E-4; una discrepancia adicional de fecha NO propuesta.  
**Carácter:** informe de verificación de fuentes y propuesta de decisión. **No es autorización editorial humana ni informe de estado de SQL Server**.

## Criterio de catálogo

El campo `FechaEstreno` significa **estreno comercial en salas de República Dominicana**, no gala, premiere privada, nota de prensa, fecha de rodaje, festival, plataforma digital ni primera exhibición extranjera. La identificación y equivalencia de cada fuente requiere revisión por el responsable editorial.

La comparación siguiente usa `docs/catalog-corrections-e4.json` y el snapshot versionado `database/seeds/catalog.snapshot.json` (generado el 2026-11-08T10:36:30.957Z). La presencia de un valor en este snapshot **no acredita que el SQL Server original tenga el mismo valor**, ni reemplaza permisos, revisión humana o firma.

## Matriz de las siete propuestas

| ID | Película | Campo | Valor anterior documentado | Valor propuesto / ya en snapshot | Evidencia consultada | Evaluación documental |
| --- | --- | --- | --- | --- | --- | --- |
| 9 | Lotoman | `Genero` | Infantil | **Comedia** | Ficha [Cinema Dominicano](https://cinemadominicano.com/lotoman-2011/); ficha [CineDominicano.com](https://cinedominicano.com/peliculasdominicanas/pelicula/lotoman-2011/) | Concordancia de catalogación; falta aprobación humana |
| 9 | Lotoman | `FechaEstreno` | 2011-03-10 | **2011-01-20** | [Diario Libre, 11/01/2011](https://www.diariolibre.com/revista/lotoman-se-estrena-el-20-de-este-mes-BNDL275224): anuncia 20 de enero, y distingue galas previas del 18 y 19; [Cinema Dominicano](https://cinemadominicano.com/lotoman-2011/) | Evidencia contemporánea fuerte para estreno comercial; falta aprobación humana |
| 24 | Sanky Panky 3 | `Director` | No registrado | **Eduardo Transfor Ortiz** | [El Caribe, marzo de 2018](https://www.elcaribe.com.do/gente/a-y-e/sanky-panky-3-se-estrenara-el-29-de-marzo-en-rd/); [El Día, 29/03/2018](https://eldia.com.do/sanky-panky-3-llega-a-los-cines-este-lunes/) | Identidad documentada como Eduardo «Transfor» Ortiz; falta aprobación humana |
| 24 | Sanky Panky 3 | `FechaEstreno` | 2018-03-18 | **2018-03-29** | [Caribbean Films citado en Diario Libre, 22/03/2018](https://www.diariolibre.com/revista/cine/sanky-panky-3-se-estrenara-el-jueves-29-de-marzo-KB9470149); [El Día, 29/03/2018](https://eldia.com.do/sanky-panky-3-llega-a-los-cines-este-lunes/) | La premiere fue el 26/03; estreno comercial el 29/03; falta aprobación humana |
| 30 | El Diablo no duerme en su cama | `Director` | No registrado | **Amauris Pérez** | [Cinema Dominicano, 24/09/2024](https://cinemadominicano.com/el-diablo-no-duerme-en-su-cama-comedia-negra-de-amauris-perez/); [Cine Cultura y Más, 22/09/2024](https://cineculturaymas.com/pelicula-el-diablo-no-duerme-en-su-cama-apuesta-dramatica-de-humor-negro/) | Corroborado en notas de producción; conservar grafía documental hasta revisión; falta aprobación humana |
| 32 | Los Rechazados 2: Operación Espacial | `Director` | No registrado | **Yasser Michelén** | [DGCINE, 13/08/2026](https://dgcine.gob.do/los-rechazados-2-lleva-la-comedia-y-la-ciencia-ficcion-a-nuevas-audiencias/); [CineDominicano.com](https://cinedominicano.com/estreno/los-rechazados-2/) | Fuente institucional explícita; falta aprobación humana |
| 32 | Los Rechazados 2: Operación Espacial | `FechaEstreno` | 2026-09-13 | **2026-08-13** | [DGCINE, 13/08/2026](https://dgcine.gob.do/los-rechazados-2-lleva-la-comedia-y-la-ciencia-ficcion-a-nuevas-audiencias/) afirma estreno en salas ese jueves; [ficha de exhibición](https://cinedominicano.com/estreno/los-rechazados-2/) | Fuente institucional explícita; falta aprobación humana |

**Balance de esta tanda:** siete propuestas con fuentes concordantes en los campos identificados. **Aprobaciones E-4 registradas: 0/7**. Los valores propuestos están ya en el snapshot; **no ejecutar actualizaciones SQL ni generar aprobaciones en este documento**.

## Discrepancia adicional: no crear corrección automática

**Película #30 — `FechaEstreno` del snapshot = 2024-09-22.** La publicación [Cine Cultura y Más de 22/09/2024](https://cineculturaymas.com/pelicula-el-diablo-no-duerme-en-su-cama-apuesta-dramatica-de-humor-negro/) describía una producción con estreno **previsto** para el primer semestre de 2025. La nota del [24/09/2024 en Cinema Dominicano](https://cinemadominicano.com/el-diablo-no-duerme-en-su-cama-comedia-negra-de-amauris-perez/) trata la producción y el rodaje, no acredita apertura comercial en RD en septiembre de 2024.

**Decisión:** `PENDIENTE_EVIDENCIA_PRIMARIA`; no interpretar la publicación de prensa del 22/09/2024 como estreno en salas; tampoco sustituir por 2025 porque fue solo una previsión. Solicitar cartelera histórica, distribuidor o constancia de función comercial dominicana con fecha exacta. Esta incidencia es **adicional** a las siete propuestas E-4 existentes.

## Otras observaciones no modificadas

- #32: DGCINE describe comedia, drama y ciencia ficción; el snapshot clasifica `Genero=Acción`. La posible reclasificación requiere criterio de taxonomía y autorización; no se incorpora como octava corrección.
- #32: el título versionado contiene un espacio final; revisar el tratamiento de normalización antes de intervenir datos.
- Cualquier sinopsis previa en SQL exige revisar procedencia y permiso de reproducción independientemente de la precisión factual de metadatos.
- Las advertencias públicas y el modo `review` deben mantenerse mientras la revisión humana no esté terminada.

## Pendientes para autorizar por persona responsable

1. Revisar los **siete campos** uno por uno y sus fuentes, compararlos contra **SQL Server real en solo lectura** (`CRUDPeliculas`) y distinguir diferencia original/snapshot.
2. Registrar para cada decisión identidad de responsable, fecha UTC, fuente contrastada, observaciones y huella válida usando el procedimiento E-4 existente, **sin inventar firmas**.
3. Resolver la fecha comercial de #30 por evidencia independiente antes de proponer un ajuste de `FechaEstreno`.
4. Mantener `docs/catalog-corrections-e4-approvals.json` y `docs/editorial-approvals-e5.json` sin alteraciones hasta contar con revisiones reales.
5. No habilitar publicidad ni cambiar `VITE_MEDIA_RIGHTS_MODE=review`; ninguna fuente periodística concede por sí sola licencia de reproducción de texto o imagen.

**Verificación técnica previa:** el intento #2 del workflow CineRD CI #378 concluyó **7/7 jobs success**. Este expediente documental generará un commit nuevo; la CI deberá volver a verificarse para ese commit antes de fusionar la PR #55, que permanece en borrador.
