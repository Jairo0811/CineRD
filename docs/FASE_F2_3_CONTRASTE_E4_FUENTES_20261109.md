# CineRD — contraste externo E-4 (9 de noviembre de 2026)

**Estado:** comprobación documental preliminar; **NO es aprobación humana**, no significa que una licencia, corrección SQL ni publicación haya sido autorizada. No se modifica el libro de decisiones E-4, el catálogo ni la base SQL. Las fuentes se consultaron en línea; disponibilidad y precisión deben volver a comprobarse antes de firmar una decisión editorial.

**Criterio de FechaEstreno:** primera exhibición comercial en salas de la República Dominicana; distinguir gala premier, estreno en el extranjero, festivales o fecha de publicación del artículo.

| Film ID | Obra / campo | Dato actual → propuesta | Contraste documental de fuentes | Decisión |
|---|---|---|---|---|
| 9 | Lotoman / Género | Infantil → Comedia | Coinciden Cinema Dominicano, CineDominicano.com y cobertura contemporánea de 2011. | PENDIENTE de revisor |
| 9 | Lotoman / FechaEstreno | 2011-03-10 → 2011-01-20 | Cinema Dominicano, CineDominicano.com y Diario Libre 11/01/2011 publicaron estreno 20/01; la gala premier fue 18/01 (Santo Domingo) y 19/01 (Santiago). | PENDIENTE de revisor |
| 24 | Sanky Panky 3 / Director | NULL → Eduardo Transfor Ortiz | El Caribe (2018) escribe «Eduardo “Transfor” Ortiz»; Diario Libre usa «Eduardo Ortiz (Transfor)». **Revisar grafía canónica**: el apodo no necesariamente integra el nombre legal o de crédito cinematográfico. | PENDIENTE de revisor |
| 24 | Sanky Panky 3 / FechaEstreno | 2018-03-18 → 2018-03-29 | El Caribe y Diario Libre anunciaron 29/03/2018; Diario Libre publicó nota del día indicando «se estrena hoy». Premier reportada para 26/03, distinta de exhibición comercial. | PENDIENTE de revisor |
| 30 | El Diablo no duerme en su cama / Director | NULL → Amauris Pérez | Cinema Dominicano (Felix Lora, 2024) y reportajes del rodaje atribuyen dirección a Amauris Pérez. Conviene confirmar crédito final y grafía (otras fuentes escriben «Amaury»). | PENDIENTE de revisor |
| 32 | Los Rechazados 2: Operación Espacial / Director | NULL → Yasser Michelén | Dirección General de Cine (DGCINE, 13/08/2026) identifica a Yasser Michelén. CineDominicano.com coincide. | PENDIENTE de revisor |
| 32 | Los Rechazados 2: Operación Espacial / FechaEstreno | 2026-09-13 → 2026-08-13 | DGCINE 13/08/2026 afirma estreno oficial en cines ese jueves; CineDominicano.com también registra 13/08. | PENDIENTE de revisor |

## Fuentes consultadas

1. Lotoman — Cinema Dominicano: https://cinemadominicano.com/lotoman-2011/
2. Lotoman — CineDominicano.com: https://cinedominicano.com/peliculasdominicanas/pelicula/lotoman-2011/
3. Lotoman, anuncio original — Diario Libre, 11/01/2011: https://www.diariolibre.com/revista/lotoman-se-estrena-el-20-de-este-mes-BNDL275224
4. Sanky Panky 3 — El Caribe, 22/03/2018: https://www.elcaribe.com.do/gente/a-y-e/sanky-panky-3-se-estrenara-el-29-de-marzo-en-rd/
5. Sanky Panky 3 — Diario Libre, 29/03/2018: https://www.diariolibre.com/revista/cine/los-sanky-panky-regresan-para-una-tercera-entrega-GD9511558
6. El Diablo no duerme en su cama — Cinema Dominicano: https://cinemadominicano.com/el-diablo-no-duerme-en-su-cama-comedia-negra-de-amauris-perez/
7. El Diablo no duerme en su cama — Acento, reportaje de rodaje 2024: https://acento.com.do/cine/el-cine-necesita-mayor-atencion-del-estado-dominicano-9398428.html
8. Los Rechazados 2 — DGCINE (órgano público sectorial): https://dgcine.gob.do/los-rechazados-2-lleva-la-comedia-y-la-ciencia-ficcion-a-nuevas-audiencias/
9. Los Rechazados 2 — CineDominicano.com: https://cinedominicano.com/estreno/los-rechazados-2/

## Qué falta antes de aplicar

- Revisar de manera humana los siete campos, priorizar las dos dudas de nombre canónico y documentar la decisión, nombre del revisor, fecha con zona y evidencia en el libro E-4. La coincidencia de páginas web por sí sola no acredita una decisión.
- Crear y **restaurar en una base aislada** una copia SQL válida; `RESTORE VERIFYONLY` no equivale a restauración efectiva.
- Ejecutar `npm --prefix backend run catalog:corrections:live:preview` y confrontar los datos de SQL con el valor esperado, sin escribir.
- Solo después de cumplir el gate E-4 y aprobar individualmente, considerar la aplicación supervisada transaccional y reexportar el snapshot.

**Resultado actual:** siete propuestas con soporte documental revisado, **cero cambios autorizados** y **cero SQL escritos** por esta revisión. E-5 sigue con 58 textos sin aprobación humana. No inferir `LOCAL_READY` ni `COMMERCIAL_READY`.
