USE CRUDPeliculas;
GO

IF OBJECT_ID(N'dbo.Premios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Premios
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Premios PRIMARY KEY,
        Nombre NVARCHAR(160) NOT NULL,
        Organizacion NVARCHAR(200) NULL,
        Pais NVARCHAR(100) NULL,
        SitioWeb NVARCHAR(300) NULL,
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_Premios_FechaCreacion DEFAULT (SYSUTCDATETIME()),
        FechaActualizacion DATETIME2 NULL
    );

    CREATE UNIQUE INDEX UX_Premios_Nombre ON dbo.Premios(Nombre);
END
GO

IF OBJECT_ID(N'dbo.Nominaciones', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Nominaciones
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Nominaciones PRIMARY KEY,
        PremioId INT NOT NULL,
        Categoria NVARCHAR(180) NOT NULL,
        Anio SMALLINT NOT NULL,
        PeliculaId INT NULL,
        ActorId INT NULL,
        Resultado NVARCHAR(20) NOT NULL CONSTRAINT DF_Nominaciones_Resultado DEFAULT (N'NOMINADO'),
        Detalle NVARCHAR(500) NULL,
        FuenteUrl NVARCHAR(500) NULL,
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_Nominaciones_FechaCreacion DEFAULT (SYSUTCDATETIME()),
        FechaActualizacion DATETIME2 NULL,
        CONSTRAINT FK_Nominaciones_Premio FOREIGN KEY (PremioId) REFERENCES dbo.Premios(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Nominaciones_Pelicula FOREIGN KEY (PeliculaId) REFERENCES dbo.Peliculas(Id),
        CONSTRAINT FK_Nominaciones_Actor FOREIGN KEY (ActorId) REFERENCES dbo.Actores(Id),
        CONSTRAINT CK_Nominaciones_Resultado CHECK (Resultado IN (N'NOMINADO', N'GANADOR')),
        CONSTRAINT CK_Nominaciones_Anio CHECK (Anio BETWEEN 1900 AND 2200),
        CONSTRAINT CK_Nominaciones_Entidad CHECK (
            (PeliculaId IS NOT NULL AND ActorId IS NULL)
            OR (PeliculaId IS NULL AND ActorId IS NOT NULL)
        )
    );

    CREATE INDEX IX_Nominaciones_PremioId ON dbo.Nominaciones(PremioId);
    CREATE INDEX IX_Nominaciones_PeliculaId ON dbo.Nominaciones(PeliculaId) WHERE PeliculaId IS NOT NULL;
    CREATE INDEX IX_Nominaciones_ActorId ON dbo.Nominaciones(ActorId) WHERE ActorId IS NOT NULL;
    CREATE INDEX IX_Nominaciones_Anio ON dbo.Nominaciones(Anio DESC);
    CREATE INDEX IX_Nominaciones_Resultado ON dbo.Nominaciones(Resultado);
END
GO
