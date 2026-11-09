# CineRD — F-2.4: ejecución integrada de los frentes 1–4

**Preparación:** 8 de noviembre de 2026.  
**Objetivo:** unificar el diagnóstico y el trabajo técnico de SQL, revisión editorial, derechos de medios y producción; conservar los bloqueos auténticos que dependen de una decisión humana, una licencia o una infraestructura externa.

> **Regla:** NO actualizar `dbo.Peliculas`, publicar medios de terceros, firmar decisiones, marcar incidencias resueltas ni declarar «producción lista» por pasar pruebas o generar este informe.

## Alcance y resultado en Git

| Frente | Trabajo técnico integrable | Estado del negocio / pendiente |
|---|---|---|
| 1 · Tramas SQL F-2.3 | Cinco candidatos ES/EN, huellas, revisión conjunta, vista previa real, transacción en lote con verificaciones previas | **0/5 autorizaciones SQL** registradas; no se han aplicado las cinco propuestas; requiere respaldo SQL Server restaurable |
| 2 · Editorial E-4/E-5 | Matriz y huellas para **58 piezas**; **7 cambios E-4** ya reflejados en el snapshot; auditoría y libro de autorizaciones por campo | **0/58 E-5**, **58/58 incidencias sin cierre**, **0/7 autorizaciones E-4** |
| 3 · Derechos | CSV de **128** medios visuales: **46 de películas y 82 talentos**; verificador y modo `review` fail-closed en Cloudflare Pages | **0/128 licencias efectivas documentadas**; no se deben incluir imágenes sin autorización en builds públicos |
| 4 · Producción | API Node.js tiene `/health`, `/ready`; Render blueprint con disco `/var/data` y variables sin secretos; CI verifica frontend, backend y builds de derechos | Faltan evidencia de despliegue real, configuración SQL/SMTP, backups con restore probado y validación de flujos de usuario |

## Cambios técnicos adicionales para este lote

1. **Control unificado** `scripts/releaseReadiness14.cjs`. Reutiliza los verificadores existentes de E-4/E-5/F-2.3 y derechos; distingue `technicalOk` de `publicationReady`; enumera los bloqueos en cada frente sin cerrar ninguno artificialmente.
2. **Verificación opcional de SQL real**: con `--live-sql`, reutiliza exclusivamente el `SELECT` parametrizado de cinco películas de `previewEditorialSynopsesLive.js`. No ejecuta `--apply`.
3. **Batería técnica completa**: con `--full`, corre tests backend/frontend, validación de catálogo, lint, compila frontend con `VITE_MEDIA_RIGHTS_MODE=review` y verifica que `dist/` omita medios pendientes. Requiere `npm ci` previamente en ambas carpetas.
4. **Auditoría pública opcional**: con `--online`, ejecuta la auditoría HTTP de `https://cinerd.pages.dev` con `--require-review --skip-ads` (la validación `ads.txt` pertenece a la fase de monetización, fuera del alcance 1–4). Si el usuario define `CINERD_API_ORIGIN` como un origen HTTPS, también prueba `/health` y `/ready`; nunca usa credenciales en URL. Esta verificación no sustituye las pruebas de recuperación de bases de datos.
5. **Corrección de la configuración de Render**: `FRONTEND_URLS` permite explícitamente `https://cinerd.pages.dev` y conserva `https://cinerd.netlify.app` durante la transición; `PUBLIC_APP_URL` apunta a Cloudflare en el blueprint. Esto **prepara** CORS y URLs de producción, no confirma que el entorno Render haya incorporado las variables ni que esté desplegado. `backend/.env.example` conserva `PUBLIC_APP_URL` local, pero incluye Cloudflare en la lista de orígenes permitidos.
6. **CI**: añade pruebas del control conjunto y un diagnóstico informativo al pipeline. El diagnóstico termina con código 0 cuando los libros son coherentes aunque haya aprobaciones pendientes. `--strict` termina con 1 cuando falta algún bloqueo, por lo que **no debe añadirse a CI de todas las ramas mientras no existan las revisiones humanas reales**.

## Un solo bloque de PowerShell

Desde la raíz CineRD, en la rama `feat/f2-editorial-review`:

```powershell
& {
    $ErrorActionPreference = 'Stop'
    git pull --ff-only origin feat/f2-editorial-review
    if ($LASTEXITCODE -ne 0) { throw 'Fallo git pull' }

    npm --prefix backend ci
    if ($LASTEXITCODE -ne 0) { throw 'Falló la instalación backend' }

    npm --prefix frontend ci
    if ($LASTEXITCODE -ne 0) { throw 'Falló la instalación frontend' }

    node --test scripts/releaseReadiness14.test.cjs
    if ($LASTEXITCODE -ne 0) { throw 'Fallaron las pruebas del control 1-4' }

    node scripts/releaseReadiness14.cjs --full --live-sql --online
    if ($LASTEXITCODE -ne 0) { throw 'Falló la verificación técnica o de conexión; revisar los mensajes anteriores' }

    Write-Host 'CineRD: controles técnicos 1-4 ejecutados. Bloqueos humanos/externos todavía pendientes.' -ForegroundColor Yellow
}
```

La auditoría HTTP puede fallar por problemas de red, despliegue o configuración externos; ello **no implica** que la base local haya sido modificada. Para un diagnóstico local más rápido sin conexión real ni pruebas extensas:

```powershell
npm --prefix frontend run release:check
```

Para un resultado JSON legible por otros procesos:

```powershell
node scripts/releaseReadiness14.cjs --json
```

Para exigir todos los requisitos de salida, incluyendo los externos:

```powershell
node scripts/releaseReadiness14.cjs --strict
```

**El modo estricto debe fallar** hasta que todos los bloqueos estén genuinamente resueltos. Los estados documentales no se borran para hacer «verde» el CI.

## Qué no puede ejecutarse de forma legítima desde este repositorio

- **Frente 1:** la actualización real SQL Server sigue prohibida mientras falten decisiones humanas por película y respaldo restaurable probado. Las cinco fichas solo tienen borradores y una consulta real de contraste.
- **Frente 2:** los 58 textos necesitan revisión factual/editorial atribuida, fuentes de respaldo, posible visionado y resolución motivada. Las siete autorizaciones E-4 son independientes y no se deducen del snapshot.
- **Frente 3:** las 128 imágenes deben licenciarse documentalmente **o excluirse**; el modo seguro puede excluirlas del artefacto publicado, pero no concede derechos de uso.
- **Frente 4:** el backend .NET 10 al que se hizo referencia en sesiones locales **no existe en esta rama de GitHub**; esta rama contiene el backend Node.js. No se ha reparado ni probado ese proyecto .NET por este trabajo. La puesta en marcha de SQL Server persistente, correo Resend, certificados, alertas, recuperación de backups, migraciones, configuración de Render y pruebas de usuario final requiere acceso al entorno y evidencia operativa.

## Orden de cierre recomendado

- **Primero**: ejecutar el control completo y corregir **errores técnicos reales**, diferenciándolos de bloqueos documentales.
- **Después**: cerrar la revisión humana del lote SQL y las 58 incidencias, con decisiones verificables.
- **En paralelo**: inventariar medios con licencia, retirar los pendientes del build seguro, revisar fuentes e imágenes de 46 películas y 83 talentos.
- **Finalmente**: verificar el backend activo, Cloudflare, copia restaurable, correo y monitoreo. Solo después considerar el cierre de producción y la monetización.

**Política de seguridad:** no registrar datos personales sensibles, contraseñas, contratos privados ni archivos `.bak` en GitHub. No automatizar decisiones humanas ni ejecutar SQL con credenciales de prueba sobre producción.

## Incidencia de ejecución local (8 de noviembre de 2026)

La prueba conjunta del usuario confirmó: backend **111/112** pruebas aprobadas, frontend/lint/build seguro aprobados, snapshot SQL real de cinco películas intacto y auditoría de Cloudflare pasada. **Se desconoce la prueba backend fallida**: la primera versión del verificador solo imprimió las últimas 450 posiciones del log TAP y mostró dos pruebas JWT que sí habían pasado. No atribuir ese fallo a JWT, SQL, Sharp o Windows sin el bloque exacto \`not ok\`.

Se corrigió \`scripts/releaseReadiness14.cjs\` para mostrar las líneas \`not ok\`, el error de aserción y el contexto del primer fallo, con pruebas de regresión del formateo. También se agregó un job \`backend-windows\` a GitHub Actions para comprobar Node 22 con Windows; no significa que ese job ya haya pasado.

**Para conocer la causa sin repetir instalaciones ni frontend completo, ejecutar una vez desde PowerShell:**

\`\`\`powershell
& {
  git pull --ff-only origin feat/f2-editorial-review
  if ($LASTEXITCODE -ne 0) { throw 'Falló git pull' }
  npm --prefix backend test
}
\`\`\`

El resultado de \`npm test\` contiene el bloque \`not ok\` con el nombre de la prueba. Con ese dato se debe corregir exactamente la causa y repetir la batería. Los **2 avisos moderados backend y 1 frontend** emitidos por \`npm ci\` ameritan \`npm audit\`, pero no ejecutar \`npm audit fix --force\` indiscriminadamente: puede introducir cambios incompatibles.
