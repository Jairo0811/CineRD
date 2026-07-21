/* =========================================================
   CineRD - Migración 002
   Metadatos cinematográficos para perfiles de películas
   Script idempotente para SQL Server
   ========================================================= */

USE CRUDPeliculas;
GO

IF COL_LENGTH(N'dbo.Peliculas', N'Sinopsis') IS NULL
    ALTER TABLE dbo.Peliculas ADD Sinopsis NVARCHAR(MAX) NULL;
GO

IF COL_LENGTH(N'dbo.Peliculas', N'DuracionMinutos') IS NULL
    ALTER TABLE dbo.Peliculas ADD DuracionMinutos INT NULL;
GO

IF COL_LENGTH(N'dbo.Peliculas', N'Calificacion') IS NULL
    ALTER TABLE dbo.Peliculas ADD Calificacion DECIMAL(3,1) NULL;
GO

IF COL_LENGTH(N'dbo.Peliculas', N'IdiomaOriginal') IS NULL
    ALTER TABLE dbo.Peliculas ADD IdiomaOriginal NVARCHAR(10) NULL;
GO

IF COL_LENGTH(N'dbo.Peliculas', N'Presupuesto') IS NULL
    ALTER TABLE dbo.Peliculas ADD Presupuesto BIGINT NULL;
GO

IF COL_LENGTH(N'dbo.Peliculas', N'Recaudacion') IS NULL
    ALTER TABLE dbo.Peliculas ADD Recaudacion BIGINT NULL;
GO

IF COL_LENGTH(N'dbo.Peliculas', N'Backdrop') IS NULL
    ALTER TABLE dbo.Peliculas ADD Backdrop NVARCHAR(500) NULL;
GO

IF COL_LENGTH(N'dbo.Peliculas', N'TrailerUrl') IS NULL
    ALTER TABLE dbo.Peliculas ADD TrailerUrl NVARCHAR(500) NULL;
GO

IF COL_LENGTH(N'dbo.Peliculas', N'Estado') IS NULL
    ALTER TABLE dbo.Peliculas ADD Estado NVARCHAR(50) NULL;
GO

IF COL_LENGTH(N'dbo.Peliculas', N'Eslogan') IS NULL
    ALTER TABLE dbo.Peliculas ADD Eslogan NVARCHAR(300) NULL;
GO

IF OBJECT_ID(N'dbo.CK_Peliculas_DuracionMinutos', N'C') IS NULL
BEGIN
    ALTER TABLE dbo.Peliculas
    ADD CONSTRAINT CK_Peliculas_DuracionMinutos
        CHECK (DuracionMinutos IS NULL OR DuracionMinutos > 0);
END
GO

IF OBJECT_ID(N'dbo.CK_Peliculas_Calificacion', N'C') IS NULL
BEGIN
    ALTER TABLE dbo.Peliculas
    ADD CONSTRAINT CK_Peliculas_Calificacion
        CHECK (Calificacion IS NULL OR Calificacion BETWEEN 0 AND 10);
END
GO

IF OBJECT_ID(N'dbo.CK_Peliculas_Importes', N'C') IS NULL
BEGIN
    ALTER TABLE dbo.Peliculas
    ADD CONSTRAINT CK_Peliculas_Importes
        CHECK
        (
            (Presupuesto IS NULL OR Presupuesto >= 0)
            AND
            (Recaudacion IS NULL OR Recaudacion >= 0)
        );
END
GO

SELECT
    Id,
    Titulo,
    Sinopsis,
    DuracionMinutos,
    Calificacion,
    IdiomaOriginal,
    Presupuesto,
    Recaudacion,
    Backdrop,
    TrailerUrl,
    Estado,
    Eslogan
FROM dbo.Peliculas
ORDER BY Id;
GO
