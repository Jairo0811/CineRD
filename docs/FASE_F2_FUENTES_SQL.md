# CineRD F-2 — referencias de las cinco sinopsis existentes en SQL

Este registro incorpora enlaces de consulta **sin modificar el texto SQL, las fechas del catálogo ni el número de aprobaciones**. Los enlaces se han identificado como puntos de partida para la revisión; la comparación línea por línea y la aprobación editorial siguen pendientes.

| ID | Película | Fuente de consulta para revisar |
|---:|---|---|
| 5 | Perico Ripiao | https://cinemadominicano.com/perico-ripiao-2003/ |
| 6 | Ladrones a Domicilio | https://cinemadominicano.com/ladrones-a-domicilio-2008/ |
| 10 | Vamos de robo | https://cinemadominicano.com/vamos-de-robo-2014/ |
| 55 | El Plan Perfecto | https://dgcine.gob.do/mas-de-50-mil-personas-han-visto-el-plan-perfecto/ |
| 56 | La Lucha de Ana | https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/ |

## Datos que NO se deben corregir automáticamente

- ID 10: el snapshot indica fecha `2014-01-15`; Cinema Dominicano indica estreno `2014-01-16`.
- ID 55: el snapshot indica fecha `2017-01-17`; DGCINE y Cinema Dominicano indican `2017-01-19`. Otras fichas publican el día 17, así que comprobar si corresponde a otro tipo de fecha antes de cambiar SQL.
- ID 56: el snapshot indica fecha `2012-04-13`; Cinema Dominicano indica estreno `2012-05-24`.
- Los textos SQL son material existente de procedencia y permisos de reproducción no verificados. Revisar su exactitud y originalidad antes de publicarlos como contenido editorial propio. No asumir que tener una referencia URL concede derechos de reproducción.

## Criterios de cierre

1. Contrastar cada sinopsis del snapshot con las fuentes y registrar qué afirmaciones son verificables.
2. Comprobar si el texto SQL se obtuvo de terceros; corregir o sustituir desde el origen cuando corresponda, con respaldo.
3. Revisar idioma y redacción, incluidas las traducciones editoriales, cuando existan.
4. Registrar una aprobación humana real en `docs/editorial-approvals-e5.json` solo después de la revisión.
5. Ejecutar `node scripts/editorialReviewAudit.mjs --json` y `node --test scripts/editorialReviewAudit.test.mjs`.

**Importante:** que la advertencia «sin URL de fuente» desaparezca no implica que una pieza esté aprobada. La auditoría debe seguir mostrando 58 pendientes hasta que haya revisiones atribuidas.
