# CineRD — F-2.3 · Revisión individual de sinopsis SQL #55

**Película:** *El Plan Perfecto* (2017).  
**ID de CineRD:** 55.  
**Estado:** revisión documental y nueva propuesta ES/EN, **no aprobada**, **no desplegada**, **sin modificación de SQL Server**.  
**Fecha del contraste:** 2026-11-08.  
**Última sincronización E-4:** el commit `3e6f6bc` actualizó solo siete metadatos de cuatro películas no relacionadas; la fecha SQL de #55 no cambió.

## 1. Resultado de la investigación

Las fuentes indican que seis empleados trabajan en un almacén de Santo Domingo cuyo propietario, **Don Pascual**, debe vender debido a problemas de salud. Tras la compra, los empleados son contratados nuevamente, sin conocer que el nuevo negocio usa el local para mercancía ilegal. Los persiguen delincuentes y la policía sospecha de complicidad. La trama está presentada como comedia con momentos de acción.

**Detalle nuevo frente al borrador anterior:** la recontratación y la doble persecución se describen expresamente en noticias de estreno, por lo que es preferible mencionarlas antes que usar un final genérico sobre «consecuencias del negocio». Una sinopsis no debe asegurar que se demostró su culpabilidad ni su inocencia.

**Sobre las fuentes:** DGCINE y varios periódicos parecen reproducir una descripción promocional común de la película. La coincidencia entre esas fichas aporta contexto, pero **no constituye pruebas independientes de autoría o licencia textual**. Se redactó de nuevo en palabras propias, preservando solo hechos narrativos relevantes.

Referencias:
- DGCINE (06/02/2017): https://dgcine.gob.do/mas-de-50-mil-personas-han-visto-el-plan-perfecto/
- Cinema Dominicano (20/01/2017): https://cinemadominicano.com/el-plan-perfecto-2017/
- LaCronica.do (17/01/2017, cobertura de la gala): https://lacronica.do/roberto-angel-salcedo-inicia-2017-estreno-plan-perfecto/
- El Día (18/01/2017, contexto del estreno): https://eldia.com.do/el-plan-perfecto-reune-buen-elenco/
- Páginas Amarillas (agregador cuya ficha muestra 17/01/2017): https://paginasamarillas.com.do/es/movie/el-plan-perfecto/M5P1549

## 2. Candidato ES — no publicado

> Don Pascual vende por motivos de salud un almacén de Santo Domingo, y sus seis empleados son contratados nuevamente por los compradores. Sin saberlo, continúan trabajando en un local que ahora se utiliza para guardar mercancía ilegal. Perseguidos por delincuentes y bajo sospecha de la policía, deberán encontrar cómo salir del enredo en medio de situaciones de acción y comedia.

## 3. Candidato EN — no publicado

> When Don Pascual sells his Santo Domingo warehouse because of health problems, its six employees are rehired by the new owners. Unaware that the premises are now being used to store illegal goods, they find themselves pursued by criminals and suspected by the police. To get out of trouble, they must come up with a plan amid a series of comic mishaps.

**Equivalencia editorial provisional:** preserva el motivo de venta, las seis contrataciones, la función ilegal del local, la persecución criminal, la sospecha policial y el tono de comedia. La revisión bilingüe humana continúa pendiente.

## 4. Discrepancia de la fecha de estreno

- **Snapshot SQL:** `FechaEstreno = 2017-01-17`.
- **LaCronica.do (17/01/2017):** informa de una gala premier ya realizada y de estreno comercial el **19 de enero de 2017**.
- **El Día (18/01/2017):** describe una premier anterior y el estreno en cines al día siguiente.
- **DGCINE y Cinema Dominicano:** también identifican el **19 de enero** como el estreno comercial.

**Acción pendiente separada:** el criterio E-4 para `FechaEstreno` es «estreno comercial en cines de República Dominicana». La investigación favorece `2017-01-19`, pero **no se agrega automáticamente la corrección a E-4** ni se modifica el snapshot/SQL en esta entrega. Antes, documentar la discrepancia y decidir cómo tratar un valor histórico de posible gala.

## 5. Procedencia, riesgo editorial y controles

La sinopsis SQL histórica coincide notablemente con la de Apple TV y otros agregadores. No hemos encontrado documentación de su autor, cesión o permiso de reproducción. **Ello no demuestra una infracción**, pero tampoco autoriza copiarla. La propuesta ES/EN sigue marcada `sourcePermissionStatus: sin_evidencia_registrada`; el registro de procedencia SQL continúa pendiente.

La actualización de los borradores y sus fuentes **cambia su fingerprint SHA-256**, por lo que el expediente local previo de #55, cuya huella empezaba por `63cb8e314dd7`, **queda obsoleto**. Regenerar una vista previa con:

```powershell
node --test backend/tests/editorialReview55.test.js
node scripts/verifyEditorialSqlReplacementDrafts.mjs
node backend/scripts/prepareEditorialHumanReview.js --film-id 55 --show
node backend/scripts/prepareEditorialSqlMigration.js --film-id 55
npm --prefix frontend run editorial:readiness
```

La generación de expedientes mediante `--write` crea un archivo local ignorado por Git y no implica firma alguna. No usar `--generate` ni `--apply` hasta que existan autorización humana real, revisión legal/editorial, evidencia de backup recuperable y un procedimiento formal.

## 6. Decisiones humanas pendientes (NO completadas)

- [ ] Corroborar los hechos de la película y, si procede, visualizar la obra; no atribuir a esta investigación un visionado que no ha ocurrido.
- [ ] Confirmar la versión ES definitiva y corregir cualquier inferencia.
- [ ] Comprobar la naturalidad y fidelidad de la versión EN.
- [ ] Confirmar autoría y procedencia de la propuesta ES/EN.
- [ ] Resolver la situación de derechos del antiguo texto SQL y la eventual sustitución.
- [ ] Determinar el valor correcto de estreno comercial y tramitar una corrección de metadatos **independiente**.
- [ ] Documentar responsable real, fecha, evidencia y decisión sobre migración.

**Resultado:** los hechos esenciales fueron contrastados documentalmente y los candidatos ES/EN mejorados; **la incidencia F-2.3 sigue pendiente, la pieza E-5 no está aprobada, SQL no cambió, AdSense no se habilitó**.
