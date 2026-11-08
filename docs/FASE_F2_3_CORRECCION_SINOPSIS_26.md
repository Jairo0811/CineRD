# CineRD — F-2.3, corrección editorial controlada de la sinopsis 26

**Película:** Feo de día, Lindo de noche (2012).  
**ID de catálogo:** 26.  
**Estado:** borrador actualizado, **pendiente de revisión humana**.  
**Tipo de modificación:** precisión argumental ES/EN. **No** altera SQL Server, la fecha de estreno, los créditos, los derechos de imágenes, los anuncios ni el libro de aprobaciones.

## Motivo y evidencia

El borrador indicaba que el protagonista cambia de aspecto «durante ciertas horas del día» y en inglés «for a few hours each day», una formulación ambigua e incluso incompatible con la regla **nocturna** del hechizo. Los registros coinciden en que la transformación ocurre **desde las 8:00 p. m. hasta la medianoche**.

- [Cinema Dominicano — ficha de 2012](https://cinemadominicano.com/feo-de-dia-lindo-de-noche-2012/): sinopsis, dirección, personajes y fecha de estreno.
- [Diario Libre — anuncio del estreno, 16/08/2012](https://www.diariolibre.com/revista/feo-de-dalindo-de-noche-se-estrena-el-13-de-septiembre-MPDL348136): descripción previa al estreno del horario del hechizo.
- [Prime Video — ficha de distribución](https://www.primevideo.com/-/es/detail/0IMQIBW8IUL7WZ2P8TUR8CN2KB): confirma el intervalo 8 p. m. a medianoche.

## Cambio acotado

- **ES:** sustituir únicamente «una apariencia diferente durante ciertas horas del día» por «una apariencia diferente cada noche, desde las ocho de la noche hasta la medianoche».
- **EN:** sustituir únicamente «a handsome version of himself for a few hours each day» por «a handsome version of himself each night from 8 p.m. until midnight».
- Se mantienen personajes, premisa, estructura de párrafos, identidad `ID/título/año`, fuente editorial ya registrada y `estado: pendiente_revision`.
- Se añade una prueba Vitest que comprueba horario, equivalencia ES/EN y estado no aprobado.
- Se actualiza **solo** la observación de la fila `sinopsis:26` en `docs/editorial-issues-f2.json`, manteniendo prioridad alta y `pendiente_verificacion`.

## Riesgos y pasos posteriores

1. Revisión humana ES/EN del borrador modificado antes de aprobarlo o afirmar originalidad.
2. Revisión de procedencia y licencias de los textos, independientemente de que el argumento coincida con referencias.
3. El contenido cambió, por lo que su fingerprint de E-5 **debe** recalcularse desde el texto vigente; no copiar firmas anteriores.
4. Ejecutar:
   ```powershell
   npm --prefix frontend test
   node --test scripts/verifyEditorialIssueMatrix.test.mjs
   node scripts/verifyEditorialIssueMatrix.mjs
   npm --prefix frontend run editorial:review
   ```
5. Resultado esperado: **58 observaciones** (19 altas, 17 medias, 22 bajas), **58 piezas pendientes de aprobación, 0 aprobadas**.

**Nota:** este paso corrige una ambigüedad factual respaldada por varias fuentes; no constituye aprobación de la obra ni autorización comercial de reproducción.
