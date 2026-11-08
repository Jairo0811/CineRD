# CineRD — E-4 / F-2.3: barrera de autorización de correcciones del catálogo

**Estado:** mecanismo de control implementado y no activado. Las **siete modificaciones E-4 siguen pendientes** y el libro de aprobaciones continúa **vacío**. No se ha realizado ninguna conexión ni cambio SQL como resultado de esta entrega.

## Por qué se refuerza E-4

El procedimiento anterior exigía únicamente `--apply --confirm-db-backup` antes de intentar conectarse. El parámetro de confirmación **no comprobaba** que existiera un archivo real de respaldo ni que los siete campos tuvieran aprobación documentada. El diseño de transacciones, las comprobaciones del valor antiguo y las preimágenes locales existentes se conservan.

El nuevo `backend/scripts/e4ApprovalGate.js` se ejecuta **antes de abrir la conexión a SQL Server** y exige:

1. Una entrada de autorización documentada **por cada uno de los siete campos** del libro `docs/catalog-corrections-e4.json`, sin duplicados ni entradas ajenas.
2. Cada registro debe incluir `filmId`, `field`, `status: aprobado`, `fingerprint` SHA-256 coincidente, `reviewer` real, `reviewedAt` con zona horaria, `notes` suficientemente detalladas, `sourcesChecked: true`, `fieldMeaningReviewed: true`, `changeAuthorized: true` y al menos una `evidenceUrl` HTTPS vinculada a las fuentes del campo.
3. Que `DB_DATABASE` coincida con `sourceDatabase` del snapshot (en el actual: `CRUDPeliculas`).
4. Presencia de los argumentos `--apply --confirm-db-backup --backup-file RUTA_ABSOLUTA.bak`.
5. Existencia de un archivo local `.bak` **no vacío** en la ruta absoluta indicada.

**Límite de seguridad:** comprobar que existe un archivo con extensión `.bak` **no equivale a certificar que contiene un backup restaurable** ni que pertenece a la base/servidor correctos. Antes de ejecutar cambios, el administrador debe verificar la copia y su recuperación independientemente.

## Libro de autorizaciones

El archivo `docs/catalog-corrections-e4-approvals.json` inicia con `approvals: []`. **No escribir ni copiar ejemplos ficticios como si fueran aprobaciones reales.** El formulario deberá reflejar una revisión humana identificada y su decisión documentada. No se proporciona un atajo para aprobar automáticamente los siete campos.

Cada fingerprint incluye `sourceDatabase`, `filmId`, `title`, `field`, `expected`, `proposed` y las fuentes ordenadas. Si cambia un dato o la lista de fuentes, debe revisarse y autorizarse otra vez. Las cadenas SHA-256 permiten detectar modificaciones; **no son firmas criptográficas de la persona revisora** ni certifican derechos.

**Aclaración:** el expediente argumental de F-2.3 ofrece evidencia útil, pero no equivale por sí solo a una aprobación de E-4. Es necesario decidir explícitamente los siete campos. Especialmente para el director de *Sanky Panky 3* debe confirmarse la grafía canónica y para las fechas se utiliza el criterio `FechaEstreno: estreno comercial en cines de República Dominicana` del ledger.

## Comandos que SÍ pueden ejecutarse ahora

Desde la raíz del repositorio en PowerShell:

```powershell
npm --prefix backend run catalog:corrections:preview
npm --prefix backend run catalog:corrections:approvals:preview

node --test backend/tests/e4ApprovalGate.test.js
node --test backend/tests/applyEditorialCorrections.test.js

npm --prefix frontend run editorial:readiness
node --test scripts/editorialReadinessF23.test.mjs
```

La nueva vista previa de autorizaciones muestra **0/7 con registro atribuible** y los hashes de las propuestas, sin cambiar SQL. `catalog:corrections:preview` sigue mostrando los siete cambios pendientes y no abre conexión a SQL.

El diagnóstico de `editorialReadinessF23.mjs` ahora distingue **siete ajustes E-4 pendientes en el snapshot** de **siete autorizaciones E-4 pendientes**. Son controles separados.

## Procedimiento futuro — NO EJECUTAR AHORA

Solo después de que las siete revisiones humanas sean reales, de comprobar una copia de SQL Server recuperable y de validar en entorno controlado el efecto de los cambios, el administrador podrá utilizar el comando de aplicación. No se imprime aquí un ejemplo de ejecución completo para evitar que el flujo de revisión se confunda con un permiso para cambiar datos.

El código conservará las protecciones de E-4: lectura de identidad, transacción `SERIALIZABLE`, preimagen local ignorada por Git, comparación de `expected` frente al valor real y `ROLLBACK` ante discrepancias; también registra la ruta del respaldo preexistente en la preimagen. El archivo local de preimagen **no sustituye** el backup de SQL Server.

Después de cambios legítimos: reexportar el snapshot, validar catálogo, revisar `git diff`, recalcular las huellas editoriales afectadas y comprobar los controles de derechos de medios. Nunca emplear `catalog:import:replace` para resolver un ajuste puntual.

## Pruebas de regresión

- El libro real sigue con **0 aprobaciones**.
- La ausencia de una autorización bloquea la aplicación.
- Una huella falsa o una fuente no vinculada a la corrección invalida la autorización.
- Una base de datos distinta o un respaldo inexistente/vacío impide conectar.
- Se rechazan duplicados, faltantes, campos alterados y flags desconocidos.
- El diagnóstico integrado no considera lista la fase mientras existan bloqueos.

**La decisión humana y la copia restaurable son requisitos operativos**, no resultados de una prueba automatizada. F-2.3 continúa abierta; E-5 permanece con 58 textos sin aprobar.
