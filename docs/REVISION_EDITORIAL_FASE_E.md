# CineRD — Fase E: calidad editorial, sinopsis y datos

**Inicio:** 7 de noviembre de 2026. **Estado:** primera entrega técnica en revisión.  
**Fuente interna:** `database/seeds/catalog.snapshot.json`, versión 3, exportado el 5 de noviembre de 2026.  
**Fuentes externas:** consultar los enlaces verificables en este documento y en `frontend/src/data/editorialPeliculas*.js`.

## Resultado del diagnóstico

| Indicador | Línea de base | Tras el lote E-1 |
|---|---:|---:|
| Películas | 46 | 46 |
| Sinopsis registradas en SQL/snapshot | 5 | 5 (sin cambios) |
| Películas sin sinopsis registrada | 41 | 41 |
| Sinopsis originales de respaldo disponibles | 0 | 8 |
| Fichas sin sinopsis visible (registrada o curada) | 41 | 33 |
| Editoriales contextuales en borrador | 12 | 12 |
| Películas sin director | 3 | 3 |
| Películas sin productora | 17 | 17 |
| Películas sin género | 0 | 0 |
| Talentos | 83 | 83 |
| Talentos sin profesión | 5 | 5 |
| Talentos sin fecha de nacimiento | 26 | 26 |
| Talentos sin vínculos de reparto NI créditos | 0 | 0 |

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

**E-2 — Sinopsis:** investigar las 33 películas que carecen incluso de borrador; escribir en español/inglés sin copiar sinopsis protegidas y adjuntar fuente.

**E-3 — Talentos:** revisar 83 perfiles; priorizar cinco sin profesión (IDs 54, 76, 88, 90, 93) y 26 sin fecha de nacimiento. **No inferir fechas ni hechos privados**. El perfil puede ser útil por filmografía y créditos sin inventar biografía personal.

**E-4 — Control editorial:** revisión del titular, exactitud de fichas, enlaces activos, revisión visual móvil y Search Console. La auditoría 20/20 confirma sólo despliegue, no calidad ni elegibilidad AdSense.

## Reproducir auditoría

```powershell
npm --prefix frontend run editorial:audit
node scripts/reportEditorialQuality.mjs --json
npm --prefix frontend test
```
