# CineRD — F-2.3 · Expedientes para revisión humana de sinopsis SQL

**Estado:** preparación documental. El inventario actual mantiene **cinco propuestas pendientes** y **cero aprobaciones de migración**. Los expedientes NO autorizan publicación, reutilización, ni modificación de SQL Server.

## Procedimiento

El comando `backend/scripts/prepareEditorialHumanReview.js` lee exclusivamente:

- `database/seeds/catalog.snapshot.json`
- `docs/editorial-sql-replacement-drafts-f23.json`
- `docs/editorial-provenance-sql-f23.json`
- `docs/editorial-issues-f2.json`
- `docs/editorial-sources-sql-f2.json`

Para cada una de las cinco películas con sinopsis SQL, el expediente compara:

1. Sinopsis actual en SQL (referencia histórica).
2. Propuesta de redacción española.
3. Propuesta de traducción inglesa.
4. Fuentes, preguntas abiertas, coincidencias de procedencia y prioridad F-2.3.
5. Huella `SHA-256` del candidato de migración, computada por el mismo módulo de `prepareEditorialSqlMigration.js`.
6. Lista de tareas y campos **vacíos** para revisión humana.

**La herramienta no crea aprobaciones, no da por satisfechos permisos y no toca los libros de aprobación.**

## Ejecutar desde la raíz del repositorio

```powershell
node --test backend/tests/prepareEditorialHumanReview.test.js

# Vista previa general: no crea archivos
node backend/scripts/prepareEditorialHumanReview.js

# Revisar en la consola una película
node backend/scripts/prepareEditorialHumanReview.js --film-id 55 --show

# Crear un expediente Markdown local de una película; no se publica en GitHub
node backend/scripts/prepareEditorialHumanReview.js --film-id 55 --write
```

El archivo local aparece en `backend/backups/editorial/review-f23/`, directorio que ya está excluido de Git por `.gitignore`. Se escribe con el modo de creación exclusiva `wx`: un expediente existente nunca se sobrescribe de forma silenciosa.

La revisión debe abordar los asuntos pendientes **individualmente**:

| ID | Película | Prioridad inicial | Tema de atención |
|---:|---|---|---|
| 5 | Perico Ripiao | Media | Duración del encierro, hechos de la huida y procedencia SQL |
| 6 | Ladrones a Domicilio | Alta | Identidad del segundo empleo, hechos documentados y procedencia |
| 10 | Vamos de robo | Alta | Sustento del argumento y coincidencias extensas de redacción |
| 55 | El Plan Perfecto | Alta | Detalles del almacén y diferencias entre fuentes |
| 56 | La lucha de Ana | Alta | Causa de la muerte, redacción y procedencia |

**Las prioridades describen trabajo pendiente, no infracciones confirmadas.** La presencia de una descripción similar en otro catálogo no determina la titularidad de derechos.

## Después de una revisión real

La persona revisora registrará correcciones y evidencia de procedencia. Una decisión de publicar requerirá una aprobación atribuida, con fecha y huella actual, y el cumplimiento de los seis controles estipulados por `prepareEditorialSqlMigration.js`.

El expediente Markdown **no es un documento de firma digital**, no modifica `docs/editorial-sql-migration-approvals-f23.json` ni `docs/editorial-approvals-e5.json`. No debe utilizarse un nombre ficticio para habilitar la generación de `UP/DOWN`.

Si una propuesta cambia durante la revisión, el fingerprint anterior ya no sirve; será preciso regenerar el expediente y validar nuevamente sus referencias. Tampoco se puede concluir que una traducción sea publicable solo por coincidir con fuentes narrativas.

## Restricciones vigentes

Las cinco sinopsis SQL siguen tal cual. Las **58 piezas editoriales continúan pendientes** de aprobación y las reglas de derechos de imágenes y AdSense permanecen sin cambios. No iniciar una migración hasta verificar respaldo de SQL Server, evidencia de autorización correspondiente, plan de reversión y validación de las huellas.

Este paso **facilita la revisión humana**, pero no la suplanta ni cierra por sí mismo F-2.3.
