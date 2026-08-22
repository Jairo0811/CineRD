USE CRUDPeliculas;
GO

IF OBJECT_ID(N'dbo.CK_GaleriaMultimedia_Contenido', N'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.GaleriaMultimedia DROP CONSTRAINT CK_GaleriaMultimedia_Contenido;
END
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
        AND Proveedor IN (N'SPOTIFY', N'YOUTUBE')
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
