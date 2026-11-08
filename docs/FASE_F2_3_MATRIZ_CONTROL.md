# CineRD — F-2.3 · Matriz de control de calidad editorial

**Estado:** primera implementación de F-2.3, con matriz de seguimiento y validación automatizada. **No implica aprobación editorial, autorización de reproducción, revisión jurídica ni correcciones aplicadas a SQL Server.**

## Entregables

- `docs/editorial-issues-f2.json`: 58 registros, cada uno vinculado a la sinopsis o contexto y al informe F-2.2 del que procede. `status: pendiente_verificacion` en todos.
- `scripts/verifyEditorialIssueMatrix.mjs`: contrasta la matriz con el inventario de `editorialReviewAudit.mjs`, detecta duplicados, faltantes, referencias inexistentes, títulos inconsistentes, estados no permitidos y vínculos E-4 inválidos.
- `scripts/verifyEditorialIssueMatrix.test.mjs`: cinco pruebas unitarias del validador.

**Importante:** «registro» significa **una pieza editorial seguida**, no un error demostrado ni una corrección autorizada. La prioridad de la matriz es de **triaje preliminar**, no una puntuación definitiva de riesgo legal.

## Resumen de prioridades

| Prioridad | Piezas | Criterio de actuación |
|---|---:|---|
| ALTA | 19 | Resolver primero dudas de procedencia SQL, precisión argumental importante y discrepancias de producción/estreno |
| MEDIA | 17 | Aclarar fuentes contrapuestas, matices editoriales y variaciones de títulos o fechas |
| BAJA | 22 | Verificar redacción, precisión y fuentes en el pase editorial final |
| **TOTAL** | **58** | **46 sinopsis + 12 contextos** |

### Principales líneas de trabajo

1. **Procedencia textual**: sinopsis SQL 5, 6, 10, 55 y 56. Determinar origen y autorizaciones; en especial 10, 55 y 56, donde los informes anteriores señalan similitud de redacción con fuentes externas. Tener una URL no equivale a permiso.
2. **Correcciones ya propuestas en E-4 (siete cambios en cuatro películas)**: IDs **9** (género y fecha), **24** (director y fecha), **30** (director) y **32** (director y fecha). La matriz apunta a `docs/catalog-corrections-e4.json` sin dar por aplicadas ni suficientes estas propuestas. Cualquier cambio exige respaldo SQL, verificación de fuentes y nueva exportación.
3. **Otros metadatos que requieren nuevas decisiones**: 12, 13, 16, 27, 31, 36, 40, 42, 44, 47, 49, 50 y 56, entre otros. **No** incluirlos de oficio en E-4 ni asumir que una fuente secundaria define inequívocamente `FechaEstreno`.
4. **Consistencia de trama y traducción**: **23** (Morena/Martha), **26** (horario del hechizo), **29** (Johana/Johanna); evaluar nuevas versiones ES/EN, fuentes oficiales y fidelidad argumental.
5. **Análisis contextuales**: comprobar citas académicas, créditos y hechos históricos; distinguir explícitamente hechos y lecturas originales de CineRD, sin atribuir intenciones de dirección no documentadas.
6. **Control legal y editorial**: los textos y las imágenes requieren verificaciones de procedencia separadas. Las **128 imágenes** siguen sin prueba de derechos comerciales registrada; AdSense continúa apagado.

## Flujo de resolución de cada observación

1. Abrir el registro `(filmId, kind)` en `editorial-issues-f2.json` y el `sourceReport` apuntado.
2. Contrastar las afirmaciones relevantes con fuentes, distinguiendo fecha de estreno nacional, festival, preestreno o información administrativa; documentar fuente primaria cuando exista.
3. Decidir si procede mantener, corregir o sustituir el texto, **sin simular visionado ni licencia**. Para datos del catálogo SQL: respaldo + procedimiento E-4 + nueva exportación, nunca editar el snapshot a mano.
4. Si cambia el contenido o la lista de referencias, su `fingerprint` editorial cambia; cualquier aprobación futura deberá corresponder a la versión vigente.
5. Hacer revisión humana atribuida ES/EN, procedencia, autoría, políticas de privacidad y derechos aplicables antes de registrar `aprobado` en `docs/editorial-approvals-e5.json`. Una matriz validada **no sustituye** esa firma.

## Comandos de comprobación

```powershell
node --test scripts/verifyEditorialIssueMatrix.test.mjs
node scripts/verifyEditorialIssueMatrix.mjs
node scripts/verifyEditorialIssueMatrix.mjs --json
npm --prefix frontend run editorial:review
git diff --check
```

Con la situación actual, el validador debe mostrar **58 registros: 19 alta, 17 media, 22 baja**, sin duplicados ni faltantes. La auditoría editorial E-5 debe seguir mostrando **0 aprobadas y 58 pendientes**.

**F-2.3 no termina aquí.** Estos controles hacen trazables las observaciones. Falta resolver las discrepancias con evidencia suficiente, decidir y aplicar cambios legítimos, revisar la redacción final y preparar el proceso de firma humana de F-2.4.
