# CineRD — cierre paralelo: E-4 + sinopsis SQL, E-5 y producción (frentes 1–3)

**Corte:** 2026-11-09 · **Rama:** `feat/f2-editorial-review` · **PR:** [#55](https://github.com/Jairo0811/CineRD/pull/55) **DRAFT**.

**Alcance aprobado por el titular:** trabajar simultáneamente los tres frentes de evaluación, implementación técnica y preparación. **No equivale a aprobación de siete cambios E-4, 58 piezas E-5, cinco sinopsis SQL, licencias de 128 medios, despliegue de backend o anuncios.** Toda modificación a SQL es manual, con backup y decisión específica. No cambiar la base desde esta rama.

## Estado de referencia

| Frente | Implementado / preparado | Bloqueo que no puede automatizarse |
|---|---|---|
| E-4 / metadatos | Siete propuestas documentadas, siete valores candidatos presentes en el **snapshot**, preflight SQL adicional de solo lectura | 0/7 firmas o decisiones E-4; SQL real no ha sido cotejado por este preflight. Tener un valor candidato en snapshot **no equivale a aprobación** |
| Sinopsis SQL | Cinco borradores originales ES/EN, registro de procedencia y generador de migración manual con huellas | 0/5 aprobaciones de sustitución; faltan revisión de exactitud, licencia/originalidad y decisión por película |
| E-5 | 58 piezas de texto catalogadas (46 sinopsis, 12 contextos), 18 altas / 18 medias / 22 bajas y paquete privado para revisión humana | 0/58 aprobaciones con fuentes verificadas; no marcar 58 como validadas por pasar el build |
| Derechos | 128 registros de medios inventariados; API productiva y builds review obligan bloqueo por defecto | 0/128 autorizaciones comerciales documentadas. Pueden continuar **ocultos** mientras se publica un catálogo sin fotos |
| API / producción | Node.js/Express, SQL Server, /health, /ready, CORS, guard de medios, deploy plan Render, CI | Infraestructura SQL y API real, backup/restore drill aislado, correo, persistencia, flujos end-to-end, revisión jurídica y pruebas de terceros **no verificadas** |
| Monetización | ads.txt/identificación presentes, anuncios OFF | AdSense, licencias, CMP/privacidad y cumplimiento pendientes; **NO habilitar** |

## Frente 1A — E-4: siete campos

La documentación ya contiene las propuestas, pero la aplicación/estado real en SQL Server es una verificación separada.

| ID | Película | Campo | Valor histórico del expediente | Valor candidato | Estado |
|---:|---|---|---|---|---|
| 9 | Lotoman | Genero | Infantil | Comedia | PENDIENTE de validación humana y SELECT SQL |
| 9 | Lotoman | FechaEstreno | 2011-03-10 | 2011-01-20 | PENDIENTE de validación humana y SELECT SQL |
| 24 | Sanky Panky 3 | Director | (NULL) | Eduardo Transfor Ortiz | PENDIENTE de validación humana y SELECT SQL |
| 24 | Sanky Panky 3 | FechaEstreno | 2018-03-18 | 2018-03-29 | PENDIENTE de validación humana y SELECT SQL |
| 30 | El Diablo no duerme en su cama | Director | (NULL) | Amauris Pérez | PENDIENTE de validación humana y SELECT SQL |
| 32 | Los Rechazados 2: Operación Espacial | Director | (NULL) | Yasser Michelén | PENDIENTE de validación humana y SELECT SQL |
| 32 | Los Rechazados 2: Operación Espacial | FechaEstreno | 2026-09-13 | 2026-08-13 | PENDIENTE de validación humana y SELECT SQL |

**Hallazgos por fuentes públicas contrastadas:** *Lotoman* estreno comercial anunciado para **20/01/2011** y descrita como comedia (Diario Libre, 11–12/01/2011; https://www.diariolibre.com/revista/lotoman-se-estrena-el-20-de-este-mes-BNDL275224). *Sanky Panky 3* anuncio de **29/03/2018**, director Eduardo «Transfor» Ortiz (El Caribe, 22/03/2018; https://www.elcaribe.com.do/gente/a-y-e/sanky-panky-3-se-estrenara-el-29-de-marzo-en-rd/). *Los Rechazados 2* estreno comercial **13/08/2026** y dirección Yasser Michelén (DGCINE, 13/08/2026; https://dgcine.gob.do/los-rechazados-2-lleva-la-comedia-y-la-ciencia-ficcion-a-nuevas-audiencias/). La dirección de *El Diablo no duerme en su cama* se atribuye a Amauris Pérez en Cinema Dominicano 24/09/2024 (https://cinemadominicano.com/el-diablo-no-duerme-en-su-cama-comedia-negra-de-amauris-perez/); **esa nota NO certifica la fecha de estreno comercial**.

**Acción segura:** ejecutar en SSMS `database/scripts/f23_e4_sinopsis_preflight_readonly.sql`. La primera tabla debe mostrar siete filas, con título/valor real/valor anterior/candidato; la segunda, cinco sinopsis SQL con longitudes y SHA-256. **Cualquier campo con valor inesperado se investiga antes de preparar migración.** Los siete campos aún necesitan decisión E-4 humana atribuible; no retroinventar aprobaciones porque el snapshot ya tenga el candidato.

## Frente 1B — cinco sinopsis SQL

| ID | Película | Referencias registradas | Preguntas abiertas | Cierre exigido |
|---:|---|---:|---:|---|
| 5 | Perico Ripiao | 3 | 3 | Revisión de hechos, originalidad, autoría y equivalencia ES/EN |
| 6 | Ladrones a Domicilio | 5 | 4 | Revisión de hechos, originalidad, autoría y equivalencia ES/EN |
| 10 | Vamos de robo | 5 | 4 | Revisión de hechos, originalidad, autoría y equivalencia ES/EN |
| 55 | El Plan Perfecto | 5 | 4 | Revisión de hechos, originalidad, autoría y equivalencia ES/EN |
| 56 | La Lucha de Ana | 4 | 4 | Revisión de hechos, originalidad, autoría y equivalencia ES/EN |

Para cada texto, contrastar borrador ES/EN, procedencia y propiedad intelectual del SQL previo, fuentes primarias y significado de personajes/hechos. El fichero `docs/editorial-sql-replacement-drafts-f23.json` conserva preguntas por obra. `backend/scripts/prepareEditorialSqlMigration.js` valida huellas, revisión y respaldo antes de generar UN SQL manual por película; **NO generar/aplicar con aprobaciones vacías**.

## Frente 2 — E-5: 58 piezas en oleadas

**Orden de trabajo:** 18 altas → 18 medias → 22 bajas. El orden es para eficiencia editorial, no autorización automática. El paquete íntegro ES/EN puede crearse localmente mediante `node scripts/prepareClosureEditorial.mjs --create` en `backend/private/editorial/` (archivo no versionado y sin sobrescritura). Su reporte de estado usa `--show`.

### Las 18 prioritarias — primera oleada

| ID | Película | Tipo | Problema ya identificado en matriz |
|---:|---|---|---|
| 6 | Ladrones a Domicilio | sinopsis | El texto SQL habla de trabajo como chofer de transporte de valores; el resumen del catálogo CineDominicano.com se refiere a guardia de seguridad. Determinar si ambas descripciones … |
| 9 | Lotoman | sinopsis | Metadatos SQL: el snapshot tiene género Infantil y fecha 2011-03-10, mientras la ficha histórica registra Comedia y estreno 2011-01-20. Hay propuesta E-4 en el proyecto; NO actuali… |
| 9 | Lotoman | contexto | Discrepancia material: el contexto dice estreno 20/01/2011, confirmado por ficha histórica, mientras SQL contiene 10/03/2011 y género Infantil en vez de Comedia. No corregir sin pr… |
| 10 | Vamos de robo | sinopsis | Redacción SQL con correspondencia textual muy marcada con sinopsis disponibles en Cinema Dominicano y CineDominicano.com. Aclarar origen/autorización, proponer texto propio solo tr… |
| 24 | Sanky Panky 3 | sinopsis | Snapshot: FechaEstreno=2018-03-18, Director=null; comunicados de Caribbean Films y notas de marzo de 2018 registran estreno comercial en RD el 2018-03-29 y dirección Eduardo «Trans… |
| 26 | Feo de día, Lindo de noche | sinopsis | F-2.3: corregida en los borradores ES/EN la referencia imprecisa a horas del día; ahora describe la transformación nocturna de 8 p. m. a medianoche, respaldada por Cinema Dominican… |
| 27 | Lotoman 003: Volando Bajito | sinopsis | Fecha SQL 2014-03-15 vs estreno comercial 2014-03-27 en Cinema Dominicano y CineDominicano.com. La organización se denomina «La Cosa Aquella» en ambas referencias; el borrador no l… |
| 30 | El Diablo no duerme en su cama | sinopsis | Alerta de metadatos: la ficha del sitio publicada el 2024-09-24 es una nota sobre la producción, no certifica estreno el 2024-09-22 del snapshot. Una nota de 2024 anuncia posible l… |
| 31 | Entiérrenlo Parao | sinopsis | IMDb y medios confirman premisa y dirección Ronni Castillo. El snapshot registra 2025-06-05, reflejado también por agregadores, pero no encontramos evidencia primaria suficiente de… |
| 32 | Los Rechazados 2: Operación Espacial | sinopsis | Discrepancias del snapshot: FechaEstreno=2026-09-13 y Director=null, mientras DGCINE documenta estreno comercial el 2026-08-13 y dirección de Yasser Michelén. El catálogo asigna gé… |
| 36 | Nueba Yol 3: Bajo la Nueva Ley | sinopsis | Fecha SQL 1997-10-31 frente a 1997-10-23 en Cinema Dominicano. La fuente describe esta obra como «segunda parte» de Nueba Yol, aunque el catálogo usa Nueba Yol 3; revisar denominac… |
| 40 | Colao 2 | sinopsis | Snapshot: estreno 2023-12-07 y género Comedia; Cinema Dominicano registra estreno 2023-11-30 y género Drama. Determinar tipo de fecha y clasificación de género con distribuidora u … |
| 42 | Andrea | sinopsis | Fecha SQL 2005-08-16 vs 2005-08-18 en Cinema Dominicano. Sobre el director, la misma ficha usa Roger Bencosme en dirección, guion y edición, pero Rogert Bencosme en productores, y … |
| 44 | Playball | sinopsis | Snapshot: estreno 2008-02-01, género Comedia. Cinema Dominicano y documentación del Festival de Cine Global señalan 14/02/2008 y la ficha histórica clasifica Drama. La misma obra a… |
| 47 | Pimp Bullies: Victimas de un Prostibulo | sinopsis | Snapshot: género Acción; Cinema Dominicano lo identifica como Drama/Thriller. Revisar subtipo/etiquetas y confirmar qué criterios utiliza la taxonomía del catálogo. La ficha emplea… |
| 55 | El Plan Perfecto | sinopsis | Comprobar si la sinopsis SQL se tomó de una descripción comercial y si existe permiso de reproducción. Fecha SQL 2017-01-17; DGCINE y Cinema Dominicano registran 2017-01-19 como es… |
| 56 | La Lucha de Ana | sinopsis | La redacción SQL se aproxima considerablemente a fuentes públicas; auditar procedencia y permisos, y revisar si conviene una sinopsis original de nueva redacción. Fecha SQL 2012-04… |
| 56 | La Lucha de Ana | contexto | Fecha SQL: 13/04/2012 frente a 24/05/2012 en ficha histórica. Ibermedia solo respalda el año 2012, no el día de estreno. La fórmula «circuito de apoyo cinematográfico» debe entende… |

**Decisión necesaria por pieza:** revisar la exactitud ES/EN y sus fuentes, conservar o proponer corrección, dejar nota editorial y registrar revisor/fecha/fingerprint real solamente tras revisión efectiva. **No introducir frases no sustentadas ni atribuir licencia a sinopsis publicadas por terceros.**

## Frente 3 — preparación de lanzamiento sin simulaciones

Ver `docs/PRODUCTION_READINESS.md`, `docs/OPERATIONS_RUNBOOK.md`, `render.yaml`, `scripts/reportProductionCommercial.mjs` y nuevo `backend/scripts/auditProductionEnv.js`.

1. **Seguridad del código:** backend restringe CORS a orígenes HTTPS públicos válidos incluso si fueron configurados incorrectamente; conserva desarrollo LAN en modo no productivo. La protección de `/uploads` en producción consulta ledger y bloquea sin autorización por ruta exacta.
2. **Preflight local de configuración SIN imprimir secretos:** `node backend/scripts/auditProductionEnv.js` inspecciona variables disponibles en el proceso y emite SOLO nombres de faltantes/problemas. En un entorno de staging con configuración completa, `--strict` puede comprobarlas sin conectarse a SQL. No subir credenciales.
3. **Infraestructura real:** SQL Server persistente con TLS, secretos seguros, storage separado `uploads/private`, API HTTPS accesible; realizar restauración real a base aislada y pruebas de sesión/cookies/roles/correos, monitorizar `/ready`.
4. **Derechos:** mantener `VITE_MEDIA_RIGHTS_MODE=review` y `VITE_ADSENSE_ENABLED=false`; comprobar 0 medios pendientes en dist y endpoints. Para monetizar o mostrar fotografías, primero pruebas de titularidad, licencia, alcance y caducidad en `docs/media-rights-ledger.csv`.
5. **Despliegue:** la CI de la PR no despliega automáticamente el backend real ni certifica que Cloudflare `main` use el commit más reciente. Verificar por separado el sitio y la API reales con la herramienta de lectura `node scripts/reportProductionCommercial.mjs --online` y `CINERD_API_ORIGIN` solo si existe una API publicada.
6. **Pruebas contractuales/jurídicas:** privacidad, términos, correo, restauración, licencias, DNS y condición de acceso a API externa requieren revisión operativa/legal.

## Panel conjunto (no ejecuta SQL)

```powershell
node .\scripts\reportParallelClosure.mjs
node .\scripts\reportParallelClosure.mjs --json
node .\scripts\reportProductionCommercial.mjs
node .\backend\scripts\auditProductionEnv.js
```

* **Por defecto:** lectura informativa, exit 0 si el inventario es internamente válido aunque existan pendientes reales.
* **`--strict`:** falla mientras exista un bloqueo; **no usar como requisito de CI verde hasta completar firmas, infraestructura y permisos**.
* **Nunca subir** `backend/private/`, `backend/.env`, `CRUD-Peliculas.sql` local ni parches ajenos al cierre.
* No interpretar un `BACKUP VERIFICADO` de SQL como prueba de restauración: `RESTORE VERIFYONLY` no sustituye un restore drill.

**Resultado esperado de esta etapa:** los tres frentes poseen una cola y controles reproducibles, pero **se mantiene PR #55 DRAFT** hasta decisiones humanas y comprobaciones de producción. Streaming es otra etapa; no es requisito de este cierre.
