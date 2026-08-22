USE CRUDPeliculas;
GO

IF COL_LENGTH(N'dbo.GaleriaMultimedia', N'AudioUrl') IS NULL
BEGIN
    ALTER TABLE dbo.GaleriaMultimedia ADD AudioUrl NVARCHAR(500) NULL;
END
GO

IF COL_LENGTH(N'dbo.GaleriaMultimedia', N'Proveedor') IS NULL
BEGIN
    ALTER TABLE dbo.GaleriaMultimedia ADD Proveedor NVARCHAR(30) NULL;
END
GO

IF COL_LENGTH(N'dbo.GaleriaMultimedia', N'Artista') IS NULL
BEGIN
    ALTER TABLE dbo.GaleriaMultimedia ADD Artista NVARCHAR(180) NULL;
END
GO

IF OBJECT_ID(N'dbo.CK_GaleriaMultimedia_Contenido', N'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.GaleriaMultimedia DROP CONSTRAINT CK_GaleriaMultimedia_Contenido;
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
        N'TEMA_OFICIAL',
        N'CANCION_ORIGINAL',
        N'BANDA_SONORA',
        N'SCORE',
        N'OTRO'
    )
);
GO

ALTER TABLE dbo.GaleriaMultimedia ADD CONSTRAINT CK_GaleriaMultimedia_Contenido CHECK
(
    (
        Tipo = N'TRAILER'
        AND PeliculaId IS NOT NULL
        AND ActorId IS NULL
        AND VideoUrl IS NOT NULL
        AND AudioUrl IS NULL
        AND Archivo IS NULL
    )
    OR
    (
        Tipo IN (N'TEMA_OFICIAL', N'CANCION_ORIGINAL', N'BANDA_SONORA', N'SCORE')
        AND PeliculaId IS NOT NULL
        AND ActorId IS NULL
        AND AudioUrl IS NOT NULL
        AND Proveedor = N'SPOTIFY'
        AND VideoUrl IS NULL
        AND Archivo IS NULL
    )
    OR
    (
        Tipo NOT IN (N'TRAILER', N'TEMA_OFICIAL', N'CANCION_ORIGINAL', N'BANDA_SONORA', N'SCORE')
        AND Archivo IS NOT NULL
        AND VideoUrl IS NULL
        AND AudioUrl IS NULL
    )
);
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.GaleriaMultimedia')
      AND name = N'IX_GaleriaMultimedia_MusicaPelicula'
)
BEGIN
    CREATE INDEX IX_GaleriaMultimedia_MusicaPelicula
        ON dbo.GaleriaMultimedia(PeliculaId, Tipo, EsDestacada)
        INCLUDE (AudioUrl, Proveedor, Artista)
        WHERE PeliculaId IS NOT NULL;
END
GO
