# CineRD 2.5.1 — Google AdSense Readiness

Este documento define cómo activar publicidad en CineRD sin contaminar rutas privadas ni acoplar el producto a un Publisher ID específico.

## Estado de la integración

La integración queda desactivada por defecto. CineRD solo carga el script de Google AdSense y renderiza un bloque publicitario cuando existen simultáneamente:

- `VITE_ADSENSE_CLIENT` con formato `ca-pub-...`;
- `VITE_ADSENSE_SLOT` numérico;
- una ruta pública elegible.

Si falta cualquiera de esos valores, la aplicación funciona exactamente igual y no reserva espacio de anuncios.

## Rutas elegibles

Los bloques manuales se permiten únicamente en:

- `/`
- `/actores`
- `/peliculas`

Las rutas de autenticación, recuperación, verificación, dashboards, edición, administración y reclamaciones no renderizan anuncios.

Desde la revisión editorial de noviembre de 2026, **las búsquedas** (`/buscar`) y las **fichas de películas y talentos** (`/peliculas/:id`, `/actores/:id`) quedan igualmente excluidas de unidades manuales. El catálogo de fichas se genera desde datos y requiere curaduría humana individual antes de considerarse inventario publicitario elegible.

## Activación

1. Desplegar CineRD en el dominio definitivo.
2. Crear/agregar el sitio en Google AdSense y completar su verificación.
3. Solicitar revisión del sitio.
4. Una vez aprobado, crear una unidad de anuncio display responsive.
5. Configurar en Netlify:

```text
VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT=XXXXXXXXXX
```

6. Volver a desplegar el frontend.
7. Copiar `frontend/public/ads.txt.example` a `frontend/public/ads.txt` y sustituir el Publisher ID por el valor exacto entregado por AdSense.
8. Confirmar que `https://<dominio>/ads.txt` responde HTTP 200 y contiene el Publisher ID correcto.

## Auto Ads

CineRD usa bloques manuales controlados por ruta como configuración segura inicial.

Si se habilita Auto Ads desde la consola de AdSense, configurar exclusiones de páginas para todas las áreas privadas y sensibles, incluyendo al menos:

- `/login`
- `/registro`
- `/recuperar-password`
- `/restablecer-password`
- `/verificar-email`
- `/dashboard`
- `/verificar-perfil`
- `/mi-perfil/*`
- `/admin/*`
- rutas de creación/edición/reparto/créditos
- reclamaciones de perfiles y créditos

La exclusión en código de los bloques manuales no reemplaza las exclusiones configuradas en AdSense para Auto Ads.

## Consentimiento

No implementar un banner casero pretendiendo sustituir los requisitos de Google.

Para regiones en las que Google exige una CMP certificada, configurar desde AdSense la CMP de Google o una CMP de terceros certificada e integrada con IAB TCF.

La Política de Privacidad debe permanecer sincronizada con la configuración real de anuncios, cookies, consentimiento, analítica y proveedores.

## UX y política editorial

- Mantener una etiqueta visible `Publicidad`.
- No colocar anuncios dentro de formularios o junto a controles que puedan provocar clics accidentales.
- No usar anuncios para imitar navegación, botones de descarga o contenido editorial.
- No insertar anuncios dentro de evidencias privadas.
- Mantener una densidad conservadora mientras se mide impacto en experiencia, Core Web Vitals y retención.

## Métricas recomendadas

Al activar AdSense, seguir como mínimo:

- pageviews públicos;
- sesiones orgánicas;
- RPM de página;
- viewability;
- CTR como diagnóstico, no como objetivo de manipulación;
- Core Web Vitals;
- rebote/engagement antes y después de anuncios;
- ingresos por país, especialmente República Dominicana y Estados Unidos.

## Criterio de salida 2.5.1

La preparación técnica puede considerarse completa cuando:

1. CI está verde con la integración desactivada.
2. No existen anuncios en rutas privadas.
3. El Publisher ID y slot se configuran solo por variables de entorno.
4. `ads.txt` se publica únicamente con el Publisher ID real.
5. La CMP se configura en AdSense antes de servir publicidad donde sea requerida.
6. La Política de Privacidad refleja el uso real de publicidad.
7. El sitio ha sido aprobado por AdSense antes de esperar impresiones monetizadas.

## Páginas públicas de información y contacto (noviembre 2026)

CineRD incorpora rutas accesibles desde la demostración de Cloudflare Pages:

- `/privacidad`: Política de Privacidad, con información sobre cookies, publicidad y proveedores.
- `/terminos`: Términos de Uso del catálogo.
- `/contacto`: incidencias públicas del catálogo a través de GitHub Issues y, opcionalmente, un correo oficial de contacto.

El titular autorizó el uso temporal de `jairo_1829@hotmail.com` como correo público para consultas privadas en CineRD. Se muestra en `/contacto` con enlace `mailto:` y se puede sustituir sin editar código al configurar `VITE_CONTACT_EMAIL` durante la compilación de Cloudflare Pages. El correo se publica deliberadamente y podrá recibir mensajes no deseados. GitHub Issues sigue siendo público y no sirve para información sensible.

**Requisitos aún pendientes antes de monetizar:** revisión jurídica de los textos publicados, validación operativa del correo de contacto y, posteriormente, su sustitución por un correo dedicado, confirmación de derechos de uso comercial de fotos/pósteres y proveedores, configuración de CMP cuando corresponda, aceptación de AdSense y activación deliberada de anuncios. Publicar estas páginas no equivale a una garantía de aprobación.


## Incidencia de revisión AdSense (7 de noviembre de 2026)

Google verificó la propiedad de `cinerd.pages.dev`, pero marcó el sitio como **requiere atención** por «Anuncios publicados por Google en pantallas sin contenido de publicadores» (contenido insuficiente o de bajo valor). La captura del titular no identifica URLs concretas. No se debe suponer que un único cambio técnico garantiza aprobación.

### Mejoras técnicas preparadas

- El build genera HTML público indexable sin requerir JavaScript para inicio, catálogos, historia y fichas de películas/talentos. La interfaz interactiva React sigue siendo la principal.
- Metadatos únicos por ficha, canonicals, Open Graph, Twitter Card y datos estructurados `Movie`/`Person` limitados a datos presentes en el catálogo.
- Sitemap construido desde `database/seeds/catalog.snapshot.json`, sin publicar rutas privadas ni buscador.
- `/buscar` se sirve con `noindex,follow` en el HTML inicial y no recibe anuncios manuales.
- Fichas automáticas sin curaduría individual tampoco reciben anuncios manuales; las unidades solo se habilitan después de aprobación y configuración.
- Se preservan las fuentes ya investigadas de la cronología histórica. No se inventan biografías ni críticas.

### Pendientes obligatorios antes de volver a solicitar revisión

1. Inspeccionar desde fuera el HTML desplegado en Cloudflare y al menos varias fichas mediante Google Search Console / Inspección de URLs; verificar la indexabilidad y los códigos HTTP.
2. Realizar **curaduría editorial manual** de las fichas más importantes: contexto, relevancia histórica, atribuciones verificadas, fuentes y redacción propia. La generación automática de HTML por sí sola no resuelve una sanción por contenido de bajo valor.
3. Revisar individualmente derechos/licencias de fotos, pósteres, sinopsis y cualquier material de terceros, en especial el uso comercial.
4. Comprobar que páginas vacías, errores, operaciones de usuario y navegación no muestren anuncios; documentar cualquier cambio en Auto Ads desde la consola de AdSense.
5. Corregir enlaces rotos o datos incompletos, publicar las mejoras y solicitar revisión **solo después** de comprobar todo lo anterior.

Referencia oficial: https://support.google.com/publisherpolicies/answer/11112688?hl=es

### Página editorial original de CineRD

Se publica `/sobre-cinerd`, disponible en español e inglés y enlazada desde navegación y pie de página. Explica el origen del proyecto (prueba técnica en 2021, retomada en 2026), sus objetivos, alcance, límites, metodología de correcciones y condición de proyecto independiente. Esta información se redactó específicamente para CineRD y no se generó mediante plantillas a partir de fichas.
