# CineRD — Preparación de SQL Server y Azure SQL (sin aprovisionamiento)

**Fecha:** 11 de noviembre de 2026. **Estado:** correcciones de código propuestas y comprobación offline; **ninguna migración ejecutada, ninguna base creada, ningún coste contratado**.

## Por qué se cambió el preflight

El inventario detectó que 14 de 15 migraciones `database/migrations/002...016` contenían `USE CRUDPeliculas;`, aunque el ejecutor selecciona la base mediante `DB_DATABASE`. Esto impedía la ejecución sobre una copia con otro nombre y podía fallar en Azure SQL Database. Microsoft indica que [Azure SQL Database no permite cambiar de base con USE](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/use-transact-sql?view=sql-server-ver17), y exige conectarse a la base prevista directamente.

- Las **14 sentencias USE se retiraron únicamente de los scripts de migración**. Las instrucciones SQL de esquema y sus condiciones de idempotencia se conservan. No se aplicaron cambios SQL en producción ni en localhost.
- `backend/scripts/migrate.js --check` verifica offline las **15 migraciones**, sin secretos ni conexión SQL y sin ejecutar DDL. Además, el ejecutor valida que `DB_DATABASE` no sea una base de sistema y coteja `SELECT DB_NAME()` con el nombre configurado **antes del primer lote**.
- `Login-CRUD-Peliculas.sql` tenía un bloque duplicado y T-SQL mal formado. Se reestructuró para **SQL Server local**, con secreto de SQLCMD y `db_owner` reservado a desarrollo. **No utilizar en Azure ni para usuario de API de producción**.
- `database/scripts/azure_schema_bootstrap.sql` es un **bootstrap manual de tablas iniciales** sin `CREATE DATABASE`, `USE` o modificaciones de registros. No se ejecuta automáticamente y requiere conectar a una base **aislada** previamente creada.

## Comprobación segura sin SQL (PowerShell, desde CineRD actualizado)

```powershell
npm --prefix backend ci
npm --prefix backend run migrate:check
npm --prefix backend test
```

`migrate:check` y las pruebas de Node son de solo lectura. No prueban que el SQL sea compatible con Azure ni que exista un servidor productivo.

## Prueba futura en un entorno AISLADO (requiere aprobación y acceso)

1. **Aprobar presupuesto**, elegir una región adecuada y confirmar límites SQL, conexiones cifradas, egreso de Render y política de firewall. No abrir SQL al público con `0.0.0.0/0`.
2. Crear **manualmente** una base Azure SQL **nueva y vacía**, no `CRUDPeliculas` local; conectar directamente a ella mediante SSMS con identidad administradora de migración.
3. Registrar `SELECT DB_NAME(), SYSUTCDATETIME();` en un acta sin credenciales; validar que se trata de la base aislada. Preparar evidencia y plan de rollback de esquema.
4. Revisar y ejecutar manualmente `database/scripts/azure_schema_bootstrap.sql` **solo contra esa base**; no ejecutar el legado `CRUD-Peliculas.sql`, que incluye `CREATE DATABASE`, `USE` y `UPDATE` de géneros.
5. Crear **usuario contenido con contraseña** de acceso SQL a la base de destino mediante configuración segura (sin publicar la contraseña en repositorio, logs ni chat). [Microsoft recomienda usuarios contenidos para Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/database/logins-create-manage?view=azuresql). Usar **cuenta DDL separada** para migrar; la API debe ser usuaria de acceso mínimo `db_datareader` / `db_datawriter` o permisos más estrictos.
6. En un entorno de staging aislado, configurar `DB_DATABASE` y credenciales privadas de migración, cifrado `DB_ENCRYPT=true` y `DB_TRUST_CERT=false`; ejecutar **primero** `npm --prefix backend run migrate:check`, y solo tras respaldo/revisión y autorización ejecutar `npm --prefix backend run migrate`.
7. Importar **solo datos de prueba o datos cuyo traslado esté autorizado**, con herramienta y comprobaciones de claves/volumen; no restaurar el `.bak` local directamente sobre Azure SQL Database Basic suponiendo compatibilidad.
8. Validar `/health`, `/ready`, operaciones CRUD, roles, transacciones, volúmenes, políticas de acceso, respaldo y **restauración real** en otro entorno. Un CI verde no prueba estas condiciones.

## Salvaguardas de seguridad y medios

- El usuario administrador de migración **no debe utilizarse como cuenta de API**.
- `render.yaml` continúa con `autoDeployTrigger: off`, y no ejecuta migraciones automáticamente.
- Los **128 medios pendientes** permanecen excluidos; ninguno recibe licencia por superar un preflight.
- AdSense sigue desactivado. Sin servidor pagado, sin correo de producción verificado y sin permisos inventados.
- El formulario de revisión editorial E-4/E-5/F2.3 requiere decisiones humanas; migraciones de esquema no implican autorización de actualización de contenido.

## Fuentes técnicas

- [Microsoft Learn — USE (Transact-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/use-transact-sql?view=sql-server-ver17).
- [Microsoft Learn — CREATE USER](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-user-transact-sql?view=sql-server-ver17).
- [Microsoft Learn — Azure SQL Database: cuentas y acceso](https://learn.microsoft.com/en-us/azure/azure-sql/database/logins-create-manage?view=azuresql).
