# CineRD — F-2: proteger las vistas previas de Cloudflare Pages

**Objetivo:** impedir que un despliegue de preview publique las 128 imágenes sin documentación de derechos comerciales. Este control aplica a todas las ramas desplegadas **por Cloudflare Pages**, no solo `main`.

## Qué cambia

- `CF_PAGES=1` obliga `review` tanto en `main` como en cualquier rama preview, aunque falte `VITE_MEDIA_RIGHTS_MODE` o esté configurado como `pilot` o `normal`.
- La compilación `review` utiliza el registro `docs/media-rights-ledger.csv`. Los medios sin autorización comercial registrada se excluyen del catálogo y de `dist`.
- El desarrollo local no cambia: para obtener un artefacto seguro fuera de Cloudflare, indicar `VITE_MEDIA_RIGHTS_MODE=review` **antes de construir**. No publicar un `dist` local construido en modo normal.
- Este cambio no activa anuncios, no aprueba sinopsis, y no acredita licencias.

## Verificación local que reproduce un preview

En PowerShell, dentro de la carpeta raíz del repositorio:

```powershell
$env:CF_PAGES = "1"
$env:CF_PAGES_BRANCH = "feat/f2-editorial-review"
$env:VITE_DEMO_MODE = "true"
Remove-Item Env:VITE_MEDIA_RIGHTS_MODE -ErrorAction SilentlyContinue

node --test scripts/resolveMediaRightsBuildMode.test.mjs
npm --prefix frontend run build
node scripts/verifyRightsReviewBuild.mjs
Get-Content frontend/dist/demo/deploy-status.json | ConvertFrom-Json |
  Select-Object mediaRightsMode, mediaFilesCopied

Remove-Item Env:CF_PAGES,Env:CF_PAGES_BRANCH -ErrorAction SilentlyContinue
```

**Resultado esperado con el registro actual:** `review` y `0` archivos copiados. Las 128 imágenes siguen pendientes de evidencia, no autorizadas.

## Límites y controles adicionales

Esta política **solo detecta builds que declaran `CF_PAGES=1`**, por lo que Netlify u otros despliegues necesitan fijar `VITE_MEDIA_RIGHTS_MODE=review` de forma explícita o una política equivalente de bloqueo.

La política protege medios del catálogo gestionados por `createRightsReviewCatalog`. Conviene seguir auditando cualquier otra ruta estática añadida en el futuro.

No fusionar o publicar por ver únicamente un `vite build` exitoso. Comprobar también `node scripts/verifyRightsReviewBuild.mjs`, el manifiesto generado y la URL pública del despliegue.
