/*
  CineRD — solo SQL Server LOCAL / instancia administrada, NO Azure SQL Database.
  Ejecute con sqlcmd en modo SQLCMD y sesión de administración legítima:

    - Configure CINERD_DB_PASSWORD en el entorno de la terminal (no lo pegue en Git).
    - sqlcmd -S <servidor-local> -E -b -i Login-CRUD-Peliculas.sql
    - Borre CINERD_DB_PASSWORD de la sesión al finalizar.

  El valor se sustituye como variable sqlcmd; no usar comillas simples en la clave.
  Requiere contraseña robusta de al menos 16 caracteres y política del servidor.
  Nunca usar esta cuenta db_owner para la API de producción: la aplicación debe
  usar una identidad separada con permisos mínimos y migraciones administradas.
  No ejecutar contra Azure SQL Database, donde se recomienda usuario contenido.
*/

USE master;
GO

DECLARE @password NVARCHAR(128) = N'$(CINERD_DB_PASSWORD)';
IF @password = N'$' + N'(CINERD_DB_PASSWORD)'
   OR NULLIF(LTRIM(RTRIM(@password)), N'') IS NULL
   OR LEN(@password) < 16
BEGIN
    THROW 51001, 'CINERD_DB_PASSWORD no fue sustituida o no cumple longitud minima.', 1;
END;

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'crud_peliculas_user')
BEGIN
    DECLARE @createLogin NVARCHAR(MAX) =
        N'CREATE LOGIN [crud_peliculas_user] WITH PASSWORD = N' +
        QUOTENAME(@password, NCHAR(39)) +
        N', CHECK_POLICY = ON, CHECK_EXPIRATION = OFF;';
    EXEC sys.sp_executesql @createLogin;
END;
GO

-- El bloque siguiente se ejecuta únicamente en SQL Server local.
USE CRUDPeliculas;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'crud_peliculas_user')
    CREATE USER [crud_peliculas_user] FOR LOGIN [crud_peliculas_user];
GO

-- Solo para entorno de DESARROLLO local que aplica DDL.
IF NOT EXISTS (
    SELECT 1
    FROM sys.database_role_members rm
    JOIN sys.database_principals rolep ON rolep.principal_id = rm.role_principal_id
    JOIN sys.database_principals memberp ON memberp.principal_id = rm.member_principal_id
    WHERE rolep.name = N'db_owner' AND memberp.name = N'crud_peliculas_user'
)
    ALTER ROLE [db_owner] ADD MEMBER [crud_peliculas_user];
GO
