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
- `/buscar`
- `/actores`
- `/actores/:id`
- `/peliculas`
- `/peliculas/:id`

Las rutas de autenticación, recuperación, verificación, dashboards, edición, administración y reclamaciones no renderizan anuncios.

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
