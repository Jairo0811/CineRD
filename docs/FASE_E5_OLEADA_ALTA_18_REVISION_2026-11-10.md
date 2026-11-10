# CineRD — E-5: primera oleada de 18 observaciones de prioridad alta

**Corte:** 2026-11-10 · **Origen de inventario:** `docs/editorial-issues-f2.json` (58 piezas: 18 alta, 18 media, 22 baja). **Estado editorial:** **0/18 aprobadas en esta oleada; 0/58 aprobadas en el proyecto**.

**Método:** esta lista deriva EXACTAMENTE de las 18 entradas `priority=alta`, conservando claves `filmId:kind`, nombre, observación original y archivo de auditoría. Las acciones sugeridas son **notas de trabajo posteriores**, no verificación de que se haya visionado la película ni autorización del titular. No se modifica el libro `docs/editorial-approvals-e5.json`.

**Actualización temporal:** varias observaciones originales mencionan fechas SQL o campos E-4 antes de su cierre. Las ocho fechas F2.3 ya fueron verificadas; los siete valores candidatos E-4 están presentes en SQL pero **sin firmas**. No reabrir migraciones solo porque una observación antigua cite una fecha anterior.

## Inventario de 18 fichas (prioridad alta)

| Clave | Película | Tipo | Bloque principal | Estado |
|---|---|---|---|---|
| `6:sinopsis` | Ladrones a Domicilio | sinopsis | Trama / licencia del texto SQL | PENDIENTE |
| `9:contexto` | Lotoman | contexto | E4 presente / contexto | PENDIENTE |
| `9:sinopsis` | Lotoman | sinopsis | E4 presente / revisión de sinopsis | PENDIENTE |
| `10:sinopsis` | Vamos de robo | sinopsis | Fecha F2.3 cerrada / derechos | PENDIENTE |
| `24:sinopsis` | Sanky Panky 3 | sinopsis | E4 presente / revisión de sinopsis | PENDIENTE |
| `26:sinopsis` | Feo de día, Lindo de noche | sinopsis | Redacción temporal / traducción | PENDIENTE |
| `27:sinopsis` | Lotoman 003: Volando Bajito | sinopsis | Fecha F2.3 cerrada / precisión | PENDIENTE |
| `30:sinopsis` | El Diablo no duerme en su cama | sinopsis | Estreno no demostrado / E4 director presente | PENDIENTE |
| `31:sinopsis` | Entiérrenlo Parao | sinopsis | Fecha comercial por confirmar | PENDIENTE |
| `32:sinopsis` | Los Rechazados 2: Operación Espacial | sinopsis | E4 presente / taxonomía | PENDIENTE |
| `36:sinopsis` | Nueba Yol 3: Bajo la Nueva Ley | sinopsis | Fecha F2.3 cerrada técnicamente / fuente primaria faltante | PENDIENTE |
| `40:sinopsis` | Colao 2 | sinopsis | Fecha F2.3 cerrada / género abierto | PENDIENTE |
| `42:sinopsis` | Andrea | sinopsis | Fecha F2.3 cerrada / crédito por confirmar | PENDIENTE |
| `44:sinopsis` | Playball | sinopsis | Fecha F2.3 cerrada / taxonomía y alias | PENDIENTE |
| `47:sinopsis` | Pimp Bullies: Victimas de un Prostibulo | sinopsis | Género/alias | PENDIENTE |
| `55:sinopsis` | El Plan Perfecto | sinopsis | Redacción ES/EN mejorada / licencia pendiente | PENDIENTE |
| `56:contexto` | La Lucha de Ana | contexto | Contexto y atribución | PENDIENTE |
| `56:sinopsis` | La Lucha de Ana | sinopsis | Fecha F2.3 cerrada / derechos | PENDIENTE |

## Fichas de revisión — ninguna decisión firmada

Para cada ficha: contrastar fuentes, verificar exactitud en ES/EN, reconocer límites de propiedad intelectual y registrar **por separado** revisor, fecha con zona, evidencia y fingerprint de la pieza vigente. Las preguntas abajo son propuestas de investigación, no un visto bueno automático.

### [ ] E5-6-sinopsis — Ladrones a Domicilio

- **Clave e inventario:** `6:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** El texto SQL habla de trabajo como chofer de transporte de valores; el resumen del catálogo CineDominicano.com se refiere a guardia de seguridad. Determinar si ambas descripciones corresponden al mismo trabajo o son contradictorias.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_SQL.md`.
- **Siguiente acción específica:** Comparar la labor de Bruno descrita como conductor de transporte de valores (Diario Libre/Casa de América) y guardia de seguridad (ficha de catálogo). El borrador SQL queda sin aprobación hasta revisión de licencias y ES/EN.
- **Límite técnico/editorial:** Sinopsis F2.3 #6; no confundir el resumen de fuentes con licencia.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-9-contexto — Lotoman

- **Clave e inventario:** `9:contexto` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Discrepancia material: el contexto dice estreno 20/01/2011, confirmado por ficha histórica, mientras SQL contiene 10/03/2011 y género Infantil en vez de Comedia. No corregir sin procedimiento E-4 en SQL y confirmación editorial del campo.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_CONTEXTOS_12.md`.
- **Siguiente acción específica:** Comparar la fecha y género del ensayo con SQL presente: 2011-01-20/Comedia; completar contraste factual del contexto, sin dar firma E-4.
- **Límite técnico/editorial:** Contexto no se aprueba por tener metadato actualizado.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-9-sinopsis — Lotoman

- **Clave e inventario:** `9:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Metadatos SQL: el snapshot tiene género Infantil y fecha 2011-03-10, mientras la ficha histórica registra Comedia y estreno 2011-01-20. Hay propuesta E-4 en el proyecto; NO actualizar el JSON a mano.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE1.md`.
- **Siguiente acción específica:** Revisar trama y lengua ES/EN, separando el metadato E-4: SQL ya muestra Comedia y 2011-01-20, pero E-4 no está aprobado.
- **Límite técnico/editorial:** No repetir `UPDATE` E-4; ver matriz E-4.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-10-sinopsis — Vamos de robo

- **Clave e inventario:** `10:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Redacción SQL con correspondencia textual muy marcada con sinopsis disponibles en Cinema Dominicano y CineDominicano.com. Aclarar origen/autorización, proponer texto propio solo tras comprobar trama. Fecha SQL 2014-01-15 vs estreno comercial 2014-01-16 en ambas fichas.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_SQL.md`.
- **Siguiente acción específica:** Fecha F2.3 ya corregida a 2014-01-16; revisar originalidad del SQL, la sospecha de los protagonistas y la cuantía de RD$150 millones en ES/EN.
- **Límite técnico/editorial:** No reabrir fecha ni copiar sinopsis de portales.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-24-sinopsis — Sanky Panky 3

- **Clave e inventario:** `24:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Snapshot: FechaEstreno=2018-03-18, Director=null; comunicados de Caribbean Films y notas de marzo de 2018 registran estreno comercial en RD el 2018-03-29 y dirección Eduardo «Transfor» Ortiz. Una premier ocurrió el 26 de marzo, no el 18. La versión inglesa no añade hechos sustanciales. Corregir solo mediante procedimiento SQL E-4 tras comprobar el registro de origen.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE3.md`.
- **Siguiente acción específica:** Director Eduardo «Transfor» Ortiz y 2018-03-29 ya presentes en SQL: verificar el contenido de sinopsis y revisar decisiones E-4 sin aplicar SQL.
- **Límite técnico/editorial:** Separar estreno comercial de gala de 26/03.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-26-sinopsis — Feo de día, Lindo de noche

- **Clave e inventario:** `26:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** F-2.3: corregida en los borradores ES/EN la referencia imprecisa a horas del día; ahora describe la transformación nocturna de 8 p. m. a medianoche, respaldada por Cinema Dominicano, Diario Libre y Prime Video. Quedan pendientes la revisión humana de exactitud, estilo, procedencia y versión editorial final. Incidencia original: Error de precisión potencial en ambos borradores: se dice «ciertas horas del día» / «a few hours each day», pero varias fuentes precisan el cambio de 8 p. m. a medianoche. Evitar interpretarlo como transformación diurna. Plantear una actualización editorial ES/EN tras revisión manual. Fecha SQL 2012-09-13 coincide.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE3.md`.
- **Siguiente acción específica:** Comprobar que el texto ES/EN efectivamente mantiene transformación de 8 p. m. a medianoche y no afirma cambio diurno; evaluar nuevas fuentes y originalidad.
- **Límite técnico/editorial:** La corrección propuesta no es aprobación humana.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-27-sinopsis — Lotoman 003: Volando Bajito

- **Clave e inventario:** `27:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Fecha SQL 2014-03-15 vs estreno comercial 2014-03-27 en Cinema Dominicano y CineDominicano.com. La organización se denomina «La Cosa Aquella» en ambas referencias; el borrador no la nombra. Evaluar precisión y corregir solo desde SQL.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE3.md`.
- **Siguiente acción específica:** Fecha F2.3 2014-03-27 ya cerrada; revisar mención opcional de «La Cosa Aquella» solo si la fuente avala el rol y el borrador respeta la trama.
- **Límite técnico/editorial:** No repetir migración ni añadir hechos sin evidencia.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-30-sinopsis — El Diablo no duerme en su cama

- **Clave e inventario:** `30:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Alerta de metadatos: la ficha del sitio publicada el 2024-09-24 es una nota sobre la producción, no certifica estreno el 2024-09-22 del snapshot. Una nota de 2024 anuncia posible llegada a salas en el primer semestre de 2025; requiere verificar fecha real, estatus de estreno y si se mezcló fecha de prensa con estreno comercial. Dirección Amauris Pérez documentada; snapshot director null.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE3.md`.
- **Siguiente acción específica:** Director Amauris Pérez ya presente E-4; investigar si la fecha catalogada 2024-09-22 era producción/noticia y si hubo estreno dominicano efectivo; revisar sinopsis.
- **Límite técnico/editorial:** No confundir artículo de rodaje con estreno.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-31-sinopsis — Entiérrenlo Parao

- **Clave e inventario:** `31:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** IMDb y medios confirman premisa y dirección Ronni Castillo. El snapshot registra 2025-06-05, reflejado también por agregadores, pero no encontramos evidencia primaria suficiente de apertura comercial dominicana en ese día. En agosto de 2026 la película fue presentada en el Dominican Film Festival de Nueva York como premiere internacional. Confirmar si el 5 de junio de 2025 es una fecha técnica/listado, estreno nacional o festival. No confundir esta obra con otro formato o producción homónima.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE3.md`.
- **Siguiente acción específica:** Obtener cartelera o documento primario que acredite estreno comercial en RD el 2025-06-05; separar noticia 2026 del festival de Nueva York y obra homónima.
- **Límite técnico/editorial:** No cambiar fecha por inferencia.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-32-sinopsis — Los Rechazados 2: Operación Espacial

- **Clave e inventario:** `32:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Discrepancias del snapshot: FechaEstreno=2026-09-13 y Director=null, mientras DGCINE documenta estreno comercial el 2026-08-13 y dirección de Yasser Michelén. El catálogo asigna género Acción; la producción se describe también como comedia y ciencia ficción. Revisar la taxonomía de géneros sin sobrescribirla por defecto. El título contiene un espacio final en el snapshot.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE4.md`.
- **Siguiente acción específica:** SQL ya refleja Yasser Michelén y 2026-08-13 (E-4 sin aprobar); revisar categoría Acción frente a comedia/ciencia ficción y la grafía/título; contrastar ES/EN.
- **Límite técnico/editorial:** No borrar el título SQL ni corregir género sin política editorial.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-36-sinopsis — Nueba Yol 3: Bajo la Nueva Ley

- **Clave e inventario:** `36:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Fecha SQL 1997-10-31 frente a 1997-10-23 en Cinema Dominicano. La fuente describe esta obra como «segunda parte» de Nueba Yol, aunque el catálogo usa Nueba Yol 3; revisar denominación y secuencia histórica antes de alterar el título.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE4.md`.
- **Siguiente acción específica:** Fecha F2.3 1997-10-23 aplicada por decisión del titular, pero sin cartelera dominicana independiente; revisar identidad del título «Nueba Yol 3»/«segunda parte».
- **Límite técnico/editorial:** Mantener advertencia de evidencia histórica insuficiente.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-40-sinopsis — Colao 2

- **Clave e inventario:** `40:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Snapshot: estreno 2023-12-07 y género Comedia; Cinema Dominicano registra estreno 2023-11-30 y género Drama. Determinar tipo de fecha y clasificación de género con distribuidora u otra fuente antes de corregir. La ficha acredita Frank Perozo mientras el snapshot utiliza su nombre extendido; conservar identidad sin cambiar por intuición.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE4.md`.
- **Siguiente acción específica:** Fecha F2.3 2023-11-30 ya verificada; contrastar género Drama vs Comedia y crédito Frank Perozo, evitando duplicar su identidad civil.
- **Límite técnico/editorial:** No crear E4 nuevo automático.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-42-sinopsis — Andrea

- **Clave e inventario:** `42:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Fecha SQL 2005-08-16 vs 2005-08-18 en Cinema Dominicano. Sobre el director, la misma ficha usa Roger Bencosme en dirección, guion y edición, pero Rogert Bencosme en productores, y el snapshot registra Rogert. Resolver con créditos originales o registro oficial, no suponer un error tipográfico. La referencia usa el título extendido «Andrea: La venganza de un espíritu».
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE4.md`.
- **Siguiente acción específica:** Fecha F2.3 2005-08-18 cerrada; investigar en créditos nombre Roger/Rogert Bencosme y título extendido, no corregir director por intuición.
- **Límite técnico/editorial:** Una misma fuente contiene ambas variantes.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-44-sinopsis — Playball

- **Clave e inventario:** `44:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Snapshot: estreno 2008-02-01, género Comedia. Cinema Dominicano y documentación del Festival de Cine Global señalan 14/02/2008 y la ficha histórica clasifica Drama. La misma obra aparece como Play Ball, mientras CineRD usa Playball. Confirmar estreno y género antes de cambios E-4; no confundir con fecha de nota promocional.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE5.md`.
- **Siguiente acción específica:** Fecha F2.3 2008-02-14 verificada; contrastar Drama/Comedia, Play Ball/Playball y método de clasificación antes de proponer cambio.
- **Límite técnico/editorial:** No equiparar cambio de título con licencia.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-47-sinopsis — Pimp Bullies: Victimas de un Prostibulo

- **Clave e inventario:** `47:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Snapshot: género Acción; Cinema Dominicano lo identifica como Drama/Thriller. Revisar subtipo/etiquetas y confirmar qué criterios utiliza la taxonomía del catálogo. La ficha emplea el título alternativo «Víctimas de un prostíbulo (Pimp Bullies)»; el título SQL presenta diferencias de tildes/capitalización y orden. Estreno 22/09/2011 coincide.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE5.md`.
- **Siguiente acción específica:** Decidir política de género (Acción vs Drama/Thriller) y variantes de título/acentos, con fuente y crédito; no sobreescribir SQL por estilo.
- **Límite técnico/editorial:** Revisar sensibilidad del contenido sin introducir trama no constatada.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-55-sinopsis — El Plan Perfecto

- **Clave e inventario:** `55:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Comprobar si la sinopsis SQL se tomó de una descripción comercial y si existe permiso de reproducción. Fecha SQL 2017-01-17; DGCINE y Cinema Dominicano registran 2017-01-19 como estreno; Páginas Amarillas muestra 1/17/17. No corregir sin establecer el significado del campo.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_SQL.md`.
- **Siguiente acción específica:** Borrador F2.3 #55 revisado: recontratación respaldada por La Crónica y elCaribe, presión policial descrita en crítica. Revisar autonomía del texto ES/EN y derechos del SQL antiguo.
- **Límite técnico/editorial:** Fecha F2.3 2017-01-19 ya cerrada; nueva redacción no aprobada.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-56-contexto — La Lucha de Ana

- **Clave e inventario:** `56:contexto` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** Fecha SQL: 13/04/2012 frente a 24/05/2012 en ficha histórica. Ibermedia solo respalda el año 2012, no el día de estreno. La fórmula «circuito de apoyo cinematográfico» debe entenderse por su registro en Ibermedia, sin inferir subvenciones específicas.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_CONTEXTOS_12.md`.
- **Siguiente acción específica:** Fecha F2.3 2012-05-24 verificada; precisar qué respalda Ibermedia sin inferir financiación, ayuda específica ni día de estreno; revisar ES/EN.
- **Límite técnico/editorial:** Separar apoyo a proyecto de apoyo financiero confirmado.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

### [ ] E5-56-sinopsis — La Lucha de Ana

- **Clave e inventario:** `56:sinopsis` · prioridad **alta** · estado inicial `pendiente_verificacion`.
- **Observación original F-2.2/F-2.3:** La redacción SQL se aproxima considerablemente a fuentes públicas; auditar procedencia y permisos, y revisar si conviene una sinopsis original de nueva redacción. Fecha SQL 2012-04-13 vs estreno 2012-05-24 indicado por fuentes históricas.
- **Informe de origen:** `docs/FASE_F2_2_AUDITORIA_SQL.md`.
- **Siguiente acción específica:** Fecha F2.3 2012-05-24 cerrada; comparar nueva redacción ES/EN con Ibermedia y texto SQL para evitar copia, hechos inventados y atribuciones de licencia.
- **Límite técnico/editorial:** No inferir modo del homicidio ni final.
- [ ] Revisé hechos y fuentes en el documento original y, donde haga falta, en una fuente primaria/visionado.
- [ ] Contrasté el texto vigente ES/EN con lo verificable; separé opinión editorial de datos.
- [ ] Revisé procedencia y derechos de reproducción; si corresponde, preparé redacción original atribuible.
- [ ] Revisé la huella del texto vigente y registré una decisión humana comprobable.
- **Revisor:** ______ · **Fecha/zona:** ______ · **Fuente/visionado:** ______ · **Resultado propuesto:** ______ · **Notas:** ______.

## Puertas de seguridad y acciones siguientes

1. **Conteo validado contra el JSON:** 18 filas de prioridad alta y claves únicas. El total completo sigue siendo 58; no se han reducido observaciones ni aprobado ninguna por completar esta lista.
2. **E-4:** consulte `docs/FASE_E4_MATRIZ_DECISIONES_7_CAMPOS_2026-11-10.md`. Los siete valores actuales de SSMS no validan por sí solos las piezas E-5.
3. **Sinopsis SQL:** los cinco borradores reemplazo permanecen manuales. El #55 tiene nueva redacción ES/EN documentada, pero **no fue aplicada en SQL**.
4. **Fingerprints reales:** obtenga el inventario con `node scripts/editorialReviewAudit.mjs --json` y genere, solo en un entorno privado, `node scripts/prepareClosureEditorial.mjs --create` si necesita un paquete con los textos completos. El paquete no certifica la revisión.
5. **Permisos y despliegue:** no modificar `docs/editorial-approvals-e5.json`, `docs/catalog-corrections-e4-approvals.json`, snapshots, SQL, media ledger ni anuncios sin evidencias y decisiones atribuibles.
6. Una vez revisadas estas 18, continuar las **18 medias** y **22 bajas** manteniendo las 58 piezas trazables.

**Resultado:** primera oleada de 18/18 fichas **preparadas para revisión**, **0/18 aprobadas**.
