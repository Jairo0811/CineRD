# CineRD — Fases A, B y C: cierre técnico y puertas de salida

**Fecha de corte:** 2026-11-10. **Rama de ejecución:** `feat/cinerd-abc-release-gates-20261110`, derivada de `docs/f23-e4-preflight-sinopsis-20261110`. **Estado:** preparación técnica documentada; **NO** Production Ready / **NO** Commercial Ready.

Este informe separa lo que se puede dejar implementado en GitHub de verificaciones que requieren la identidad de una persona, acceso a proveedores, contraseñas o derechos sobre obras. La ejecución de pruebas automatizadas **no** sustituye verificaciones contractuales, una restauración real ni el despliegue externo.

## Fase A — Editorial

### Entregables terminados en repositorio

- **E-4:** [matriz de siete decisiones](FASE_E4_MATRIZ_DECISIONES_7_CAMPOS_2026-11-10.md), un campo por decisión y con fuentes; preflight SSMS aportado por titular muestra **7/7 valores candidatos ya presentes en SQL**, **0/7 aprobaciones**.
- **Cinco sinopsis SQL:** [expediente bilingüe F2.3](FASE_F23_REVISION_PRELIMINAR_5_SINOPSIS_2026-11-10.md), cinco propuestas ES/EN en `editorial-sql-replacement-drafts-f23.json`, conciliación documental de las 7 fuentes #55 y cinco paquetes de revisión. **0/5 aprobadas**.
- **E-5:** [18 observaciones altas](FASE_E5_OLEADA_ALTA_18_REVISION_2026-11-10.md) + [18 medias y 22 bajas](FASE_E5_OLEADAS_MEDIA_BAJA_40_REVISION_2026-11-10.md): **58/58 expedientes preparados y trazables**, **0/58 decisiones humanas atribuidas**.
- Las **8 fechas F2.3 ya comprobadas** no vuelven a migrarse. Los candidatos E-4 presentes en SQL tampoco deben reescribirse por aparecer en una propuesta.

### Para completar la validación humana

1. Por cada campo E-4, verificar fuente original, procedencia del dato actual, identidad del responsable y hora/zona. Registrar decisión de conservar/rechazar el dato **sin ejecutar UPDATE** si coincide con SQL. Completar `docs/catalog-corrections-e4-approvals.json` solo mediante proceso autorizado y verificable.
2. Por cada sinopsis SQL, cotejar original e idiomas, documentar origen del texto SQL anterior, licencias/uso comercial de contenido antiguo y originalidad de la nueva versión. Registrar aprobación solo tras revisión. Usar los preparadores privados existentes (`backend/scripts/prepareEditorialHumanReview.js`, `backend/scripts/prepareEditorialBatchReview.js`) sin flags de publicación.
3. Por cada pieza E-5, cotejar la versión vigente y su huella contra fuentes verificables y registrar firmante/fecha/evidencia y decisión editorial mediante el libro `docs/editorial-approvals-e5.json` y los controles existentes. **No aprobar por inferencia desde un ensayo histórico o una prueba verde**.
4. Una discrepancia real posterior crea un expediente nuevo con preflight de solo lectura; no usar `CRUD-Peliculas.sql` ni reaplicar el lote F2.3.

**Criterio de cierre A:** 7 decisiones E-4, 5 sinopsis SQL y 58 piezas E-5 revisadas y atribuibles con evidencias, huellas vigentes y sin pasos sin autorización. Mientras tanto, **A = DOCUMENTACIÓN COMPLETA / APROBACIONES PENDIENTES**.

## Fase B — Backend real, SQL y Render

### Entregables técnicos y salvaguardas

- `render.yaml` define servicio Node, `/ready` como health check, disco `/var/data` con uploads y private en directorios separados, TLS SQL y configuración de CORS. **Despliegue automático desactivado (`autoDeployTrigger: off`)**.
- En cada **build** de Render se ejecuta el control de inventario de derechos; antes de arrancar, `node scripts/auditProductionEnv.js --strict` valida las **15 variables mínimas** sin imprimir secretos. **Si faltan, el servidor no inicia**.
- `/health` acredita liveness del proceso; `/ready` requiere conexión SQL real. Ni una prueba unitaria, ni una simple respuesta HTTP 200 de otra aplicación prueban SQL de CineRD.
- **SQL Server no se aprovisiona con el blueprint:** se necesita servidor externo persistente con TLS, firewall/ACL, backups y credenciales de mínimo privilegio. Render ofrece Postgres gestionado, no equivalencia automática con el stack existente SQL Server de CineRD. No sustituir el motor por Postgres mediante una bandera.
- **Costo/operación:** el blueprint usa web `starter` + disco persistente de 5 GB; Render requiere servicio web de pago para disco. No crear servicio facturable ni habilitar auto-deploy sin revisar costo/aceptar plan. Ver [documentación oficial de discos](https://render.com/docs/disks).

### Pasos de activación que requieren acceso a cuentas

1. Seleccionar hosting externo de SQL Server/Azure SQL y documentar ubicación, retención/backups, TLS y control de red. Nunca alojar `.bak` en un directorio público.
2. Revisar el costo del servicio Render `cinerd-api`, definir branch desplegada y aplicar Blueprint solo tras confirmar entorno SQL. Ingresar `DB_SERVER`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`, `RESEND_API_KEY`, `EMAIL_FROM` y secretos **en Render**, no en el repositorio ni en mensajes. El resto de valores mínimos ya figura en el blueprint, sujeto a revisión.
3. Configurar identidad de remitente Resend con dominio verificado; asegurar `PUBLIC_APP_URL` y `FRONTEND_URLS` como los orígenes HTTPS verdaderos.
4. Ejecutar `node scripts/auditProductionEnv.js --strict` **dentro del servicio configurado** y validar que `/ready` retorna `status=ready, database=ok` con el origen HTTPS público. Usar `CINERD_API_ORIGIN=https://<origen-real>` en sesión privada y `node scripts/reportProductionCommercial.mjs --online --json`, sin añadir parámetros sensibles a URL.
5. Migraciones de esquema deben aplicarse solo según plan/backups autorizados; `render.yaml` **no** ejecuta migraciones SQL automáticamente. No usar base `CRUDPeliculas` como staging.
6. Obtener un backup SQL físico, restaurarlo a **otro servidor/base aislada**, validar tablas, lectura de una película y talento, y levantar `/ready` en entorno de recuperación con secretos distintos. **`RESTORE VERIFYONLY` no es una restauración funcional**. Guardar acta de fecha, usuario responsable, ubicación de evidencia, tiempo de recuperación y resultado. No enviar nombres privados de SQL, credenciales ni backups a GitHub.
7. Realizar pruebas manuales de registro, verificación de email, login, refresh, recuperación de cuenta, autorización por roles, carga y protección de archivos, solicitud de crédito y devolución de datos. Configurar monitor externo de `/ready` y alertas HTTP 5xx.

**Criterio de cierre B:** API HTTPS y SQL reales funcionando, 15 variables aprobadas, backup restaurado en entorno independiente, envío de correo probado, autenticación y almacenamiento correctos, monitoreo activado. Hasta entonces, **B = CÓDIGO PREPARADO / ENTORNO REAL NO VERIFICADO**.

## Fase C — Publicación comercial y monetización

### Entregables que sí están cerrados técnicamente

- Catálogo estático protegido en Cloudflare verificado online (`PASS` en revisión previa), con 46 películas, 83 talentos y cubiertas originales; archivo público de 128 medios ajenos bloqueado por `review`.
- API incluye control previo a `express.static` para negar archivos sin derechos efectivos; esta protección debe comprobarse además en el host desplegado y en cualquier CDN/URL directa.
- El registro de derechos contiene **128 fichas, cero permisos comerciales acreditados**. El hecho de estar en web, mencionar crédito o tener una URL no concede reproducción ni monetización.
- `VITE_ADSENSE_ENABLED=false` debe permanecer así. Tener `ads.txt` y verificación de propiedad **no** demuestra la aprobación de Google. No habilitar anuncios si hay contenido/sitio/legal o derechos sin revisar.

### Revisión externa/administrativa indispensable

1. Auditar material ya publicado (texto, marcas, música y cubiertas originales) para determinar autoría, atribución y derechos de distribución, no solo las 128 fotos externas.
2. Elegir permanentemente **modo texto/cubiertas propias** para no depender de las 128 imágenes, o tramitar permiso individual verificable. No registrar `AUTORIZADO` sin prueba y titular.
3. Confirmar HTTPS, dominios, privacidad, cookies, términos, contacto y consentimiento aplicable a las funcionalidades reales; solicitar revisión jurídica RD cuando corresponda.
4. Revisar Google Search Console, canonical, sitemap `/sitemap.xml`, indexación real y posibles problemas de calidad o contenido duplicado.
5. Revisar estado auténtico de cuenta AdSense para el dominio, elegibilidad, políticas y configuración comercial por Google. No inferir aprobación por un build local.
6. Validar CI de la PR final, commit desplegado, smoke test del contenido sin medios pendientes, reglas de acceso de API y rollback. Fusionar PRs solo después de decidir expresamente la salida.

**Criterio de cierre C:** evidencia contractual o exclusión permanente de recursos no autorizados + revisión legal/AdSense real + despliegue final auditado. Hasta entonces, **C = CANAL ESTÁTICO PROTEGIDO / COMERCIAL BLOQUEADO**.

## Comandos de inspección reproducible sin cambios

```powershell
# En el nuevo worktree de revisión:
node --test scripts/verifyF23EditorialRound2.test.mjs scripts/verifyABCReleaseGates.test.mjs
node scripts/verifyABCReleaseGates.mjs
node scripts/reportParallelClosure.mjs
node scripts/reportProductionCommercial.mjs --online
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run lint
$env:NETLIFY="true"
npm --prefix frontend run build
Remove-Item Env:NETLIFY -ErrorAction SilentlyContinue
```

`node scripts/verifyABCReleaseGates.mjs --strict` **debe fallar mientras haya bloqueos externos**; ese fallo es una barrera de salida, no una regresión. La ruta `--json` entrega un reporte sin secretos.

## Estado de las PR

- **PR #55:** F2.3/F2.4 y protección multimedia; permanece **DRAFT**.
- **PR #59:** segunda pasada F2.3/E4/E5 con 317/317 pruebas locales reportadas; permanece **DRAFT**.
- **Rama nueva A/B/C:** agrega 40 expedientes de revisión restantes, verificadores técnicos y salvaguardas de Render/CI. **No fusionar automáticamente** ni confundir un PR nuevo con una API ya desplegada.

**Declaración:** ninguno de estos cambios crea licencias, testimonios de revisores, respaldos reales, proveedores externos, cuentas de correo, aprobación AdSense ni permisos de publicación.
