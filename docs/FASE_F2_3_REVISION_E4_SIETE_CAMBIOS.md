# CineRD — F-2.3: revisión de evidencia para siete correcciones E-4

**Estado:** contraste de fuentes público y recomendación de verificación, **sin aprobación editorial humana** y **sin ejecución de SQL Server**.  
**Corte de la investigación:** 2026-11-08.  
**Base de datos declarada del snapshot:** `CRUDPeliculas`.  
**Expediente original:** `docs/catalog-corrections-e4.json`.  
**Script existente (vista previa y aplicación controlada):** `backend/scripts/applyEditorialCorrections.js`.

## Resultado de revisión

El ledger E-4 contiene **7 propuestas de modificación en 4 películas**. Todas tienen fuentes externas que favorecen el nuevo dato, pero **no se deben marcar como aplicadas**: el snapshot todavía contiene el valor anterior para las siete filas. Debe existir un responsable que confirme la decisión, el significado del campo `FechaEstreno` y el respaldo de la base.

| ID | Película | Campo | Valor SQL/snapshot | Propuesta E-4 | Contrastación | Decisión pendiente |
|---:|---|---|---|---|---|---|
| 9 | Lotoman | `Genero` | Infantil | Comedia | Ficha histórica y CineDominicano usan **Comedia**, y producción la presentó como película con humor; no equivaler clasificación de audiencia a género | Adoptar Comedia tras revisión humana |
| 9 | Lotoman | `FechaEstreno` | 2011-03-10 | 2011-01-20 | Anuncio de Orange Cinema reportado el 11/01/2011 confirmó estrenarse el **20/01**; premieres **18/01 Santo Domingo**, **19/01 Santiago** | Confirmar que `FechaEstreno` significa estreno comercial en RD |
| 24 | Sanky Panky 3 | `Director` | NULL | Eduardo Transfor Ortiz | ElCaribe y Diario Libre documentan al director **Eduardo «Transfor» Ortiz**; créditos también usan **Eduardo Ortiz** | **Normalización del nombre:** el valor propuesto omite comillas del apodo; confirmar si se conservará `Eduardo Ortiz` como nombre, `Eduardo «Transfor» Ortiz` como artístico, o el texto del ledger |
| 24 | Sanky Panky 3 | `FechaEstreno` | 2018-03-18 | 2018-03-29 | Premier identificada el **26/03/2018** y estreno comercial **jueves 29/03/2018**, documentados por medios contemporáneos | Aceptar 29/03 solo si el campo representa estreno comercial dominicano |
| 30 | El Diablo no duerme en su cama | `Director` | NULL | Amauris Pérez | Reportaje de Acento durante rodaje 2024 identifica a Amauris como director; ficha de producción y Cinema Dominicano coinciden | Confirmar crédito final; las noticias de rodaje **no acreditan estreno definitivo** |
| 32 | Los Rechazados 2: Operación Espacial | `Director` | NULL | Yasser Michelén | **DGCINE** identifica expresamente a Yasser Michelén como director | Corroborar copia de créditos oficiales si disponible antes de firmar |
| 32 | Los Rechazados 2: Operación Espacial | `FechaEstreno` | 2026-09-13 | 2026-08-13 | **DGCINE**, en nota del propio **13/08/2026**, identifica el estreno oficial ese día; cartelera/distribución y prensa coinciden | Adoptar 13/08 si se documenta como estreno comercial en RD |

## Evidencias por película, con jerarquía

### Lotoman — ID 9

- **Fuente contemporánea que reproduce el anuncio del distribuidor:** Diario Libre, 11/01/2011, informó fecha 20 de enero y premieres 18 y 19. https://www.diariolibre.com/revista/lotoman-se-estrena-el-20-de-este-mes-BNDL275224
- **Registro de filmografía:** https://cinemadominicano.com/lotoman-2011/
- **Catálogo de cine dominicano:** https://cinedominicano.com/peliculasdominicanas/pelicula/lotoman-2011/
- **Refuerzo contemporáneo:** Noticias SIN (11/01/2011), anuncio de Orange Cinema. https://noticiassin.com/pelicula-lotoman-llegara-a-los-cines-el-20-de-este-mes/

**Evaluación:** respaldo **alto** para ambas propuestas. Las premieres de los días 18 y 19 **no** justifican cambiar el campo al 18 o al 19.

### Sanky Panky 3 — ID 24

- **Anuncio de distribución previo:** elCaribe (22/03/2018), fecha de estreno 29/03 y dirección Eduardo «Transfor» Ortiz. https://www.elcaribe.com.do/gente/a-y-e/sanky-panky-3-se-estrenara-el-29-de-marzo-en-rd/
- **Noticia del propio estreno:** Listín Diario (29/03/2018), señala llegada a salas ese jueves. https://listindiario.com/entretenimiento/2018/03/29/508408/estreno-de-sanky-panky-historia-entre-rd-y-puerto-rico.html
- **Crónica de premier:** Cinema Dominicano, evento del 26/03 y publicación 28/03. https://cinemadominicano.com/caribbean-cinemas-presenta-sanky-panky-3/
- **Ficha del director:** https://cinemadominicano.com/sanky-panky-3-29-marzo/
- **Entrevista contemporánea al director:** Diario Libre, 29/03/2018. https://www.diariolibre.com/amp/revista/cine/los-sanky-panky-regresan-para-una-tercera-entrega-GD9511558

**Evaluación:** fecha **altamente respaldada**. La identificación de director está respaldada, pero **la normalización del nombre necesita una decisión**: varias fuentes hablan de `Eduardo Ortiz`, `Eduardo «Transfor» Ortiz` o `Transfor Ortiz`, y el ledger propone `Eduardo Transfor Ortiz` sin signos. **No reescribir silenciosamente el ledger**.

**Precisión:** un titular de El Día usa «este lunes» aunque el cuerpo está fechado 29/03/2018; no usar el titular ambiguo como fuente dominante. Evidencias contemporáneas indican **jueves 29/03** y premier **lunes 26/03**.

### El Diablo no duerme en su cama — ID 30

- **Reportaje en el set (Acento, 24/09/2024):** identifica a Amauris Pérez durante el rodaje y menciona estreno **previsto** para 2025. https://acento.com.do/cine/el-cine-necesita-mayor-atencion-del-estado-dominicano-9398428.html
- **Ficha de producción, en fase de rodaje:** https://notisurbani.com/index.php/15-entretenimiento
- **Reseña de producción contemporánea:** https://cinemadominicano.com/el-diablo-no-duerme-en-su-cama-comedia-negra-de-amauris-perez/
- **Artículo adicional con ficha y elenco:** https://cineculturaymas.com/pelicula-el-diablo-no-duerme-en-su-cama-apuesta-dramatica-de-humor-negro/

**Evaluación:** director **bien respaldado** por referencias de rodaje. **No se verificó** con estas fuentes la fecha de estreno comercial definitivo; el anuncio de 2024 de una intención de estrenar en 2025 **no equivale** a prueba de estreno. Este informe no modifica el año del catálogo ni la condición de estrenada.

### Los Rechazados 2: Operación Espacial — ID 32

- **Fuente institucional primaria: DGCINE (13/08/2026):** identifica director, productor, elenco y estreno comercial oficial **13/08/2026**. https://dgcine.gob.do/los-rechazados-2-lleva-la-comedia-y-la-ciencia-ficcion-a-nuevas-audiencias/
- **Cartelera del distribuidor Caribbean Films Distribution:** https://www.conectate.com.do/cartelera-de-cine/Los%2BRechazados%2B2%2B2026
- **Ficha de crítica con equipo y fecha:** https://acento.com.do/cine/los-rechazados-2-estrena-este-jueves-13-con-novedad-de-su-tema-y-la-impecable-factura-del-buen-cine-9735417.html

**Evaluación:** respaldo **institucional y de distribución alto** para los dos valores propuestos.

## Lista para la decisión humana (sin completar)

- [ ] Confirmé el alcance de `FechaEstreno` en CineRD: primer estreno comercial nacional, festival/premier u otro.
- [ ] Revisé **cada uno de los siete campos** y comprobé personalmente al menos la evidencia prioritaria.
- [ ] Comprobé que las fuentes no solo repiten una misma nota promocional cuando existen discrepancias.
- [ ] Decidí la grafía canónica de Eduardo Ortiz / «Transfor» Ortiz.
- [ ] Verifiqué créditos finales de los directores cuando están disponibles.
- [ ] Confirmé que existe un respaldo de la **base SQL Server** válido y un plan probado de recuperación.
- [ ] Verifiqué el estado real de los siete campos **en SQL Server** antes de ejecutar.
- [ ] Registré responsable real, fecha, justificación y autorización de los cambios concretos.
- [ ] Revisé el `git diff` del snapshot recién exportado y sus efectos sobre textos y huellas editoriales.

**Responsable:** PENDIENTE.  
**Decisión final por campo:** PENDIENTE.  
**Permiso para aplicar E-4:** NO registrado en este informe.  
**Migración aplicada:** NO.

## Procedimiento técnico existente

- Vista previa: `npm --prefix backend run catalog:corrections:preview`.
- El script `backend/scripts/applyEditorialCorrections.js` exige `--apply --confirm-db-backup`, se conecta a **SQL Server local** y comprueba valores originales bajo transacción `SERIALIZABLE`, guarda preimagen y realiza cambios. La confirmación por flag **no prueba por sí sola** la existencia de un respaldo restaurable; es tarea del administrador.
- No ejecutar `catalog:import:replace`, no editar `database/seeds/catalog.snapshot.json` manualmente y no sobreescribir cambios ajenos.
- Tras ejecutar legítimamente en un futuro: `npm --prefix backend run catalog:export` y `npm --prefix backend run catalog:validate`; comprobar diff y renovar los fingerprints de E-5 cuando los datos que afectan a identidad o fuentes cambien.
- El validador de F-2.3 aún debe mostrar **7 ajustes E-4 pendientes**, **58 observaciones F-2.3 abiertas**, **0 revisiones E-5** y **0 aprobaciones para migración SQL de sinopsis**.

## Dictamen de este informe

**La evidencia documental es consistente y favorece los siete valores propuestos**, con la salvedad explícita de la **grafía del director en ID 24** y la necesidad de estandarizar qué significa `FechaEstreno`. El expediente está **listo para revisión humana**, no para aplicación desatendida. La confirmación de contenido y de respaldo SQL sigue sin registrarse.

Este archivo **no cambia** `docs/catalog-corrections-e4.json`, SQL Server, huellas, `docs/editorial-issues-f2.json`, aprobaciones ni AdSense.
