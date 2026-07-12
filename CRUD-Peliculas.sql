/* =========================================================
   CineRD - Base de datos CRUDPeliculas
   Script idempotente de creación y actualización
   ========================================================= */

/* Crear la base de datos si no existe */
IF DB_ID(N'CRUDPeliculas') IS NULL
BEGIN
    CREATE DATABASE CRUDPeliculas;
END
GO

USE CRUDPeliculas;
GO

/* =========================================================
   Tabla: Actores
   ========================================================= */
IF OBJECT_ID(N'dbo.Actores', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Actores
    (
        Id INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Actores PRIMARY KEY,

        Nombres NVARCHAR(150) NULL,
        Apellidos NVARCHAR(150) NULL,
        NombreCompleto NVARCHAR(150) NOT NULL,
        NombreArtistico NVARCHAR(150) NULL,
        Profesion NVARCHAR(100) NULL,

        FechaNacimiento DATE NULL,
        AnioNacimiento INT NULL,
        Sexo NVARCHAR(20) NOT NULL,
        EstaVivo BIT NOT NULL
            CONSTRAINT DF_Actores_EstaVivo DEFAULT (1),
        FechaFallecimiento DATE NULL,

        Foto NVARCHAR(255) NULL,
        TMDbId INT NULL
    );
END
GO

/* Actualizar instalaciones existentes */
IF COL_LENGTH(N'dbo.Actores', N'Nombres') IS NULL
BEGIN
    ALTER TABLE dbo.Actores ADD Nombres NVARCHAR(150) NULL;
END
GO

IF COL_LENGTH(N'dbo.Actores', N'Apellidos') IS NULL
BEGIN
    ALTER TABLE dbo.Actores ADD Apellidos NVARCHAR(150) NULL;
END
GO

IF COL_LENGTH(N'dbo.Actores', N'Profesion') IS NULL
BEGIN
    ALTER TABLE dbo.Actores ADD Profesion NVARCHAR(100) NULL;
END
GO

IF COL_LENGTH(N'dbo.Actores', N'AnioNacimiento') IS NULL
BEGIN
    ALTER TABLE dbo.Actores ADD AnioNacimiento INT NULL;
END
GO

IF COL_LENGTH(N'dbo.Actores', N'TMDbId') IS NULL
BEGIN
    ALTER TABLE dbo.Actores ADD TMDbId INT NULL;
END
GO

/* Migrar la profesión antigua, si existe */
IF COL_LENGTH(N'dbo.Actores', N'ProfesionPrincipal') IS NOT NULL
BEGIN
    UPDATE dbo.Actores
    SET Profesion = ProfesionPrincipal
    WHERE Profesion IS NULL
      AND ProfesionPrincipal IS NOT NULL;
END
GO

/* Índice único: permite varios NULL, pero no IDs repetidos */
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_Actores_TMDbId'
      AND object_id = OBJECT_ID(N'dbo.Actores')
)
BEGIN
    CREATE UNIQUE INDEX UX_Actores_TMDbId
        ON dbo.Actores (TMDbId)
        WHERE TMDbId IS NOT NULL;
END
GO

/* =========================================================
   Tabla: Peliculas
   ========================================================= */
IF OBJECT_ID(N'dbo.Peliculas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Peliculas
    (
        Id INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Peliculas PRIMARY KEY,

        Titulo NVARCHAR(150) NOT NULL,
        Genero NVARCHAR(80) NOT NULL,
        Director NVARCHAR(150) NULL,
        Productora NVARCHAR(150) NULL,
        FechaEstreno DATE NOT NULL,
        Foto NVARCHAR(255) NULL,
        TMDbId INT NULL,

        CONSTRAINT UQ_Peliculas_Titulo UNIQUE (Titulo)
    );
END
GO

IF COL_LENGTH(N'dbo.Peliculas', N'TMDbId') IS NULL
BEGIN
    ALTER TABLE dbo.Peliculas ADD TMDbId INT NULL;
END
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_Peliculas_TMDbId'
      AND object_id = OBJECT_ID(N'dbo.Peliculas')
)
BEGIN
    CREATE UNIQUE INDEX UX_Peliculas_TMDbId
        ON dbo.Peliculas (TMDbId)
        WHERE TMDbId IS NOT NULL;
END
GO

/* =========================================================
   Tabla: ActoresPeliculas
   Relación muchos a muchos
   ========================================================= */
IF OBJECT_ID(N'dbo.ActoresPeliculas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ActoresPeliculas
    (
        PeliculaId INT NOT NULL,
        ActorId INT NOT NULL,
        Personaje NVARCHAR(150) NULL,
        EsPrincipal BIT NOT NULL
            CONSTRAINT DF_ActoresPeliculas_EsPrincipal DEFAULT (0),
        TipoParticipacion NVARCHAR(50) NULL,

        CONSTRAINT PK_ActoresPeliculas
            PRIMARY KEY (PeliculaId, ActorId),

        CONSTRAINT FK_ActoresPeliculas_Peliculas
            FOREIGN KEY (PeliculaId)
            REFERENCES dbo.Peliculas(Id),

        CONSTRAINT FK_ActoresPeliculas_Actores
            FOREIGN KEY (ActorId)
            REFERENCES dbo.Actores(Id)
    );
END
GO

IF COL_LENGTH(N'dbo.ActoresPeliculas', N'TipoParticipacion') IS NULL
BEGIN
    ALTER TABLE dbo.ActoresPeliculas
    ADD TipoParticipacion NVARCHAR(50) NULL;
END
GO

/* =========================================================
   Limpieza de géneros existentes
   ========================================================= */
UPDATE dbo.Peliculas
SET Genero = LTRIM(RTRIM(Genero))
WHERE Genero IS NOT NULL;
GO

UPDATE dbo.Peliculas
SET Genero = N'Comedia'
WHERE LOWER(LTRIM(RTRIM(Genero))) IN
(
    N'comedia',
    N'comedia dominicana'
);
GO

UPDATE dbo.Peliculas
SET Genero = N'Drama'
WHERE LOWER(LTRIM(RTRIM(Genero))) IN
(
    N'drama',
    N'dramática',
    N'dramatico',
    N'dramático'
);
GO

/* =========================================================
   Consultas de verificación
   ========================================================= */
SELECT
    Id,
    Nombres,
    Apellidos,
    NombreCompleto,
    NombreArtistico,
    Profesion,
    FechaNacimiento,
    AnioNacimiento,
    Sexo,
    EstaVivo,
    FechaFallecimiento,
    Foto,
    TMDbId
FROM dbo.Actores
ORDER BY Id;

SELECT
    Id,
    Titulo,
    Genero,
    Director,
    Productora,
    FechaEstreno,
    Foto,
    TMDbId
FROM dbo.Peliculas
ORDER BY Id;

SELECT
    PeliculaId,
    ActorId,
    Personaje,
    EsPrincipal,
    TipoParticipacion
FROM dbo.ActoresPeliculas
ORDER BY PeliculaId, ActorId;
GO


ALTER TABLE ActoresPeliculas
ADD OrdenCreditos INT NULL;