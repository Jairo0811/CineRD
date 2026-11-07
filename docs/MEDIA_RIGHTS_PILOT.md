# CineRD — Piloto documental de cuatro imágenes de películas

**Fecha:** 7 de noviembre de 2026  
**Estado:** PREPARADO PARA REVISIÓN — no se activa automáticamente en producción.

## Qué hemos encontrado

Los cuatro archivos de imagen siguen sin procedencia exacta del JPG/JPEG, sin identificación comprobada del titular del arte y sin autorización documentada para reproducirlo en un sitio con publicidad. La ficha de una película permite identificar **productoras potenciales para una consulta**; no acredita la titularidad del póster ni del archivo concreto.

| ID | Película | Productora(s) identificadas | Fuente para investigar |
|---:|---|---|---|
| 16 | Nueba Yol (1995) | D’ Película, Cigua Films | https://cinemadominicano.com/nueba-yol-por-fin-llego-balbuena-1995/ |
| 5 | Perico Ripiao (2003) | Cigua Films | https://cinemadominicano.com/perico-ripiao-2003/ |
| 4 | Sanky Panky (2007) | Premium Latin Films | https://cinemadominicano.com/sanky-panky-2007/ |
| 56 | La lucha de Ana (2012) | Imakonos | https://www.programaibermedia.com/proyectos/la-lucha-de-ana-2/ |

Los cuatro registros permanecen como `PENDIENTE` en `docs/media-rights-ledger.csv`. No se han realizado contactos ni solicitudes de licencia. La columna `source_url` está vacía porque **no se comprobó la procedencia de los archivos locales**, aunque sí se encontraron fuentes sobre las películas.

## Sustitución provisional original (vista previa)

Para ensayar una alternativa sin fotografías ni pósteres de terceros, se creó la cubierta tipográfica **CINERD · ARCHIVO**. Usa degradados originales, una composición con perforaciones de película, el título y el año registrados. La cubierta advierte que no es un afiche oficial. La lógica funciona como fallback también cuando una ficha no tiene `Foto`.

En el modo `VITE_MEDIA_RIGHTS_MODE=pilot`:

- El catálogo `dist/demo/catalog.json` oculta las fotos de cuatro películas (IDs 4, 5, 16 y 56), sin alterar el snapshot original ni SQL Server.
- Sus archivos `/uploads/peliculas` no se copian al build. Se eliminan los residuos del directorio generado `frontend/public` si quedaron de una compilación previa; **nunca** se borra un archivo de `backend/uploads`.
- Las demás imágenes permanecen: el piloto no certifica los otros 124 medios.
- El job de GitHub Actions `rights-pilot` prueba el escenario en Linux y verifica la ausencia de archivos excluidos.

### Comprobación local en PowerShell

```powershell
cd "C:\Users\jairo\OneDrive\Escritorio\PROYECTOS DE PROGRAMACION\PERSONALES\CineRD"
$env:VITE_MEDIA_RIGHTS_MODE = "pilot"
npm --prefix frontend run build
node scripts/verifyRightsPilotBuild.mjs
Remove-Item Env:\VITE_MEDIA_RIGHTS_MODE
```

La variable es exclusivamente de **compilación**. No activarla en Cloudflare sin verificar antes que el resultado visual sea aceptable. Para volver al modo normal basta recompilar sin la variable o sin `pilot`.

## Mensaje sugerido para solicitar autorización (NO ENVIADO)

**Asunto: Consulta sobre derechos del afiche de [Película y año]**

Estimado equipo:

CineRD es un proyecto independiente de documentación y preservación informativa del cine dominicano. Estamos revisando los derechos de reproducción de las imágenes del catálogo.

Quisiéramos identificar al titular de los derechos del afiche de **[Película]** y conocer si puede concedernos permiso **por escrito** para alojar una copia en nuestra ficha informativa, con atribución apropiada y contemplando el posible uso de publicidad en el sitio.

¿Podrían indicarnos la persona o entidad responsable del arte y las condiciones aplicables (alcance, vigencia, atribución, publicación y uso comercial)? Si no gestionan los derechos, agradeceremos cualquier orientación hacia su titular.

Muchas gracias por su colaboración.

Equipo CineRD — dirección de contacto publicada en el sitio.

### Verificación requerida antes de cambiar el CSV

1. Comprobar de dónde salió el archivo **exacto** del repositorio, no solo dónde aparece otro póster visualmente parecido.
2. Verificar qué persona o empresa puede autorizar el uso del diseño y fotografía.
3. Obtener prueba válida de licencia/permiso, incluyendo reproducción web y eventual monetización.
4. Archivar contratos o correos con evidencias **fuera de Git**; registrar solo su identificador en `evidence_ref`.
5. Si no se obtiene permiso, optar por la cubierta propia o retirarlo del catálogo público en una fase de despliegue autorizada.

### Límites

- No se ha confirmado que ninguna de las cuatro imágenes sea de TMDb. Un ID de TMDb no demuestra procedencia.
- TMDb distingue API no comercial y acuerdos comerciales (https://developer.themoviedb.org/docs/faq), y no reclama propiedad sobre todas las imágenes de la API.
- El problema comunicado por AdSense fue **contenido insuficiente/de bajo valor**, no un dictamen específico sobre derechos de los pósteres. Esta medida no garantiza aprobación.
- La revisión jurídica de las otras 124 imágenes, los logotipos y otros recursos aún está pendiente.


## Refinamiento editorial premium (noviembre de 2026)

El componente `PosterOriginal` tiene ahora cuatro ilustraciones vectoriales originales (SVG/CSS), con una identidad gráfica diferenciada según el ID verificado del catálogo. Se respeta el estilo CineRD, sin utilizar pósteres, fotogramas, fotografías ni logotipos de terceros:

- **ID 16, Nueba Yol:** arquitectura urbana abstracta y líneas de recorrido (azul/cian).
- **ID 5, Perico Ripiao:** disco y notas musicales abstractas (naranja/cobre).
- **ID 4, Sanky Panky:** sol y olas geométricas (azul turquesa).
- **ID 56, La lucha de Ana:** flor simbólica y haces de luz (violeta/rosa).

Para cualquier otra ficha sin imagen se utiliza una bobina abstracta genérica. Las cubiertas muestran el título, identidad editorial y motivos gráficos; **no repiten el año visualmente** porque la tarjeta ya tiene un marcador. El año permanece en la descripción accesible para lectores de pantalla. El código y las pruebas usan `peliculaId` para distinguir las variantes, sin heurísticas inestables sobre el título. El modo piloto continúa desactivado por defecto y no modifica archivos multimedia originales.


## Licencias individuales posteriores a este piloto

Cada cartel prioritario se evalúa por su **ruta exacta** y por el ID y campo de su película. En modo piloto, si el registro contiene un permiso válido en estado `AUTORIZADO`, con evidencia, titular, alcance `WEB_MONETIZADA` y vigencia `license_until`, **solo esa imagen** vuelve al catálogo y se copia al artefacto. Los demás carteles permanecen con las cubiertas propias.

No hace falta cambiar el código o desactivar todo el modo piloto cuando una productora autorice uno de los cuatro afiches. Es suficiente registrar la licencia comprobada en `docs/media-rights-ledger.csv`, recompilar y comprobar. El documento privado con la autorización NO debe incluirse en GitHub. No existe actualmente ningún `AUTORIZADO` real.
