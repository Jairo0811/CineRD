# CineRD — Paquete de decisión editorial para ocho fechas (F-2.3)

**Fecha:** 2026-11-09 · **Rama:** `feat/f2-editorial-review` · **PR:** #55  
**Estado:** **3 FECHAS APROBADAS POR EL TITULAR** (#10, #40, #55), **3 CAMBIOS SQL APLICADOS SEGÚN CAPTURA SSMS**; **5 PENDIENTES DE DECISIÓN** (#27, #36, #42, #44, #56). Falta lectura SQL independiente y exportación del snapshot.  
**Objeto:** resolver la fecha de **estreno comercial en cines de República Dominicana**. La fecha de gala, festival, reseña, distribución internacional o preestreno no reemplaza esa definición.

## Evidencia técnica previa

El propietario ejecutó `SELECT` el 2026-11-09 en la base SQL Server original `CRUDPeliculas` sobre las películas 6,10,26,27,31,36,40,42,44,47,55,56. Los ocho registros abajo coinciden con el snapshot `database/seeds/catalog.snapshot.json` en valores históricos. **Este cotejo demuestra sincronía entre SQL y snapshot, no que las fechas históricas sean correctas.**

Para repetir una comprobación sin cambiar nada: **`database/scripts/f23_preflight_fechas_estreno_8_readonly.sql`**. El script identifica los ocho registros por ID/título y muestra el valor actual y el candidato. **Solo consulta**.

## Decisiones de revisión — no completar automáticamente

**Aprobación expresada el 2026-11-09:** ante la pregunta específica sobre las tres fechas de *Vamos de robo*, *Colao 2* y *El Plan Perfecto*, el titular respondió «aprobadas». La decisión está registrada en `docs/f23-approved-release-dates-2026-11-09.json`. Se refiere a **los tres valores de fecha**, no al género, director, sinopsis ni a otras cinco propuestas. No consta fecha exacta UTC, firma adicional, declaración individual de revisión de URLs ni ejecución SQL; esos datos **no se inventan**. El titular posteriormente creó y verificó un backup FULL COPY_ONLY con CHECKSUM; la captura SSMS de la migración muestra tres filas `EJECUCION_MANUAL_CONFIRMADA` con `UP` para #10, #40 y #55. **La aplicación fue reportada como ejecutada**, y no se debe repetir `UP`. Queda pendiente una lectura SELECT posmigración independiente y exportar el snapshot; los archivos versionados siguen con las fechas anteriores.

**Script protegido de aplicación/reversión manual (conservar como referencia; NO repetir UP):** `database/scripts/f23_fechas_3_aprobadas_manual_up_down.sql`. Por defecto muestra previa (`@Apply=0`) y no modifica datos. Exige un backup completo reciente con CHECKSUM, comprobación de integridad, verificación de preimagen y transacción para ejecutar UP o DOWN manualmente. La variante ejecutada en SSMS por el titular tiene automatizada la selección del backup; el script versionado conserva `@Apply=0` como estado seguro.

| ID | Película | Fecha actual en SQL | Candidata | Principal evidencia y evaluación | Decisión |
|---:|---|---|---|---|---|
| 10 | Vamos de robo | 2014-01-15 | **2014-01-16** | [Diario Libre (crónica 20/01/2014)](https://www.diariolibre.com/amp/revista/cine/vamos-de-robo-DIDL447141) habla de taquilla en primera noche, jueves 16; evidencia contemporánea fuerte | APROBADA Y APLICADA SEGÚN SSMS |
| 27 | Lotoman 003: Volando Bajito | 2014-03-15 | **2014-03-27** | [Ficha Cinema Dominicano](https://cinemadominicano.com/lotoman-003-volando-bajito-2014/) y [gala previa](https://cinemadominicano.com/orange-cinema-realiza-gala-premier-de-lotoman-003/); concordancia | PENDIENTE |
| 36 | Nueba Yol 3: Bajo la Nueva Ley | 1997-10-31 | **1997-10-23** | [Ficha Cinema Dominicano](https://cinemadominicano.com/nueba-yol-3-bajo-la-nueva-ley-1997/); **pedir otra evidencia primaria** por antigüedad y falta de cartelera | PENDIENTE |
| 40 | Colao 2 | 2023-12-07 | **2023-11-30** | [Anuncio de Caribbean Cinemas citado por Cinema Dominicano](https://cinemadominicano.com/colao-2-llega-a-los-cines-dominicanos/); lanzamiento en RD | APROBADA Y APLICADA SEGÚN SSMS |
| 42 | Andrea | 2005-08-16 | **2005-08-18** | [Ficha Cinema Dominicano](https://cinemadominicano.com/andrea-la-venganza-de-un-espiritu-2005/); **pedir confirmación independiente** | PENDIENTE |
| 44 | Playball | 2008-02-01 | **2008-02-14** | [Ficha Cinema Dominicano](https://cinemadominicano.com/play-ball-2008/); archivo [catálogo de cine dominicano](https://cinemadominicano.com/wp-content/uploads/2022/02/CDELM.pdf); revisar si son fuentes independientes | PENDIENTE |
| 55 | El Plan Perfecto | 2017-01-17 | **2017-01-19** | [DGCINE, 06/02/2017](https://dgcine.gob.do/mas-de-50-mil-personas-han-visto-el-plan-perfecto/) confirma explícitamente estreno en todos los cines RD; evidencia institucional | APROBADA Y APLICADA SEGÚN SSMS |
| 56 | La Lucha de Ana | 2012-04-13 | **2012-05-24** | [Ficha Cinema Dominicano](https://cinemadominicano.com/la-lucha-de-ana-2012/); [Ibermedia](https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/) no certifica el día; pedir otra evidencia del estreno | PENDIENTE |

### Categorías de decisión permitidas para una revisión REAL

Cada campo debe ser decidido **individualmente** por la persona revisora:

- **APROBAR_CANDIDATA**: fuente cotejada y criterio de estreno comercial RD satisfecho; registrar persona, fecha real UTC, fuente y comparación SQL; entonces preparar migración protegida.
- **MANTENER_ACTUAL**: hay evidencia fundada de que el SQL actual responde al criterio; documentar el motivo y la fuente.
- **REQUIERE_MAS_EVIDENCIA**: no hacer cambios; solicitar registro de distribuidor, cartelera, DGCINE o créditos apropiados.

**Tres decisiones expresas ya registradas y aplicación UP reportada por SSMS:** #10, #40 y #55; las otras cinco filas mantienen **PENDIENTE**. No se altera `docs/catalog-corrections-e4-approvals.json` (libro E-4 de otras siete correcciones), `docs/editorial-approvals-e5.json` ni `docs/editorial-issues-f2.json`. Ninguna decisión de fecha implica automáticamente la aprobación de una sinopsis o el cierre de una incidencia.

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

1. Conservar las tres decisiones expresas registradas y solicitar revisión/decisión independiente de las otras cinco; no equiparar investigación documental a autorización.
2. La migración UP de las tres filas ya fue ejecutada, según el OUTPUT SSMS del titular. **NO repetir UP.** Antes de publicar, verificar las tres fechas mediante SELECT nuevo y exportar el snapshot real desde `CRUDPeliculas`; comparar diferencias antes de confirmar el commit.
3. Reexportar snapshot desde SQL real mediante el procedimiento del proyecto, **no editar datos manualmente**, y actualizar trazabilidad/correcciones nuevas; ampliar tests/avisos públicos si corresponde.
4. Correr todos los jobs de CI antes de integrar la PR #55, que permanece DRAFT. Ni una CI verde equivale a licencia de terceros o permiso para monetizar.

**Garantías:** las tareas automatizadas de GitHub no actualizan SQL; la captura del titular muestra **3 actualizaciones SQL en `CRUDPeliculas`**, con 3 decisiones expresas del titular, 5 pendientes, 0 firmas ficticias y 0 aprobaciones automáticas E-4/E-5. La lectura posmigración y sincronización del snapshot siguen abiertas.
