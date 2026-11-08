# CineRD — F-2.3 · Diagnóstico integral de preparación editorial

**Estado:** auditoría documental automatizada de **solo lectura**. No autoriza publicaciones, no modifica SQL ni concede licencias, no sustituye revisión o aprobación humana.

## Objetivo

Disponer de **un solo comando reproducible** para conocer los obstáculos pendientes antes de cerrar F-2.3, en lugar de inferir que el éxito de las pruebas unitarias significa que las sinopsis ya son publicables.

**Nuevo script:** `scripts/editorialReadinessF23.mjs`.

Comprueba la integridad de la matriz F-2.3 y los registros SQL, aprovechando los validadores existentes; consulta también las huellas E-5 y las propuestas E-4, sin modificar ninguno de sus archivos.

## Resultado documental actual

| Control | Situación | Interpretación |
|---|---|---|
| Piezas E-5 | **0/58 aprobadas**; 58 pendientes | La cobertura de contraste NO es aprobación |
| Matriz F-2.3 | **58/58 observaciones pendientes; 0 resueltas** | 18 de prioridad alta, 18 media, 22 baja |
| Procedencia de cinco sinopsis SQL | **5 sin evidencia de permiso de reproducción registrada** | No permite presumir infracción ni permiso |
| Propuestas ES/EN SQL | **5 propuestas pendientes** | 0 publicadas automáticamente |
| Aprobaciones para migración SQL | **0/5** | El generador reversible sigue bloqueado |
| Propuestas E-4 | **7 cambios en cuatro películas**, pendientes en snapshot | No se han aplicado en la base exportada |
| Aptitud para cerrar F-2.3 | **NO LISTA** | Hacen falta decisiones y verificaciones humanas reales |

La herramienta diferencia **inconsistencias técnicas** (errores en un registro) de **bloqueos de revisión** (documentos válidos, pero pendientes de decisiones). Un resultado correcto del validador puede terminar con «NO LISTA» sin que exista fallo de software.

## Ejecutar desde la raíz de CineRD

```powershell
# Informe normal: salida 0 si los documentos son coherentes, incluso con bloqueos
node scripts/editorialReadinessF23.mjs

# Salida estructurada (no modifica archivos)
node scripts/editorialReadinessF23.mjs --json

# Salida 1 mientras F-2.3 no esté lista (comportamiento esperado HOY)
node scripts/editorialReadinessF23.mjs --strict

# Accesos rápidos desde frontend
npm --prefix frontend run editorial:readiness
npm --prefix frontend run editorial:readiness:strict

# Siete pruebas de regresión
node --test scripts/editorialReadinessF23.test.mjs
```

**No usar `--strict` como requisito de compilación pública mientras existan 58 revisiones pendientes**: su fallo actual es deliberado y significa que no debe declararse la fase concluida, no que el frontend esté averiado.

## Incidencias resueltas frente a aprobaciones

El diagnóstico muestra **dos contadores distintos**: `issues.pending` e `issues.resolved`. Solo una resolución humana atribuida, con fecha, fuentes HTTPS y fingerprint vigente, puede reducir el primero. El validador `verifyEditorialIssueMatrix.mjs` exige esos requisitos y rechaza cierres falsos o desactualizados.

Una incidencia documental resuelta **no incrementa** `editorial.approved`; la aprobación de contenido continúa bajo el registro E-5. Asimismo, la disponibilidad de permisos SQL y la aprobación de migraciones siguen siendo controles separados. Con los registros actuales, los conteos permanecen en **58 pendientes / 0 resueltas / 0 aprobaciones E-5**.

## Flujo para resolver bloqueos

1. **Textos y argumento:** revisar personalmente las cinco fichas usando `docs/FASE_F2_3_CONTRASTE_ARGUMENTAL_SQL_5.md` y los expedientes locales de `prepareEditorialHumanReview.js`. Resolver dudas del argumento, fuentes y calidad ES/EN.
2. **Procedencia:** identificar autor y autorización cuando corresponda; si no existe prueba de licencia para los textos SQL antiguos, tomar una decisión editorial y jurídica informada sobre retiro y sustitución. No inferir permiso de una URL.
3. **Datos E-4:** para fechas, género y directores, revisar las siete propuestas frente a fuentes primarias; solo actualizar SQL Server mediante su procedimiento de respaldo, comprobación de preimagen y nueva exportación.
4. **Aprobación humana de una migración:** registrar decisiones atribuibles y huella exacta solamente tras revisión real. El preparador `prepareEditorialSqlMigration.js` debe continuar sin generar scripts hasta entonces.
5. **Revisión final E-5:** validar la versión **que realmente se publica**, con fuentes vigentes, autoría, derechos, coherencia ES/EN y firma humana. El control de fingerprints impide reutilizar la aprobación de un texto distinto.

## Límites expresos

- El programa **no inspecciona directamente Cloudflare**, ni certificados de licencias de imágenes, ni la cuenta AdSense; sus controles específicos siguen siendo independientes.
- Las aprobaciones son **registros atribuibles**, no firmas criptográficas ni prueba automática de identidad del revisor. Ni una firma en JSON ni las pruebas de este informe certifican por sí solas el cumplimiento de derechos de autor.
- Que una corrección E-4 aparezca en el snapshot no demuestra que todas las fuentes sean definitivas; revisarlas sigue siendo una responsabilidad humana.
- `ready` representa **ausencia de bloqueos documentales detectados**, no consentimiento de titulares, seguridad jurídica o autorización de publicación.
- Ninguna salida crea ni rellena `docs/editorial-approvals-e5.json` ni `docs/editorial-sql-migration-approvals-f23.json`.
- AdSense se mantiene desactivado y la compilación segura de derechos de medios continúa en modo `review`.

**Conclusión:** el proyecto funciona técnicamente y su expediente de F-2.3 es trazable, pero **la fase editorial no está cerrada** hasta que los bloqueos se atiendan con decisiones humanas verificables.
