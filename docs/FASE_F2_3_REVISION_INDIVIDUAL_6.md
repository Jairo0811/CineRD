# CineRD — F-2.3 · Revisión individual de sinopsis SQL #6

**Película:** *Ladrones a Domicilio* (2008).  
**ID:** 6.  
**Estado:** nueva propuesta editorial bilingüe pendiente de revisión humana. **No sustituye la sinopsis SQL original, no autoriza publicación y no registra cesión de derechos.**  
**Fecha del contraste:** 2026-11-08.

## 1. Hechos contrastados

Bruno es un profesor universitario. La institución en la que trabaja suspende el programa de becas que permitiría apoyar los estudios de su hija. Con la ayuda de su compadre Biembo, consigue un segundo trabajo como **conductor de un vehículo de transporte de valores**. En su primera noche, Bruno y sus compañeros se ven involucrados, sin saberlo, en un **robo planificado desde dentro de la compañía**. La película incorpora sátira y crítica de la corrupción.

**Observación previa F-2.3:** una ficha breve de Cinema Dominicano y el catálogo CineDominicano definen el segundo empleo como «guardia de seguridad», mientras el programa de Casa de América y la nota de Diario Libre sobre el estreno lo identifican como «chofer de transporte de valores». Esta distinción puede reflejar dos grados de precisión sobre el **mismo trabajo**, y no permite concluir que sean dos empleos distintos.

**Cuidado en la redacción:** no se presenta a Bruno como instigador del robo, ni se afirma que el vehículo fuera efectivamente blindado. Se utiliza la frase «transporte de valores» / `cash transport vehicle` para reflejar la información documental sin importar detalles técnicos no acreditados.

**Estreno en República Dominicana:** 14 de agosto de 2008. Coincide con el snapshot SQL y con los anuncios de la época; **no se propone ajuste de fecha para #6**.

## 2. Candidato ES — SIN PUBLICAR

> Bruno, profesor universitario, intenta financiar los estudios de su hija después de que se suspende el programa de becas de la institución donde enseña. Con ayuda de su compadre Biembo, consigue un empleo como conductor de un vehículo de transporte de valores. En su primera noche, él y sus acompañantes quedan atrapados en un robo organizado desde la propia compañía. Para escapar de la maniobra, Bruno deberá recurrir a su habilidad al volante mientras enfrenta una trama de corrupción.

## 3. Candidato EN — SIN PUBLICAR

> When the university where he teaches suspends its scholarship program, professor Bruno looks for another way to fund his daughter's education. With help from his friend Biembo, he takes a job driving a cash transport vehicle. On his first night, Bruno and his companions become caught in a robbery orchestrated from within the company. Escaping the scheme will test his driving skills as he confronts corruption.

**Equivalencia:** se preservan el obstáculo de las becas, el segundo empleo, la intervención de Biembo, el robo organizado y la necesidad de Bruno de salir de la situación. La fidelidad lingüística definitiva debe revisarla una persona responsable.

## 4. Referencias verificables

- **Diario Libre, 18 de julio de 2008:** anuncio contemporáneo de estreno del 14 de agosto, detalle del segundo trabajo, plan de autorrobo y capacidad de conducción de Bruno. https://www.diariolibre.com/amp/revista/ladrones-a-domicilio-se-estrena-14-de-agosto-AADL25057
- **Diario Libre, 4 de julio de 2008:** declaraciones de producción sobre el protagonista, suspensión de becas y el trasfondo sociopolítico. https://www.diariolibre.com/amp/revista/ladrones-a-domicilio-la-nueva-pelcula-del-director-ngel-muiz-YCDL23032
- **Casa de América, 22 de febrero de 2012:** ficha de proyección que identifica expresamente a Bruno como conductor de transporte de valores y su vínculo con Biembo. https://www.casamerica.es/cine/ladrones-domicilio
- **Cinema Dominicano:** ficha técnica, reparto, estreno y sinopsis abreviada que llama «guardia de seguridad» al trabajo. https://cinemadominicano.com/ladrones-a-domicilio-2008/
- **CineDominicano:** catálogo que usa la misma descripción breve de «guardia de seguridad». https://cinedominicano.com/peliculasdominicanas/pelicula/ladrones-a-domicilio-2008/

**Dependencia de fuentes:** varias fichas y publicaciones pueden derivar de un texto de promoción compartido. No deben contarse como verificaciones independientes de la *autoría del texto*, ni confundirse la noticia del argumento con autorización de reproducir párrafos.

## 5. Revisión de derechos y estado del contenido

El texto SQL histórico presenta coincidencias muy altas con descripciones publicadas por terceros y carece en CineRD de autorización de reutilización registrada. No sabemos quién lo redactó originalmente. Ese indicio **no prueba infracción de derechos**, pero tampoco constituye permiso.

La nueva propuesta se redactó desde los hechos argumentales contrastados. **Sigue pendiente** verificar procedencia, originalidad, exactitud narrativa y uso editorial autorizado.

En el registro `docs/editorial-sql-replacement-drafts-f23.json`, #6 está como `draftOrigin: nueva_redaccion_f23`, `status: pendiente_revision` y `deployment: manual_only`. Los registros E-5, F-2.3 y permisos SQL permanecen sin aprobación.

La nueva redacción y las tres fuentes adicionales generan una **huella distinta** de la versión anterior. Cualquier expediente local previo de #6 deberá regenerarse para revisar esa nueva versión.

## 6. Ejecución de pruebas y lectura del expediente

Desde la raíz del repositorio, en PowerShell:

```powershell
node --test backend/tests/editorialReview6.test.js
node --test backend/tests/prepareEditorialHumanReview.test.js
node scripts/verifyEditorialSqlReplacementDrafts.mjs
node backend/scripts/prepareEditorialHumanReview.js --film-id 6 --show
npm --prefix frontend run editorial:readiness
```

No usar `--generate`, `--apply` o permisos ficticios para acelerar las migraciones SQL. Los scripts SQL permanecen sujetos a autorización humana, huella vigente, copia restaurable y procedimientos de reversión.

## 7. Lista humana de validación — SIN COMPLETAR

- [ ] Confirmé personalmente el segundo empleo y los eventos de la primera noche mediante visionado o créditos/material primario.
- [ ] Revisé los matices «guardia de seguridad» y «conductor de valores».
- [ ] Validé que el robo se atribuye al plan de otros participantes y que Bruno no aparece como organizador.
- [ ] Revisé estilo ES, traducción EN y ausencia de material promocional copiado.
- [ ] Determiné la procedencia de la sinopsis SQL previa y la decisión de sustitución.
- [ ] Verifiqué condiciones de uso, permisos y riesgos editoriales.
- [ ] Registré nombre real, fecha, evidencias y decisión atribuible.
- [ ] Autoricé explícitamente o rechacé una migración puntual (sin inferir consentimiento).

**Resultado documental:** nuevo borrador ES/EN preparado; fecha del estreno respaldada; duda del segundo empleo aclarada como diferencia descriptiva; **cero aprobación y cero cambios SQL**. F-2.3 sigue abierta.
