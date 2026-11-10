# CineRD F-2.3 — revisión preliminar de cinco sinopsis SQL (ES/EN)

**Fecha:** 2026-11-10 · **Estado:** análisis de hechos y riesgos; **0/5 aprobadas** · **No modifica SQL, snapshot, interfaz, borradores canónicos, permisos ni fingerprints**.

**Textos examinados:** propuestas existentes en `docs/editorial-sql-replacement-drafts-f23.json`, IDs 5, 6, 10, 55 y 56. Se contrastaron sus afirmaciones con fuentes públicamente consultables. Una fuente demuestra *un hecho descrito*, no concede derechos de reproducción literal ni certifica el visionado de la obra. La autoría/originalidad final exige revisión humana.

## Diagnóstico por película

| ID | Obra | Hallazgo documental | Acción editorial propuesta | Aprobación |
|---:|---|---|---|---|
| 5 | Perico Ripiao | Se confirma el núcleo de tres presos, fuga, música y búsqueda de familiares; el tiempo de prisión difiere entre fuentes | Mantener **sin número de años**; solicitar testimonio primario/visionado antes de detalles adicionales | PENDIENTE |
| 6 | Ladrones a Domicilio | Prensa contemporánea y Casa de América respaldan expresamente que Bruno es **chofer de transporte de valores**; otras fichas lo llaman **guardia de seguridad** | Conservar la especificidad con atribución a prensa de estreno; revisar ES/EN y secuencia de hechos mediante visionado | PENDIENTE |
| 10 | Vamos de robo | El trabajo bancario de Michael/Pedro/Mateo/Antonio y los RD$150 millones están respaldados | Mantener la distinción entre **sospechosos** y culpables; revisar afirmaciones sobre la investigación o exoneración posterior | PENDIENTE |
| 55 | El Plan Perfecto | **Recontratación y persecuciones respaldadas** en La Crónica, elCaribe y crítica contemporánea; falta aval de autoría y revisión ES/EN | Borrador ES/EN reformulado como propuesta, con siete fuentes; contrastar escenas por visionado, derechos y fidelidad | PENDIENTE |
| 56 | La Lucha de Ana | Ibermedia respalda a Ana como florista y la búsqueda de justicia por su hijo asesinado; la fuente catalográfica menciona vías legales | Mantener incertidumbre sobre desenlace y evitar causalidades o mecanismos concretos del fallecimiento | PENDIENTE |

## 5 — Perico Ripiao (2003)

- El borrador evita indicar si el encierro duró siete o diez años. Esta prudencia está justificada: no hay concordancia entre las descripciones consultadas; la ficha de Cinema Dominicano menciona diez años.
- «Tres hombres», «delitos menores», instrumentos musicales y búsqueda de familiares son consistentes con la ficha catalográfica.
- **Decisión sugerida:** conservar borrador ES/EN como propuesta. Revisor debe contrastar protagonistas y detalles mediante una fuente primaria o visionado.
- Fuentes: [Cinema Dominicano](https://cinemadominicano.com/perico-ripiao-2003/); [CineDominicano](https://cinedominicano.com/peliculasdominicanas/pelicula/perico-ripiao-2003/).

## 6 — Ladrones a Domicilio (2008)

- La nota contemporánea de **Diario Libre (18/07/2008)** y la reseña de **Casa de América** especifican que Bruno obtiene un empleo como conductor de una compañía de transporte de valores, ayudado por Biembo. La descripción abreviada de Cinema Dominicano usa «guardia de seguridad»; por sí sola, esa formulación no invalida la función de conductor.
- Diario Libre también documenta la primera noche y el intento de autorrobo dirigido desde la compañía, pero su relato es material promocional; para validación definitiva de cada escena conviene visionado.
- **Decisión sugerida:** mantener ES «conductor de un vehículo de transporte de valores» / EN «driving a cash transport vehicle» como borrador respaldado; revisar que no se impute a Bruno culpabilidad.
- Fuentes: [Diario Libre (2008)](https://www.diariolibre.com/amp/revista/ladrones-a-domicilio-se-estrena-14-de-agosto-AADL25057); [Casa de América](https://www.casamerica.es/cine/ladrones-domicilio); [Cinema Dominicano](https://cinemadominicano.com/ladrones-a-domicilio-2008/).

## 10 — Vamos de robo (2014)

- El argumento de Cinema Dominicano identifica cuatro responsables del departamento de fiscalización bancario y un robo de **RD$150 millones**, que los convierte en sospechosos por encontrarse en el lugar.
- El borrador no los declara culpables ni absueltos, una distinción que debe conservarse. Las «complicaciones» posteriores son genéricas; se recomienda evitar detalles adicionales no documentados.
- La pregunta de metadatos en el JSON que compara 2014-01-15 con 2014-01-16 es **histórica**: la fecha F2.3 ya quedó actualizada y verificada en SQL; no reabrir ni volver a aplicar la migración.
- **Decisión sugerida:** mantener como propuesta, comprobar equivalencia de ES «fiscalización» y EN «auditing department» y obtener revisión editorial de procedencia.
- Fuentes: [Cinema Dominicano](https://cinemadominicano.com/vamos-de-robo-2014/); [CineDominicano](https://cinedominicano.com/peliculasdominicanas/pelicula/vamos-de-robo-2014/).

## 55 — El Plan Perfecto (2017): rectificación de evidencia y borrador revisado

**Rectificación del análisis inicial:** en el corte anterior se afirmó que no había constancia específica de recontratación y persecución. Una búsqueda posterior identificó fuentes contemporáneas que **sí las respaldan**: [La Crónica](https://lacronica.do/roberto-angel-salcedo-inicia-2017-estreno-plan-perfecto/) describe a los seis empleados recontratados, y [elCaribe](https://www.elcaribe.com.do/sin-categoria/el-plan-perfecto-en-gala-premier/) relata una nueva oferta de empleo por Vicente. Una [crítica de Cinema Dominicano](https://cinemadominicano.com/el-plan-perfecto-imperfecto-plan/) también refiere la persecución policial. La fuente institucional [DGCINE](https://dgcine.gob.do/mas-de-50-mil-personas-han-visto-el-plan-perfecto/) avala el cierre por salud y la conversión del almacén en acopio clandestino.

**Borrador bilingüe ahora registrado en `docs/editorial-sql-replacement-drafts-f23.json`, NO aprobado:**

- **ES:** «Por problemas de salud, Don Pascual vende el almacén de Santo Domingo donde trabajan seis compañeros. El nuevo dueño los contrata nuevamente, sin que ellos sepan que el local se utiliza para almacenar mercancía ilegal. Cuando el engaño sale a la luz, quedan entre las presiones de los responsables del negocio y las sospechas de la policía. Los seis intentarán salir del aprieto en una sucesión de enredos de comedia y acción.»
- **EN:** «Health problems lead Don Pascual to sell his Santo Domingo warehouse, where six coworkers earn their living. The new owner rehires them, but they do not realize the premises are being used to store illegal goods. When the deception comes to light, they find themselves caught between pressure from the people behind the operation and police suspicions. The six try to find a way out amid escalating comic and action-filled complications.»

- **Control editorial:** no atribuir culpabilidad probada ni absolución; corroborar acciones concretas mediante visionado, revisar autonomía redaccional y fidelidad ES/EN. El borrador se modificó con `reviewedBy=null`, `reviewedAt=null`, `status=pendiente_revision`, `deployment=manual_only`.
- **Control histórico:** el estreno comercial **2017-01-19** ya fue corregido en F2.3; esta revisión no modifica fechas.
- **Control de derechos:** las fuentes periodísticas no conceden licencia sobre sus textos; se requiere evaluación humana de autoría y condiciones de uso de la sinopsis SQL previa.
- **Fingerprint:** todo cambio del borrador ES/EN o de sus fuentes altera la huella propuesta. No se generan firmas ni migraciones sin consentimiento documentado.

## 56 — La Lucha de Ana (2012)

- **Ibermedia** describe a Ana como vendedora de flores que busca justicia por el asesinato de su hijo. **Cinema Dominicano** y una nota de **DGCINE** detallan el contexto del Mercado Nuevo y su búsqueda ante las instituciones.
- El borrador evita atribuir un mecanismo concreto del asesinato y no resuelve anticipadamente su lucha; mantener esa precisión.
- La referencia en el JSON a la fecha histórica 2012-04-13 es anterior al cierre de las ocho fechas: el SQL ya fue cotejado con 2012-05-24 en F2.3. **No repetir esa operación**.
- **Decisión sugerida:** conservar el borrador como candidato y verificar por visionado las secuencias posteriores a su búsqueda de justicia; revisar terminología ES/EN.
- Fuentes: [Programa Ibermedia](https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/); [Cinema Dominicano](https://cinemadominicano.com/la-lucha-de-ana-2012/); [DGCINE](https://dgcine.gob.do/programacion-cinemateca-sobre-ruedas-centro-cultural-narciso-gonzalez-2/).

## Criterios de aceptación por cada una de las cinco

Para que una propuesta pase de `pendiente_revision` a una decisión humana atribuida hacen falta, **por película**: contraste factual documentado; lectura ES/EN; identificación de quien revisa y cuándo; evidencia de autoría, originalidad y permiso de reutilización del texto anterior o justificación de sustitución original; ausencia de inferencias no corroboradas; y validación de la huella del borrador definitivo. Registrar la autorización real antes de preparar una migración de sinopsis.

**No se ha verificado:** el texto SQL íntegro comparado por similitud con todas sus fuentes (la captura solo mostró longitud y hash parcial), visionado de las cinco películas, firma de revisor, titularidad de los textos o aprobación comercial.

**Corte actualizado:** 5/5 sinopsis SQL presentes según SSMS y un borrador bilingüe #55 reformulado con fuentes contrastadas; **0/5 sustituciones aprobadas**. Prioridad siguiente: revisión humana atribuida, matriz E-4 de siete campos y oleada alta de 18 piezas E-5.
