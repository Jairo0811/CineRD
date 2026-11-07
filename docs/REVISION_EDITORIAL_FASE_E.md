# CineRD — Fase E: calidad editorial, sinopsis y datos

**Inicio:** 7 de noviembre de 2026. **Estado:** sinopsis E-1 y E-2 completas para 46/46 fichas, con 41 borradores pendientes de revisión humana.  
**Fuente interna:** `database/seeds/catalog.snapshot.json`, versión 3, exportado el 5 de noviembre de 2026.  
**Fuentes externas:** consultar los enlaces verificables en este documento y en `frontend/src/data/editorialPeliculas*.js`.

## Resultado del diagnóstico

| Indicador | Línea de base | Tras E-1 | Tras E-2 lote 24 | Tras E-2 final |
|---|---:|---:|---:|---:|
| Películas | 46 | 46 | 46 | 46 |
| Sinopsis registradas en SQL/snapshot | 5 | 5 | 5 | 5 |
| Películas sin sinopsis registrada | 41 | 41 | 41 | 41 |
| Sinopsis originales de respaldo disponibles | 0 | 8 | 32 | 41 |
| Fichas sin sinopsis visible (registrada o curada) | 41 | 33 | 9 | 0 |
| Editoriales contextuales en borrador | 12 | 12 | 12 | 12 |
| Películas sin director | 3 | 3 | 3 | 3 |
| Películas sin productora | 17 | 17 | 17 | 17 |
| Películas sin género | 0 | 0 | 0 | 0 |
| Talentos | 83 | 83 | 83 | 83 |
| Talentos sin profesión | 5 | 5 | 5 | 5 |
| Talentos sin fecha de nacimiento | 26 | 26 | 26 | 26 |
| Talentos sin vínculos de reparto NI créditos | 0 | 0 | 0 | 0 |

> Las ocho fichas mejoradas son las películas sin sinopsis registrada que pertenecen al lote de 12 borradores. La nueva sinopsis editorial **no se copia automáticamente a SQL Server**, no se presenta como oficial y conserva una señal visible de revisión pendiente. Los otros cuatro borradores también quedan preparados para una futura sustitución editorial autorizada.

### Primera tanda E-1 — 12 sinopsis redactadas, ES/EN

| ID | Película | Fuente |
|---:|---|---|
| 4 | Sanky Panky | https://cinemadominicano.com/sanky-panky-2007/ |
| 5 | Perico Ripiao | https://cinemadominicano.com/perico-ripiao-2003/ |
| 6 | Ladrones a Domicilio | https://cinemadominicano.com/ladrones-a-domicilio-2008/ |
| 9 | Lotoman | https://cinemadominicano.com/lotoman-2011/ |
| 10 | Vamos de robo | https://cinemadominicano.com/vamos-de-robo-2014/ |
| 11 | Santicló: La Vaina de la Navidad | https://cinemadominicano.com/santi-clo-la-vaina-de-la-navidad-2008/ |
| 12 | I Love Bachata | https://cinemadominicano.com/yo-amo-la-bachata-i-love-bachata-2011/ |
| 13 | Cristiano de la Secreta | https://cinemadominicano.com/cristiano-de-la-secreta-2009/ |
| 16 | Nueba Yol: ¡Por Fin Llegó Balbuena! | https://cinemadominicano.com/nueba-yol-por-fin-llego-balbuena-1995/ |
| 39 | Colao | https://cinemadominicano.com/colao-2017/ |
| 45 | Yuniol | https://cinemadominicano.com/yuniol2-2007/ |
| 56 | La Lucha de Ana | https://cinemadominicano.com/la-lucha-de-ana-2012/ |

**Control editorial:** cada sinopsis y su traducción requieren lectura, comparación de trama con las fuentes citadas y aprobación por el titular. No se afirma que las películas hayan sido visionadas. Si la base de datos contiene sinopsis, se usa esa sinopsis registrada y no se sustituye silenciosamente por el borrador.

## Segunda tanda E-2 — 24 sinopsis originales bilingües

Se prepararon resúmenes breves de trama para las 24 películas de esta tabla, basados en fuentes identificadas. Se integran en `frontend/src/data/sinopsisCuradasFaseE2.js`, cada entrada con **ID, título y año de referencia**, URL de fuente y estado `pendiente_revision`. Al tratarse de fichas sin sinopsis en SQL, ahora muestran un borrador claramente rotulado en español e inglés. Las versiones originales en `backend` y `database/seeds` permanecen intactas.

| ID | Película | Fuente de argumento |
|---:|---|---|
| 15 | Tubérculo Gourmet | https://cinemadominicano.com/tuberculo-gourmet-2015/ |
| 17 | Profe por Accidente | https://cinemadominicano.com/profe-por-accidente-2013/ |
| 18 | Lotoman 2.0 | https://cinemadominicano.com/lotoman-2-0-2012/ |
| 20 | Un Macho de Mujer | https://cinemadominicano.com/un-macho-de-mujer-2006/ |
| 23 | Sanky Panky 2 | https://cinemadominicano.com/sanky-panky-2-2013/ |
| 24 | Sanky Panky 3 | https://cinemadominicano.com/sanky-panky-3-29-marzo/ |
| 25 | Sanky Panky 4: De Safari | https://cinemadominicano.com/sanky-panky-4-de-safari-2025/ |
| 26 | Feo de día, Lindo de noche | https://cinemadominicano.com/feo-de-dia-lindo-de-noche-2012/ |
| 27 | Lotoman 003: Volando Bajito | https://cinemadominicano.com/lotoman-003-volando-bajito-2014/ |
| 28 | Teacher Mechy | https://caribbeancinemas.com/es/movie/8592/ |
| 29 | Baño de Mujeres | https://cinemadominicano.com/bano-de-mujeres-2025/ |
| 33 | Pueto Pa' Mi | https://cinemadominicano.com/pueto-pami-2015/ |
| 34 | Los Super | https://cinemadominicano.com/los-super-2013/ |
| 36 | Nueba Yol 3: Bajo la Nueva Ley | https://cinemadominicano.com/nueba-yol-3-bajo-la-nueva-ley-1997/ |
| 38 | La casa del kilómetro 5 | https://cinemadominicano.com/la-casa-del-kilometro-5-2012/ |
| 40 | Colao 2 | https://cinemadominicano.com/colao-2-2023/ |
| 42 | Andrea | https://cinemadominicano.com/andrea-la-venganza-de-un-espiritu-2005/ |
| 44 | Playball | https://cinemadominicano.com/play-ball-2008/ |
| 49 | Los Locos también Piensan | https://cinemadominicano.com/los-locos-tambien-piensan-2005/ |
| 50 | Hermanos | https://cinemadominicano.com/hermanos-2018/ |
| 51 | Tubérculo Presidente | https://cinemadominicano.com/tuberculo-presidente-2016/ |
| 52 | Dos policías en apuros | https://cinemadominicano.com/dos-policias-en-apuros-2016/ |
| 53 | La Musiquita por Dentro | https://cinemadominicano.com/la-musiquita-por-dentro-2019/ |
| 54 | Los Paracaidistas | https://cinemadominicano.com/los-paracaidistas-2015/ |

**Cierre de cobertura:** Los nueve títulos de esta lista ya cuentan con un borrador respaldado por una fuente (ver sección «Cierre E-2»). Persisten las validaciones de exactitud, la revisión humana y las discrepancias de metadatos.

**Datos por revisar (no alterados):**
- ID 24, *Sanky Panky 3*: director vacío y estreno `2018-03-18` en snapshot; ficha histórica: Eduardo «Transfor» Ortiz y estreno `2018-03-29`.
- ID 27, *Lotoman 003*: fecha `2014-03-15` en snapshot; ficha histórica: `2014-03-27`.
- ID 36, *Nueba Yol 3*: fecha `1997-10-31` en snapshot; fuente histórica: `1997-10-23`.
- ID 40, *Colao 2*: fecha `2023-12-07` en snapshot; fuente histórica: `2023-11-30`.
- ID 42, *Andrea*: fecha `2005-08-16` en snapshot; ficha histórica: `2005-08-18`.
- ID 44, *Playball*: género `Comedia` en snapshot frente a `Drama` en la ficha histórica; fecha `2008-02-01` frente a `2008-02-14`.
- ID 50, *Hermanos*: género `Comedia` en snapshot frente a `Drama` en ficha histórica; considerar clasificación secundaria o combinada según otra fuente.
- ID 28, *Teacher Mechy*: el director `Francisco Ernesto Perozo Balbuena` coincide con el crédito artístico `Frank Perozo`, aunque las formas del nombre difieran.

**Advertencia:** estas discrepancias son **pistas de auditoría**, no hechos corregidos. Fuentes de fechas pueden distinguir premieres, funciones especiales, estrenos comerciales y festivales. Confirmar el criterio y corregir únicamente en SQL Server antes de regenerar el snapshot.

**Fase E-2 y AdSense:** alcanzar 46 fichas con sinopsis (5 SQL + 41 borradores) **no garantiza calidad editorial suficiente ni aprobación de monetización**. Las sinopsis nuevas requieren revisión independiente, fuentes activas, lectura manual, y no sustituyen 12 análisis editoriales más profundos ni perfiles de talentos desarrollados.


## Cierre E-2 — Nueve sinopsis finales, bilingües

Las nueve fichas restantes se documentaron con fuentes y recibieron resúmenes de nueva redacción. Se implementan en `frontend/src/data/sinopsisCuradasFaseE2Final.js`, integradas con `getSinopsisEditorial()`. Con estos textos se alcanza una **cobertura visible de 46/46 películas: cinco sinopsis registradas en SQL y 41 sinopsis editoriales todavía pendientes de aprobación humana**.

| ID | Película | Fuente principal |
|---:|---|---|
| 14 | Los Rechazados | https://dgcine.gob.do/los-rechazados-operacion-submarino-ya-en-salas-de-cine-del-pais/ |
| 19 | Carlota la Más Barrial | https://dgcine.gob.do/dgcine-participa-en-la-premiere-decarlota-la-mas-barrial-que-llegara-a-los-cines-este-28-de-agosto/ |
| 21 | Medias Hermanas | https://caribbeancinemas.com/es/movie/2607/ |
| 30 | El Diablo no duerme en su cama | https://cinemadominicano.com/el-diablo-no-duerme-en-su-cama-comedia-negra-de-amauris-perez/ |
| 31 | Entiérrenlo Parao | https://www.imdb.com/es/title/tt34794158/ |
| 32 | Los Rechazados 2: Operación Espacial | https://dgcine.gob.do/los-rechazados-2-lleva-la-comedia-y-la-ciencia-ficcion-a-nuevas-audiencias/ |
| 41 | Malos padres | https://cinemadominicano.com/malos-padres-2023/ |
| 47 | Pimp Bullies: Victimas de un Prostibulo | https://cinemadominicano.com/victimas-de-un-prostibulo-pimp-bullies-2011-2/ |
| 48 | Al Fin y al Cabo | https://cinemadominicano.com/al-fin-y-al-cabo-2008/ |

**Contradicciones adicionales que deben revisarse en SQL (sin editar):**
- ID 32, *Los Rechazados 2*: snapshot `FechaEstreno=2026-09-13`; DGCINE indica estreno comercial `2026-08-13`, y director Yasser Michelén mientras SQL tiene `Director=null`.
- ID 30, *El Diablo no duerme en su cama*: campo `Director=null`; Cinema Dominicano atribuye la dirección a Amauris Pérez. Verificar la fecha concreta de estreno antes de modificar.
- ID 47, *Pimp Bullies*: género SQL `Acción`, mientras Cinema Dominicano clasifica `Drama/Thriller`. Registrar género(s) oficiales según criterio del catálogo.
- ID 31, *Entiérrenlo Parao*: el resultado para 2025 y duración de largometraje puede coexistir con referencias a un cortometraje anterior. Comprobar que el registro corresponde a la obra de 2025, sin mezclar fichas.

**Alcance:** las sinopsis fueron redactadas sin reproducir textualmente los argumentos de las fuentes. No equivalen a visionados ni a licencias de las obras, ni se certifica que los proveedores tengan datos perfectos. El código de la ficha solo presenta los borradores cuando `Sinopsis` SQL está ausente, con el rótulo `pendiente_revision` correspondiente.


## Discrepancias del catálogo que requieren corrección en origen (SQL)

Los datos siguientes proceden de fuentes históricas consultadas el 7/11/2026. **Son propuestas para revisión, no una migración aplicada**. Las fechas de exhibición, premiere, estreno comercial y publicación digital pueden diferir; documentar el criterio antes de sobrescribir.

| ID | Película | Campo | Dato en snapshot | Referencia histórica | Acción |
|---:|---|---|---|---|---|
| 9 | Lotoman | Género | Infantil | Comedia | Corregir en SQL tras revisión |
| 9 | Lotoman | FechaEstreno | 2011-03-10 | 2011-01-20 | Confirmar criterio de estreno y corregir |
| 16 | Nueba Yol | FechaEstreno | 1995-08-16 | 1995-08-17 | Confirmar un día de diferencia |
| 56 | La Lucha de Ana | FechaEstreno | 2012-04-13 | 2012-05-24 | Verificar antes de modificar |
| 12 | I Love Bachata | FechaEstreno | 2011-10-27 | 2011-10-25 | Verificar antes de modificar |
| 10 | Vamos de robo | FechaEstreno | 2014-01-15 | 2014-01-16 | Verificar antes de modificar |
| 13 | Cristiano de la Secreta | FechaEstreno | 2009-01-01 | 2009-01-15 | Verificar posible fecha provisional |

Fuentes:
- Lotoman: https://cinemadominicano.com/lotoman-2011/ y https://cinedominicano.com/peliculasdominicanas/pelicula/lotoman-2011/
- Nueba Yol: https://cinemadominicano.com/nueba-yol-por-fin-llego-balbuena-1995/
- La Lucha de Ana: https://cinemadominicano.com/la-lucha-de-ana-2012/
- I Love Bachata: https://cinemadominicano.com/yo-amo-la-bachata-i-love-bachata-2011/
- Vamos de robo: https://cinemadominicano.com/vamos-de-robo-2014/
- Cristiano de la Secreta: https://cinemadominicano.com/cristiano-de-la-secreta-2009/

**Procedimiento de integridad:** 1) guardar respaldo SQL; 2) confirmar en una segunda referencia o con distribuidora/productora; 3) ejecutar `UPDATE` controlado por `Id` en SQL Server; 4) regenerar `npm --prefix backend run catalog:export`; 5) comprobar diff de `database/seeds/catalog.snapshot.json`; 6) ejecutar `npm --prefix backend run catalog:validate`; 7) probar en entorno de revisión y publicar cuando sea correcto. No editar la copia JSON y la base independientemente: evitar divergencias.

## Próximos lotes

**E-2 — Sinopsis:** cobertura técnica completa (46/46). Revisar humanamente 41 borradores, comprobar sus fuentes y depurar discrepancias desde SQL Server. No confundir cobertura con aprobación editorial.

**E-3 — Talentos:** revisar 83 perfiles; priorizar cinco sin profesión (IDs 54, 76, 88, 90, 93) y 26 sin fecha de nacimiento. **No inferir fechas ni hechos privados**. El perfil puede ser útil por filmografía y créditos sin inventar biografía personal.

**E-4 — Control editorial:** revisión del titular, exactitud de fichas, enlaces activos, revisión visual móvil y Search Console. La auditoría 20/20 confirma sólo despliegue, no calidad ni elegibilidad AdSense.

## Reproducir auditoría

```powershell
npm --prefix frontend run editorial:audit
node scripts/reportEditorialQuality.mjs --json
npm --prefix frontend test
```
