/*
  Crea el login y el usuario de base de datos que usa la API de CineRD.

  La contraseña NO se guarda en el repositorio: se pasa al ejecutar el script, y si falta,
  sqlcmd se detiene con un error en lugar de crear el login con una clave conocida.

    sqlcmd -S <servidor> -E -i Login-CRUD-Peliculas.sql -v CINERD_DB_PASSWORD="<clave larga y aleatoria>"

  - EJECÚTALO SIEMPRE CON sqlcmd (o con el modo SQLCMD activado en SSMS). Si se ejecuta como SQL
    normal, $(CINERD_DB_PASSWORD) no se sustituye y el login quedaría con esa cadena literal
    como contraseña.
  - Usa una clave que cumpla la política de SQL Server y que no contenga comillas simples (').
  - Esa misma clave va en DB_PASSWORD (backend/.env o variables de Render), nunca en Git.
  - Si una versión anterior de este archivo se usó en un servidor real, cambia esa clave:
    sigue visible en el historial de Git.
*/
USE master;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.server_principals
    WHERE name = 'crud_peliculas_user'
)
BEGIN
    CREATE LOGIN crud_peliculas_user
    WITH PASSWORD = N'$(CINERD_DB_PASSWORD)',
    CHECK_POLICY = ON,
    CHECK_EXPIRATION = OFF;
END
GO

ALTER LOGIN crud_peliculas_user ENABLE;
GO

USE CRUDPeliculas;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.database_principals
    WHERE name = 'crud_peliculas_user'
)
BEGIN
    CREATE USER crud_peliculas_user
    FOR LOGIN crud_peliculas_user;
END
GO

-- db_owner permite que `npm run migrate` y `npm run setup:local` creen tablas e índices.
ALTER ROLE db_owner ADD MEMBER crud_peliculas_user;
GO

/*
  Mínimo privilegio para producción: la API solo ejecuta SELECT/INSERT/UPDATE/DELETE (no crea
  objetos mientras corre). Si aplicas las migraciones con otra cuenta administrativa, reemplaza
  el bloque db_owner de arriba por este:

  ALTER ROLE db_datareader ADD MEMBER crud_peliculas_user;
  ALTER ROLE db_datawriter ADD MEMBER crud_peliculas_user;
  GO
*/