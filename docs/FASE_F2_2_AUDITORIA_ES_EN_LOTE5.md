# CineRD — F-2.2 · Auditoría preliminar ES/EN, lote 5 (últimas nueve sinopsis)

**Estado:** contraste documental preliminar; **ninguna aprobación editorial concedida**.  
**Rama:** `feat/f2-editorial-review`.  
**Fuentes del catálogo:** `database/seeds/catalog.snapshot.json`, `frontend/src/data/sinopsisCuradasFaseE2.js`, `frontend/src/data/sinopsisCuradasFaseE2Final.js`.  
**IDs incluidos:** 44, 47, 48, 49, 50, 51, 52, 53 y 54.

Se contrastaron argumento, correspondencia general ES/EN y ciertos metadatos contra referencias públicas. **No consta visionado de las obras, validación de procedencia o autorización de textos, dictamen de derechos ni revisión humana final**. Este informe **no modifica** las sinopsis, SQL, el inventario de medios ni `docs/editorial-approvals-e5.json`.

## Matriz del lote

| ID | Película | Revisión de argumento y traducción | Discrepancias y comprobaciones pendientes | Prioridad |
|---:|---|---|---|---|
| 44 | Playball (2008) | Álex Durán es pelotero prometedor de Grandes Ligas, se implica en esteroides, pierde oportunidades y regresa a RD para jugar con un equipo de la liga profesional. Ambas versiones concuerdan con la premisa documentada. | **Snapshot:** estreno `2008-02-01`, género `Comedia`. Cinema Dominicano y documentación del Festival de Cine Global señalan **14/02/2008** y la ficha histórica clasifica **Drama**. La misma obra aparece como **Play Ball**, mientras CineRD usa `Playball`. Confirmar estreno y género antes de cambios E-4; no confundir con fecha de nota promocional. | **ALTA** |
| 47 | Pimp Bullies: Víctimas de un Prostíbulo (2011) | Isabel no puede costear el tratamiento del hijo enfermo, viaja irregularmente a Nueva York, acaba asesinada tras ingresar en la prostitución y un policía investiga su muerte años después. ES/EN fieles a la trama de la referencia. | **Snapshot:** género `Acción`; Cinema Dominicano lo identifica como **Drama/Thriller**. Revisar subtipo/etiquetas y confirmar qué criterios utiliza la taxonomía del catálogo. La ficha emplea el título alternativo «Víctimas de un prostíbulo (Pimp Bullies)»; el título SQL presenta diferencias de tildes/capitalización y orden. Estreno 22/09/2011 coincide. | **ALTA** |
| 48 | Al Fin y al Cabo (2008) | Dos agentes del FBI persiguen al Duque con ayuda de Cabo Azulado y Joe, ladrón de radios; ambas versiones describen el mismo conflicto y tono cómico. | Cinema Dominicano registra estreno **02/10/2008**, dirección **Alfonso Rodríguez** y género **Comedia/Fantástico**. El snapshot coincide en fecha y Comedia, aunque no refleja la etiqueta Fantástico. «El Duque» se identifica como jefe de cartel internacional. Sin incidencia urgente; revisar redacción final y titularidad. | BAJA |
| 49 | Los Locos también Piensan (2005) | Filomeno pierde su trabajo teatral, presenta un guion por intermediación de Balbuena, su propuesta es rechazada y planea probar su valor. ES/EN alineados con fuente. | **Discrepancia no resuelta:** snapshot `2005-01-26`; Cinema Dominicano indica **27/01/2005**, mientras **Diario Libre (06/01/2005)** anunció estreno simultáneo en RD, Puerto Rico y EE. UU. para el **26/01/2005** y su cobertura de premier se publicó el 26. **No clasificar todavía la fecha SQL como errónea**; confirmar función/premier/estreno efectivo y país. Dirección `Che Castellanos` es forma abreviada de `Humberto «Che» Castellanos`, verificar cómo documentar alias. | **MEDIA** |
| 50 | Hermanos (2018) | Dos gemelos separados al nacer viven como cristiano y ladrón; el asalto deja a uno en coma y el otro suplanta su identidad, mientras la familia cree que padece amnesia. ES/EN acordes con el argumento público. | **Diferencia de taxonomía, no necesariamente error:** CineRD almacena `Comedia` y Cinema Dominicano/CineDominicano.com clasifican `Drama`; **DGCINE describe expresamente la obra como comedia con drama humano**. Registrar ambos géneros o adoptar criterio editorial multisectorial tras comprobar el modelo de datos. Fecha **15/03/2018** y dirección Archie López coinciden. | **MEDIA** |
| 51 | Tubérculo Presidente (2016) | Tubérculo y Tirson gobiernan como presidente y vicepresidente; políticas de alimentación y anticorrupción generan respaldo y oposición interesada. Traducciones conservan hechos esenciales. | Cinema Dominicano confirma fecha **24/11/2016**, género Comedia y dirección Archie López: coinciden con snapshot. La descripción «food access» puede pulirse con referencia a programas de alimentación popular para precisión de traducción, sin cambiar hechos. | BAJA |
| 52 | Dos policías en apuros (2016) | Dos policías dominicanos de carácter peculiar cooperan con un agente del FBI para investigar una organización internacional; problemas por sus diferencias de método. ES/EN consistentes con ficha histórica. | Fecha **25/02/2016** y Comedia coinciden. CineRD registra director `Francis Disla`, Cinema Dominicano lo acredita como `Francisco Disla`; publicaciones contemporáneas usan `Francis Disla («El Indio»)`. **No deducir que se trata de personas distintas**; revisar alias/nombre de crédito oficial antes de modificar identidad. | BAJA |
| 53 | La Musiquita por Dentro (2019) | Ariel, pasante tímido, se enamora de Mar; Vanessa complica su relación; el protagonista intenta vencer inseguridades. ES/EN respetan el núcleo. | Cinema Dominicano registra **02/05/2019**, dirección Ernesto Alemany y comedia romántica; fecha/director coinciden con snapshot, que clasifica Comedia. El borrador en inglés `Vanessa's involvement` es correcto pero amplio; verificar que no atribuya acciones no descritas explícitamente. | BAJA |
| 54 | Los Paracaidistas (2015) | Cuatro empleados de una fábrica de colchones quieren entrar sin invitación a 100 fiestas para ayudar a Leo tras una ruptura; su amistad y empleo quedan amenazados. ES/EN congruentes con ficha. | Fecha **12/02/2015**, dirección Archie López y comedia coinciden. La ficha añade la intención de **enriquecerse**, resumida en ES/EN como ganar fama; evaluar incluir «ricos y famosos» sin reproducir literalmente una sinopsis ajena. | BAJA |

## Referencias documentales contrastadas

- **44 — Play Ball:** [Cinema Dominicano](https://cinemadominicano.com/play-ball-2008/); [Festival de Cine Global Dominicano, nota del 14/02/2008](https://www.festivaldecineglobal.org/drgff2007/site/noticias005.asp); [Diario Libre, anuncio de estreno](https://www.diariolibre.com/revista/play-ball-se-estrenar-en-febrero-del-2008-en-cines-APDL161625).
- **47 — Pimp Bullies / Víctimas de un prostíbulo:** [Cinema Dominicano](https://cinemadominicano.com/victimas-de-un-prostibulo-pimp-bullies-2011-2/).
- **48 — Al Fin y al Cabo:** [Cinema Dominicano](https://cinemadominicano.com/al-fin-y-al-cabo-2008/).
- **49 — Los Locos también Piensan:** [Cinema Dominicano](https://cinemadominicano.com/los-locos-tambien-piensan-2005/); [Diario Libre, 06/01/2005](https://www.diariolibre.com/revista/los-locos-tambin-piensan-este-mes-a-la-pantalla-CBDL55260); [Diario Libre, 26/01/2005](https://www.diariolibre.com/revista/los-locos-tambin-piensan-supera-las-expectativas-AEDL56406).
- **50 — Hermanos:** [Cinema Dominicano](https://cinemadominicano.com/hermanos-2018/); [CineDominicano.com](https://cinedominicano.com/peliculasdominicanas/pelicula/hermanos-2018/); [DGCINE, actividad de proyección](https://dgcine.gob.do/privados-de-libertad-disfrutan-la-pelicula-hermanos-y-aprecian-su-mensaje-de-superacion/).
- **51 — Tubérculo Presidente:** [Cinema Dominicano](https://cinemadominicano.com/tuberculo-presidente-2016/).
- **52 — Dos policías en apuros:** [Cinema Dominicano](https://cinemadominicano.com/dos-policias-en-apuros-2016/); [estreno, ficha complementaria](https://cinemadominicano.com/dos-policias-en-apuros-llega-a-los-cines-del-pais-y-puerto-rico/).
- **53 — La Musiquita por Dentro:** [Cinema Dominicano](https://cinemadominicano.com/la-musiquita-por-dentro-2019/).
- **54 — Los Paracaidistas:** [Cinema Dominicano](https://cinemadominicano.com/los-paracaidistas-2015/); [anuncio de estreno](https://cinemadominicano.com/los-paracaidistas-caera-el-12-de-febrero-en-todos-los-cines-del-pais/).

## Acciones propuestas y límites

1. **Alta prioridad: IDs 44 y 47.** Verificar con productores, créditos o registros institucionales las discrepancias de fecha/género de Playball y la clasificación de Pimp Bullies. Mantener propuestas de cambio, no actualizaciones automáticas.
2. **Resolución entre fuentes: IDs 49 y 50.** La fecha 26 vs 27 de enero y la categoría Drama vs Comedia admiten evidencia divergente; conservarla, anotar nivel de confianza y no fabricar certeza.
3. **Identidad y títulos alternativos: IDs 47, 49, 52.** Confirmar grafías de título y alias de directores; una variación editorial no acredita una persona distinta.
4. **Control lingüístico:** realizar pase final por las nueve traducciones ES/EN para exactitud, puntuación y matices culturales.
5. **Derechos:** rastrear procedencia de cada texto; las fuentes bibliográficas son evidencia argumental, no autorizaciones de reproducción ni aprobación.
6. **SQL:** si se decide corregir algún metadato, respaldar origen SQL Server, aplicar E-4 y reexportar el snapshot; no editar el JSON manualmente.
7. **Aprobaciones:** mantener `docs/editorial-approvals-e5.json` sin entradas; ninguna fase de contraste sustituye una firma humana atribuida.

## Balance acumulado

- **46/46 sinopsis** con contraste documental **preliminar** registrado en F-2.2: **5 SQL + 41 borradores bilingües**.
- **12/12 análisis contextuales pendientes** de contraste y validación final de sus interpretaciones.
- **0/58 aprobaciones humanas**.
- AdSense permanece desactivado; los medios sin licencia comercial documentada deben mantenerse excluidos de los builds públicos en modo `review`.

**Criterio de cierre del lote:** se ha documentado la existencia de puntos de contraste y discrepancias; **no** se declara cierre de calidad editorial, originalidad, veracidad definitiva ni preparación para monetización.
