USE master;
GO

IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'crud_peliculas_user')
BEGIN
    DROP LOGIN crud_peliculas_user;
END
GO

CREATE LOGIN crud_peliculas_user
WITH PASSWORD = 'CrudPeliculas123*',
CHECK_POLICY = OFF,
CHECK_EXPIRATION = OFF;
GO

ALTER LOGIN crud_peliculas_user ENABLE;
GO

USE CRUDPeliculas;
GO

IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'crud_peliculas_user')
BEGIN
    DROP USER crud_peliculas_user;
END
GO

CREATE USER crud_peliculas_user FOR LOGIN crud_peliculas_user;
GO

ALTER ROLE db_owner ADD MEMBER crud_peliculas_user;
GO