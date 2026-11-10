# CineRD · F-2.8 — expediente privado de revisión de seis fechas

**Origen:** F-2.6 / F-2.7. **Modalidad:** expediente local NO APROBADO; no cambia SQL Server, snapshot, incidencias, libros de aprobaciones ni configuración de despliegue.

## Resultado de la consulta real del responsable

El 8 de noviembre de 2026, en la base de datos `CRUDPeliculas`, la vista previa `catalog:metadata:live:preview` devolvió **6 `ORIGINAL`**, **0 `ALREADY`**, **0 `DRIFT`**, **0 `MISSING`** y **0 desincronizaciones SQL/snapshot**. Por tanto, los seis valores antiguos siguen presentes y coinciden en ambos entornos. **No hay autorización para ejecutar `UPDATE`**.

| ID | Película | SQL y snapshot | Fecha candidata | Confianza documental |
|---:|---|---|---|---|
| 27 | Lotoman 003: Volando Bajito | 2014-03-15 | 2014-03-27 | Alta |
| 36 | Nueba Yol 3: Bajo la Nueva Ley | 1997-10-31 | 1997-10-23 | Media, falta prueba independiente |
| 40 | Colao 2 | 2023-12-07 | 2023-11-30 | Alta |
| 42 | Andrea | 2005-08-16 | 2005-08-18 | Alta |
| 44 | Playball | 2008-02-01 | 2008-02-14 | Alta |
| 56 | La Lucha de Ana | 2012-04-13 | 2012-05-24 | Alta |

Los expedientes #31 y #47 siguen *retenidos* sin correcciones propuestas. Una alta confianza documental no significa firma humana, y una fecha propuesta no modifica automáticamente `FechaEstreno`.

## Política propuesta para decisión editorial

**Propuesta F-2.7 todavía no aceptada formalmente:** `FechaEstreno` debe representar la **primera exhibición comercial ordinaria en salas de República Dominicana**, cuando se pueda acreditar. Premiere, festival, estreno internacional o fecha anunciada deben distinguirse y documentarse aparte. La opción correcta para una fecha no demostrada no es inventar día ni sobrescribir la columna con `NULL` sin una decisión sobre el modelo de datos.

Antes de aprobar alguna fecha, el responsable debe comprobar el documento `docs/POLITICA_FECHA_ESTRENO_F27.md`, las fuentes específicas de `docs/FASE_F2_6_CONTRASTE_8_METADATOS.md` y los créditos/carteleras u otras evidencias primarias, particularmente en #36.

## Un solo procedimiento privado

Desde la raíz de CineRD:

```powershell
npm --prefix backend run catalog:metadata:review:create
```

Se crea **una hoja JSON privada con seis decisiones `pendiente`** en `backend/backups/editorial/review-f28/`. Ese directorio está excluido por `.gitignore`, y el archivo se crea con modo restrictivo y `wx` (nunca sobrescribir). Guarda un `batchHash` y huellas SHA-256 por película, ligadas a la propuesta, las fuentes, el snapshot y la política vigente.

Para ver la hoja sin crear archivo:

```powershell
npm --prefix backend run catalog:metadata:review:show
```

Si una persona con responsabilidad editorial realmente revisa cada ficha, podrá introducir una decisión **`aprobado` o `rechazado`**, identidad del revisor, fecha y hora con zona horaria, nota explicativa sustancial y, al aprobar, aceptación del criterio `FechaEstreno` y evidencia URL enlazada a una fuente documentada. No completar atributos falsamente.

Para **validar solamente** la hoja local que exista:

```powershell
npm --prefix backend run catalog:metadata:review:check
```

El `--check` debe fallar mientras existan decisiones pendientes. Solo comprueba coherencia, huellas, datos formales y presencia de evidencias: **no garantiza que la persona revisó realmente el material**. Ni siquiera una hoja validada por `--check` autoriza migraciones.

## Controles y límites

- **Ningún `--apply` existe en F-2.8**. El comando no puede modificar SQL ni exportar el snapshot.
- La hoja y sus nombres no deben publicarse en GitHub: `backend/backups/` está excluido, y la identidad del revisor puede ser personal.
- El script no firma ni transfiere decisiones a `docs/editorial-approvals-e5.json`, E-4 ni a ningún libro de autorización SQL.
- Cambiar el documento de política o las fuentes invalida las huellas asociadas a la hoja. Se requiere nueva revisión real.
- Antes de cualquier migración posterior: evidencia verificable de los datos, autorización expresa, `.bak` restaurable probado, control transaccional de todas las preimágenes, diff y exportación de catálogo posterior. No actualizar SQL desde un simple borrador.
- La PR #55 continúa como borrador hasta verificaciones pendientes, sin activar anuncios.

**Estado comprobado al preparar el expediente:** seis fechas candidatas, cero aprobaciones en F-2.8, seis registros SQL originales, cero cambios SQL.
