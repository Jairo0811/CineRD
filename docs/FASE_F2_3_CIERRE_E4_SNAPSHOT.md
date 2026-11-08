# CineRD — E-4: sincronización segura del snapshot después de SQL Server

**Hallazgo real (8 de noviembre de 2026):** `CRUDPeliculas` devuelve **7/7 `ALREADY`** para los campos de E-4; el snapshot versionado conserva sus siete valores anteriores. El usuario ya ejecutó `catalog:export` con 46 películas, 83 talentos, 216 participaciones, 28 créditos, una traducción y 12 elementos de galería; `catalog:validate` concluyó correctamente y el diff estadístico mostró **8 líneas modificadas**.

**No hay que repetir `catalog:corrections:apply`**. Las siete actualizaciones ya existen en SQL Server y no se debe atribuirles una aprobación humana que no esté documentada.

## Nuevo verificador antes del commit

`scripts/verifyE4SnapshotExport.cjs` lee, sin modificar nada:

- La versión del snapshot de Git HEAD (`git show HEAD:database/seeds/catalog.snapshot.json`).
- `database/seeds/catalog.snapshot.json` del directorio de trabajo, ya exportado desde SQL.
- `docs/catalog-corrections-e4.json` con las siete propuestas.

Comprueba que los **siete valores anteriores** estén en HEAD, que los **siete valores propuestos** figuren en el snapshot exportado y que la **única diferencia adicional** sea `generatedAtUtc`, con fecha UTC válida y posterior. Compara íntegramente los objetos JSON: cualquier cambio de otras películas, actores, relaciones, contenidos, multimedia, columnas o metadatos **hace fallar el verificador**.

La consulta no abre SQL, no cambia Git y no crea permisos, aprobaciones ni snapshots.

## Comprobación y commit local, en ese orden

Desde la raíz del repositorio, con PowerShell:

```powershell
git pull --ff-only origin feat/f2-editorial-review
git log -1 --oneline

node --test scripts/verifyE4SnapshotExport.test.cjs
npm --prefix backend run catalog:corrections:snapshot:verify
git diff -- database/seeds/catalog.snapshot.json
git diff --check
```

**Continúa únicamente si** el verificador muestra `✓ Solo cambian las 7 correcciones E-4 y generatedAtUtc.` y si el diff confirma exactamente esos cambios, sin datos inesperados.

```powershell
git add -- database/seeds/catalog.snapshot.json

# Antes del commit, comprobar que SOLO este archivo quedó staged
git diff --cached --name-only
git diff --cached --check
git diff --cached --stat

git commit -m "data(catalog): sincronizar siete correcciones E-4 ya presentes en SQL"
git push origin feat/f2-editorial-review

npm --prefix frontend run editorial:readiness
```

`git add -- database/seeds/catalog.snapshot.json` **no añade** `backend-dotnet/`, `CineRD-Netlify-Demo-Patch/`, scripts de pruebas Cloudflare ni parches `.patch` que estén sin seguimiento. **No ejecutar `git add .` ni `git add -A`** en este flujo.

El verificador es de **precommit** y requiere comparar el HEAD antiguo con el snapshot exportado. Después de hacer el commit, el nuevo HEAD ya contendrá los siete datos actualizados y ese cotejo puntual puede dejar de aplicar. Para el futuro seguimiento usar `editorial:readiness` y `catalog:validate`.

## Resultados esperados después del commit

`editorial:readiness` deberá reflejar `E-4: 0 cambios pendientes; 7 reflejados en snapshot`. **El libro de autorizaciones seguirá en 0/7**, y las aprobaciones editoriales E-5 en 0/58; ningún informe de sincronización puede crear una autorización humana de manera retroactiva.

**No confundir disponibilidad física con licencias de multimedia:** la prueba local `128/128` refleja solo archivos presentes, no derechos comerciales acreditados. No se habilita publicidad ni contenido editorial sin revisión.

Si el verificador encuentra discrepancias, **no hacer commit**: compartir el reporte y el diff para una investigación de alcance antes de incorporar el archivo.
