# CineRD — F-2.3: procedencia SQL y conciliación argumental de Sanky Panky 2

**Estado:** revisión documental en curso. **No hay permiso de reproducción acreditado ni aprobación editorial.**
**Rama:** `feat/f2-editorial-review`.
**Archivos relevantes:** `docs/editorial-provenance-sql-f23.json`, `docs/editorial-issues-f2.json`, `frontend/src/data/sinopsisCuradasFaseE2.js`.

## 1. Sanky Panky 2 (ID 23): discrepancia argumental aclarada

Las descripciones publicadas por **Caribbean Cinemas (distribuidora)**, el proyecto académico **Cine de movilidad / UC3M** y la ficha histórica de Cinema Dominicano coinciden en que **La Morena es la novia de Genaro** y que **Martha regresa** al país y altera la situación. Una reseña de 2013 que llama Martha «novia» introduce una contradicción secundaria.

- Distribuidora: https://caribbeancinemas.com/movie/3959/
- UC3M: https://humanidadesdigitales.uc3m.es/s/cine-de-movilidad/item/42221
- Ficha histórica: https://cinemadominicano.com/sanky-panky-2-2013/
- Reseña discrepante: https://cinemadominicano.com/sanky-panky-2-la-otra-vuelta-de-genaro/

**Decisión editorial provisional:** conservar la sinopsis ES/EN existente sin reescribir el argumento. Añadir al borrador el enlace de distribución como segunda fuente, para sostener la distinción Morena/Martha. **No** aprobarla por ello. La variante de título `Objetivo Italia` requiere política de alias y no altera el título canónico por ahora.

La observación `sinopsis:23` baja de **alta** a **media**; continúa `pendiente_verificacion` para revisión de autoría, estilo, procedencia y fuentes. La matriz total queda en **18 alta, 18 media, 22 baja**.

## 2. Cinco sinopsis SQL: coincidencia textual con materiales públicos

El contraste detectó solapamientos de redacción de nivel **muy alto** en las cinco sinopsis SQL. Su existencia **no determina** quién redactó originalmente cada pieza, ni si existe permiso, cesión, atribución válida o una excepción legal aplicable. El estado actual es **`textOriginStatus: por_identificar`** y **`reusePermissionStatus: sin_evidencia_registrada`** para las cinco.

| ID | Película | Tipo de coincidencia | Fuente externa de comparación |
|---:|---|---|---|
| 5 | Perico Ripiao | Redacción casi idéntica, con pequeñas variaciones | [La Vanguardia](https://www.lavanguardia.com/peliculas-series/peliculas/perico-ripiao-25000) y PlayPilot |
| 6 | Ladrones a Domicilio | Coincidencia extensa, incluyendo errores ortográficos | [Cine.com](https://www.cine.com/pelicula/ladrones-a-domicilio) y Diario Libre |
| 10 | Vamos de robo | Construcción y secuencia prácticamente idénticas | [elCaribe](https://www.elcaribe.com.do/sin-categoria/ldquovamos-robordquo-asalto-risas/) y JustWatch |
| 55 | El Plan Perfecto | Coincidencia literal con sinopsis distribuida | [Apple TV](https://tv.apple.com/us/movie/el-plan-perfecto/umc.cmc.1xuuyzufrx91vsnxjqt3q4zqb?l=es) y Plex |
| 56 | La lucha de Ana | Coincidencia muy alta con descripción de cine institucional | [DGCINE](https://dgcine.gob.do/programacion-cinemateca-sobre-ruedas-centro-cultural-narciso-gonzalez-2/) y catálogo cinematográfico |

Las URLs de comparación **no sustituyen** `docs/editorial-sources-sql-f2.json`: aquel registro apunta a fuentes argumentales, mientras que el nuevo identifica lugares donde aparece texto muy parecido.

## 3. Control técnico de procedencia

`scripts/verifyEditorialSqlProvenance.mjs` inspecciona las sinopsis SQL del snapshot y exige una fila por obra, identidad ID/título/año, enlaces HTTPS de comparación y estados de procedencia. Rechaza marcar `acreditada` una autorización si no se documentan revisión atribuida y evidencias. Esta comprobación valida **consistencia del registro**, no legitimidad de las pruebas ni contenido legal.

Comandos de revisión:

```powershell
node --test scripts/verifyEditorialSqlProvenance.test.mjs
node scripts/verifyEditorialSqlProvenance.mjs
node scripts/verifyEditorialIssueMatrix.mjs
npm --prefix frontend test
npm --prefix frontend run editorial:review
```

Resultado de procedencia esperado: **5 sinopsis SQL, 5 sin evidencia registrada, 0 acreditadas**. La matriz mantiene **58 registros (18 alta / 18 media / 22 baja)**. E-5 permanece **0 aprobadas / 58 pendientes**.

## 4. Decisiones por realizar

1. Identificar la procedencia original de cada texto SQL mediante el historial de carga, autoría, autorización documental y material de productora/distribuidor, si existen.
2. Si no se puede acreditar permiso y corresponde la sustitución, redactar nuevas versiones **genuinamente originales**, contrastadas y aprobadas humanamente; no bastaría con cambios superficiales de palabras.
3. **No** modificar SQL Server ni el snapshot sin respaldo y flujo E-4; el texto SQL tiene prioridad en la visualización actual. El informe de coincidencia **no bloquea por sí solo** esas fichas mientras no se integre un control de publicación específico.
4. Si se añaden fuentes o se edita el texto ES/EN, se modificará su fingerprint de E-5. Asegurar que toda aprobación futura corresponda a la versión vigente.
5. Mantener las imágenes en `review` y AdSense desactivado. Estas protecciones no acreditan derechos sobre las sinopsis.

**No declarar resuelta la cuestión de originalidad o licencia hasta completar revisión humana documentada.**
