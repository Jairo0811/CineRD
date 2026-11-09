# CineRD — fotografías de talentos con licencias libres verificadas (9/11/2026)

## Alcance

Se incorporaron **seis alternativas de fotografías reales**, distintas de las imágenes antiguas de `backend/uploads`, para que la **demo estática en modo review** pueda mostrar retratos cuando el catálogo elimine las fotos con derechos comerciales pendientes.

Las seis proceden de **Wikimedia Commons**, con licencia CC BY o CC BY-SA comercialmente reutilizable **cumpliendo las condiciones de atribución y de compartir igual cuando corresponda**. El código referencia las páginas de cada foto, enlaza la licencia y muestra créditos desde el pie global del sitio. Se respeta el autor y no se afirma que la persona fotografiada respalde CineRD.

| ID | Talento | Archivo de Wikimedia | Autor | Licencia |
| --- | --- | --- | --- | --- |
| 3 | Fausto Mata (Boca de Piano) | [Fausto Mata.jpg](https://commons.wikimedia.org/wiki/File:Fausto_Mata.jpg) | 809 New York Magazine | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| 9 | Miguel Céspedes | [Miguel adjusted.jpg](https://commons.wikimedia.org/wiki/File:Miguel_adjusted.jpg) | 809 New York Magazine | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| 8 | Raymond Pozo | [Raymond adjusted.jpg](https://commons.wikimedia.org/wiki/File:Raymond_adjusted.jpg) | 809 New York Magazine | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| 17 | Aquiles Correa | [Aquiles Correa at Hiram Bithorn Stadium.jpg](https://commons.wikimedia.org/wiki/File:Aquiles_Correa_at_Hiram_Bithorn_Stadium.jpg) | Dawin Manuel | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| 10 | Manolo Ozuna | [Manolo Ozuna.jpg](https://commons.wikimedia.org/wiki/File:Manolo_Ozuna.jpg) | Reynaldo Brito | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| 14 | Tony Pascual / Pachulí | [Tony Pascual.jpg](https://commons.wikimedia.org/wiki/File:Tony_Pascual.jpg) | 809 New York Magazine | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |

En las páginas de estos archivos se declara la licencia indicada y se encuentran los registros del autor y su fuente original. Las fotos se muestran sin modificarse ni descargar/copiar a `backend/uploads`; CSS puede adaptarlas al marco de la tarjeta. Los créditos están disponibles permanentemente en el pie de página.

**No confundir:** el registro `docs/media-rights-ledger.csv` sigue teniendo 128 fotos/pósteres antiguos **PENDIENTE**. Estos seis archivos externos no autorizan esas fotos originales y no modifican su estado. La compilación pública permanece en modo `review`. En desarrollo local, CineRD sigue usando las fotografías propias del backend para que el titular pueda revisar los datos.

Las cuatro entradas de la captura pendientes de una alternativa gratuita verificable son: Cheddy García (#18), Nashla Bogaert (#39), Chelsy Bautista (#45) y Olga Buccarelli (#56). Para ellas se conserva el SVG original de reserva. **No copiar fotos de prensa, Google Imágenes, redes sociales o TMDb sin una licencia apropiada.**

## Límites

- Wikimedia Commons responde desde un servidor de terceros. Si falla la carga, el sitio conserva su fallback SVG.
- El audit automatizado sólo verifica la estructura y lista explícita de estas seis fotos; el hecho jurídico de la licencia se basa en las páginas originales enlazadas.
- La herramienta de cierre comercial reporta 0 medios antiguos copiados. Ese número **no cuenta** estas seis imágenes externas abiertas y no debe interpretarse como ausencia total de fotografías visibles.
- Antes de realizar una comercialización definitiva, reevaluar disponibilidad, atribución, licencia y requisitos legales aplicables.
