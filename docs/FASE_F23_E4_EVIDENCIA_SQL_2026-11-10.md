# CineRD — evidencia de lectura SQL para E-4 y cinco sinopsis

**Corte:** 2026-11-10 · **Base examinada:** `CRUDPeliculas` · **Origen:** captura de resultados de SSMS compartida por el titular durante esta revisión.

**Instrumento:** `database/scripts/f23_e4_sinopsis_preflight_readonly.sql`. La consulta se ejecutó correctamente y devolvió dos tablas (7 + 5 filas). La captura **no está archivada en GitHub**; este informe transcribe lo visible y no inventa una firma, hora de ejecución, identificación del servidor ni hashes completos. Se distingue expresamente el dato observado de una autorización editorial.

## A. Siete metadatos E-4: lectura observada

La primera tabla de SSMS identifica 7/7 campos con estado exacto **`CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4`**:

| FilmId | Película | Campo | Anterior documentado | Actual en SQL / candidato | Estado |
|---:|---|---|---|---|---|
| 9 | Lotoman | FechaEstreno | 2011-03-10 | 2011-01-20 | CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4 |
| 9 | Lotoman | Genero | Infantil | Comedia | CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4 |
| 24 | Sanky Panky 3 | Director | NULL | Eduardo Transfor Ortiz | CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4 |
| 24 | Sanky Panky 3 | FechaEstreno | 2018-03-18 | 2018-03-29 | CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4 |
| 30 | El Diablo no duerme en su cama | Director | NULL | Amauris Pérez | CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4 |
| 32 | Los Rechazados 2: Operación Espacial | Director | NULL | Yasser Michelén | CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4 |
| 32 | Los Rechazados 2: Operación Espacial | FechaEstreno | 2026-09-13 | 2026-08-13 | CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4 |

**Interpretación:** el estado efectivo de la base ya coincide con los siete candidatos del expediente. **No corresponde ejecutar un UPDATE E-4 para volver a escribirlos.** Esta lectura por sí sola no demuestra cuándo, cómo, por quién ni bajo qué respaldo se incorporaron; tampoco equivale a 7 aprobaciones. Mantener **0/7 aprobaciones E-4 atribuidas** hasta completar revisión editorial, trazabilidad y registro de decisiones.

## B. Cinco sinopsis SQL: presencia sin autorización

La segunda tabla confirma que existen las cinco sinopsis en SQL. Los valores `BytesSinopsisSql` visibles son:

| FilmId | Película | BytesSinopsisSql | Estado |
|---:|---|---:|---|
| 5 | Perico Ripiao | 474 | SINOPSIS_SQL_PRESENTE_PENDIENTE_REVISION |
| 6 | Ladrones a Domicilio | 1400 | SINOPSIS_SQL_PRESENTE_PENDIENTE_REVISION |
| 10 | Vamos de robo | 674 | SINOPSIS_SQL_PRESENTE_PENDIENTE_REVISION |
| 55 | El Plan Perfecto | 278 | SINOPSIS_SQL_PRESENTE_PENDIENTE_REVISION |
| 56 | La Lucha de Ana | 844 | SINOPSIS_SQL_PRESENTE_PENDIENTE_REVISION |

SSMS mostró una columna `Sha256SinopsisSql` para cada fila, **pero los 64 caracteres de cada hash no son legibles íntegramente en la captura aportada**. Por tanto, no se certifican ni se completan aquí las huellas. Si se requiere una evidencia reproducible completa, exportar únicamente los resultados de la consulta a un archivo de control de acceso apropiado, sin texto íntegro de las sinopsis ni secretos.

**Interpretación:** 5/5 textos SQL presentes, **0/5 sustituciones aprobadas**; no se ha ejecutado el generador ni un `UPDATE` de sinopsis por esta constatación.

## C. Control de cambios y siguiente decisión

1. No volver a ejecutar migraciones de fechas F2.3: las ocho fechas ya se comprobaron en la auditoría independiente documentada en `docs/FASE_F2_3_PAQUETE_DECISIONES_8_FECHAS_2026-11-09.md`.
2. Para E-4, solicitar aprobación atribuida **campo por campo**, con fuente, identidad de revisor, fecha y evidencia suficiente. Verificar en historial SQL/backups qué explica la presencia anterior de los candidatos; **no declarar que esta ejecución aplicó E-4**.
3. Para las cinco sinopsis, ver `docs/FASE_F23_REVISION_PRELIMINAR_5_SINOPSIS_2026-11-10.md`. Revisar exactitud, versión ES/EN, autoría y licencia/uso permitido del texto anterior y del nuevo borrador. No otorgar permisos implícitos.
4. E-5 continúa en 0/58 decisiones. Los 128 medios sin permiso continúan ocultos por modo `review`; AdSense sigue desactivado.
5. Esta lectura no certifica restauración de un backup, estado de `/ready` externo, despliegue de la API ni seguridad de producción.

**Resultado del control:** **SQL cotejado técnicamente (7/7 + 5/5), cierre de aprobaciones E-4 y sinopsis pendiente (0/7 + 0/5).** Documento descriptivo; ninguna firma, autorización o cambio SQL ejecutado desde esta rama.
