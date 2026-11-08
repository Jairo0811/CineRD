# CineRD — F-2.2, lote 3: contraste preliminar de ocho sinopsis ES/EN

**Estado:** investigación documental preliminar; no implica visionado, licencia de textos ni aprobación humana.  
**Rama:** `feat/f2-editorial-review`.  
**Archivos fuente:** `frontend/src/data/sinopsisCuradasFaseE2.js`, `frontend/src/data/sinopsisCuradasFaseE2Final.js`, `database/seeds/catalog.snapshot.json`.  
**IDs:** 24, 25, 26, 27, 28, 29, 30, 31.

## Resultado por película

| ID | Película | Argumento y traducción ES/EN | Hallazgo documental y actuación pendiente | Prioridad |
|---:|---|---|---|---|
| 24 | Sanky Panky 3 (2018) | El borrador describe a Genaro, Chelo y Carlitos en Puerto Rico, la separación de Genaro y Morena, un nuevo interés romántico y el regreso de conflictos pasados; ambos idiomas coinciden. | **Snapshot:** `FechaEstreno=2018-03-18`, `Director=null`; comunicados de Caribbean Films y notas de marzo de 2018 registran **estreno comercial en RD el 2018-03-29** y dirección **Eduardo «Transfor» Ortiz**. Una premier ocurrió el 26 de marzo, no el 18. La versión inglesa no añade hechos sustanciales. Corregir solo mediante procedimiento SQL E-4 tras comprobar el registro de origen. | ALTA |
| 25 | Sanky Panky 4: De Safari (2025) | El viaje africano surge de un premio a Carlitos mientras los tres amigos trabajan en una finca cacaotera; se separan y viven aventuras. ES/EN mantienen la trama. | La referencia identifica el encuentro de **cada uno con una tribu diferente**, detalle omitido sin distorsión en el resumen. Fecha SQL `2025-05-15` y director Elías Acosta coinciden. Revisar matices culturales y denominación geográfica antes de aprobar. | BAJA |
| 26 | Feo de día, Lindo de noche (2012) | Ambos idiomas recogen el hechizo que modifica la apariencia de Lorenzo y complica su historia amorosa. | **Error de precisión potencial en ambos borradores:** se dice «ciertas horas del día» / «a few hours each day», pero varias fuentes precisan el cambio **de 8 p. m. a medianoche**. Evitar interpretarlo como transformación diurna. Plantear una actualización editorial ES/EN tras revisión manual. Fecha SQL `2012-09-13` coincide. | ALTA |
| 27 | Lotoman 003: Volando Bajito (2014) | Modesto y Manuel aceptan ayudar a una unidad especial de la policía a localizar integrantes de una organización clandestina. El borrador comprime la trama sin contradicción relevante; ES/EN concordantes. | **Fecha SQL `2014-03-15` vs estreno comercial `2014-03-27`** en Cinema Dominicano y CineDominicano.com. La organización se denomina «La Cosa Aquella» en ambas referencias; el borrador no la nombra. Evaluar precisión y corregir solo desde SQL. | ALTA |
| 28 | Teacher Mechy (2023) | Mercedes regresa de Nueva York, sabe del embarazo de Saray, y acepta un puesto docente de danza moderna que no domina. ES/EN coherentes. | Caribbean Cinemas confirma estreno `2023-01-05` y director acreditado como **Frank Perozo**. El snapshot contiene el nombre civil extendido **Francisco Ernesto Perozo Balbuena**; no modificar la identidad sin revisar política de alias/créditos. | BAJA |
| 29 | Baño de Mujeres (2025) | Tres amigas paran durante un viaje, encuentran mensajes de auxilio sobre trata de personas y deben afrontar una situación de terror. Ambas versiones recogen lo esencial. | La referencia describe a la víctima como fallecida que intenta ayudar a su hermana, dato sobrenatural que el borrador omite. **Inconsistencia ortográfica interna:** el borrador dice `Johanna`, mientras la ficha de Cinema Dominicano utiliza `Johana` en el argumento y `Johanna` en créditos. Confirmar nombre del personaje en créditos oficiales. Estreno `2025-10-02` y dirección Frank Perozo respaldados también por DGCINE. | MEDIA |
| 30 | El Diablo no duerme en su cama (2024 en snapshot) | David y Paloma, adolescentes de dos familias, inician una relación; sus padres descubren relaciones pasadas entre ellos. ES/EN coherentes con el argumento de Cinema Dominicano. | **Alerta de metadatos:** la ficha del sitio publicada el 2024-09-24 es una nota sobre la producción, no certifica estreno el `2024-09-22` del snapshot. Una nota de 2024 anuncia posible llegada a salas en el **primer semestre de 2025**; requiere verificar fecha real, estatus de estreno y si se mezcló fecha de prensa con estreno comercial. Dirección **Amauris Pérez** documentada; snapshot director `null`. | ALTA |
| 31 | Entiérrenlo Parao (2025) | La última voluntad de Don Adrián, un capo que desea un entierro de pie, desencadena caos en su familia. ES/EN se corresponden con la ficha IMDb y notas del festival. | IMDb y medios confirman premisa y dirección Ronni Castillo. El snapshot registra `2025-06-05`, reflejado también por agregadores, pero **no encontramos evidencia primaria suficiente de apertura comercial dominicana en ese día**. En agosto de **2026** la película fue presentada en el Dominican Film Festival de Nueva York como premiere internacional. Confirmar si el 5 de junio de 2025 es una fecha técnica/listado, estreno nacional o festival. No confundir esta obra con otro formato o producción homónima. | ALTA |

## Fuentes documentales de contraste

- **24 — Sanky Panky 3:** [Cinema Dominicano — ficha de estreno](https://cinemadominicano.com/sanky-panky-3-29-marzo/); [Diario Libre — anuncio de distribuidora](https://www.diariolibre.com/revista/cine/sanky-panky-3-se-estrenara-el-jueves-29-de-marzo-KB9470149); [Cinema Dominicano — premier](https://cinemadominicano.com/caribbean-cinemas-presenta-sanky-panky-3/).
- **25 — Sanky Panky 4:** [Cinema Dominicano — ficha de 2025](https://cinemadominicano.com/sanky-panky-4-de-safari-2025/).
- **26 — Feo de día, lindo de noche:** [Cinema Dominicano — ficha de 2012](https://cinemadominicano.com/feo-de-dia-lindo-de-noche-2012/); [Diario Libre — anuncio de 2012](https://www.diariolibre.com/revista/feo-de-dalindo-de-noche-se-estrena-el-13-de-septiembre-MPDL348136).
- **27 — Lotoman 003:** [Cinema Dominicano — ficha de 2014](https://cinemadominicano.com/lotoman-003-volando-bajito-2014/); [CineDominicano.com — catálogo](https://cinedominicano.com/peliculasdominicanas/pelicula/lotoman-003-volando-bajito-2014/).
- **28 — Teacher Mechy:** [Caribbean Cinemas — ficha de distribución](https://caribbeancinemas.com/es/movie/8592/).
- **29 — Baño de Mujeres:** [Cinema Dominicano — ficha de 2025](https://cinemadominicano.com/bano-de-mujeres-2025/); [DGCINE — estreno](https://dgcine.gob.do/se-estrena-la-pelicula-dominicana-de-suspenso-y-terror-bano-de-mujeres/).
- **30 — El Diablo no duerme en su cama:** [Cinema Dominicano — nota del 24/9/2024](https://cinemadominicano.com/el-diablo-no-duerme-en-su-cama-comedia-negra-de-amauris-perez/); [Listín Diario — anuncio de septiembre de 2024](https://listindiario.com/entretenimiento/2024/09/21/824036/pelicula-diablo-duerme-cama-apuesta-dramatica-humor-negro.html) (comprobar URL y fecha de exhibición independientemente).
- **31 — Entiérrenlo Parao:** [IMDb — ficha de 2025](https://www.imdb.com/es/title/tt34794158/); [Encuentros Interactivos — presentación en festival de Nueva York, 17/8/2026](https://encuentrosinteractivos.do/entierrenlo-parao-llena-la-sala-en-su-estreno-internacional/); [Noticias SIN — nota 11/8/2026](https://noticiassin.com/vida-y-estilo/arte/2026/08/11/entierrenlo-parao-brilla-en-festival-de-nueva-york-2085643/?amp=1).

## Recomendaciones para la siguiente revisión

1. **Prioridad alta, correcciones de datos de origen:** IDs 24, 27 y 30. No editar manualmente el snapshot versionado: validar, respaldar SQL, ejecutar cambios controlados y exportar de nuevo según E-4.
2. **Prioridad alta, precisión editorial:** corregir la ambigüedad día/noche del ID 26 en ambas versiones ES/EN tras revisión del titular.
3. **Fechas con evidencia insuficiente:** ID 31 (2025-06-05) e ID 30 (2024-09-22). Identificar tipo de fecha en lugar de convertir una nota de prensa o festival en estreno comercial.
4. **Variantes de nombres:** ID 29 (Johana/Johanna) y 28 (Frank Perozo/nombre civil). Revisar créditos oficiales, no inventar identidades.
5. **Trazabilidad:** conservar `pendiente_revision` y el libro `editorial-approvals-e5.json` intacto. Ningún hallazgo constituye por sí solo una licencia o aprobación.

## Balance F-2.2

- **5** sinopsis SQL y **24** borradores ES/EN contrastados preliminarmente: **29 de 46** sinopsis.
- **17** borradores ES/EN sin este contraste.
- **12** contextos/ensayos por revisar.
- **0 de 58** piezas aprobadas humanamente.
- Se mantiene el modo `review` de las imágenes sin licencias documentadas y AdSense desactivado.

**Aviso:** las fechas de estreno pueden referirse a mercados, estrenos comerciales, funciones privadas, festivales o fichas importadas. Las fuentes externas citadas no sustituyen las actas primarias ni prueban titularidad de textos e imágenes.
