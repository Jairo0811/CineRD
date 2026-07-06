/* Crear la base de datos */
IF DB_ID('CRUDPeliculas') IS NULL
BEGIN
    CREATE DATABASE CRUDPeliculas;
END
GO

/* Seleccionar la base de datos */
USE CRUDPeliculas;
GO

/* ==========================
   Tabla: Actores
   ========================== */
IF OBJECT_ID('Actores', 'U') IS NULL
BEGIN
    CREATE TABLE Actores (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        NombreCompleto NVARCHAR(150) NOT NULL,
        NombreArtistico NVARCHAR(150) NULL,
        FechaNacimiento DATE NULL,
        Sexo NVARCHAR(20) NOT NULL,
        EstaVivo BIT NOT NULL CONSTRAINT DF_Actores_EstaVivo DEFAULT 1,
        FechaFallecimiento DATE NULL,
        Foto NVARCHAR(255) NULL,
        ProfesionPrincipal NVARCHAR(100) NULL
    );
END
GO

/* ==========================
   Tabla: Peliculas
   ========================== */
IF OBJECT_ID('Peliculas', 'U') IS NULL
BEGIN
    CREATE TABLE Peliculas (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Titulo NVARCHAR(150) NOT NULL,
        Genero NVARCHAR(80) NOT NULL,
        Director NVARCHAR(150) NULL,
        Productora NVARCHAR(150) NULL,
        FechaEstreno DATE NOT NULL,
        Foto NVARCHAR(255) NULL,

        CONSTRAINT UQ_Peliculas_Titulo UNIQUE (Titulo)
    );
END
GO

/* ==========================
   Tabla: ActoresPeliculas
   Relación muchos a muchos
   ========================== */
IF OBJECT_ID('ActoresPeliculas', 'U') IS NULL
BEGIN
    CREATE TABLE ActoresPeliculas (
        PeliculaId INT NOT NULL,
        ActorId INT NOT NULL,
        Personaje NVARCHAR(150) NULL,
        EsPrincipal BIT NOT NULL CONSTRAINT DF_ActoresPeliculas_EsPrincipal DEFAULT 0,

        CONSTRAINT PK_ActoresPeliculas PRIMARY KEY (PeliculaId, ActorId),

        CONSTRAINT FK_ActoresPeliculas_Peliculas
            FOREIGN KEY (PeliculaId) REFERENCES Peliculas(Id),

        CONSTRAINT FK_ActoresPeliculas_Actores
            FOREIGN KEY (ActorId) REFERENCES Actores(Id)
    );
END
GO

/* ==========================
   Tabla: Directores
   Reservada para futura versión
   ========================== */
IF OBJECT_ID('Directores', 'U') IS NULL
BEGIN
    CREATE TABLE Directores (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        NombreCompleto NVARCHAR(150) NOT NULL,
        NombreArtistico NVARCHAR(150) NULL,
        FechaNacimiento DATE NULL,
        Sexo NVARCHAR(20) NULL,
        EstaVivo BIT NOT NULL DEFAULT 1,
        FechaFallecimiento DATE NULL,
        Foto NVARCHAR(255) NULL
    );
END
GO

/* ==========================
   Consultas de verificación
   ========================== */
SELECT * FROM Actores;
SELECT * FROM Peliculas;
SELECT * FROM ActoresPeliculas;
SELECT * FROM Directores;
GO

SELECT
    Profesion,
    COUNT(*) Total
FROM Actores
WHERE Profesion IS NOT NULL
GROUP BY Profesion
ORDER BY Total DESC;

USE CRUDPeliculas;
GO

ALTER TABLE Actores
ALTER COLUMN FechaNacimiento DATE NULL;
GO

SELECT COLUMN_NAME, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Actores'
  AND COLUMN_NAME = 'FechaNacimiento';


  USE CRUDPeliculas;
GO

IF COL_LENGTH('ActoresPeliculas', 'TipoParticipacion') IS NULL
BEGIN
    ALTER TABLE ActoresPeliculas
    ADD TipoParticipacion NVARCHAR(50) NULL;
END
GO

USE CRUDPeliculas;
GO

IF COL_LENGTH('ActoresPeliculas', 'TipoParticipacion') IS NULL
BEGIN
    ALTER TABLE ActoresPeliculas
    ADD TipoParticipacion NVARCHAR(50) NULL;
END
GO