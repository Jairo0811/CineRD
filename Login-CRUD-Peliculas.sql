/*
  Crea el login y el usuario de base de datos que usa la API de CineRD.

  La contraseña NO se guarda en el repositorio. Configura CINERD_DB_PASSWORD como
  variable de entorno privada de la sesión antes de invocar sqlcmd.
  No pases la contraseña con -v en la línea de comandos: puede quedar en el historial.

    sqlcmd -S <servidor> -E -b -i Login-CRUD-Peliculas.sql

  - EJECÚTALO CON sqlcmd o con el modo SQLCMD de SSMS. -b hace que sqlcmd devuelva error
    al detectar fallos. Además, el script comprueba la ausencia de sustitución para evitar
    crear accidentalmente un login con una contraseña literal.
  - Elimina la variable de entorno al terminar de crear la cuenta.
  - Usa una clave que cumpla la política de SQL Server y que no contenga comillas simples (').
  - Esa misma clave va en DB_PASSWORD (backend/.env o variables de Render), nunca en Git.
  - Si una versión anterior de este archivo se usó en un servidor real, cambia esa clave:
    sigue visible en el historial de Git.
*/
USE master;
GO

-- Defensa adicional: si alguien ejecuta esto como T-SQL normal, la variable
-- SQLCMD no se expande. Rechazarla en el mismo lote que CREATE LOGIN.
IF N'$(CINERD_DB_PASSWORD)' = N'
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
*/ + N'(CINERD_DB_PASSWORD)'
   OR NULLIF(LTRIM(RTRIM(N'$(CINERD_DB_PASSWORD)')), N'') IS NULL
BEGIN
    THROW 51001, 'CINERD_DB_PASSWORD no fue sustituida por SQLCMD o esta vacia.', 1;
END;

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