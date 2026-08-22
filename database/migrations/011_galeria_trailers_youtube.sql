USE CRUDPeliculas;
GO

IF COL_LENGTH(N'dbo.GaleriaMultimedia', N'VideoUrl') IS NULL
BEGIN
    ALTER TABLE dbo.GaleriaMultimedia ADD VideoUrl NVARCHAR(500) NULL;
END
GO

IF EXISTS
(
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.GaleriaMultimedia')
      AND name = N'Archivo'
      AND is_nullable = 0
)
BEGIN
    ALTER TABLE dbo.GaleriaMultimedia ALTER COLUMN Archivo NVARCHAR(300) NULL;
END
GO

IF OBJECT_ID(N'dbo.CK_GaleriaMultimedia_Tipo', N'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.GaleriaMultimedia DROP CONSTRAINT CK_GaleriaMultimedia_Tipo;
END
GO

ALTER TABLE dbo.GaleriaMultimedia ADD CONSTRAINT CK_GaleriaMultimedia_Tipo CHECK
(
    Tipo IN
    (
        N'FOTO_RODAJE',
        N'POSTER_ALTERNATIVO',
        N'BACKDROP',
        N'PROMOCIONAL',
        N'PRENSA',
        N'EVENTO',
        N'TRAILER',
        N'OTRO'
    )
);
GO

IF OBJECT_ID(N'dbo.CK_GaleriaMultimedia_Contenido', N'C') IS NULL
BEGIN
    ALTER TABLE dbo.GaleriaMultimedia ADD CONSTRAINT CK_GaleriaMultimedia_Contenido CHECK
    (
        (Tipo = N'TRAILER' AND PeliculaId IS NOT NULL AND ActorId IS NULL AND VideoUrl IS NOT NULL AND Archivo IS NULL)
        OR
        (Tipo <> N'TRAILER' AND Archivo IS NOT NULL AND VideoUrl IS NULL)
    );
END
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.GaleriaMultimedia')
      AND name = N'IX_GaleriaMultimedia_TrailerPelicula'
)
BEGIN
    CREATE INDEX IX_GaleriaMultimedia_TrailerPelicula
        ON dbo.GaleriaMultimedia(PeliculaId, Tipo, EsDestacada)
        WHERE PeliculaId IS NOT NULL;
END
GO
