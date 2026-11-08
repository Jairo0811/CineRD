# CineRD — F-2.3: cinco propuestas ES/EN de sustitución de sinopsis SQL

**Estado:** cinco **borradores editoriales para revisión humana**, sin aprobación, licencia acreditada ni publicación automática.  
**Rama:** `feat/f2-editorial-review`.  
**Archivo de datos:** `docs/editorial-sql-replacement-drafts-f23.json`.

## Objetivo y alcance

Preparar versiones breves en español e inglés de las cinco películas cuyo campo `Sinopsis` proviene de SQL Server y cuya procedencia textual no está acreditada en `docs/editorial-provenance-sql-f23.json`. El trabajo **no cambia SQL**, `database/seeds/catalog.snapshot.json`, `frontend/src/data/sinopsisCuradasFaseE.js`, el contenido actualmente servido, permisos ni AdSense.

### Propuestas

| ID | Película | Procedencia del borrador | Consideración especial |
|---:|---|---|---|
| 5 | Perico Ripiao | Borrador ES/EN ya redactado en fase E | La fuente histórica menciona una década de encarcelamiento; el texto propuesto no fija cantidad exacta de años |
| 6 | Ladrones a Domicilio | Borrador ES/EN de fase E | El trabajo en transporte de valores aparece en Diario Libre y Casa de América; otra ficha resume esa ocupación como «guardia de seguridad» |
| 10 | Vamos de robo | Borrador ES/EN de fase E | Los cuatro empleados son **sospechosos**, no se declara su culpabilidad ni se recrea la redacción periodística |
| 55 | El Plan Perfecto | **Nuevo borrador ES/EN F-2.3** | Basado en las condiciones del almacén documentadas por DGCINE, sin reproducir la descripción comercial breve de Apple TV |
| 56 | La lucha de Ana | Borrador ES/EN de fase E | Se evita atribuir una causa concreta a la muerte del hijo cuando las fuentes no son uniformes |

**Fuentes de apoyo y contrastes principales**

- *Perico Ripiao*: https://cinemadominicano.com/perico-ripiao-2003/ ; https://cinedominicano.com/peliculasdominicanas/pelicula/perico-ripiao-2003/
- *Ladrones a Domicilio*: https://cinemadominicano.com/ladrones-a-domicilio-2008/ ; https://www.diariolibre.com/amp/revista/ladrones-a-domicilio-se-estrena-14-de-agosto-AADL25057 ; https://www.casamerica.es/cine/ladrones-domicilio
- *Vamos de robo*: https://cinemadominicano.com/vamos-de-robo-2014/ ; https://www.elcaribe.com.do/sin-categoria/ldquovamos-robordquo-asalto-risas/
- *El Plan Perfecto*: https://dgcine.gob.do/mas-de-50-mil-personas-han-visto-el-plan-perfecto/ ; https://cinemadominicano.com/el-plan-perfecto-2017/ ; https://tv.apple.com/us/movie/el-plan-perfecto/umc.cmc.1xuuyzufrx91vsnxjqt3q4zqb?l=es
- *La lucha de Ana*: https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/ ; https://cinemadominicano.com/la-lucha-de-ana-2012/

El campo `sources` del JSON referencia URLs ya registradas en F-2.1. Son referencias bibliográficas **para contrastar hechos**; no prueban permiso de uso del texto original ni certifican originalidad de las propuestas.

## Controles técnicos

`scripts/verifyEditorialSqlReplacementDrafts.mjs` es un script de **solo lectura**. Exige:

1. **Exactamente una propuesta por cada película con sinopsis SQL en el snapshot**, sin entradas ajenas, con ID/título/año compatibles.
2. Estado `pendiente_revision`, `deployment: manual_only`, `autoPublish: false`, sin revisión atribuida ficticia ni banderas de aprobación.
3. Texto ES y EN suficientemente desarrollado, distinto de la redacción SQL en términos de igualdad normalizada.
4. Fuentes HTTPS incluidas en el registro `editorial-sources-sql-f2.json`.
5. Consistencia con el registro de procedencia: las cinco siguen en `sin_evidencia_registrada`.
6. Para los cuatro textos reutilizados, igualdad con el borrador fuente de fase E. Si hay futuras ediciones sustantivas, deberán versionarse como nueva revisión.
7. Preguntas de revisión no vacías para todas las películas.

**Importante:** el validador solo verifica integridad, existencia y no identidad literal. **No es un detector de plagio, no prueba originalidad ni evalúa automáticamente exactitud factual.**

## Comprobaciones en PowerShell

```powershell
git pull --ff-only origin feat/f2-editorial-review
node --test scripts/verifyEditorialSqlReplacementDrafts.test.mjs
node scripts/verifyEditorialSqlReplacementDrafts.mjs
node scripts/verifyEditorialSqlProvenance.mjs
node scripts/verifyEditorialIssueMatrix.mjs
npm --prefix frontend test
npm --prefix frontend run editorial:review
```

Resultado esperado para el nuevo validador: `5 propuestas, 5 pendientes, 0 publicadas automáticamente`. Los controles previos deben conservar **5 sin permisos acreditados, 58 observaciones (18 alta / 18 media / 22 baja), 0 aprobaciones editoriales y 58 piezas pendientes**.

## Qué falta antes de sustituir textos en producción

1. **Revisor humano:** confrontar los cinco textos con fuentes primarias, créditos o visionado; revisar el inglés y la identidad editorial de CineRD.
2. **Trazabilidad de derechos:** revisar autoría y eventuales permisos de las sinopsis SQL existentes. Si se sustituye por un texto redactado por CineRD, documentar autoría de la propuesta y el criterio editorial; no asumir que citar una fuente crea licencia.
3. **Transición de datos:** decidir dónde residirá el texto canónico. Actualmente la vista privilegia `Peliculas.Sinopsis` de SQL frente a los borradores de fase E. El JSON de propuestas **no modifica esa prioridad**.
4. **Migración controlada:** con respaldo de SQL Server, plan de reversión, versionado y pruebas, habilitar únicamente las sustituciones aprobadas, una película por vez; regenerar el snapshot si el origen cambia.
5. **Huella editorial:** recalcular el fingerprint de E-5 sobre la versión pública y sus fuentes finales. Registrar únicamente la aprobación humana real, con revisor y fecha efectivos.
6. **Despliegue seguro:** conservar `VITE_MEDIA_RIGHTS_MODE=review` en Cloudflare, 128 imágenes sin autorización excluidas y AdSense desactivado.

**La F-2.3 sigue abierta.** Este commit prepara los reemplazos pero no los autoriza, no los utiliza públicamente y no cierra las incidencias de derechos.
