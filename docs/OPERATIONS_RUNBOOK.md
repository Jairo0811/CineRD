# CineRD — Operations Runbook

## Health and readiness

- `GET /health`: confirma que el proceso HTTP está activo.
- `GET /ready`: confirma proceso + conectividad básica con SQL Server.
- El proveedor cloud debe usar `/ready` para health checks de producción.
- Cada respuesta incluye `X-Request-ID`; los logs HTTP se emiten como JSON para correlación.

## Storage

Producción debe definir `UPLOADS_DIR` y `PRIVATE_STORAGE_DIR` sobre almacenamiento persistente. El blueprint de Render monta `/var/data` y separa `/var/data/uploads` de `/var/data/private`.

Nunca publicar `PRIVATE_STORAGE_DIR` mediante `express.static`. Las evidencias privadas deben continuar sirviéndose únicamente desde endpoints autenticados/autorizados.

## Backups mínimos

### SQL Server

- Backup completo diario.
- Retención recomendada inicial: 30 días.
- Copia adicional semanal fuera del mismo proveedor/región cuando el presupuesto lo permita.
- Probar una restauración al menos trimestralmente y documentar fecha, duración y resultado.

### Archivos

- Incluir el volumen persistente en snapshots/backups del proveedor.
- Mantener copia de `uploads` y `private` coherente con la base de datos.
- Las evidencias privadas deben conservar los mismos controles de acceso en cualquier backup.

## Restore drill

1. Provisionar una instancia SQL Server aislada.
2. Restaurar el backup más reciente.
3. Montar/restaurar una copia del almacenamiento persistente.
4. Configurar un entorno temporal con secretos distintos de producción.
5. Ejecutar `/ready`.
6. Verificar una película, un talento, una imagen pública y una evidencia privada autorizada.
7. Registrar resultado y eliminar el entorno temporal.

## Incidentes

Ante una posible exposición de credenciales o sesiones:

1. Rotar `JWT_ACCESS_SECRET` si corresponde.
2. Revocar `RefreshTokens` activos.
3. Rotar credenciales de base de datos/API afectadas.
4. Revisar logs por `requestId`, usuario, IP y rango temporal.
5. Preservar evidencia del incidente antes de depurar logs.

## Monitoreo recomendado

Configurar un monitor externo contra `/ready` y alertas por HTTP 5xx, latencia y pérdida de conectividad a SQL Server. Los logs JSON pueden enviarse al proveedor de observabilidad elegido sin cambios de formato.

## F-3/F-4: lanzamiento y monetización — controles adicionales

**Código preparado no significa producción operativa.** Antes de conectar clientes reales, se debe comprobar el estado del despliegue y tener evidencia de respaldos restaurables, envío de correo y flujos de usuarios.

### Protección de medios en la API real

En `NODE_ENV=production`, `GET /uploads/...` ahora pasa por `backend/src/middlewares/publicUploadsRights.js` **antes** de `express.static`. Se limita a las rutas exactas `/uploads/actores/*`, `/uploads/peliculas/*` y `/uploads/galerias/*` con autorización web comercial vigente en `docs/media-rights-ledger.csv`, identidad consistente y catálogo válido. La ausencia de ledger, archivo, autorización efectiva o error de lectura produce **404** sin revelar datos de permisos.

Con el expediente actual, que contiene **128 medios `PENDIENTE` y cero aprobados**, la API de producción no debe servir esos medios. En desarrollo (`NODE_ENV=development`) no cambia el acceso histórico a imágenes para el entorno local. **Verificar otros orígenes de medios** (CDNs, enlaces externos y archivos subidos nuevos) antes del lanzamiento; esta protección es específica de la ruta de la API y no es una licencia jurídica.

El proceso debe desplegar desde la raíz de GitHub con `docs/media-rights-ledger.csv`, `database/seeds/catalog.snapshot.json` y `scripts/verifyMediaRightsLedger.mjs` disponibles. Si faltan, el guard falla cerrado (medios no servidos). Esta condición puede reducir temporalmente la disponibilidad de fotos en la API comercial, deliberadamente, hasta completar derechos.

### Auditoría combinada, sin escritura

```powershell
node scripts/reportProductionCommercial.mjs
node scripts/reportProductionCommercial.mjs --online
```

- **Sin `--online`**: inspección documental y de configuración del repo, sin conexión a la API ni al sitio público.
- **Con `--online`**: lectura del manifiesto y catálogo servidos en Cloudflare Pages, verifica `mediaRightsMode=review`, coincidencia de 46 películas/83 talentos y cero imágenes expuestas en ausencia de licencias.
- Para comprobar una API **ya publicada**: asignar `CINERD_API_ORIGIN` a un origen HTTPS sin credenciales ni ruta y ejecutar `--online`. Se comprueba `/health` y `/ready` (respuesta semántica CineRD, no solo HTTP 200).
- `--json`: información estructurada, sin secretos; `--strict`: falla mientras existan bloqueos de salida. Es normal que el modo estricto falle antes de documentar todas las verificaciones.
- El `sourceCommit` público puede corresponder a `main`, no a la rama `feat/f2-editorial-review`. No declarar producción actualizada por pasar CI en una PR sin fusionar.

La herramienta marca siempre el **backup/restauración, correo, registro y flujos completos como `NOT_VERIFIED`** porque no se pueden acreditar solo mediante el repositorio. El informe de AdSense también identifica revisiones editoriales, derechos, Search Console y aprobaciones manuales pendientes. **No realiza ningún cambio ni habilita anuncios.**

### Secuencia mínima operativa cuando exista infraestructura

1. Aprovisionar instancia SQL persistente y establecer respaldos fuera del mismo volumen. Ejecutar un restore drill en una base aislada, guardando evidencia.
2. Desplegar API Node.js con HTTPS, secretos seguros, disco persistente, CORS limitado y guard de imágenes activo.
3. Comprobar `/health` y `/ready` con el origen externo. No introducir claves en URLs ni en conversaciones.
4. Probar registro, verificación de email, login, refresh, recuperación, reclamaciones, permisos y carga de archivos; validar que los mensajes se envían desde un dominio autorizado.
5. Validar el Cloudflare realmente publicado (manifiesto, catálogo, rutas e imágenes) y contrastar su commit con el `main` desplegado.
6. Solo tras aprobación editorial/legal, revisión de Search Console, consentimiento e interfaz móvil, revisar la elegibilidad para AdSense. **`ads.txt` y el código de verificación no constituyen autorización ni activan anuncios.**
