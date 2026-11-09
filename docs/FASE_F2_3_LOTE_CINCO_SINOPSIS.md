# CineRD — F-2.3 · Sustitución conjunta de las cinco tramas SQL

**Objetivo del usuario:** evitar revisar/aplicar las cinco películas con cinco comandos individuales. Ahora las propuestas bilingües están listas como un **lote**. La actualización SQL (solo el texto ES, columna `dbo.Peliculas.Sinopsis`) se planifica como **una transacción**, de forma que un fallo provoque `ROLLBACK` de las cinco. **Actualmente no existe autorización humana documentada y la ejecución no está habilitada.**

## 1. Inventario completo

| ID | Película | Cambio preparado | Estado |
|---:|---|---|---|
| 5 | Perico Ripiao (2003) | Nueva redacción ES/EN: tres presos, burocracia, fuga e instrumentos musicales; no fija años de encierro en disputa | pendiente de aprobación |
| 6 | Ladrones a Domicilio (2008) | Nueva redacción ES/EN: Bruno, becas, segundo empleo y robo interno | pendiente de aprobación |
| 10 | Vamos de robo (2014) | Nueva redacción ES/EN: cuatro empleados de un banco, RD$150 millones y sospechas | pendiente de aprobación |
| 55 | El Plan Perfecto (2017) | Nueva redacción ES/EN: venta del almacén, recontratación, mercancía ilegal y persecución | pendiente de aprobación |
| 56 | La Lucha de Ana (2012) | Nueva redacción ES/EN: florista, asesinato de su hijo, búsqueda de justicia y conflicto interior | pendiente de aprobación |

Las cinco propuestas permanecen en `docs/editorial-sql-replacement-drafts-f23.json`, `draftOrigin=nueva_redaccion_f23`, `status=pendiente_revision`, `deployment=manual_only`, y están respaldadas por `docs/editorial-sources-sql-f2.json`. **Ninguna se ha publicado ni tiene permiso o firma atribuida.**

## 2. Un solo comando de revisión para las cinco

Tras `git pull --ff-only origin feat/f2-editorial-review` en la rama correspondiente:

```powershell
npm --prefix backend run catalog:synopses:batch -- --show
```

Este comando muestra **las cinco sinopsis antiguas identificadas con su huella y las cinco versiones candidatas ES/EN**, sin abrir SQL ni escribir archivos. Sin `--show` solo enumera cada obra, el estado de aprobación y la huella.

Para comprobar la implementación del lote:

```powershell
node --test backend/tests/applyEditorialSynopsesBatch.test.js
node scripts/verifyEditorialSqlReplacementDrafts.mjs
```

## 3. Una sola operación SQL para las cinco (desactivada hasta aprobación)

El mismo comando soporta, **solo cuando se completen las cinco revisiones humanas reales**, la operación:

```powershell
npm --prefix backend run catalog:synopses:batch -- --apply --confirm-db-backup --backup-file "C:\RUTA_REAL\respaldo-verificado.bak"
```

**No ejecutar ahora:** `docs/editorial-sql-migration-approvals-f23.json` contiene `approvals: []`. El sistema rechazará `--apply` antes de abrir SQL.

**Condiciones obligatorias del lote:**

1. Las cinco decisiones humanas documentadas, con identidad real, fecha con zona horaria, revisión de fuentes, exactitud ES/EN, originalidad, derechos, autorización de publicación, motivación y `fingerprint` vigente de cada propuesta, en el ledger de aprobación SQL. Los campos «aprobado» no son firmas criptográficas.
2. Un archivo de respaldo SQL Server `.bak` real, accesible por ruta absoluta, no vacío y **probado para restauración por el administrador**. La herramienta comprueba existencia, no restaurabilidad; la prueba de restauración es un procedimiento humano aparte.
3. `backend/.env` con `DB_DATABASE` igual al `sourceDatabase` versionado; no imprimir ni compartir claves.
4. Las cinco preimágenes SQL originales idénticas a las almacenadas en el snapshot, además del mismo ID, título y fecha/año. El fallo en **cualquier** fila aborta sin ejecutar los cinco `UPDATE`.
5. Una única transacción `SERIALIZABLE`, con bloqueos de actualización, una preimagen local ignorada por Git antes de la modificación y rollback ante un error. La preimagen JSON no sustituye el `.bak`.

**Después de aplicar (si y solo si todo fue autorizado):** exportar el snapshot, validar, verificar el diff completo, revisar la publicación del frontend y considerar por separado las versiones EN. No marcar E-5 completada automáticamente.

## 4. Hallazgos particulares de los dos últimos candidatos

### #5 Perico Ripiao

Cinema Dominicano y CineDominicano hablan de **diez años** en prisión por delitos menores; FilmAffinity y Cine.com señalan **siete años**. La sinopsis evita cuantificarlos mientras las fuentes discrepen. Se preservan los instrumentos y la intención de reunirse con sus familias.

Fuentes:
- https://cinemadominicano.com/perico-ripiao-2003/
- https://cinedominicano.com/peliculasdominicanas/pelicula/perico-ripiao-2003/
- https://www.filmaffinity.com/es/fullcredits.php?movie_id=452681

### #56 La Lucha de Ana

El programa Ibermedia identifica una madre vendedora de flores que busca justicia por su hijo asesinado. DGCINE y Cinema Dominicano explican su búsqueda institucional y el posible curso de actuar por cuenta propia. Evitamos deducir el modo concreto de la muerte.

Existe una discrepancia separada: el catálogo SQL registra `FechaEstreno=2012-04-13`, mientras Cinema Dominicano identifica **24/05/2012** como estreno. **No se cambia ningún metadato en este lote**.

Fuentes:
- https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/
- https://cinemadominicano.com/la-lucha-de-ana-2012/
- https://dgcine.gob.do/programacion-cinemateca-sobre-ruedas-centro-cultural-narciso-gonzalez-2/
- https://cinedominicano.com/peliculasdominicanas/pelicula/la-lucha-de-ana-2012/

## 5. Restricciones de alcance

- **SQL:** solo las **cinco sinopsis ES** en `dbo.Peliculas.Sinopsis`, nunca director, fechas, géneros, usuarios ni otras tablas.
- **Inglés:** los textos EN continúan como propuestas documentales; este lote no añade automáticamente filas a `dbo.PeliculaTraducciones`.
- **Editorial:** ninguna revisión humana ni licencia se atribuye por haber ejecutado la vista previa o las pruebas automatizadas.
- **Derechos multimedia:** los 128 archivos localmente disponibles no implican licencia comercial; AdSense permanece sujeto a auditoría.
- **Git:** no agregar carpetas sin seguimiento como `backend-dotnet/` ni `CineRD-Netlify-Demo-Patch/`.

**Estado al publicar este documento:** se entregan las cinco nuevas tramas bilingües y la posibilidad de un solo lote SQL seguro. La aplicación efectiva depende de controles humanos pendientes.

## 6. Estado posterior al primer lote de pruebas: simulación ≠ actualización SQL

El usuario ejecutó 13 pruebas correctamente con `node --test` y después `catalog:synopses:batch -- --show`. La frase `Cinco sinopsis españolas cambiadas en UNA transacción SQL` que apareció **dentro de las pruebas** provenía de un driver SQL y filesystem **simulados**, con firmas ficticias creadas únicamente en memoria de los tests. **No constituye prueba de cambio en la base real**, ni certifica que se generó un .bak restaurable. Los tests ahora silencian esos logs simulados.

Para evitar una eventual repetición del hallazgo E-4 —SQL real actualizado antes que el snapshot—, se incorporó una consulta de diagnóstico en un solo comando:

```powershell
npm --prefix backend run catalog:synopses:live:preview
```

El diagnóstico conecta al `CRUDPeliculas` configurado localmente y ejecuta **un único SELECT con cinco parámetros ID**, para las películas 5, 6, 10, 55, 56. No hace `UPDATE`, `INSERT`, `DELETE`, transacciones de escritura, creación de archivos ni registro de aprobaciones. Compara exactamente el texto, nombre y fecha del SQL actual contra la sinopsis histórica del snapshot y el candidato ES de Git:

- `ORIGINAL`: SQL mantiene la sinopsis anterior; técnicamente coincide con la preimagen para el lote, **pero todavía faltan las autorizaciones**.
- `ALREADY`: SQL ya tiene la nueva sinopsis ES; no aplicar de nuevo.
- `DRIFT`: SQL, título o fecha no coincide; bloquear y revisar.
- `MISSING`: falta un ID; bloquear y revisar.

**Cinco ORIGINAL** o **cinco ALREADY** son estados coherentes para el diagnóstico (no aprobación); mezclas o discrepancias bloquean la continuación. No se imprimen textos SQL ni credenciales para evitar exposiciones innecesarias.

Antes de ejecutar, correr la batería nueva:

```powershell
node --test backend/tests/previewEditorialSynopsesLive.test.js backend/tests/applyEditorialSynopsesBatch.test.js
npm --prefix backend run catalog:synopses:live:preview
```

**La autorización para publicar ES/EN y actualizar SQL es un proceso distinto**: con el libro de aprobaciones todavía vacío, `--apply` seguirá bloqueado. El archivo `.bak` debe ser un respaldo SQL auténtico y su restauración debe verificarse por el administrador; no se deduce eso de un nombre de archivo.
