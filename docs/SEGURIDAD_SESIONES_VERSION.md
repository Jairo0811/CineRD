# CineRD — Control de sesión tras restablecer contraseña

## Hallazgo y alcance

En la prueba aislada con SQL Server se verificó que el restablecimiento de contraseña
revocaba todos los refresh tokens previos, pero el access JWT ya emitido podía
continuar autenticando al mismo usuario hasta expirar si su rol y estado no cambiaban.

La defensa incorpora `dbo.Usuarios.SesionVersion` (entero positivo), que se
incluye como `sv` en los access JWT. En cada petición autenticada el middleware
verifica firma, expiración, estado, rol **y** versión actual. Restablecer la
contraseña incrementa la versión en la misma transacción donde actualiza el
hash de contraseña y revoca refresh tokens.

Las sesiones con JWT sin `sv` tendrán que iniciar sesión de nuevo. Un
login o renovación normal emite el valor vigente desde SQL.

## Orden obligatorio de despliegue

1. Respaldar SQL Server y comprobar la base de destino.
2. Aplicar **antes del nuevo backend** `database/migrations/016_sesion_version.sql`
   a la base prevista. La migración no contiene `USE`; depende de la conexión.
3. Comprobar `COL_LENGTH('dbo.Usuarios','SesionVersion')` y verificar que
   todas las cuentas tienen valores `SesionVersion >= 1`.
4. Publicar backend actualizado y obligar a iniciar sesión nuevamente a
   las sesiones anteriores al despliegue.
5. Comprobar login, refresh, endpoints protegidos y reseteo de contraseña.
6. Mantener la PR como borrador mientras falten revisiones editoriales y derechos.

**Aislamiento E2E:** `CRUDPeliculas_E2E` es una copia de pruebas; NO ejecutar
`npm run migrate` sobre ella. Las migraciones anteriores contienen `USE
CRUDPeliculas;` y el migrador ahora aborta ante un destino diferente antes
de iniciar los lotes. En SSMS se recomienda aplicar solo la migración 016,
con `USE [CRUDPeliculas_E2E]` y comprobación del nombre antes del ALTER.

## SQL de aplicación E2E segura (SSMS)

```sql
USE [CRUDPeliculas_E2E];
GO
SET XACT_ABORT ON;

IF DB_NAME() <> N'CRUDPeliculas_E2E'
    THROW 51000, 'No está conectado a la base E2E.', 1;
IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
    THROW 51001, 'Falta dbo.Usuarios.', 1;

BEGIN TRY
    BEGIN TRANSACTION;
    IF COL_LENGTH(N'dbo.Usuarios', N'SesionVersion') IS NULL
        ALTER TABLE dbo.Usuarios
        ADD SesionVersion INT NOT NULL
            CONSTRAINT DF_Usuarios_SesionVersion DEFAULT (1) WITH VALUES;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT Id, Email, Rol, Estado, SesionVersion
FROM dbo.Usuarios
WHERE Email LIKE N'cinerd-%@example.invalid'
ORDER BY Id;
```

## Criterios de aceptación

- El JWT antiguo con `sv=1` devuelve 403 cuando `SesionVersion=2`, aunque
  el usuario siga `ACTIVO` y con el mismo rol.
- El JWT nuevo con `sv=2` accede a `/api/auth/perfil`.
- El token anterior sin `sv` devuelve 401 (requiere nuevo inicio de sesión).
- La recuperación correcta incrementa `SesionVersion`, invalida refresh
  tokens anteriores y consume el token de un solo uso en una sola transacción.
- Un error SQL cierra la sesión con 503, no autoriza sin consultar la base.
- No se modifican bases de datos ajenas a la conexión prevista.

**Distinción:** la comprobación aislada de revocación de refresh tokens 5/5
precedió a esta mejora; las pruebas E2E de la nueva versión deben repetirse
después de aplicar la migración 016 y actualizar el servidor local.
