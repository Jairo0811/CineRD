# CineRD — matriz de siete decisiones E-4 (sin aprobación automática)

**Corte:** 2026-11-10 · **SQL leído:** `CRUDPeliculas` · **Estado:** **7/7 valores candidatos presentes en SSMS, 0/7 aprobaciones humanas E-4**.

**Trazabilidad:** la captura de SSMS aportada por el titular muestra `CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4` para las siete filas. No se archivó la captura ni se identificó de qué operación, usuario o backup proceden las escrituras previas. Evidencia descrita en [FASE_F23_E4_EVIDENCIA_SQL_2026-11-10.md](FASE_F23_E4_EVIDENCIA_SQL_2026-11-10.md). La presencia de un valor no es una firma editorial.

## Matriz operativa

| ID | Obra | Campo | Valor anterior | Valor leído en SQL | Revisión formal |
|---:|---|---|---|---|---|
| 9 | Lotoman | `FechaEstreno` | 2011-03-10 | **2011-01-20** | PENDIENTE (sin reescritura SQL) |
| 9 | Lotoman | `Genero` | Infantil | **Comedia** | PENDIENTE (sin reescritura SQL) |
| 24 | Sanky Panky 3 | `Director` | NULL | **Eduardo Transfor Ortiz** | PENDIENTE (sin reescritura SQL) |
| 24 | Sanky Panky 3 | `FechaEstreno` | 2018-03-18 | **2018-03-29** | PENDIENTE (sin reescritura SQL) |
| 30 | El Diablo no duerme en su cama | `Director` | NULL | **Amauris Pérez** | PENDIENTE (sin reescritura SQL) |
| 32 | Los Rechazados 2: Operación Espacial | `Director` | NULL | **Yasser Michelén** | PENDIENTE (sin reescritura SQL) |
| 32 | Los Rechazados 2: Operación Espacial | `FechaEstreno` | 2026-09-13 | **2026-08-13** | PENDIENTE (sin reescritura SQL) |

## Decisión individual por campo

En cada ficha las opciones quedan desmarcadas: son una **plantilla de deliberación**, no un mecanismo de autorización ni una sustitución de `docs/catalog-corrections-e4-approvals.json`.

### [ ] E4-9-FechaEstreno: Lotoman

- **Identidad:** película #9, campo `FechaEstreno`.
- **Original documentado:** 2011-03-10.
- **Candidato ya presente en SQL:** 2011-01-20.
- **Estado SQL observado:** `CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4`.
- **Análisis de la fuente y la decisión:** Confirmar «20/01/2011» como apertura comercial dominicana frente a galas del 18 y 19 de enero; documentación contemporánea de Orange Cinema vía Diario Libre.
- **Referencias del expediente, por verificar en revisión humana:**
  - https://cinemadominicano.com/lotoman-2011/
  - https://www.diariolibre.com/revista/lotoman-se-estrena-el-20-de-este-mes-BNDL275224
- [ ] Revisé el valor, la identidad, el criterio editorial y las fuentes originales.
- [ ] Contrasté la traza de carga previa contra historial, exportaciones o backup pertinente.
- [ ] Aprobar **conservar el valor ya presente**, sin ejecutar nuevo `UPDATE`.
- [ ] Rechazar o solicitar revisión adicional (registrar motivo y propuesta concreta).
- **Revisor:** ______ · **Fecha y zona horaria:** ______ · **Evidencia verificable:** ______ · **Notas:** ______.

### [ ] E4-9-Genero: Lotoman

- **Identidad:** película #9, campo `Genero`.
- **Original documentado:** Infantil.
- **Candidato ya presente en SQL:** Comedia.
- **Estado SQL observado:** `CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4`.
- **Análisis de la fuente y la decisión:** Revisar política de género único: «Comedia» está documentada, pero decidir si «Infantil» era una categoría comercial/familiar y si debe conservarse como etiqueta secundaria. No escribir SQL.
- **Referencias del expediente, por verificar en revisión humana:**
  - https://cinemadominicano.com/lotoman-2011/
  - https://cinedominicano.com/peliculasdominicanas/pelicula/lotoman-2011/
- [ ] Revisé el valor, la identidad, el criterio editorial y las fuentes originales.
- [ ] Contrasté la traza de carga previa contra historial, exportaciones o backup pertinente.
- [ ] Aprobar **conservar el valor ya presente**, sin ejecutar nuevo `UPDATE`.
- [ ] Rechazar o solicitar revisión adicional (registrar motivo y propuesta concreta).
- **Revisor:** ______ · **Fecha y zona horaria:** ______ · **Evidencia verificable:** ______ · **Notas:** ______.

### [ ] E4-24-Director: Sanky Panky 3

- **Identidad:** película #24, campo `Director`.
- **Original documentado:** NULL.
- **Candidato ya presente en SQL:** Eduardo Transfor Ortiz.
- **Estado SQL observado:** `CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4`.
- **Análisis de la fuente y la decisión:** Verificar crédito «Eduardo Transfor Ortiz» frente a «Eduardo Ortiz» / sobrenombre «Transfor», y cuál nombre corresponde al campo Director.
- **Referencias del expediente, por verificar en revisión humana:**
  - https://www.elcaribe.com.do/gente/a-y-e/sanky-panky-3-se-estrenara-el-29-de-marzo-en-rd/
  - https://eldia.com.do/sanky-panky-3-llega-a-los-cines-este-lunes/
- [ ] Revisé el valor, la identidad, el criterio editorial y las fuentes originales.
- [ ] Contrasté la traza de carga previa contra historial, exportaciones o backup pertinente.
- [ ] Aprobar **conservar el valor ya presente**, sin ejecutar nuevo `UPDATE`.
- [ ] Rechazar o solicitar revisión adicional (registrar motivo y propuesta concreta).
- **Revisor:** ______ · **Fecha y zona horaria:** ______ · **Evidencia verificable:** ______ · **Notas:** ______.

### [ ] E4-24-FechaEstreno: Sanky Panky 3

- **Identidad:** película #24, campo `FechaEstreno`.
- **Original documentado:** 2018-03-18.
- **Candidato ya presente en SQL:** 2018-03-29.
- **Estado SQL observado:** `CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4`.
- **Análisis de la fuente y la decisión:** Confirmar exhibición comercial «29/03/2018» y separar gala/premier del 26/03; validar la nota de distribuidora.
- **Referencias del expediente, por verificar en revisión humana:**
  - https://www.elcaribe.com.do/gente/a-y-e/sanky-panky-3-se-estrenara-el-29-de-marzo-en-rd/
  - https://eldia.com.do/sanky-panky-3-llega-a-los-cines-este-lunes/
- [ ] Revisé el valor, la identidad, el criterio editorial y las fuentes originales.
- [ ] Contrasté la traza de carga previa contra historial, exportaciones o backup pertinente.
- [ ] Aprobar **conservar el valor ya presente**, sin ejecutar nuevo `UPDATE`.
- [ ] Rechazar o solicitar revisión adicional (registrar motivo y propuesta concreta).
- **Revisor:** ______ · **Fecha y zona horaria:** ______ · **Evidencia verificable:** ______ · **Notas:** ______.

### [ ] E4-30-Director: El Diablo no duerme en su cama

- **Identidad:** película #30, campo `Director`.
- **Original documentado:** NULL.
- **Candidato ya presente en SQL:** Amauris Pérez.
- **Estado SQL observado:** `CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4`.
- **Análisis de la fuente y la decisión:** Verificar créditos originales que acreditan a Amauris Pérez; **no** convertir nota de producción en prueba de FechaEstreno.
- **Referencias del expediente, por verificar en revisión humana:**
  - https://cinemadominicano.com/el-diablo-no-duerme-en-su-cama-comedia-negra-de-amauris-perez/
  - https://notisurbani.com/index.php/15-entretenimiento
- [ ] Revisé el valor, la identidad, el criterio editorial y las fuentes originales.
- [ ] Contrasté la traza de carga previa contra historial, exportaciones o backup pertinente.
- [ ] Aprobar **conservar el valor ya presente**, sin ejecutar nuevo `UPDATE`.
- [ ] Rechazar o solicitar revisión adicional (registrar motivo y propuesta concreta).
- **Revisor:** ______ · **Fecha y zona horaria:** ______ · **Evidencia verificable:** ______ · **Notas:** ______.

### [ ] E4-32-Director: Los Rechazados 2: Operación Espacial

- **Identidad:** película #32, campo `Director`.
- **Original documentado:** NULL.
- **Candidato ya presente en SQL:** Yasser Michelén.
- **Estado SQL observado:** `CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4`.
- **Análisis de la fuente y la decisión:** Contrastar «Yasser Michelén» con ficha oficial DGCINE y créditos del largometraje.
- **Referencias del expediente, por verificar en revisión humana:**
  - https://dgcine.gob.do/los-rechazados-2-lleva-la-comedia-y-la-ciencia-ficcion-a-nuevas-audiencias/
  - https://cinedominicano.com/estreno/los-rechazados-2/
- [ ] Revisé el valor, la identidad, el criterio editorial y las fuentes originales.
- [ ] Contrasté la traza de carga previa contra historial, exportaciones o backup pertinente.
- [ ] Aprobar **conservar el valor ya presente**, sin ejecutar nuevo `UPDATE`.
- [ ] Rechazar o solicitar revisión adicional (registrar motivo y propuesta concreta).
- **Revisor:** ______ · **Fecha y zona horaria:** ______ · **Evidencia verificable:** ______ · **Notas:** ______.

### [ ] E4-32-FechaEstreno: Los Rechazados 2: Operación Espacial

- **Identidad:** película #32, campo `FechaEstreno`.
- **Original documentado:** 2026-09-13.
- **Candidato ya presente en SQL:** 2026-08-13.
- **Estado SQL observado:** `CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4`.
- **Análisis de la fuente y la decisión:** Contrastar apertura comercial nacional «13/08/2026» con DGCINE; distinguir la gala de lanzamiento del mismo día.
- **Referencias del expediente, por verificar en revisión humana:**
  - https://dgcine.gob.do/los-rechazados-2-lleva-la-comedia-y-la-ciencia-ficcion-a-nuevas-audiencias/
  - https://cinedominicano.com/estreno/los-rechazados-2/
- [ ] Revisé el valor, la identidad, el criterio editorial y las fuentes originales.
- [ ] Contrasté la traza de carga previa contra historial, exportaciones o backup pertinente.
- [ ] Aprobar **conservar el valor ya presente**, sin ejecutar nuevo `UPDATE`.
- [ ] Rechazar o solicitar revisión adicional (registrar motivo y propuesta concreta).
- **Revisor:** ______ · **Fecha y zona horaria:** ______ · **Evidencia verificable:** ______ · **Notas:** ______.

## Puertas de seguridad

1. Ninguna casilla ha sido seleccionada y **no se registraron firmas**. El libro `docs/catalog-corrections-e4-approvals.json` debe permanecer vacío hasta la decisión real y verificable por campo.
2. **No ejecutar scripts UP** para E-4: los siete candidatos ya están en SQL. Si una decisión difiere del valor existente, preparar expediente nuevo con preflight, backup y autorización por separado.
3. No modificar `database/seeds/catalog.snapshot.json` para simular aprobaciones; el snapshot reproduce datos SQL, no su legitimidad editorial.
4. No confundir E-4 con las ocho fechas F2.3 ya aprobadas y verificadas; tampoco aprobar de oficio las 58 piezas E-5.
5. No presentar esta revisión como prueba de restore drill, despliegue de API, licencias o AdSense.

**Resultado preparado:** siete decisiones individualizadas, **0/7 firmadas**.
