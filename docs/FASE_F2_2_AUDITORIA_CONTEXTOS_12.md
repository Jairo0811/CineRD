# CineRD — F-2.2: auditoría documental de los 12 contextos ES/EN

**Estado:** contraste documental **preliminar** de cobertura total; no es validación editorial final, prueba de autoría/licencia ni visionado de las películas.  
**Rama:** `feat/f2-editorial-review`.  
**Textos:** `frontend/src/data/editorialPeliculas.js` (4 contextos) y `frontend/src/data/editorialPeliculasFaseA.js` (8 contextos).  
**Catálogo de referencia:** `database/seeds/catalog.snapshot.json` y política `docs/EDITORIAL_POLICY.md`.

**IDs del inventario:** 4, 5, 6, 9, 10, 11, 12, 13, 16, 39, 45 y 56. Cada ficha contiene tres párrafos ES, tres EN y al menos una URL de referencia. El propósito es separar hechos de producción, argumento histórico, lectura temática y discrepancias, **sin modificar textos ni aprobaciones**.

## Matriz de contrastes e incidencias

| ID | Contexto | Datos respaldados / lectura temática | Pendiente de comprobación o mejora | Prioridad |
|---:|---|---|---|---|
| **4** | **Sanky Panky** (2007) | Ficha histórica confirma dirección y estreno; UC3M registra la motivación económica del viaje de Genaro, el resort, Martha y su aspiración de mudarse a Nueva York. ES/EN presentan turismo y movilidad social como **lectura de CineRD**, no intención atribuida al director. | La mención a música/comedia y «diferencias culturales» es un análisis interpretativo plausible, pero no sustituye examen de la película. Revisar referencias específicas del artículo académico digital y alcance de la interpretación. | MEDIA |
| **5** | **Perico Ripiao** (2003) | La ficha histórica respalda la década de los setenta, el encarcelamiento prolongado por burocracia, la fuga y los instrumentos güira, tambor y acordeón. La crítica a la indiferencia institucional está expresada claramente como interpretación propia. | El artículo utiliza «encarcelados durante años»; el registro histórico habla de **diez años**. Precisión opcional tras contraste. La lectura de los instrumentos como «expresión musical reconocible» corresponde a análisis, no hecho comprobado del diseño sonoro. | BAJA |
| **6** | **Ladrones a Domicilio** (2008) | Ficha histórica confirma a Bruno como profesor universitario, la beca frustrada, dirección y guion Ángel Muñiz, reparto y productora Estudio Quitasueño. Estreno **14/08/2008**, consistente con el snapshot. | Distinguir la ocupación del personaje en la **sinopsis SQL** (donde se han detectado descripciones divergentes) de la lectura contextual. Aquí no se precisa el tipo de segundo trabajo, lo cual evita conflicto, pero debe verificarse al armonizar ambos textos. ES/EN correctos en nombres y relaciones generales. | MEDIA |
| **9** | **Lotoman** (2011) | La ficha identifica a Archie López, Raymond Pozo/Modesto, Miguel Céspedes/Manuel, guionistas y empresas productoras. Interpretación sobre riqueza repentina y amistades está señalada como pregunta de CineRD. | **Discrepancia material:** el contexto dice estreno **20/01/2011**, confirmado por ficha histórica, mientras SQL contiene **10/03/2011** y género **Infantil** en vez de **Comedia**. No corregir sin procedimiento E-4 en SQL y confirmación editorial del campo. | **ALTA** |
| **10** | **Vamos de robo** (2014) | La fuente histórica describe empleados bancarios sospechosos tras un robo, reparto, director y estreno en enero 2014. Otra nota publica cifras históricas de taquilla de 2014 atribuidas a SIRECINE/DGCINE. Los ensayos ES/EN **no reproducen cifras** y distinguen métricas históricas de actuales. | **Fecha:** ficha cinematográfica señala **16/01/2014**, mientras SQL conserva **15/01/2014**. Verificar fuente primaria y tipo de fecha; al revisar texto SQL y ensayo, evitar confundir «sospecha» con prueba de culpabilidad. | MEDIA |
| **11** | **Santicló: La Vaina de la Navidad** (2008) | Ficha histórica respalda despido, dificultades familiares, empleo como Santa Claus, dinero y elenco; coincide la identificación de José Enrique Pintor. ES/EN mantienen coherencia narrativa. | Frases como «adaptación de símbolos importados» y «Navidad frente a precariedad» son **interpretación cultural**, no declaraciones documentadas de dirección. Verificar atribución de la productora y grafías `Santi Cló` / `Santicló` al fijar título canónico. | BAJA |
| **12** | **I Love Bachata** (2011) | Ficha histórica confirma comedia musical, personajes Marcos/Tommy/Carlitos, dirección/guion de Roberto Ángel Salcedo, música de Amaury Sánchez y reparto. La lectura de bachata como vínculo social se presenta como interpretación. | **Fecha de estreno:** fuente indica **25/10/2011**, SQL almacena **27/10/2011**. Evitar corregir sin verificar preestreno o apertura comercial. El análisis ES/EN no confunde `música de Amaury Sánchez` con canciones originales de los protagonistas. | MEDIA |
| **13** | **Cristiano de la Secreta** (2009) | Ficha confirma a Eddy, Raymond Pozo, director Archie López, elenco y el ocultamiento de su fe fuera del templo. Texto contextual ES/EN evita emitir juicios religiosos y etiqueta la tensión identidad pública/privada como interpretación. | **Fecha:** estreno **15/01/2009** en referencia y **01/01/2009** en snapshot. No atribuir el 01/01 a un «placeholder» sin evidencia. Verificar créditos de guion antes de aprobación. | MEDIA |
| **16** | **Nueba Yol: ¡Por fin llegó Balbuena!** (1995) | **DGCINE** confirma que fue objeto de una campaña de mercadeo excepcionalmente amplia y reseña el contraste de Balbuena al llegar a Nueva York. **Ciencia y Sociedad** (2018, Gerardo A. Roa Ogando) estudia las representaciones familiares en *Nueba Yol 1* y *(Yuniol)²*. Ambos ensayos ES/EN distinguen ese trabajo académico de la lectura propuesta por CineRD. | Fecha del catálogo **16/08/1995**, mientras Cinema Dominicano cita **17/08/1995**: investigar tipo de exhibición antes de modificar. Evitar convertir la importancia histórica o impacto promocional en cifras de audiencia no respaldadas. | MEDIA |
| **39** | **Colao** (2017) | La ficha respalda caficultor Antonio, Jarabacoa, Santo Domingo, primos, director Frank Perozo y estreno **30/11/2017**. El contraste rural/urbano del ensayo es interpretación argumental identificada. | Citar `Frank Perozo` como **crédito artístico** y no crear entidad adicional respecto del nombre civil largo del snapshot. La referencia al café en el título es lectura temática, no etimología oficial certificada. | BAJA |
| **45** | **Yuniol** (2007) | Cinema Dominicano confirma personajes Yuniol y Junior, reparto Shalim Ortiz/Yuniol y Frank Perozo/Junior, estreno de abril, director Alfonso Rodríguez y producción Antena Latina Films. El ensayo analiza beca y desigualdad sin afirmar representatividad total. | **Variantes de título:** la ficha histórica usa `(Yuniol)²`, y la revista académica dice `Yuniol 2`; SQL usa `Yuniol`. Documentar alias/canon antes de cambiar título. Precisión académica: el estudio de 2018 analiza **familia e ideología**, no prueba directamente todas las interpretaciones sobre movilidad educativa del ensayo CineRD. | MEDIA |
| **56** | **La lucha de Ana** (2012) | **Ibermedia** confirma drama dominicano, vendedora de flores que busca justicia por su hijo asesinado y dirección **Bladimir Abud**. Cinema Dominicano informa estreno **24/05/2012**. El ensayo identifica la lectura de desigualdad, duelo e instituciones como propia. | **Fecha SQL: 13/04/2012** frente a **24/05/2012** en ficha histórica. Ibermedia solo respalda el **año 2012**, no el día de estreno. La fórmula «circuito de apoyo cinematográfico» debe entenderse por su registro en Ibermedia, sin inferir subvenciones específicas. | **ALTA** |

## Fuentes verificadas y enlaces de referencia

1. Sanky Panky: https://cinemadominicano.com/sanky-panky-2007/ ; ficha del proyecto UC3M https://humanidadesdigitales.uc3m.es/s/cine-de-movilidad/item/17937
2. Perico Ripiao: https://cinemadominicano.com/perico-ripiao-2003/
3. Ladrones a Domicilio: https://cinemadominicano.com/ladrones-a-domicilio-2008/
4. Lotoman: https://cinemadominicano.com/lotoman-2011/
5. Vamos de robo: https://cinemadominicano.com/vamos-de-robo-2014/ ; nota de taquilla https://cinemadominicano.com/vamos-de-robo-alcanza-la-cima-de-la-taquilla-en-2014/
6. Santi Cló: https://cinemadominicano.com/santi-clo-la-vaina-de-la-navidad-2008/
7. I Love Bachata: https://cinemadominicano.com/yo-amo-la-bachata-i-love-bachata-2011/
8. Cristiano de la Secreta: https://cinemadominicano.com/cristiano-de-la-secreta-2009/
9. Nueba Yol: https://dgcine.gob.do/de-interes/filmar-en-rd/el-cine-en-republica-dominicana/ ; Cinema Dominicano https://cinemadominicano.com/nueba-yol-por-fin-llego-balbuena-1995/ ; Roa Ogando (2018) https://revistas.intec.edu.do/index.php/ciso/article/view/1161
10. Colao: https://cinemadominicano.com/colao-2017/
11. Yuniol: https://cinemadominicano.com/yuniol2-2007/ ; artículo de Roa Ogando (2018) https://revistas.intec.edu.do/index.php/ciso/article/view/1161
12. La lucha de Ana: https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/ ; https://cinemadominicano.com/la-lucha-de-ana-2012/

## Revisión transversal ES/EN y alcance de las conclusiones

- La estructura de los 12 contextos contiene **tres párrafos ES y tres EN** con asuntos correspondientes. No se detectaron inversiones evidentes de personaje, película o fecha al comparar sus pares, pero **queda pendiente una corrección de estilo línea por línea por un revisor**.
- Los textos **mezclan hechos documentales y análisis cultural** de manera mayormente explícita. Cada afirmación sobre intención del director, trascendencia histórica, recepción social, recaudación o valor moral requiere **atribución expresa o lenguaje interpretativo**, no afirmarse como realidad acreditada por la ficha argumental.
- **Prioridad de coherencia de datos:** IDs **9 y 56**; secundarios **10, 12, 13 y 16**. Estas incidencias **no se resuelven editando la copia estática**: investigar fuente primaria, respaldar SQL Server y aplicar el flujo E-4.
- El control de `editorialReviewAudit.mjs` verifica existencia/formato de fuentes, longitud, fingerprint, firma y atributos básicos; **no verifica por sí mismo si el contenido es original, veraz o autorizado**.
- Ninguno de los enlaces de referencia transfiere derechos de reproducción, incluso cuando confirma hechos de la película.
- La cobertura de este informe no constituye recepción crítica, peritaje de licencias, visionado ni permiso para monetización; **no crear aprobaciones humanas simuladas**.

## Estado acumulado de F-2.2

- **46/46** sinopsis documentadas con **contraste preliminar**, mediante F-2.2 SQL y lotes editoriales 1–5.
- **12/12** contextos ES/EN con **contraste preliminar** en este informe.
- **58/58 piezas** con informe de cobertura documental preliminar, **0/58 aprobadas humanamente**.
- Pendiente para F-2.3: **matriz consolidada de incidencias, decisiones editoriales, revisión de licencias/procedencia, verificación humana, corrección y firma por contenido**.
- AdSense permanece desactivado y las imágenes sin autorización comercial registrada siguen excluidas en builds Cloudflare `review`.

**Regla de cierre:** sin fuentes primarias suficientes o con discrepancias abiertas, marcar la afirmación como `pendiente_verificacion`, no como verificada; sin firma humana y fingerprint vigente, mantener `pendiente_revision`.
