/*
  CineRD — Bootstrap inicial de esquema para Azure SQL Database o SQL Server.
  SOLO sobre una base VACÍA/aislada ya creada por el administrador.
  REVISIÓN MANUAL OBLIGATORIA antes de ejecutar. NO ejecuta CREATE DATABASE,
  USE ni importación de datos; tampoco aplica el legado CRUD-Peliculas.sql.

  Ejecución prevista: conéctese DIRECTAMENTE a la base destino deseada
  utilizando SSMS/sqlcmd con permisos de DDL de una identidad de migración.
  Confirme DB_NAME() y que el entorno está aislado. NUNCA ejecutar contra
  la base operativa original sin respaldo, revisión y autorización.
*/
IF DB_NAME() IN (N'master',N'model',N'msdb',N'tempdb',N'CRUDPeliculas')
   OR NOT (
      DB_NAME() LIKE N'%[_]Staging'
      OR DB_NAME() LIKE N'%[_]POC'
      OR DB_NAME() LIKE N'%[_]E2E'
   )
BEGIN
    THROW 51051, 'Bootstrap bloqueado: use una base AISLADA con sufijo _Staging, _POC o _E2E.', 1;
END;
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

IF COL_LENGTH(N'dbo.ActoresPeliculas', N'OrdenCreditos') IS NULL
BEGIN
    ALTER TABLE dbo.ActoresPeliculas
    ADD OrdenCreditos INT NULL;
END
GO

