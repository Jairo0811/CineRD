/* =========================================================
   CineRD - Migración 006
   Traducciones editoriales de películas
   Conserva el contenido original como fuente canónica.
   ========================================================= */

USE CRUDPeliculas;
GO

IF OBJECT_ID(N'dbo.PeliculaTraducciones', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PeliculaTraducciones
    (
        Id INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_PeliculaTraducciones PRIMARY KEY,
        PeliculaId INT NOT NULL,
        Idioma NVARCHAR(10) NOT NULL,
        Titulo NVARCHAR(200) NULL,
        Sinopsis NVARCHAR(MAX) NULL,
        Eslogan NVARCHAR(300) NULL,
        TipoFuente NVARCHAR(30) NOT NULL
            CONSTRAINT DF_PeliculaTraducciones_TipoFuente DEFAULT N'EDITORIAL',
        FuenteReferencia NVARCHAR(500) NULL,
        FechaCreacion DATETIME2 NOT NULL
            CONSTRAINT DF_PeliculaTraducciones_FechaCreacion DEFAULT SYSUTCDATETIME(),
        FechaActualizacion DATETIME2 NULL,
        CONSTRAINT FK_PeliculaTraducciones_Peliculas
            FOREIGN KEY (PeliculaId) REFERENCES dbo.Peliculas(Id) ON DELETE CASCADE,
        CONSTRAINT UQ_PeliculaTraducciones_Pelicula_Idioma
            UNIQUE (PeliculaId, Idioma),
        CONSTRAINT CK_PeliculaTraducciones_TipoFuente
            CHECK (TipoFuente IN (N'OFICIAL', N'DISTRIBUCION', N'EDITORIAL'))
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_PeliculaTraducciones_Idioma'
      AND object_id = OBJECT_ID(N'dbo.PeliculaTraducciones')
)
BEGIN
    CREATE INDEX IX_PeliculaTraducciones_Idioma
        ON dbo.PeliculaTraducciones (Idioma, PeliculaId);
END
GO

SELECT Id, PeliculaId, Idioma, Titulo, TipoFuente, FuenteReferencia
FROM dbo.PeliculaTraducciones
ORDER BY PeliculaId, Idioma;
GO
