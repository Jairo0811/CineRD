# CineRD — F-2.3: preparación reversible y manual de migración SQL para sinopsis

**Estado:** procedimiento preparado, **sin migraciones ejecutadas**, sin aprobaciones registradas y sin cambios al catálogo.  
**Commit:** trabajo en `feat/f2-editorial-review`.  
**Base:** `backend/scripts/applyEditorialCorrections.js` (patrón E-4), `docs/editorial-sql-replacement-drafts-f23.json`, `docs/editorial-provenance-sql-f23.json`.

## Qué se incorpora

- `backend/scripts/prepareEditorialSqlMigration.js`: **preparador offline**, sin dependencias de SQL Server ni conexiones a bases de datos. En modo normal imprime el inventario y las **huellas SHA-256** de las cinco propuestas sin modificar ningún archivo.
- `docs/editorial-sql-migration-approvals-f23.json`: libro de decisiones humanas **vacío**. Es distinto de `docs/editorial-approvals-e5.json`; nunca debe llenarse a partir de un validador o de una IA.
- `backend/tests/prepareEditorialSqlMigration.test.js`: siete pruebas de control de firmas, huellas y generación de SQL transaccional reversible.

## Modo vista previa, seguro

Desde la raíz de CineRD:

```powershell
node backend/scripts/prepareEditorialSqlMigration.js
node backend/scripts/prepareEditorialSqlMigration.js --film-id 55
node --test backend/tests/prepareEditorialSqlMigration.test.js
```

Debe informar que hay **0 aprobaciones humanas de migración**. El programa no crea archivos ni abre SQL Server.

La huella (fingerprint) de cada película depende de: ID, título, año, **SHA-256 de la sinopsis original SQL**, textos propuestos ES/EN y lista de fuentes. Si cambia uno de esos valores, la aprobación anterior deja de ser válida.

## Aprobación manual futura

Este paso **NO se realiza ahora**. Una persona responsable de la revisión editorial deberá comprobar texto, traducción, procedencia, derechos y fuentes, y documentar la decisión en el libro. Una entrada futura exige `filmId`, `status: aprobado`, `fingerprint` exacto, `reviewer`, `reviewedAt` con zona horaria, `notes` sustanciales y los seis campos booleanos siguientes en `true`: `sourcesChecked`, `esReviewed`, `enReviewed`, `originalityReviewed`, `rightsReviewed`, `releaseAuthorized`.

No se proporcionan revisores ficticios ni se marcan autorizaciones como obtenidas. El programa no acepta una aprobación de otro texto o un simple `--apply` para saltarse estas barreras.

## Preparar scripts para un solo título, tras aprobarlo

Hacer previamente un respaldo `.bak` **real y comprobado** de SQL Server. El preparador verifica que exista un archivo local `.bak` no vacío; **no puede certificar que el respaldo sea restaurable**. Corresponde al administrador verificarlo.

Ejemplo conceptual de uso futuro, **solo cuando exista una aprobación humana real**:

```powershell
node backend/scripts/prepareEditorialSqlMigration.js --generate --film-id 55 --backup-file "C:\Respaldos\CineRD_ANTES_F23.bak"
```

Mientras `approvals` esté vacío, el comando falla y **no genera scripts ejecutables**.

Cuando exista aprobación válida, genera en la ruta **ignoradas por Git** `backend/backups/editorial/sql-f23/film-ID-FINGERPRINT/`:

1. `up.sql`: actualiza únicamente `dbo.Peliculas.Sinopsis` en **español**, para la película seleccionada.
2. `down.sql`: revierte a la sinopsis original **únicamente si** la base contiene exactamente el texto actualizado. Nunca sobrescribe cambios posteriores silenciosamente.
3. `preimage.json`: huellas, copia del texto anterior, redacciones ES/EN y metadatos de revisión; **no subir al repositorio**.

**La herramienta nunca ejecuta estos scripts**. Es responsabilidad del administrador revisarlos, ejecutar manualmente el `up.sql` en el servidor adecuado, verificar una única fila actualizada y conservar la copia de seguridad. Solo entonces corresponde exportar y validar de nuevo el snapshot:

```powershell
npm --prefix backend run catalog:export
npm --prefix backend run catalog:validate
node scripts/editorialReviewAudit.mjs
```

Antes de fusionar a `main` o desplegar cambios, revisar el diff del snapshot, las rutas de medios y la huella nueva de E-5. **No ejecutar `catalog:import:replace`** para esta operación.

## Garantías y limitaciones

- Los SQL generados comprueban `DB_NAME()` frente a `sourceDatabase` del snapshot, usan `SERIALIZABLE`, `UPDLOCK/HOLDLOCK`, `TRY/CATCH`, `XACT_ABORT`, comparación binaria del texto antiguo y validación de identidad ID/título/año; `@@ROWCOUNT` debe ser exactamente 1.
- La migración aplica solo **ES** al campo SQL `Sinopsis`. El texto **EN** queda conservado en el expediente; ofrecer traducción en vivo requiere una decisión de arquitectura separada para `PeliculaTraducciones` o un mecanismo equivalente.
- El simple hecho de aprobar un reemplazo no acredita automáticamente los derechos sobre la sinopsis SQL antigua. La evaluación de procedencia anterior permanece registrada.
- El `fingerprint` de este procedimiento es para **autorizar una migración específica**; no sustituye el fingerprint de `editorialReviewAudit.mjs` ni las aprobaciones de E-5.
- No existe conexión automática entre el libro de migración, las fichas públicas o el despliegue.
- AdSense continúa desactivado y los medios sin licencia comercial permanecen excluidos en la compilación Cloudflare segura.

## Pruebas previstas

```powershell
node --test backend/tests/prepareEditorialSqlMigration.test.js
node backend/scripts/prepareEditorialSqlMigration.js
node backend/scripts/prepareEditorialSqlMigration.js --film-id 55
node scripts/verifyEditorialSqlReplacementDrafts.mjs
node scripts/verifyEditorialSqlProvenance.mjs
node scripts/verifyEditorialIssueMatrix.mjs
npm --prefix frontend test
npm --prefix frontend run editorial:review
```

**Resultado esperado actualmente:** vista previa funcional; 0 aprobaciones de migración; 5 propuestas SQL pendientes; 58 piezas editoriales pendientes. No se debe generar ni ejecutar ningún `up.sql` sin revisión atribuida.

**Nota de seguridad:** el preparador valida el tamaño y la existencia del archivo `.bak`, no su contenido. Verificar respaldos restaurables fuera de esta herramienta; los archivos locales con preimágenes pueden contener textos sujetos a derechos y deben conservarse con acceso restringido.
