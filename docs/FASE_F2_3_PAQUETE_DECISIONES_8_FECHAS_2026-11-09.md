# CineRD — Paquete de decisión editorial para ocho fechas (F-2.3)

**Fecha:** 2026-11-09 · **Rama:** `feat/f2-editorial-review` · **PR:** #55  
**Estado:** **8 PROPUESTAS PENDIENTES DE DECISIÓN HUMANA**, no autorizadas ni aplicadas.  
**Objeto:** resolver la fecha de **estreno comercial en cines de República Dominicana**. La fecha de gala, festival, reseña, distribución internacional o preestreno no reemplaza esa definición.

## Evidencia técnica previa

El propietario ejecutó `SELECT` el 2026-11-09 en la base SQL Server original `CRUDPeliculas` sobre las películas 6,10,26,27,31,36,40,42,44,47,55,56. Los ocho registros abajo coinciden con el snapshot `database/seeds/catalog.snapshot.json` en valores históricos. **Este cotejo demuestra sincronía entre SQL y snapshot, no que las fechas históricas sean correctas.**

Para repetir una comprobación sin cambiar nada: **`database/scripts/f23_preflight_fechas_estreno_8_readonly.sql`**. El script identifica los ocho registros por ID/título y muestra el valor actual y el candidato. **Solo consulta**.

## Decisiones de revisión — NO completar automáticamente

| ID | Película | Fecha actual en SQL | Candidata | Principal evidencia y evaluación | Decisión |
|---:|---|---|---|---|---|
| 10 | Vamos de robo | 2014-01-15 | **2014-01-16** | [Diario Libre (crónica 20/01/2014)](https://www.diariolibre.com/amp/revista/cine/vamos-de-robo-DIDL447141) habla de taquilla en primera noche, jueves 16; evidencia contemporánea fuerte | PENDIENTE |
| 27 | Lotoman 003: Volando Bajito | 2014-03-15 | **2014-03-27** | [Ficha Cinema Dominicano](https://cinemadominicano.com/lotoman-003-volando-bajito-2014/) y [gala previa](https://cinemadominicano.com/orange-cinema-realiza-gala-premier-de-lotoman-003/); concordancia | PENDIENTE |
| 36 | Nueba Yol 3: Bajo la Nueva Ley | 1997-10-31 | **1997-10-23** | [Ficha Cinema Dominicano](https://cinemadominicano.com/nueba-yol-3-bajo-la-nueva-ley-1997/); **pedir otra evidencia primaria** por antigüedad y falta de cartelera | PENDIENTE |
| 40 | Colao 2 | 2023-12-07 | **2023-11-30** | [Anuncio de Caribbean Cinemas citado por Cinema Dominicano](https://cinemadominicano.com/colao-2-llega-a-los-cines-dominicanos/); lanzamiento en RD | PENDIENTE |
| 42 | Andrea | 2005-08-16 | **2005-08-18** | [Ficha Cinema Dominicano](https://cinemadominicano.com/andrea-la-venganza-de-un-espiritu-2005/); **pedir confirmación independiente** | PENDIENTE |
| 44 | Playball | 2008-02-01 | **2008-02-14** | [Ficha Cinema Dominicano](https://cinemadominicano.com/play-ball-2008/); archivo [catálogo de cine dominicano](https://cinemadominicano.com/wp-content/uploads/2022/02/CDELM.pdf); revisar si son fuentes independientes | PENDIENTE |
| 55 | El Plan Perfecto | 2017-01-17 | **2017-01-19** | [DGCINE, 06/02/2017](https://dgcine.gob.do/mas-de-50-mil-personas-han-visto-el-plan-perfecto/) confirma explícitamente estreno en todos los cines RD; evidencia institucional | PENDIENTE |
| 56 | La Lucha de Ana | 2012-04-13 | **2012-05-24** | [Ficha Cinema Dominicano](https://cinemadominicano.com/la-lucha-de-ana-2012/); [Ibermedia](https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/) no certifica el día; pedir otra evidencia del estreno | PENDIENTE |

### Categorías de decisión permitidas para una revisión REAL

Cada campo debe ser decidido **individualmente** por la persona revisora:

- **APROBAR_CANDIDATA**: fuente cotejada y criterio de estreno comercial RD satisfecho; registrar persona, fecha real UTC, fuente y comparación SQL; entonces preparar migración protegida.
- **MANTENER_ACTUAL**: hay evidencia fundada de que el SQL actual responde al criterio; documentar el motivo y la fuente.
- **REQUIERE_MAS_EVIDENCIA**: no hacer cambios; solicitar registro de distribuidor, cartelera, DGCINE o créditos apropiados.

El presente documento **no realiza** ninguna de estas decisiones. Las ocho filas conservan **PENDIENTE** y no se altera `docs/catalog-corrections-e4-approvals.json`, `docs/editorial-approvals-e5.json` ni `docs/editorial-issues-f2.json`.

## Campos de acta (rellenar manualmente, sin fabricar firmas)

**Por cada decisión:**
- `filmId`, `campo=FechaEstreno`, `tituloVerificado`
- `valorActualSql` leído en SSMS; `valorCandidato`
- `decision` (una de las anteriores)
- `fuentesRevisadas` (URL o evidencia almacenada)
- `criterio` (estreno comercial en cines RD, justificación)
- `revisadoPor` (nombre de quien verificó personalmente, no generado automáticamente)
- `revisadoEnUtc` (fecha real de la revisión)
- `observaciones` (incluida la diferencia premiere/estreno)
- Referencia de backup y hash de la propuesta antes de aplicar cualquier migración; **no inventar** un valor de huella

## Bloqueos paralelos NO abordados por esta tanda

1. **#30 — El Diablo no duerme en su cama:** `FechaEstreno=2024-09-22` en SQL/snapshot, sin prueba de estreno comercial esa fecha. No proponer reemplazo hasta evidencia primaria.
2. **#31 — Entiérrenlo Parao:** `2025-06-05` sin prueba de estreno comercial dominicano; estreno en festival extranjero en 2026 no determina valor para el campo.
3. **#40, #44, #47:** géneros que requieren criterio de clasificación; *Colao 2* tiene fuentes contradictorias.
4. **#42:** director Roger/Rogert Bencosme necesita créditos originales; no cambiar la identidad por inferencia.
5. **58 textos E-5, cinco sinopsis SQL y 128 medios** siguen pendientes de autorizaciones apropiadas; modo seguro `review` y anuncios desactivados.

## Procedimiento posterior, condicionado a autorizaciones efectivas

1. Registrar las ocho decisiones reales; no equiparar investigación documental a autorización.
2. Para las filas autorizadas como `APROBAR_CANDIDATA`, generar **un script SQL diferente**, protegido por ID, título, valor anterior, transacción, `OUTPUT`, respaldo y reversión, dirigido **solo a la base original con autorización explícita**.
3. Reexportar snapshot desde SQL real mediante el procedimiento del proyecto, **no editar datos manualmente**, y actualizar trazabilidad/correcciones nuevas; ampliar tests/avisos públicos si corresponde.
4. Correr todos los jobs de CI antes de integrar la PR #55, que permanece DRAFT. Ni una CI verde equivale a licencia de terceros o permiso para monetizar.

**Garantías de este paquete:** documentación y verificación de lectura solamente. **0 actualizaciones SQL; 0 decisiones humanas autocompletadas; 0 aprobaciones nuevas.**
