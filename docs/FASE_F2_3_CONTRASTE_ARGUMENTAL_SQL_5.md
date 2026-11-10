# CineRD — F-2.3: contraste factual de cinco propuestas de sustitución SQL

**Estado:** verificación argumental documental por fuentes externas, **no aprobación humana** y **sin auditoría jurídica de autoría**.  
**Rama:** `feat/f2-editorial-review`.  
**Alcance:** IDs 5, 6, 10, 55 y 56, versiones ES/EN preparadas en `docs/editorial-sql-replacement-drafts-f23.json` y fichas originales de `database/seeds/catalog.snapshot.json`.  
**Fecha de contraste:** 2026-11-08 (República Dominicana).

## Criterio de revisión

- **Respaldado:** hay referencias públicas que sustentan un hecho narrativo sin obligarnos a copiar su expresión.
- **Matiz:** el resumen abrevia, generaliza o interpreta el argumento; la decisión de estilo pertenece a una persona revisora.
- **Discrepancia:** las fechas, términos o caracterizaciones no son idénticos entre fuentes. Documentar sin sustituir SQL automáticamente.
- **Procedencia:** un texto puede ser argumentalmente correcto y **seguir sin permiso de reproducción, originalidad acreditada o aprobación humana**.
- **No se ha visionado ninguna obra** como parte de este contraste, ni se ha obtenido evidencia de licencia.

## Hallazgos por película

### 5 — Perico Ripiao (2003)

**Respaldado:** el argumento de Cinema Dominicano sitúa tres personajes encarcelados por delitos menores en los años setenta, en prisión durante **diez años** debido a burocracia. Escapan con güira, tambor y acordeón, buscando volver con sus familias. El borrador ES/EN recoge la fuga, el largo encierro, los instrumentos y la búsqueda familiar sin inventar una cifra concreta.

**Matiz editorial:** «una aventura atravesada por música y humor» / «Music and comedy accompany» interpreta el tono de la película, acorde con su clasificación como comedia, pero no se acredita con la misma precisión que los hechos del argumento.

**Metadatos:** estreno del snapshot `2003-11-27`, coincidente con la ficha consultada.

**Pendiente:** comprobar autoría del borrador y procedencia del texto SQL, y realizar revisión de exactitud y estilo ES/EN; no hay permiso de reproducción documentado.

Referencias:
- https://cinemadominicano.com/perico-ripiao-2003/
- https://cinedominicano.com/peliculasdominicanas/pelicula/perico-ripiao-2003/

### 6 — Ladrones a Domicilio (2008)

**Respaldado:** las fichas históricas identifican a Bruno como profesor universitario cuyo proyecto educativo para su hija resulta afectado al perderse la beca. **Casa de América** lo describe expresamente trabajando como **chofer de una compañía de transporte de valores**, mientras otra ficha usa «guardia de seguridad». El primer detalle no debe rechazarse como error: ambas descripciones pueden aludir al trabajo de seguridad de valores, aunque los términos no son idénticos.

**Matiz editorial:** el borrador describe un «segundo trabajo vinculado al transporte de valores» y «peligrosa trama/corrupción». Es congruente con las referencias, pero no puede afirmarse una modalidad laboral más específica sin evidencia suficiente.

**Metadatos:** estreno `2008-08-14` en snapshot y ficha histórica.

**Pendiente:** resolver la descripción del cargo si se requiere exactitud de crédito narrativo; comprobar traducción inglesa de `armored cash transport`, autoría y derechos.

Referencias:
- https://www.casamerica.es/cine/ladrones-domicilio
- https://cinemadominicano.com/ladrones-a-domicilio-2008/

### 10 — Vamos de robo (2014)

**Respaldado:** la ficha de Cinema Dominicano describe a **Michael, Pedro, Mateo y Antonio** como encargados de fiscalización del banco y sospechosos tras un robo de **RD$150 millones** en la bóveda. El borrador ES/EN coincide en los nombres, relación con el banco, robo y sospecha. No afirmar que fueron declarados culpables.

**Matiz editorial:** omite la cuantía exacta y emplea «presiones, desconfianza y situaciones disparatadas» / «comic complications», un resumen interpretativo del tono y sus efectos; revisión humana recomendada.

**Discrepancia de fecha:** `2014-01-15` en el snapshot frente a **2014-01-16** como fecha de estreno en la fuente histórica. Mantener el dato original hasta esclarecer fecha comercial/preestreno.

**Pendiente:** origen del texto SQL y permiso de reproducción; asegurarse de que el borrador no reproduzca la redacción de una ficha externa.

Referencias:
- https://cinemadominicano.com/vamos-de-robo-2014/
- https://cinedominicano.com/peliculasdominicanas/pelicula/vamos-de-robo-2014/

### 55 — El Plan Perfecto (2017)

**Respaldado institucionalmente:** DGCINE describe **seis compañeros de trabajo**, un **almacén de Santo Domingo**, el cierre/venta motivado por la salud del dueño y su uso posterior como **centro clandestino de acopio de mercancía ilegal**. La propuesta ES/EN recoge esos elementos centrales sin reproducir literalmente la descripción breve del agregador.

**Convergencia histórica:** Cinema Dominicano identifica a **Roberto Ángel Salcedo** como director y el **19 de enero de 2017** como estreno. La nota institucional de DGCINE también identifica el día 19. Una crítica histórica amplía los hechos con la persecución de la policía, que el borrador no menciona; la omisión no constituye una contradicción argumental.

**Discrepancia de fecha:** SQL contiene `2017-01-17`, cifra coincidente con una ficha de Páginas Amarillas; dos referencias de estreno señalan `2017-01-19`. **No inferir** sin documentación si el 17 corresponde a premier, función privada o error de la ficha.

**Matiz editorial:** «deben encontrar una salida ante las consecuencias del negocio» / «find a way through the resulting trouble» es resumen general y válido como propuesta narrativa, pero no demuestra originalidad o licencia. Las fuentes DGCINE, Cinema Dominicano y agregadores pueden derivar de una **misma sinopsis promocional**, y no deben contarse como testimonios plenamente independientes sobre redacción original.

**Pendiente:** comprobar autoría del borrador ES/EN; un revisor humano debe verificar, si dispone de ella, documentación de producción/visionado y el tipo exacto de fecha de estreno antes de decidir la migración.

Referencias:
- https://dgcine.gob.do/mas-de-50-mil-personas-han-visto-el-plan-perfecto/
- https://cinemadominicano.com/el-plan-perfecto-2017/
- https://cinemadominicano.com/el-plan-perfecto-imperfecto-plan/
- https://paginasamarillas.com.do/es/movie/el-plan-perfecto/M5P1549

### 56 — La lucha de Ana (2012)

**Respaldado:** Ibermedia caracteriza la historia como una madre **vendedora de flores** que busca justicia por su **hijo asesinado**. Cinema Dominicano añade dificultades por las vías legales. La propuesta ES/EN conserva esa premisa sin repetir párrafos de sinopsis comerciales.

**Matiz:** Cinema Dominicano utiliza la expresión «por un accidente fortuito» para describir las circunstancias del asesinato, lo que **no equivale** a afirmar que la muerte fue simplemente accidental. El borrador evita una causalidad específica y dice «muere de forma violenta» / «violently killed», acorde con el dato de asesinato de Ibermedia.

**Discrepancia de fecha:** snapshot `2012-04-13`; ficha histórica de Cinema Dominicano `2012-05-24`. Ibermedia confirma el **año** 2012, no el día. Es necesaria evidencia adicional sobre estreno comercial en RD.

**Pendiente:** comprobar originalidad, autoría, traducción y procedencia SQL; no declarar que las dificultades institucionales fueron la intención expresamente manifestada del realizador sin fuente adecuada.

Referencias:
- https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/
- https://cinemadominicano.com/la-lucha-de-ana-2012/

## Decisiones de control F-2.3

| Área | Resultado de este contraste |
|---|---|
| Cobertura argumental | Se localizaron fundamentos documentales para los cinco borradores |
| Propuestas ES/EN | **Se mantienen sin modificar**; el contraste no fuerza una reescritura |
| Snapshot y SQL Server | **Sin cambios** |
| Cuestiones de fechas | Pendientes para 10, 55 y 56; no se presume tipo de fecha |
| Permisos y autoría SQL | **Cinco sin evidencia documentada**; no adjudicar derechos por semejanza |
| Aprobaciones | **Cero aprobaciones**; revisión humana final pendiente |
| Migración | **No generar ni ejecutar** scripts para publicación hasta cumplir los controles de firma, respaldo y verificación |
| E-5 / AdSense | Sin alteración: **58 piezas pendientes** y publicidad desactivada |

## Uso del informe por el revisor

Abrir la ficha de una película con `node backend/scripts/prepareEditorialHumanReview.js --film-id 55 --show` o consultar el expediente local ya creado. Este informe aporta contraste documental para marcar, **solo tras revisión personal**, las casillas correspondientes al argumento; ninguna casilla de autoría/licencia debe marcarse únicamente por existir estas URL.

El expediente local `backend/backups/editorial/review-f23/film-55-63cb8e314dd7.md` y las huellas anteriores siguen válidos porque **ningún texto ni fuente del borrador se modificó**. No es necesario regenerar ese expediente solo por incorporar esta investigación; puede anexarse este informe como material de contraste.

**Estado final:** F-2.3 continúa abierta hasta documentar revisión atribuida, decisiones de procedencia, validación lingüística y, cuando corresponda, migraciones autorizadas.
