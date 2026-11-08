# CineRD — F-2.2, lote 4: contraste de ocho sinopsis editoriales ES/EN

**Estado:** contraste documental preliminar; no acredita visionado, origen lícito de los textos ni aprobación humana.  
**Rama:** `feat/f2-editorial-review`.  
**Archivos consultados:** `database/seeds/catalog.snapshot.json`, `frontend/src/data/sinopsisCuradasFaseE2.js`, `frontend/src/data/sinopsisCuradasFaseE2Final.js`.  
**Películas:** IDs 32, 33, 34, 36, 38, 40, 41 y 42.

Las películas de este lote carecen de `Sinopsis` SQL y usan textos editoriales ES/EN con estado `pendiente_revision`. Las observaciones se basan en el snapshot versionado, los textos editoriales y las referencias externas identificadas en este documento. **No se ha alterado SQL Server, los textos públicos, ni `docs/editorial-approvals-e5.json`.**

## Resultado por película

| ID | Película | Evaluación del argumento ES/EN | Hallazgos y decisiones pendientes | Prioridad |
|---:|---|---|---|---|
| 32 | Los Rechazados 2: Operación Espacial (2026) | Las versiones ES/EN describen una amenaza climática, una inteligencia artificial hostil y una misión espacial de héroes sin entrenamiento. La premisa coincide con DGCINE y otras fuentes. | **Discrepancias del snapshot:** `FechaEstreno=2026-09-13` y `Director=null`, mientras **DGCINE documenta estreno comercial el 2026-08-13 y dirección de Yasser Michelén**. El catálogo asigna género `Acción`; la producción se describe también como comedia y ciencia ficción. Revisar la taxonomía de géneros sin sobrescribirla por defecto. El título contiene un espacio final en el snapshot. | ALTA |
| 33 | Pueto Pa' Mi (2015) | Las dos versiones capturan la aspiración de dos cantantes urbanos a progresar pese a obstáculos económicos; la traducción preserva el sentido básico. | Dirección Iván Herrera, género drama y estreno 2015-08-13 coinciden con Cinema Dominicano. La fuente identifica a los protagonistas como Aníbal y Renzo Comando; incluir nombres solo si aporta claridad al resumen. Comprobar grafía oficial del título `PUETO PA´MI` frente a la variante apostrofada del snapshot. | BAJA |
| 34 | Los Super (2013) | El borrador español y su versión inglesa presentan a Cristina, Belisario y Benito como defensores del barrio frente a Vandomal; coinciden con los elementos esenciales del argumento externo. | La ficha histórica especifica que Vandomal crea un virus letal y posee su cura para obtener apoyo político; el resumen de CineRD lo omite. Puede mantenerse abreviado, pero no convertir la omisión en una interpretación diferente. Estreno 2013-05-09 y director Bladimir Abud coinciden. | BAJA |
| 36 | Nueba Yol 3: Bajo la Nueva Ley (1997) | El borrador ES/EN trata las dificultades migratorias de Balbuena ante una ley restrictiva. La ficha histórica sitúa la trama en las semanas anteriores al llamado «martes negro»; argumento general consistente. | **Fecha SQL 1997-10-31 frente a 1997-10-23 en Cinema Dominicano**. La fuente describe esta obra como «segunda parte» de `Nueba Yol`, aunque el catálogo usa `Nueba Yol 3`; revisar denominación y secuencia histórica antes de alterar el título. | ALTA |
| 38 | La casa del kilómetro 5 (2012) | Ambas sinopsis mantienen la emisora radial, el concurso de pasar la noche en una casa embrujada de La Vega y el peligro que rodea el lugar. | La ficha especifica un premio de **dos millones de pesos** y que la emisora buscaba aumentar audiencia; el borrador omite la cuantía, una simplificación admisible. La frase inglesa `publicity stunt` es una interpretación funcional del concurso, no una cita oficial. Estreno 2012-03-22 y director Omar Javier coinciden. | BAJA |
| 40 | Colao 2 (2023) | La sinopsis ES/EN refleja los planes de Antonio para la adaptación de Laura a la vida rural y las tensiones causadas por una antigua novia; coincide con la ficha histórica. | **Snapshot: estreno 2023-12-07 y género Comedia; Cinema Dominicano registra estreno 2023-11-30 y género Drama.** Determinar tipo de fecha y clasificación de género con distribuidora u otra fuente antes de corregir. La ficha acredita `Frank Perozo` mientras el snapshot utiliza su nombre extendido; conservar identidad sin cambiar por intuición. | ALTA |
| 41 | Malos padres (2023) | El borrador presenta a Leo y Diego, oportunistas atraídos por una herencia, que deben convivir y cuidar de un niño cuya paternidad es incierta. Las dos versiones mantienen la trama central. | El texto fuente aclara que la herencia proviene de **la madre del niño**; el borrador no identifica de quién procede. Puede añadirse para precisión, previa revisión editorial. Estreno 2023-08-10 y dirección José Ramón Alamá coinciden. | BAJA |
| 42 | Andrea (2005) | La protagonista retira una cruz de una tumba y libera un espíritu vinculado a una antigua venganza; ES/EN coinciden con la sinopsis histórica. | **Fecha SQL 2005-08-16 vs 2005-08-18 en Cinema Dominicano.** Sobre el director, la misma ficha usa **Roger Bencosme** en dirección, guion y edición, pero **Rogert Bencosme** en productores, y el snapshot registra Rogert. Resolver con créditos originales o registro oficial, no suponer un error tipográfico. La referencia usa el título extendido «Andrea: La venganza de un espíritu». | ALTA |

## Fuentes públicas utilizadas

- **32:** [DGCINE — Los Rechazados 2 llega a salas el 13/8/2026](https://dgcine.gob.do/los-rechazados-2-lleva-la-comedia-y-la-ciencia-ficcion-a-nuevas-audiencias/); [CineDominicano.com — estreno](https://cinedominicano.com/estreno/los-rechazados-2/).
- **33:** [Cinema Dominicano — Pueto Pa’Mi](https://cinemadominicano.com/pueto-pami-2015/).
- **34:** [Cinema Dominicano — Los Super](https://cinemadominicano.com/los-super-2013/).
- **36:** [Cinema Dominicano — Nueba Yol 3: Bajo la Nueva Ley](https://cinemadominicano.com/nueba-yol-3-bajo-la-nueva-ley-1997/).
- **38:** [Cinema Dominicano — La casa del kilómetro 5](https://cinemadominicano.com/la-casa-del-kilometro-5-2012/).
- **40:** [Cinema Dominicano — Colao 2](https://cinemadominicano.com/colao-2-2023/).
- **41:** [Cinema Dominicano — Malos padres](https://cinemadominicano.com/malos-padres-2023/).
- **42:** [Cinema Dominicano — Andrea: La venganza de un espíritu](https://cinemadominicano.com/andrea-la-venganza-de-un-espiritu-2005/).

## Reglas de seguimiento

1. Tratar las discrepancias en IDs **32, 36, 40 y 42** como **incidencias de metadatos**, no como instrucciones automáticas de escritura en SQL.
2. Priorizar las fuentes primarias y distinguir estreno nacional, preestreno, distribución, festivales y fechas administrativas antes de modificar `FechaEstreno`.
3. Resolver variante `Roger/Rogert` del ID 42 y el nombre extendido `Frank Perozo` del ID 40 usando créditos de obra; evitar alterar identidades de talentos sin evidencia.
4. Revisar fidelidad lingüística ES/EN y procedencia original de las ocho sinopsis. Ninguna fuente enlazada concede automáticamente licencia de reproducción.
5. Mantener `docs/editorial-approvals-e5.json` vacío hasta revisiones humanas reales y con huellas vigentes.
6. Mantener AdSense desactivado y compilaciones Cloudflare en modo de derechos `review`.

## Balance acumulado F-2.2

- **5 sinopsis SQL + 32 editoriales bilingües** contrastadas documentalmente en lotes: **37/46** sinopsis del catálogo.
- **9 sinopsis ES/EN** restantes para este nivel de revisión.
- **12 textos contextuales** todavía pendientes de esta auditoría.
- **0/58 aprobaciones editoriales humanas** registradas.

**Nota de alcance:** el contraste documental no constituye revisión humana final de contenido ni un dictamen jurídico de propiedad intelectual. El presente commit documenta riesgos y evidencia; no cambia el comportamiento del sitio.
