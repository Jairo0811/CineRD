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
