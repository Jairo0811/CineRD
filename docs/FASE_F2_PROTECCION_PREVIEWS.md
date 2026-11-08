# CineRD — F-2: protección de previews de Cloudflare Pages

El modo de derechos `review` se aplica a **todas** las compilaciones con `CF_PAGES=1`, no solo a la rama `main`.

- Previene distribuir accidentalmente las 128 imágenes sin autorización del catálogo desde las ramas de vista previa.
- El registro `docs/media-rights-ledger.csv` sigue determinando qué imágenes tienen autorización documentada. El modo de revisión no equivale a licencia.
- Builds locales u otros proveedores requieren `VITE_MEDIA_RIGHTS_MODE=review` explícito; los builds realizados en `normal` no deben publicarse.
- AdSense continúa desactivado; no se alteran aprobaciones editoriales.

## Verificación

```powershell
$env:CF_PAGES = "1"
$env:CF_PAGES_BRANCH = "feat/f2-editorial-review"
$env:VITE_DEMO_MODE = "true"
Remove-Item Env:VITE_MEDIA_RIGHTS_MODE -ErrorAction SilentlyContinue

node --test scripts/resolveMediaRightsBuildMode.test.mjs
npm --prefix frontend run build
node scripts/verifyRightsReviewBuild.mjs
Get-Content frontend/dist/demo/deploy-status.json | ConvertFrom-Json | Select-Object mediaRightsMode, mediaFilesCopied

Remove-Item Env:CF_PAGES,Env:CF_PAGES_BRANCH -ErrorAction SilentlyContinue
```

Resultado esperado con el registro actual: `review` y cero imágenes de terceros copiadas. Se debe contrastar además el despliegue público.
