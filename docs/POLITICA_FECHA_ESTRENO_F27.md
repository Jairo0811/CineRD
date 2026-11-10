# CineRD — F-2.7 · Política propuesta para `FechaEstreno` y vista previa de seis fechas

**Estado:** propuesta técnica-editorial **pendiente de aprobación humana** (no es una política editorial ya firmada).  
**Fecha del expediente:** 8 de noviembre de 2026.  
**Alcance:** seis fechas candidatas registradas en `docs/editorial-metadata-candidates-f26.json` y dos casos que deben permanecer retenidos.

## Significado recomendado del campo

Para CineRD, recomiendo establecer **`Peliculas.FechaEstreno` = fecha de la primera exhibición comercial ordinaria de la obra en salas de cine de República Dominicana, cuando sea verificable**.

No son equivalentes: gala de *premiere*, proyección de prensa, festival, avance publicitario, estreno internacional, publicación online, fecha de filmación, fecha de ficha administrativa o fecha **prevista** de estreno. Esos eventos deben documentarse **separadamente** en observaciones o en un modelo de eventos de estreno futuro, sin ocupar automáticamente este campo.

Si una obra no tiene evidencia suficiente de exhibición comercial en RD, no debe inventarse un día. **No convertir automáticamente la fecha existente a NULL**, ya que implicaría un cambio de esquema/semántica que requiere decisión y migración formal. Identificar el estado como «fecha no confirmada» en el expediente, sin sobrescribir SQL.

Esta propuesta es un criterio de trabajo, no una licencia de explotación ni una autorización de modificaciones. Su adopción formal requiere decisión editorial humana registrada.

## Jerarquía de evidencia

1. **Primaria**: distribuidora, exhibidor con cartelera/archivo, anuncio contemporáneo de la productora o institución competente que identifique claramente la fecha y modalidad de estreno.
2. **Corroboración**: prensa contemporánea del estreno con contexto distinguible de las premieres o festivales.
3. **Referencia secundaria**: archivo filmográfico, ficha retrospectiva, agregadores. Dos sitios que derivan del mismo archivo no cuentan como dos pruebas independientes.
4. **Insuficiente**: previsiones sin seguimiento, fichas sin día verificable, festivales que no acreditan exhibición comercial RD o metadatos contradictorios.

**Niveles de confianza** de los candidatos F-2.6: cinco `alta` (#27, #40, #42, #44, #56), una `media` (#36); retenidos sin propuesta #31 y #47. *Confianza* no significa aprobación, y todas las seis fechas siguen sujetas a decisión real.

## Seis fechas candidatas, sin cambios en SQL

| ID | Película | Fecha anterior en snapshot | Candidata de estreno comercial RD | Confianza |
|---:|---|---|---|---|
| 27 | Lotoman 003: Volando Bajito | 2014-03-15 | 2014-03-27 | Alta |
| 36 | Nueba Yol 3: Bajo la Nueva Ley | 1997-10-31 | 1997-10-23 | Media |
| 40 | Colao 2 | 2023-12-07 | 2023-11-30 | Alta |
| 42 | Andrea | 2005-08-16 | 2005-08-18 | Alta |
| 44 | Playball | 2008-02-01 | 2008-02-14 | Alta |
| 56 | La Lucha de Ana | 2012-04-13 | 2012-05-24 | Alta |

Los datos provienen del expediente F-2.6. **No se reabren los siete campos antiguos E-4**, que ya se contrastaron en SQL y snapshot. No se modifica el campo `Genero` ni el de `Director` en ninguna película de este lote.

## Control F-2.7 de solo lectura

El nuevo script `backend/scripts/previewEditorialMetadataLive.js` hace dos tareas separadas:

### 1. Validar documentos (sin conectarse a SQL)

```powershell
npm --prefix backend run catalog:metadata:validate
```

Comprueba: ocho expedientes F-2.6, seis propuestas de `FechaEstreno`, dos expedientes retenidos, identidad/títulos, fechas ISO reales, fuentes HTTPS, vínculo con incidencias altas, no colisión con E-4, valores aceptables en snapshot y **ninguna autorización automática**. Este comando corre en GitHub Actions Linux y Windows.

### 2. Leer las fechas actuales de SQL Server, sin mutaciones

```powershell
npm --prefix backend run catalog:metadata:live:preview
```

**La consulta es exclusivamente `SELECT` parametrizado.** Compara SQL Server con el snapshot y con los seis candidatos. Devuelve:

- `ORIGINAL`: SQL conserva la fecha anterior.
- `ALREADY`: SQL ya contiene la fecha candidata; **no reaplicar**.
- `DRIFT`: título/fecha diferente de ambas posibilidades o dato inválido; exige investigación.
- `MISSING`: la película no existe en la instancia SQL.

También compara directamente SQL y snapshot con `coinciden=SI/NO`. **No ejecuta `UPDATE`, no firma aprobaciones, no hace backup, no exporta catálogo ni concede permisos**. Si hay `DRIFT`, `MISSING` o SQL/snapshot distinto, devuelve error para impedir su interpretación como lote sincronizado.

## Criterios para una eventual corrección

Una vez confirmada por una persona responsable la definición de `FechaEstreno`, las fuentes y las seis decisiones individualmente:

1. Verificar identificación exacta de película y preimagen tanto en snapshot como en SQL, sin aplicar correcciones cuando ya están presentes.
2. Registrar autorización atribuible con fuentes, fecha de decisión y huella del cambio. No usar como evidencia el mero paso del CI.
3. Acreditar respaldo SQL Server **restaurable**, fuera del repositorio, con prueba de recuperación.
4. Diseñar por separado un procedimiento transaccional y reversible de las correcciones aprobadas; el F-2.7 actual **no contiene modo de escritura**.
5. Tras la modificación autorizada, exportar el snapshot, revisar el diff, validar catálogo, revisar dependencias editoriales/huellas de F-2.3 y comprobar el despliegue.

**Los ocho registros altos siguen pendientes**, junto con las demás incidencias y los derechos de uso. Esta propuesta no los marca como resueltos.
