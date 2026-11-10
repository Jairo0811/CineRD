# CineRD — F-2.2 · Lote 2 de sinopsis editoriales bilingües

**Estado:** contraste documental preliminar; ninguna firma ni aprobación editorial concedida.  
**Rama:** `feat/f2-editorial-review`.  
**Fuentes internas:** `frontend/src/data/sinopsisCuradasFaseE2.js`, `frontend/src/data/sinopsisCuradasFaseE2Final.js`, `database/seeds/catalog.snapshot.json`.  
**Identificadores revisados:** 14, 15, 17, 18, 19, 20, 21, 23.

El contraste se limita al argumento principal, traducción ES/EN y algunos metadatos con referencias públicas. **No es constancia de visionado, certificación de originalidad, permiso de reproducción ni revisión humana final.** No se han editado las sinopsis, la base de datos ni `docs/editorial-approvals-e5.json`.

## Resultados

| ID | Película | Comprobación documental y ES/EN | Incidencias y acciones pendientes | Prioridad |
|---:|---|---|---|---|
| 14 | Los Rechazados (2025) | La sinopsis ES/EN coincide con la premisa de marginados sociales que realizan una misión submarina ante una crisis global. DGCINE confirma dirección de Yasser Michelén y estreno dominicano de 2025-03-06, igual que el snapshot. | La fuente presenta el título extendido «Los Rechazados: Operación Submarino»; registrar como variante antes de cambiar el título canónico. Verificar que la traducción inglesa no añada hechos no documentados. | MEDIA |
| 15 | Tubérculo Gourmet (2015) | Tubérculo y Tirson son amigos desde la infancia, se separan por un malentendido y vuelven a encontrarse veinte años después. ES/EN fieles a la premisa; estreno 2015-11-26 coincide. | «Lealtad» en inglés y la caracterización interpretativa en ambas versiones requieren revisión final: son lectura editorial, no afirmación documental estricta. | BAJA |
| 17 | Profe por Accidente (2013) | Francisco pierde el empleo como chofer del tren del zoológico, sufre un incendio, busca ayuda de Mon y llega a un colegio bilingüe. Las versiones ES/EN conservan el mismo argumento; estreno 2013-01-17 coincide. | El texto simplifica la relación con el amigo y su trabajo como profesor sustituto; confirmar que esa abreviación no induzca error. | BAJA |
| 18 | Lotoman 2.0 (2012) | Modesto y Manuel, ahora millonarios, afrontan la enfermedad de Mamá Susana. Argumento consistente en ES/EN; estreno 2012-11-01 coincide. | La idea final de que «el dinero no puede resolverlo» es interpretación de CineRD: distinguir tema de hecho narrativo si se presenta como dato oficial. | BAJA |
| 19 | Carlota la Más Barrial (2025) | DGCINE describe el liderazgo de Carlota en Villa Hermosa frente a una banda delictiva; respalda la solidaridad comunitaria y el estreno 2025-08-28. ES/EN coinciden en lo principal. | El borrador omite la localización Villa Hermosa, que podría incorporarse si se desea mayor precisión. Revisar atribución de las afirmaciones sobre «organización comunitaria» como interpretación editorial. | BAJA |
| 20 | Un Macho de Mujer (2006) | Ramón sale de parranda tras el trabajo; un amuleto desencadena el intercambio de roles familiares. ES/EN son consistentes y fecha de estreno 2006-02-09 coincide. | La ficha identifica a su esposa como Mariel; el borrador no la nombra, sin que ello constituya error. Revisar adecuación lingüística de «reversal of family roles». | BAJA |
| 21 | Medias Hermanas (2025) | Caribbean Cinemas confirma el encuentro entre Victoria y Yoli durante el velorio paterno y la casa de playa donde ambas deben pasar el fin de año. ES/EN conservan las relaciones y la premisa. | La sinopsis resumida omite la intervención del esposo Román y la condición vinculada a vender la casa; es una simplificación aceptable si se valida editorialmente. La página consultada no indica fecha precisa de estreno: **2025-12-04 en el snapshot queda pendiente de segunda fuente**. | MEDIA |
| 23 | Sanky Panky 2 (2013) | La ficha describe a Genaro, Morena, una familia italiana y el regreso de Martha; ES/EN son congruentes con esa ficha y la fecha 2013-10-31 coincide. | **Contradicción de fuentes:** una reseña del mismo medio describe a Martha como la novia actual de Genaro, frente a Morena en la ficha histórica. Comprobar con créditos, productora o visionado antes de aprobar la relación entre personajes. Además, la ficha emplea el título extendido «Sanky Panky 2: Objetivo Italia». | ALTA |

## Fuentes consultadas

- ID 14: DGCINE — https://dgcine.gob.do/los-rechazados-operacion-submarino-ya-en-salas-de-cine-del-pais/
- ID 15: Cinema Dominicano — https://cinemadominicano.com/tuberculo-gourmet-2015/
- ID 17: Cinema Dominicano — https://cinemadominicano.com/profe-por-accidente-2013/
- ID 18: Cinema Dominicano — https://cinemadominicano.com/lotoman-2-0-2012/
- ID 19: DGCINE — https://dgcine.gob.do/dgcine-participa-en-la-premiere-decarlota-la-mas-barrial-que-llegara-a-los-cines-este-28-de-agosto/
- ID 20: Cinema Dominicano — https://cinemadominicano.com/un-macho-de-mujer-2006/
- ID 21: Caribbean Cinemas — https://caribbeancinemas.com/es/movie/2607/
- ID 23 (ficha histórica): https://cinemadominicano.com/sanky-panky-2-2013/
- ID 23 (reseña narrativa que discrepa): https://cinemadominicano.com/sanky-panky-2-la-otra-vuelta-de-genaro/

## Acciones de seguimiento

1. **ID 23 (prioridad alta):** resolver si Morena o Martha es pareja de Genaro en esta entrega, aclarando si las fuentes mezclan momentos de la historia. No inferir una corrección sin evidencia.
2. **ID 21:** confirmar la fecha 2025-12-04 en fuente de estreno fechada.
3. **IDs 14 y 23:** registrar variantes de títulos, sin alterar el título canónico ni la identidad por ID/año mientras no haya criterio editorial aprobado.
4. Revisar la fidelidad lingüística de las ocho parejas ES/EN y evitar presentar las interpretaciones temáticas como sinopsis oficiales.
5. Confirmar procedencia/autorizaciones de los textos antes de atribuirles originalidad o estatus editorial aprobado.
6. Mantener la auditoría de aprobación humana y el bloqueo de AdSense; esta documentación **no cambia ningún fingerprint**.

## Balance acumulado

- **5** sinopsis SQL con contraste preliminar documentado (F-2.2 informe SQL).
- **16** borradores ES/EN con contraste preliminar documentado (8 en lote 1 + 8 en lote 2).
- **25** borradores ES/EN pendientes de esta revisión preliminar.
- **12** contextos/ensayos pendientes.
- **0/58** aprobaciones humanas registradas; los controles de derechos de imágenes continúan separados de esta tarea.

La correspondencia con fuentes públicas es un indicio de consistencia documental, no una prueba concluyente de exactitud, originalidad ni derechos comerciales.
