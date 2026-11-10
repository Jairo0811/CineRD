# CineRD — Primera pareja de cierre: contenido editorial y medios

**Rama:** `feat/f2-editorial-review`. **Fecha:** 8 de noviembre de 2026.  
**Alcance:** puntos **1. calidad editorial** y **2. derechos multimedia**. No implica liberar producción ni aprobar AdSense.

> **Actualización 09/11/2026 (posterior a este reporte histórico de 08/11):** las ocho fechas autorizadas por el titular fueron ejecutadas según SSMS y sincronizadas por snapshots GitHub `f93db85` y `864d26a`. El verificador público ahora informa **3 avisos restantes** (1 fecha histórica de *Nueba Yol 3* sin prueba primaria independiente, 2 casos retenidos) y 5 fechas corregidas. Las **7 autorizaciones E-4, 58 E-5, 5 reemplazos de sinopsis SQL y 128 medios** siguen pendientes. No confundir las ocho fechas F-2.3 con las siete propuestas E-4. La planificación simultánea de contenido y producción está en [PLAN_CIERRE_PARALELO_E4_E5_PRODUCCION_2026-11-09.md](PLAN_CIERRE_PARALELO_E4_E5_PRODUCCION_2026-11-09.md). Lo descrito abajo refleja la implementación histórica del 08/11 y no sustituye este estado posterior.


## 1. Publicación editorial más precisa

En la UI de `PerfilPelicula` se añadió un aviso contextual, **en español e inglés**, para las ocho fichas del expediente F-2.6:

- **Fechas candidatas sin corregir:** #27 Lotoman 003, #36 Nueba Yol 3, #40 Colao 2, #42 Andrea, #44 Playball, #56 La Lucha de Ana.
- **Estreno comercial no confirmado:** #31 Entiérrenlo Parao.
- **Clasificación de género mixta:** #47 Pimp Bullies.

Se aclara que el dato mostrado **está en revisión** sin sustituir la fecha o el género registrado en SQL Server. No se publican las fechas propuestas como si ya hubieran sido aprobadas. El aviso **no se retira automáticamente** si la base cambia: hacerlo exige cierre editorial atribuido.

El módulo `frontend/src/data/revisionCatalogo.js` mantiene los avisos visibles. El comando `npm --prefix frontend run editorial:public:verify` cruza el módulo con el expediente F-2.6 y el snapshot y detecta desincronizaciones de IDs, títulos, fechas, tipos y estados. La comprobación está integrada como **prerrequisito del build** para impedir publicaciones silenciosas con un aviso obsoleto.

**Pendientes reales:** 58 incidencias en la matriz original, 12 contextos editoriales, 41 sinopsis de respaldo y cinco sinopsis SQL pendientes de las decisiones/revisiones humanas correspondientes. Los avisos públicos no cierran ninguna observación ni verifican exactitud por sí solos.

## 2. Recursos visuales más seguros

`frontend/src/utils/talentoPlaceholder.js` deja de depender de dos retratos WebP de reserva y utiliza **siluetas SVG abstractas creadas en el código de CineRD**, sin fotos de personas, imágenes externas, logotipos ni solicitudes HTTP. Se conserva la paleta de respaldo por variante y la misma API `obtenerFotoTalento` / `manejarErrorFotoTalento` de componentes existentes.

- Los retratos se generan como data-URI local, por lo que tampoco se cargan desde un servidor externo.
- Un fallo de descarga de foto usa el nuevo respaldo SVG y desactiva el bucle de error de `img`.
- El SVG no sustituye las verificaciones de derechos de una foto real existente.
- Los archivos WebP antiguos quedan sin referencia directa en el módulo, pero no se borran del repositorio sin auditoría de dependencias.
- El catálogo estático desplegado en Cloudflare/Netlify ya usa `review` y excluye las **128 imágenes pendientes** registradas en `docs/media-rights-ledger.csv`. Estas 128 siguen **sin permiso acreditado**. El cambio actual mejora los respaldos visuales, no autoriza esas imágenes.

**Importante:** el filtro de derechos del catálogo estático no demuestra protección equivalente en todos los endpoints de la API real. Antes de un lanzamiento con API, verificar que los endpoints públicos no filtren fotos sin licencia. Los SVG de reserva no pueden emplearse como argumento de que todas las imágenes ya son utilizables comercialmente: hay que auditar también branding, iconos y recursos auxiliares.

## Control técnico y siguientes decisiones

- `npm --prefix frontend test`: incluye pruebas de avisos ES/EN, IDs, variantes, SVG y fallbacks.
- `npm --prefix frontend run editorial:public:verify`: coteja las ocho advertencias públicas con la investigación F-2.6 y el snapshot.
- `npm --prefix frontend run build`: verifica aviso, derechos, catálogo y artefactos públicos; los medios sin licencia permanecen ocultos en Cloudflare/Netlify.
- **Sin UPDATE SQL, sin nueva aprobación editorial, sin licencia inventada y sin activar anuncios**.

Para cerrar realmente los puntos 1 y 2 hacen falta revisión factual de las 58 observaciones con decisiones humanas verificables y obtener prueba documental de licencias individuales o mantener las imágenes pendientes excluidas. No se automatizan esas decisiones.

Una vez terminado este frente técnico, la siguiente pareja acordada es **3. infraestructura de producción** y **4. monetización**, que debe quedar desactivada hasta cumplir requisitos reales.
