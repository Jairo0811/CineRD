USE CRUDPeliculas;
GO

/* Verificar actores */
SELECT *
FROM Actores;
GO

/* Verificar películas */
SELECT *
FROM Peliculas;
GO

/* Verificar relaciones actor-película */
SELECT *
FROM ActoresPeliculas;
GO

/* Verificar directores */
SELECT *
FROM Directores;
GO

/* Ver estructura de tablas */
EXEC sp_help 'Actores';
EXEC sp_help 'Peliculas';
EXEC sp_help 'ActoresPeliculas';
GO


SELECT Id, NombreCompleto, Foto
FROM Actores
ORDER BY Id;

UPDATE Actores
SET Foto = NULL
WHERE Id = 15;

SELECT Id, NombreCompleto, Foto
FROM Actores
WHERE Id = 14;

UPDATE Actores
SET Foto = NULL
WHERE Foto = '/uploads/actores/undefined';

