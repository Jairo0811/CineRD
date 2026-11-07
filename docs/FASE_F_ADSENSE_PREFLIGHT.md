# CineRD — Fase F-1: preparación verificable para AdSense

Fecha de inicio: 7 de noviembre de 2026.  
**Situación:** controles automáticos listos; **NO iniciar publicidad ni solicitar reenvío** sin revisión editorial y validación externa.

## Qué se corrigió

El informe antiguo `scripts/reportAdSenseReadiness.mjs` reflejaba aún las Fases A–D y declaraba algunos estados con indicadores fijos. Ahora consulta **el snapshot, las 58 piezas de E-5, el registro de derechos, las siete correcciones E-4 y la constancia manual de preparación**, sin atribuir aprobaciones inexistentes.

Además:

- `VITE_ADSENSE_CLIENT` y `VITE_ADSENSE_SLOT` sirven para identificar la cuenta y una ranura, **no activan publicidad**.
- Se exige `VITE_ADSENSE_ENABLED=true` de forma **explícita**, y un prebuild bloquea el despliegue si aún faltan aprobaciones editoriales, correcciones SQL, revisión legal, Search Console o evidencia de aprobación del sitio en el panel de AdSense.
- Incluso después de la activación, la ubicación autorizada por ahora es **solo la portada** (después de su contenido); quedan excluidos catálogo/listados, buscador, fichas de autor generadas automáticamente, páginas legales, autenticación y errores.
- El modo `review` de imágenes permanece **obligatorio en producción Cloudflare**. La verificación de cuenta mediante metaetiqueta y ads.txt permanece, aunque la publicidad esté apagada.
- `scripts/verifyStaticPages.mjs` garantiza que las **46 películas** tengan sinopsis prerenderizada y los **83 talentos** contengan un resumen profesional en el HTML inicial.
- GitHub CI comprueba el informe y las protecciones, sin exigir que la revisión manual se simule como terminada.

## Qué significa un informe correcto

```powershell
node scripts/reportAdSenseReadiness.mjs
node scripts/reportAdSenseReadiness.mjs --json
node scripts/reportAdSenseReadiness.mjs --strict
```

El primer y segundo comando muestran un diagnóstico. **`--strict` termina con error mientras falte algo:** esto es deliberado; no hay que desactivar el control para obtener un estado verde ficticio.

Los bloqueos esperados inicialmente son:

- **58 piezas**: 46 sinopsis y 12 contextos pendientes de aprobación humana.
- **7 ajustes E-4** todavía pendientes de aplicar mediante SQL Server y exportar el snapshot.
- Falta evidencia manual del estado de AdSense, Search Console, revisión móvil/accesibilidad, cumplimiento legal y consentimientos.

Las **128 imágenes PENDIENTE** no se muestran en la compilación pública `review`. Las licencias originales no cambian por el hecho de ocultarlas.

## Revisión y cierre manual

**E-4:** revisar fuentes y respaldo SQL antes de ejecutar `npm --prefix backend run catalog:corrections:apply -- --confirm-db-backup`; exportar la nueva versión del snapshot y comprobar diferencias antes de publicarla.

**E-5:** revisar cada texto en ES/EN contra sus fuentes, mejorar la interpretación y firmar exclusivamente los elementos realmente revisados en `docs/editorial-approvals-e5.json`. La huella SHA-256 evita que un texto modificado conserve una aprobación antigua. No basta con marcarlo manualmente como aprobado si no se efectuó la revisión.

**Google Search Console:** comprobar que `https://cinerd.pages.dev/` y las fichas relevantes estén indexables, evaluar inspección de URL y cobertura del sitemap; conservar evidencia real de resultados. El archivo del sitio no autoriza a inventar esos datos.

**Política de privacidad y consentimiento:** confirmar que la información pública describe el tratamiento de datos real. Para visitantes del Espacio Económico Europeo, Reino Unido o Suiza a quienes se muestren anuncios personalizados, Google requiere una CMP certificada compatible con IAB TCF. Es una tarea de configuración y validación externa: no se considera resuelta por un banner ornamental.

**AdSense:** comprobar en el panel de Google si el sitio está autorizado, los avisos del Centro de Políticas, el modo de anuncios y la posibilidad de solicitar revisión. Se requiere aprobación previa para activar anuncios en este flujo.

**Móvil/accesibilidad:** comprobar en navegador real los tamaños de portada, menús, contraste, foco, enlaces y lectura de sinopsis/perfiles con imágenes sustituidas.

Al terminar y documentar esas comprobaciones legítimas, cumplimentar **`docs/adsense-launch-signoff.json`** indicando `reviewedBy`, `reviewedAt`, `notes` y cada indicador correspondiente. El registro se añade al repositorio mediante revisión de cambios.

## Pruebas y publicación

```powershell
git fetch origin
git switch --detach origin/main
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix frontend run editorial:review
node scripts/reportAdSenseReadiness.mjs
node scripts/auditProduction.mjs --require-review
```

Comprobar que el manifiesto público tiene la última referencia de GitHub y `mediaRightsMode=review`, `mediaFilesCopied=0` mientras no haya licencias autorizadas.

## Fuentes de política de Google

- Contenido de valor del editor: https://support.google.com/publisherpolicies/answer/11112688?hl=es
- Restricciones de contenido replicado o autogenerado sin revisión: https://support.google.com/publisherpolicies/answer/11190248?hl=es
- Política de privacidad publicitaria: https://support.google.com/adsense/answer/1348695?hl=es
- Plataforma de consentimiento: https://support.google.com/adsense/answer/13554116?hl=es

**Esta herramienta no puede certificar aprobación de AdSense.** Pasar las pruebas técnicas solo demuestra que CineRD mantiene los controles de seguridad definidos por el proyecto.
