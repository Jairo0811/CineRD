# CineRD — SQL Server aislado y validación de Render sin aprovisionamiento

**Fecha:** 11/11/2026. **Alcance:** automatización de pruebas sobre SQL Server 2022 Developer desechable dentro de GitHub Actions. **No equivale a Azure SQL Database ni a pruebas de producción**. No se copian datos de la base local.

## Prueba real de SQL en entorno desechable

El workflow [SQL Server isolated](../.github/workflows/sql-server-isolated.yml) ejecuta en un runner de GitHub Actions:

1. Genera una contraseña efímera, enmascarada en los logs; no utiliza secretos de producción.
2. Inicia un contenedor oficial SQL Server 2022 Developer accesible exclusivamente por `127.0.0.1:14333` en el runner.
3. Confirma edición Developer y que la base `CineRD_CI_Staging` todavía no existe; crea esa base nueva.
4. Ejecuta [azure_schema_bootstrap.sql](../database/scripts/azure_schema_bootstrap.sql) y aplica las 15 migraciones existentes **dos veces**, comprobando su idempotencia.
5. Inserta datos sintéticos de actor, película y participación dentro de una transacción; ejecuta **ROLLBACK** y verifica la ausencia de la película de prueba.
6. Elimina el contenedor al finalizar, incluso si una prueba falla.

El script [sqlContainerIntegration.js](../backend/scripts/sqlContainerIntegration.js) exige `GITHUB_ACTIONS=true`, `CINERD_EPHEMERAL_SQL_TEST=yes`, host fijo de loopback, puerto fijo, base nueva con nombre fijo y edición Developer. No admite parámetros de host o DB. El migrador sigue contrastando `DB_DATABASE` con `DB_NAME()`.

**Esta prueba SÍ ejecuta DDL y DML, pero solo en un contenedor nuevo y desechable del runner remoto.** No se ejecuta SQL en `CRUDPeliculas`, SQL local, Azure ni Render. No se demuestra compatibilidad específica con Azure SQL Database, restauración de `.bak` real, rendimiento, seguridad o disponibilidad de producción.

Referencia: [Microsoft Learn — ejecutar SQL Server 2022 en contenedores](https://learn.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker?view=sql-server-ver16).

## Comprobación estática del despliegue Render

El comando `node scripts/auditRenderBlueprint.mjs --check` comprueba sin conectarse a Render que `render.yaml`:

- Mantiene `autoDeployTrigger: off` en `cinerd-api`.
- Exige `/ready` y disco persistente en `/var/data`.
- Verifica el inventario de derechos en compilación y exige `auditProductionEnv.js --strict` antes del arranque.
- Conserva TLS SQL y certificados verificados en producción.
- Mantiene credenciales de SQL y Resend como `sync: false`, sin valores en Git.
- No confunde disco persistente con un servicio de plan gratuito.

Es una **auditoría textual**, no un parseo completo de YAML ni una prueba de infraestructura. Se ejecuta en el CI y cuenta con pruebas que detectan configuraciones inseguras.

## Lo que todavía requiere aprobación y acceso externo

1. Seleccionar y aprobar tarifa de hosting SQL y Render, sin asumir que la estimación es precio contractual.
2. Probar la migración real en **Azure SQL Database aislado**, que no es igual a SQL Server 2022 contenedorizado.
3. Configurar TLS, firewall restringido, identidad SQL de mínimo privilegio y secretos privados en Render.
4. Validar API HTTPS, `/health`, `/ready`, CORS, registro, correo, login, refresh, permisos de archivos, respaldos y una restauración real.
5. Completar las 70 decisiones editoriales y mantener los 128 archivos de terceros sin licencias excluidos.

**Ningún recurso de pago ha sido creado por esta fase. El modo comercial y AdSense siguen bloqueados.**
