USE CRUDPeliculas;
GO

IF OBJECT_ID(N'dbo.GaleriaMultimedia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.GaleriaMultimedia
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_GaleriaMultimedia PRIMARY KEY,
        PeliculaId INT NULL,
        ActorId INT NULL,
        Tipo NVARCHAR(40) NOT NULL,
        Titulo NVARCHAR(180) NULL,
        Descripcion NVARCHAR(700) NULL,
        Archivo NVARCHAR(300) NOT NULL,
        FuenteUrl NVARCHAR(500) NULL,
        Orden INT NULL,
        EsDestacada BIT NOT NULL CONSTRAINT DF_GaleriaMultimedia_EsDestacada DEFAULT (0),
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_GaleriaMultimedia_FechaCreacion DEFAULT (SYSUTCDATETIME()),
        FechaActualizacion DATETIME2 NULL,
        CONSTRAINT FK_GaleriaMultimedia_Pelicula FOREIGN KEY (PeliculaId) REFERENCES dbo.Peliculas(Id) ON DELETE CASCADE,
        CONSTRAINT FK_GaleriaMultimedia_Actor FOREIGN KEY (ActorId) REFERENCES dbo.Actores(Id) ON DELETE CASCADE,
        CONSTRAINT CK_GaleriaMultimedia_Entidad CHECK
        (
            (PeliculaId IS NOT NULL AND ActorId IS NULL)
            OR
            (PeliculaId IS NULL AND ActorId IS NOT NULL)
        ),
        CONSTRAINT CK_GaleriaMultimedia_Tipo CHECK
        (
            Tipo IN
            (
                N'FOTO_RODAJE',
                N'POSTER_ALTERNATIVO',
                N'BACKDROP',
                N'PROMOCIONAL',
                N'PRENSA',
                N'EVENTO',
                N'OTRO'
            )
        )
    );

    CREATE INDEX IX_GaleriaMultimedia_PeliculaId ON dbo.GaleriaMultimedia(PeliculaId);
    CREATE INDEX IX_GaleriaMultimedia_ActorId ON dbo.GaleriaMultimedia(ActorId);
    CREATE INDEX IX_GaleriaMultimedia_Tipo ON dbo.GaleriaMultimedia(Tipo);
    CREATE INDEX IX_GaleriaMultimedia_Orden ON dbo.GaleriaMultimedia(Orden);
END
GO
