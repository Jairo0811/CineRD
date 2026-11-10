# CineRD — F-2.5 · Triaje conjunto de 18 observaciones editoriales ALTA

**Corte:** 8 de noviembre de 2026. **Fuente del inventario:** `docs/editorial-issues-f2.json` + `database/seeds/catalog.snapshot.json` + `docs/catalog-corrections-e4.json`.  
**Estado:** diagnóstico técnico/documental, **no resolución humana** ni permiso de exhibición; no modifica base de datos, sinopsis, derechos ni decisiones de E-4/E-5.

## Hallazgo central

Hay **18 observaciones altas** correspondientes a **16 películas**. No todas representan fallos actuales de datos: parte de la matriz reproduce observaciones del snapshot F-2.2 anterior y ahora está desactualizada en su descripción histórica.

| Grupo del triaje | Observaciones | Qué se comprobó ahora | Próxima acción |
|---|---:|---|---|
| **A · E-4 reflejado en el snapshot, sin aprobación** | **5** | Los **7 campos** E-4 en 4 películas ya contienen el valor **propuesto en el JSON exportado**. El libro de autorizaciones E-4 permanece vacío | Consultar **SQL Server real en modo lectura**, confirmar procedencia y registrar decisiones humanas reales; no reaplicar ciegamente |
| **B · Nueva propuesta de sinopsis SQL ES/EN** | **4** | Hay borradores propios en revisión para #6, #10, #55 y #56 | Examinar originalidad, fuentes, equivalencia ES/EN y condiciones de uso. Sin cinco decisiones válidas ni respaldo restaurable no migrar |
| **C · Borrador ES/EN con precisión editorial ajustada** | **1** | #26 ya recoge el horario nocturno en la redacción candidata según expediente | Confirmación factual/editorial humana antes de cerrar incidencia |
| **D · Datos/fechas/créditos por resolver** | **8** | No hay propuesta E-4 controlada para estas incidencias | Buscar fuentes primarias y decidir si procede propuesta separada, sin cambiar el snapshot de forma manual |
| **Total** | **18** | **0 incidencias altas resueltas por firma humana** | Mantener `pendiente_verificacion` hasta evidencia |

## A · Los 7 campos E-4 ya figuran en el snapshot

Las cinco *observaciones* E-4 son #9 (sinopsis y contexto), #24, #30 y #32; cada una puede señalar más de un campo. Los valores actuales **en el snapshot** coinciden con:

| Película | Campo | Anterior (en expediente E-4) | Actual en snapshot |
|---|---|---|---|
| #9 Lotoman | Género | Infantil | Comedia |
| #9 Lotoman | FechaEstreno | 2011-03-10 | 2011-01-20 |
| #24 Sanky Panky 3 | Director | NULL | Eduardo Transfor Ortiz |
| #24 Sanky Panky 3 | FechaEstreno | 2018-03-18 | 2018-03-29 |
| #30 El Diablo no duerme en su cama | Director | NULL | Amauris Pérez |
| #32 Los Rechazados 2: Operación Espacial | Director | NULL | Yasser Michelén |
| #32 Los Rechazados 2: Operación Espacial | FechaEstreno | 2026-09-13 | 2026-08-13 |

**Importante:** estos datos NO acreditan que la base SQL conectada hoy tenga las siete modificaciones, ni que se hayan obtenido las siete autorizaciones. La matriz conserva la historia de la investigación y **no se marca como resuelta**. Para dirimirlo sin escribir en SQL:

```powershell
npm --prefix backend run catalog:corrections:live:preview
```

La herramienta emite `EXPECTED` (anterior), `ALREADY` (propuesto), `DRIFT` (distinto) o `MISSING` (sin película). Si hay estado mixto o distinto, NO ejecutar lote E-4 de aplicación y revisar la procedencia.

## B · Cuatro propuestas de sinopsis SQL: #6, #10, #55 y #56

- **#6 Ladrones a Domicilio:** diferencia entre `chofer` y `guardia de seguridad`; fuentes sobre transporte de valores. Revisar papel del protagonista con la película/créditos y constatar la titularidad del texto.
- **#10 Vamos de robo:** la versión SQL previa guarda similitud con textos comerciales; nuevo argumento ES/EN candidato. La diferencia 15/01 vs 16/01/2014 en estrenos requiere metadatos **independientes** del reemplazo de sinopsis.
- **#55 El Plan Perfecto:** nueva propuesta ES/EN; diferencia 17/01 vs 19/01/2017 en fechas según fuentes y clase de estreno. No aprobar como hecho sin precisar significado de `FechaEstreno`.
- **#56 La Lucha de Ana:** nueva propuesta ES/EN; metadato SQL 13/04 vs 24/05/2012. Distinguir fecha de salida comercial de cualquier otra. La ubicación del mercado también requiere contraste entre fuentes.

El expediente conjunto de las **cinco** sinopsis SQL incluye además **#5 Perico Ripiao** (incidencia de otra prioridad); no dejarla fuera al aprobar/migrar el lote.

## C · Una redacción corregida pero todavía no aprobada: #26

**Feo de día, Lindo de noche:** el expediente F-2.3 reemplazó una referencia temporal ambigua por un período **de 8 p. m. a medianoche** en las versiones ES/EN candidatas. Falta una verificación editorial real; el mero cambio del borrador no cierra su incidencia.

## D · Ocho observaciones que requieren una decisión nueva

| Incidencia | Discrepancia que queda documentada en F-2.2 | Qué confirmar antes de cambiar |
|---|---|---|
| #27 Lotoman 003 | 15/03/2014 vs 27/03/2014 | Estreno comercial RD; no deducir fecha de un anuncio |
| #31 Entiérrenlo Parao | 05/06/2025 frente a referencias de festival 2026 | Tipo de estreno; no equiparar festival con estreno en salas |
| #36 Nueba Yol 3 | 31/10/1997 vs 23/10/1997 | Registro original de estreno y nombre/secuencia de la obra |
| #40 Colao 2 | 07/12/2023 vs 30/11/2023; género Comedia vs Drama | Distribución comercial y taxonomía de género |
| #42 Andrea | 16/08/2005 vs 18/08/2005; Roger/Rogert Bencosme | Créditos originales para nombre exacto |
| #44 Playball | 01/02/2008 vs 14/02/2008; género Comedia vs Drama | Estreno, festivales y fuente de género |
| #47 Pimp Bullies | Acción vs Drama/Thriller; variantes del título | Crédito y clasificación comercial, convenciones de catálogo |
| #56 La Lucha de Ana (contexto) | 13/04/2012 vs 24/05/2012; alcance de registro Ibermedia | No inferir subvenciones ni día de estreno de una ficha solo anual |

**No se añadieron correcciones E-4 nuevas**: requieren fuentes cotejadas y decisión humana; las antiguas siete se mantienen tal como aparecen en el registro.

## Comprobaciones automáticas

```powershell
node scripts/reportHighPriorityEditorial.mjs
node --test scripts/reportHighPriorityEditorial.test.mjs
```

El informe comprueba identidad de películas, observa el snapshot, agrupa las 18 altas y conserva su estado documental. Emite error si detecta una desviación E-4 inesperada. No edita `docs/editorial-issues-f2.json` ni concede licencias.

## Límites antes del cierre

- Incidencias `status: pendiente_verificacion` hasta firma humana, `notes`, fuentes HTTPS, fecha y huella vigentes en la matriz.
- El libro E-5 continúa con **0/58** revisiones acreditadas; resolver una incidencia NO equivale a aprobar su texto.
- Libro E-4 **0/7** autorizaciones acreditadas; un snapshot actualizado NO equivale a licencia ni a autorización retroactiva.
- Cinco propuestas de reemplazo SQL siguen sin aplicarse y con derechos/documentación humanos pendientes.
- **No fusionar como producción comercial** solo porque pase CI o un script informativo.

## Contraste efectivo SQL Server / snapshot (8 de noviembre de 2026)

El responsable ejecutó el 8/11/2026 `npm --prefix backend run catalog:corrections:live:preview` desde su equipo con base `CRUDPeliculas`. **Los 7 campos E-4 regresaron `ALREADY`**, sin `DRIFT` ni `MISSING`. La verificación documental del repositorio comprobó además que los **7 valores propuestos ya constan en el snapshot actual**. Por tanto, **no ejecutar `catalog:corrections:apply`, ni reexportar el catálogo por estos siete valores**.

Se corrigió el formato de salida del verificador para distinguir `snapshot_actual` (valor versionado real) de `anterior_E4` (preimagen histórica registrada en el expediente). El nuevo contraste **comparará SQL y snapshot directamente** y señalará diferencias antes de recomendar ninguna actuación.

**Trazabilidad administrativa pendiente:** las siete autorizaciones E-4 **no constan** en el libro. No se sabe desde la comprobación cuándo, cómo o por quién se aplicaron los siete valores; el hecho de encontrarlos en SQL no permite fabricar una aprobación retroactiva. Las 5 incidencias altas E-4 no se cierran automáticamente, ni cambian las 0/58 aprobaciones E-5.
