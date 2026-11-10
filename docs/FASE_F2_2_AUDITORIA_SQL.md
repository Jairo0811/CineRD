# CineRD — F-2.2: auditoría preliminar de las cinco sinopsis SQL

**Estado:** análisis documental preliminar; **ninguna aprobación editorial concedida**.  
**Rama de trabajo:** `feat/f2-editorial-review`.  
**Base:** `database/seeds/catalog.snapshot.json` (cinco textos SQL), `docs/editorial-sources-sql-f2.json`, `docs/EDITORIAL_POLICY.md`.  
**Alcance:** lectura y contraste inicial con fichas públicas, sin visionado de las películas y sin peritaje de propiedad intelectual.

> **Regla:** las URL registradas en F-2.1 identifican referencias. Su presencia no confirma la autoría, la fidelidad textual ni la licencia del contenido publicado. Este informe no modifica el catálogo, SQL Server ni `docs/editorial-approvals-e5.json`.

## Resultado por película

| ID | Obra | Coincidencia argumental observada | Riesgo editorial / comprobación pendiente | Estado |
|---:|---|---|---|---|
| 5 | Perico Ripiao (2003) | El catálogo y la ficha histórica describen la fuga de tres presos acompañados de güira, tambor y acordeón. | El texto SQL omite el encarcelamiento prolongado por burocracia que describe la ficha histórica; revisar la expresión «criminales convictos», la búsqueda familiar y detalles de aventuras añadidos sin referencia. | PENDIENTE |
| 6 | Ladrones a Domicilio (2008) | Coinciden Bruno, la beca frustrada, su hija y la búsqueda de otro empleo. | El texto SQL habla de trabajo como chofer de transporte de valores; el resumen del catálogo CineDominicano.com se refiere a guardia de seguridad. Determinar si ambas descripciones corresponden al mismo trabajo o son contradictorias. | PENDIENTE |
| 10 | Vamos de robo (2014) | Coinciden los cuatro personajes, su empleo en el banco, el robo de RD$150 millones y la sospecha. | Redacción SQL con correspondencia textual muy marcada con sinopsis disponibles en Cinema Dominicano y CineDominicano.com. Aclarar origen/autorización, proponer texto propio solo tras comprobar trama. Fecha SQL 2014-01-15 vs estreno comercial 2014-01-16 en ambas fichas. | PENDIENTE |
| 55 | El Plan Perfecto (2017) | La fuente de DGCINE sitúa a los protagonistas en un almacén que pasa a operar con mercancía ilegal. La descripción abreviada de terceros se parece estrechamente a la del SQL. | Comprobar si la sinopsis SQL se tomó de una descripción comercial y si existe permiso de reproducción. Fecha SQL 2017-01-17; DGCINE y Cinema Dominicano registran 2017-01-19 como estreno; Páginas Amarillas muestra 1/17/17. No corregir sin establecer el significado del campo. | PENDIENTE |
| 56 | La Lucha de Ana (2012) | Coinciden la madre que vende flores, la muerte de su hijo y la búsqueda de justicia. | La redacción SQL se aproxima considerablemente a fuentes públicas; auditar procedencia y permisos, y revisar si conviene una sinopsis original de nueva redacción. Fecha SQL 2012-04-13 vs estreno 2012-05-24 indicado por fuentes históricas. | PENDIENTE |

## Referencias consultadas para el contraste

- ID 5: [Cinema Dominicano — Perico Ripiao](https://cinemadominicano.com/perico-ripiao-2003/); [CineDominicano.com](https://cinedominicano.com/peliculasdominicanas/pelicula/perico-ripiao-2003/).
- ID 6: [CineDominicano.com — Ladrones a domicilio](https://cinedominicano.com/peliculasdominicanas/pelicula/ladrones-a-domicilio-2008/); [Cinema Dominicano](https://cinemadominicano.com/ladrones-a-domicilio-2008/).
- ID 10: [Cinema Dominicano — Vamos de robo](https://cinemadominicano.com/vamos-de-robo-2014/); [CineDominicano.com](https://cinedominicano.com/peliculasdominicanas/pelicula/vamos-de-robo-2014/).
- ID 55: [DGCINE — Más de 50 mil personas han visto El Plan Perfecto](https://dgcine.gob.do/mas-de-50-mil-personas-han-visto-el-plan-perfecto/); [Cinema Dominicano](https://cinemadominicano.com/el-plan-perfecto-2017/); [Páginas Amarillas](https://paginasamarillas.com.do/es/movie/el-plan-perfecto/M5P1549).
- ID 56: [DGCINE — Cinemateca: La lucha de Ana](https://dgcine.gob.do/programacion-cinemateca-sobre-ruedas-centro-cultural-narciso-gonzalez-2/); [Cinema Dominicano](https://cinemadominicano.com/la-lucha-de-ana-2012/); [CineDominicano.com](https://cinedominicano.com/peliculasdominicanas/pelicula/la-lucha-de-ana-2012/).

## Revisión pendiente — no certificada por este documento

1. **Procedencia:** localizar la carga original en SQL Server o el historial de importación y determinar si los textos fueron redactados internamente, reproducidos de terceros o recibidos con permiso.
2. **Exactitud:** comparar cada afirmación con al menos una referencia verificable; priorizar créditos o materiales de productoras/distribuidoras ante datos controvertidos.
3. **Originalidad:** donde se detecte texto potencialmente reproducido, preparar una versión editorial genuinamente nueva y revisarla sin copiar fuentes. Cambiar palabras sueltas no basta para certificar originalidad.
4. **Metadatos:** decidir y documentar qué representa `FechaEstreno` (estreno comercial nacional, festival, preestreno, registro comercial). Hacer respaldo y corregir solo en SQL Server; regenerar snapshot y revisar el diff.
5. **Control de publicación:** mantener `pendiente_revision`, `VITE_ADSENSE_ENABLED` desactivado y `review` para imágenes. No registrar `aprobado` hasta la revisión humana atribuida y comprobación de fingerprint.
6. **Cobertura posterior:** revisar los 41 borradores bilingües y los 12 análisis contextuales de manera independiente; el presente informe **solo evalúa preliminarmente las cinco sinopsis SQL**.

## Resultado de cierre de este lote

- Cinco sinopsis SQL con **referencias de consulta** y revisión preliminar documentada.
- Cero textos certificados como originales o autorizados para reproducción.
- Cero cambios en contenido público, metadatos SQL, imágenes, anuncios o firmas editoriales.
- Inventario global **58 pendientes / 0 aprobadas** hasta revisión humana verificable.

**Nota:** similitud de redacción no prueba por sí sola plagio, titularidad, infracción ni ausencia de licencia. Las conclusiones sobre derechos requieren determinar procedencia, autorizaciones y legislación aplicable.
