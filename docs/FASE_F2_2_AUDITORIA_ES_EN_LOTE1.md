# CineRD — F-2.2, lote 2: revisión documental de ocho sinopsis editoriales (ES/EN)

**Estado:** contraste documental preliminar. No equivale a visionado, evaluación jurídica, certificación de originalidad ni aprobación humana final.  
**Fecha:** 7 de noviembre de 2026 (hora local de República Dominicana).  
**Rama:** `feat/f2-editorial-review`; **base de catálogo:** `database/seeds/catalog.snapshot.json` (sinopsis SQL nulas en este lote).  
**Textos revisados:** `frontend/src/data/sinopsisCuradasFaseE.js`.  
**Alcance:** ocho fichas con textos en español e inglés, procedentes del primer lote editorial de fase E, IDs 4, 9, 11, 12, 13, 16, 39 y 45.

Este informe se basa en las sinopsis versionadas y las fichas históricas públicas citadas más abajo. **Las ocho siguen con `estado: pendiente_revision`.** No modificar `docs/editorial-approvals-e5.json` por esta tarea.

## Síntesis de hallazgos

| ID | Película | Contraste del argumento (ES/EN) | Incidencia detectada | Prioridad |
|---:|---|---|---|---|
| 4 | Sanky Panky (2007) | Genaro busca mejorar su situación y la de su madre; se traslada a un hotel para trabajar como sanky panky. Ambas versiones coinciden en el núcleo. | Algunas frases del borrador sobre romance y malentendidos culturales son inferencias o detalles narrativos no explicitados en la ficha base; comprobarlos con otra fuente o suavizar su grado de certeza. La fecha SQL coincide con 2007-02-01. | MEDIA |
| 9 | Lotoman (2011) | Modesto y Manuel ganan la lotería y deben afrontar sus consecuencias. ES/EN conservan la trama principal. | **Metadatos SQL:** el snapshot tiene género `Infantil` y fecha `2011-03-10`, mientras la ficha histórica registra **Comedia** y estreno **2011-01-20**. Hay propuesta E-4 en el proyecto; NO actualizar el JSON a mano. | ALTA |
| 11 | Santicló: La Vaina de la Navidad (2008) | Nicolás pierde su empleo en Navidad, trabaja como Santa Claus y encuentra una bolsa con dinero. ES/EN son consistentes. | El texto abrevia la separación familiar; no parece alterar la trama principal. Pendiente comprobar procedencia, traducción y redacción final. Fecha SQL 2008-11-13 coincide con la ficha histórica. | BAJA |
| 12 | I Love Bachata (2011) | Marcos vende discos, Tommy es mecánico y Carlitos estudia chelo; aspiran a crear una agrupación de bachata. Consistencia ES/EN adecuada. | **Fecha SQL `2011-10-27` vs fecha de estreno histórico `2011-10-25`.** Comprobar criterio y posible preestreno antes de corregir en SQL. | MEDIA |
| 13 | Cristiano de la Secreta (2009) | Eddy oculta su fe fuera del templo, generando mentiras y situaciones cómicas. Consistente en ES/EN. | **Fecha SQL `2009-01-01` vs estreno histórico `2009-01-15`.** Es posible que el 1 de enero sea una fecha aproximada, pero no presumirlo como hecho sin prueba. | MEDIA |
| 16 | Nueba Yol: ¡Por Fin Llegó Balbuena! (1995) | La viudez y el viaje de Balbuena a Nueva York, con dificultades migratorias y contrastes culturales, están respaldados por la ficha. ES/EN alineados. | **Fecha SQL `1995-08-16` vs ficha histórica `1995-08-17`.** Hay publicaciones secundarias que sitúan exhibiciones desde el día 16; documentar tipo de fecha, no forzar una corrección automática. | MEDIA |
| 39 | Colao (2017) | Antonio cultiva café en Jarabacoa y va a Santo Domingo a conquistar a Laura, con ayuda de sus primos. ES/EN coherentes. | La fuente histórica respalda los elementos centrales, y el estreno 2017-11-30 coincide con SQL. Mantener revisión lingüística y de originalidad. | BAJA |
| 45 | Yuniol (2007) | Yuniol obtiene una beca y conoce a Junior, de clase adinerada, en la universidad; nace una amistad interclasista. ES/EN consistentes. | La ficha histórica se presenta con la grafía **(Yuniol)²**. Revisar título canónico y posibles nombres alternativos sin cambiar IDs ni créditos. Fecha SQL 2007-04-19 coincide con la referencia. | BAJA |

## Referencias externas y afirmaciones contrastadas

1. **Sanky Panky (ID 4):** [Cinema Dominicano, ficha de 2007](https://cinemadominicano.com/sanky-panky-2007/). Registra estreno del 1/2/2007 y la motivación económica de Genaro.
2. **Lotoman (ID 9):** [Cinema Dominicano, ficha de 2011](https://cinemadominicano.com/lotoman-2011/). Identifica el género Comedia y la fecha de estreno 20/1/2011.
3. **Santicló (ID 11):** [Cinema Dominicano, ficha de 2008](https://cinemadominicano.com/santi-clo-la-vaina-de-la-navidad-2008/). Relata despido, trabajo como Santa Claus y hallazgo del dinero.
4. **I Love Bachata (ID 12):** [Cinema Dominicano, ficha de 2011](https://cinemadominicano.com/yo-amo-la-bachata-i-love-bachata-2011/). Confirma las profesiones de los protagonistas y registra el estreno 25/10/2011.
5. **Cristiano de la Secreta (ID 13):** [Cinema Dominicano, ficha de 2009](https://cinemadominicano.com/cristiano-de-la-secreta-2009/). Registra estreno 15/1/2009 y premisa de Eddy.
6. **Nueba Yol (ID 16):** [Cinema Dominicano, ficha de 1995](https://cinemadominicano.com/nueba-yol-por-fin-llego-balbuena-1995/). Registra estreno 17/8/1995; [catálogo de investigación sobre cine dominicano](https://cinemadominicano.com/wp-content/uploads/2022/01/EIA-Pdf.pdf) aporta una referencia a exhibiciones desde 16/8/1995. Esta divergencia requiere comprobar la distinción entre apertura y otras fechas.
7. **Colao (ID 39):** [Cinema Dominicano, ficha de 2017](https://cinemadominicano.com/colao-2017/). Confirma Jarabacoa, café, Laura, primos y estreno 30/11/2017.
8. **Yuniol (ID 45):** [Cinema Dominicano, ficha «(Yuniol)²» (2007)](https://cinemadominicano.com/yuniol2-2007/). Confirma beca, amistad interclasista y estreno 19/4/2007.

## Comprobaciones cruzadas ES/EN

- **Relaciones, nombres y situaciones:** las traducciones inglesas de estas ocho sinopsis preservan el argumento general de sus textos españoles. Esta evaluación es preliminar, no una revisión lingüística integral.
- **Términos culturales:** conservar `sanky panky`, `bachata` y nombres propios sin traducirlos de manera engañosa. Si se añaden notas explicativas, distinguirlas del argumento original.
- **Fuentes:** las fichas citadas respaldan la historia base, pero no todas las adiciones interpretativas o los matices de cada traducción; se requiere edición humana y, cuando corresponda, una segunda fuente.
- **Originalidad y licencias:** una sinopsis que parafrasea hechos de una película no queda automáticamente autorizada, ni la presencia de una fuente demuestra plagio. La procedencia y redacción original deben revisarse caso por caso.

## Acciones recomendadas sin cambios automáticos

1. **Priorizar ID 9 (Lotoman):** ya existe una propuesta de corrección de género/fecha en E-4. Revisar el respaldo SQL, aplicar cambios en el origen después de contrastarlos y regenerar el snapshot. El stash local anterior conserva cambios similares, pero no debe aplicarse a ciegas.
2. Documentar los criterios de `FechaEstreno` para IDs 12, 13 y 16; admitir explícitamente `no confirmado` si no hay evidencia suficiente.
3. Revisar afirmaciones adicionales en el borrador de Sanky Panky y la variante de título de Yuniol.
4. Solicitar revisión editorial humana de redacción ES/EN y procedencia de las ocho sinopsis antes de crear aprobaciones.
5. Continuar con las **33 sinopsis editoriales restantes** y los **12 análisis contextuales**, sin crear registros ficticios en `editorial-approvals-e5.json`.

**Balance acumulado de F-2.2:** 5 sinopsis SQL y 8 borradores ES/EN revisados documentalmente en esta fase; 33 borradores ES/EN todavía sin este nivel de contraste. **0 de 58 piezas aprobadas.** Los estudios técnicos y los derechos de imagen siguen tratados por controles independientes.
