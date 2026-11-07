# CineRD — Fases E-3, E-4 y E-5

**Base de trabajo:** 7 de noviembre de 2026, snapshot v3, `main`.  
**Principio:** mejorar el valor informativo sin atribuir hechos biográficos no acreditados, editar datos en secreto ni fingir aprobaciones de contenidos.

## E-3 — 83 perfiles de talentos

- Cada ficha pública incorpora un módulo **Trayectoria en el archivo CineRD** generado a partir de participaciones de reparto, obras dirigidas y créditos profesionales registrados.
- Resume cuántas producciones **distintas** están enlazadas, evitando doble conteo si la persona figura simultáneamente como actor y director.
- Enlaza hasta cinco películas en la vista React y la versión estática SEO incluye el listado documentado de obras completo.
- El texto explica que las cifras reflejan **solo el catálogo CineRD**, no toda la carrera de la persona ni créditos verificados por el estudio.
- Los cinco talentos sin `Profesion` (IDs 54, 76, 88, 90 y 93) reciben la etiqueta de dato no documentado en vez de recibir un oficio inventado.
- Las 26 fechas de nacimiento ausentes permanecen ausentes. No inferir lugar/fecha de nacimiento, estado civil, edad o vida personal.
- Los 83 registros tienen por lo menos un vínculo en reparto o crédito profesional; los tests comparan resumen y vínculos de los 83.

**Control:** `npm --prefix frontend test`. Para revisar, abrir fichas de talentos con y sin profesión, incluida `/actores/35` (dirección profesional) y `/actores/54` (sin profesión).

## E-4 — Correcciones del catálogo en SQL Server, con respaldo y sin aplicar en GitHub

El manifiesto `docs/catalog-corrections-e4.json` documenta **7 ajustes en cuatro películas** con dos enlaces de evidencia cada uno y valores actuales **esperados**, para impedir sobrescrituras accidentales:

| ID | Título | Campo | Actual | Propuesto |
|---:|---|---|---|---|
| 9 | Lotoman | Género | Infantil | Comedia |
| 9 | Lotoman | Fecha de estreno RD | 2011-03-10 | 2011-01-20 |
| 24 | Sanky Panky 3 | Director | — | Eduardo Transfor Ortiz |
| 24 | Sanky Panky 3 | Fecha de estreno RD | 2018-03-18 | 2018-03-29 |
| 30 | El Diablo no duerme en su cama | Director | — | Amauris Pérez |
| 32 | Los Rechazados 2 | Director | — | Yasser Michelén |
| 32 | Los Rechazados 2 | Fecha de estreno RD | 2026-09-13 | 2026-08-13 |

**Fuentes clave:** [Lotoman — Cinema Dominicano](https://cinemadominicano.com/lotoman-2011/), [Lotoman — CineDominicano.com](https://cinedominicano.com/peliculasdominicanas/pelicula/lotoman-2011/), [Sanky Panky 3 — El Caribe](https://www.elcaribe.com.do/gente/a-y-e/sanky-panky-3-se-estrenara-el-29-de-marzo-en-rd/), [Sanky Panky 3 — El Día](https://eldia.com.do/sanky-panky-3-llega-a-los-cines-este-lunes/), [El Diablo no duerme en su cama — Cinema Dominicano](https://cinemadominicano.com/el-diablo-no-duerme-en-su-cama-comedia-negra-de-amauris-perez/), [Los Rechazados 2 — DGCINE](https://dgcine.gob.do/los-rechazados-2-lleva-la-comedia-y-la-ciencia-ficcion-a-nuevas-audiencias/), [Los Rechazados 2 — CineDominicano.com](https://cinedominicano.com/estreno/los-rechazados-2/). Se documentan otros enlaces en el JSON.

Se decidió **no automatizar** otras discrepancias (por ejemplo, Playball, Hermanos o distintas fechas de premieres) sin mayor criterio editorial o evidencia.

### Procedimiento seguro desde la computadora con SQL Server

1. Revisar las siete propuestas y las fuentes. Verificar que `FechaEstreno` en CineRD signifique **estreno comercial en cines dominicanos**, no gala premier ni estreno internacional.
2. Crear y verificar un **respaldo real de SQL Server**. La herramienta crea además un archivo de reversión local de los registros afectados, pero **no sustituye** el respaldo de base de datos.
3. Desde la raíz del repositorio, ejecutar únicamente la vista previa:

```powershell
npm --prefix backend run catalog:corrections:preview
npm --prefix backend run catalog:validate
```

4. Con respaldo verificado, base de datos local correcta y `backend/.env` configurado, ejecutar de manera **explícita**:

```powershell
npm --prefix backend run catalog:corrections:apply -- --confirm-db-backup
```

5. El script comprueba el título, los campos y los valores anteriores en **una transacción serializable**; si cualquiera difiere, aborta. Crea un archivo local en `backend/backups/editorial` (excluido de Git) antes de escribir. No modificar si hay errores. Tras una ejecución exitosa:

```powershell
npm --prefix backend run catalog:export
npm --prefix backend run catalog:validate
npm --prefix frontend run editorial:audit
git diff -- database/seeds/catalog.snapshot.json
```

6. Revisar el diff y la procedencia del snapshot antes de subirlo. No exponer nunca `.env`, respaldos, contraseñas ni datos privados.

**Importante:** desde GitHub no se puede escribir en la instancia local de SQL Server. Hasta ejecutar estos pasos, **el catálogo público y el snapshot siguen con los valores antiguos**.

## E-5 — Revisión editorial auditada, sin aprobaciones ficticias

- `scripts/editorialReviewAudit.mjs` revisa el inventario de **46 sinopsis** (cinco SQL y 41 borradores) y **12 textos contextuales**.
- Comprueba que cada entrada tenga contenido, una identidad de película, longitudes mínimas indicativas y fuente HTTPS en los textos editoriales. Las cinco sinopsis SQL requieren rastrear su procedencia antes de aprobarlas.
- El libro de aprobaciones `docs/editorial-approvals-e5.json` empieza **vacío**, con todos los elementos en `pendiente_revision`.
- No se aprueba ninguna ficha por el hecho de haber sido generada por IA ni por pasar los tests.
- Si una persona revisora acredita un texto, la aprobación debe incluir: `filmId`, `kind` (`sinopsis` o `contexto`), `status: "aprobado"`, la **huella SHA-256 actual** (`fingerprint`), `reviewer`, `reviewedAt` (fecha ISO), `sourcesChecked: true` y `notes` con constancia de la revisión. El programa rechaza duplicados, datos incompletos y huellas desactualizadas.

Para generar el inventario con huellas vigentes:

```powershell
npm --prefix frontend run editorial:review
node scripts/editorialReviewAudit.mjs --json
```

Para exigir **100 % de aprobación antes de intentar AdSense**:

```powershell
npm --prefix frontend run editorial:review:strict
```

**Ese último comando debe fallar mientras existan textos pendientes**, porque aún no se ha realizado la revisión humana final. El informe registra advertencias de procedencia cuando las sinopsis importadas no tienen enlaces a fuentes. La auditoría automática comprueba estructura y rastreabilidad; no demuestra que las películas hayan sido visionadas o que todas las afirmaciones estén corroboradas. Enlace HTTPS válido no equivale a fuente verificada.

## Checklist final de publicación y AdSense

- [x] 83 perfiles con contexto profesional calculado de registros internos y enlaces.
- [x] Correcciones propuestas E-4 documentadas, con herramienta segura; [ ] ejecutadas en SQL y exportadas.
- [x] Inventario E-5 y mecanismo de firma/huella; [ ] 58 piezas aprobadas por revisión humana.
- [x] Modo Cloudflare `review` obligatorio en `main`; [ ] nueva compilación y auditoría HTTP después de todos los cambios.
- [ ] Verificar enlaces, fechas y géneros restantes, páginas móviles, licencias de recursos, Search Console e información del panel de AdSense.
- [ ] Solicitar una nueva revisión **solo** una vez validados los requisitos editoriales, técnicos y legales.

**Conclusión:** E-3 está implementada a nivel de software; E-4 tiene ejecución **preparada pero no aplicada a SQL**; E-5 tiene controles de auditoría **implementados pero revisiones humanas pendientes**. No es correcto declarar AdSense listo.
