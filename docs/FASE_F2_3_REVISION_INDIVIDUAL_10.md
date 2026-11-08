# CineRD — F-2.3 · Revisión individual de sinopsis SQL #10

**Película:** *Vamos de robo* (2014).  
**ID:** 10.  
**Estado:** propuesta bilingüe nueva, pendiente de revisión humana. **SQL Server, snapshot, interfaz y AdSense sin cambios.**  
**Fecha del contraste:** 2026-11-08.

## 1. Hallazgos argumentales

Michael, Pedro, Mateo y Antonio trabajan en el departamento de fiscalización de un banco. Después de un robo de **RD$150 millones** de la bóveda, los cuatro se convierten en sospechosos porque estaban presentes durante el suceso. El tono narrativo es el de una comedia, con confusiones y situaciones de enredo. No necesitamos reproducir literalmente las fichas comerciales para describir esos hechos.

**Advertencia editorial:** la redacción nueva describe sospechas y el intento de aclarar lo sucedido; **no emite una conclusión judicial** sobre la culpabilidad o inocencia de los personajes. Algunas crónicas hablan de implicación involuntaria, pero esa interpretación debe distinguirse del conocimiento objetivo del espectador en cada momento de la historia.

**Riesgo de procedencia:** el texto SQL anterior presenta correspondencia muy marcada con descripciones distribuidas públicamente. Eso por sí solo no prueba una infracción, pero su **autor y permiso siguen sin identificarse**. No copiar los párrafos originales; verificar la autoría de la nueva redacción y sus condiciones de publicación antes de sustituir.

## 2. Propuesta ES — NO PUBLICADA

> Michael, Pedro, Mateo y Antonio trabajan en el área de fiscalización de un banco. Cuando desaparecen 150 millones de pesos de la bóveda, las sospechas recaen sobre ellos: los cuatro estaban en las instalaciones durante el robo. Mientras intentan aclarar lo sucedido y despejar las acusaciones, se ven envueltos en una cadena de complicaciones y situaciones cómicas.

## 3. Propuesta EN — NO PUBLICADA

> Michael, Pedro, Mateo and Antonio work in a bank's auditing department. When 150 million Dominican pesos are stolen from the vault, suspicion falls on the four men because they were on the premises during the robbery. As they try to find out what happened and clear their names, they get caught up in a series of complications and comic mishaps.

La expresión `área de fiscalización` se traduce aquí como `auditing department`; requiere confirmación humana de equivalencia contextual. La cifra se expresa en inglés como `150 million Dominican pesos` para conservar la unidad monetaria.

## 4. Discrepancia de estreno: 15 vs. 16 de enero

- **Snapshot de CineRD:** `2014-01-15` (sin modificar).
- **Diario Libre, 15 de octubre de 2013:** anuncia estreno en salas el **jueves 16 de enero de 2014**.
- **Acento (anuncio previo):** informa que los productores fijaron el **16 de enero** como estreno.
- **El Día, nota fechada 15 de enero de 2014:** describe una gala con público y afirma que la película se exhibiría en los cines **al día siguiente**.
- **IMDb:** diferencia una exhibición del **15 de enero** en Palacio del Cine y otra del **16 de enero** en Caribbean Cinemas. IMDb es de actualización comunitaria; es evidencia contextual, no confirmación definitiva del tipo de función de cada fecha.

**Interpretación provisional:** la fecha **16/01/2014** está mejor respaldada como **estreno comercial general** en República Dominicana; el día 15 podría referirse a otra exhibición o registro de sala. Sin acta/programación oficial de la distribuidora, **no declarar una explicación definitiva**.

**Decisión técnica:** no cambiar `FechaEstreno` en SQL Server ni editar el snapshot en esta fase. La discrepancia se registra para corrección futura de metadatos con evidencia y decisión atribuida.

## 5. Fuentes registradas

- Cinema Dominicano, ficha de película: https://cinemadominicano.com/vamos-de-robo-2014/
- CineDominicano, ficha cinematográfica: https://cinedominicano.com/peliculasdominicanas/pelicula/vamos-de-robo-2014/
- Diario Libre, anuncio de estreno (15/10/2013): https://www.diariolibre.com/revista/vamos-de-robo-a-las-salas-de-cines-en-enero-BMDL406632
- El Día, crónica de gala y exhibición (15/01/2014): https://eldia.com.do/publico-valora-filme-vamos-de-robo/
- Diario Libre, reseña y argumento (20/01/2014): https://www.diariolibre.com/amp/revista/cine/vamos-de-robo-DIDL447141

Contexto adicional de fecha:
- Acento, anuncio de producción: https://acento.com.do/cultura/vamos-de-robo-primer-estreno-dominicano-para-el-2014-1127603.html
- IMDb, registro de fechas por exhibidor: https://www.imdb.com/title/tt3587714/releaseinfo/

**Nota de independencia:** varias fichas podrían basarse en una sinopsis de promoción compartida. No confundir cantidad de enlaces con testimonios independientes de autoría o con licencias.

## 6. Estado de la revisión y precauciones

La propuesta #10 en `docs/editorial-sql-replacement-drafts-f23.json` lleva `draftOrigin: nueva_redaccion_f23`, `status: pendiente_revision`, `deployment: manual_only`, `reviewedBy: null`, `reviewedAt: null` y `sourcePermissionStatus: sin_evidencia_registrada`.

La nueva versión tiene una huella distinta del borrador previo. Cualquier expediente local de la versión anterior queda desactualizado para fines de aprobación y debe regenerarse.

**Comandos de validación (solo lectura):**

```powershell
node --test backend/tests/editorialReview10.test.js
node --test backend/tests/prepareEditorialHumanReview.test.js
node scripts/verifyEditorialSqlReplacementDrafts.mjs
node backend/scripts/prepareEditorialHumanReview.js --film-id 10 --show
npm --prefix frontend run editorial:readiness
```

## 7. Revisión humana pendiente — casillas NO completadas

- [ ] Corroborar nombres, cargos, monto robado y circunstancias de las sospechas con créditos, materiales primarios o visionado.
- [ ] Confirmar la exactitud y el estilo de la sinopsis ES.
- [ ] Revisar fidelidad, claridad y terminología financiera en inglés.
- [ ] Confirmar la autoría de ambos textos y que no reproducen una sinopsis ajena protegida.
- [ ] Resolver la procedencia y autorización del texto SQL histórico o justificar su sustitución.
- [ ] Determinar el criterio de estreno comercial y decidir si procede corregir 15/01 a 16/01 en un proceso de metadatos independiente.
- [ ] Registrar persona revisora real, fecha, decisión y fuentes comprobadas.
- [ ] Autorizar o rechazar la migración por separado; exigir respaldo SQL y plan de reversión.

**Cierre documental:** borrador contrastado y mejorado; **sin autorización**, sin modificación de SQL, sin cierre de incidencia F-2.3 ni aprobación E-5.
