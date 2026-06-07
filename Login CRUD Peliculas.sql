USE master;
GO

CREATE LOGIN crud_peliculas_user
WITH PASSWORD = 'CrudPeliculas123*';
GO

USE CRUDPeliculas;
GO

CREATE USER crud_peliculas_user
FOR LOGIN crud_peliculas_user;
GO

ALTER ROLE db_owner
ADD MEMBER crud_peliculas_user;
GO