USE CRUDPeliculas;
GO

IF OBJECT_ID(N'dbo.PeliculaCreditos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PeliculaCreditos
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PeliculaCreditos PRIMARY KEY,
        PeliculaId INT NOT NULL,
        ActorId INT NOT NULL,
        TipoCredito NVARCHAR(40) NOT NULL,
        Personaje NVARCHAR(200) NULL,
        Orden INT NULL,
        EsPrincipal BIT NOT NULL CONSTRAINT DF_PeliculaCreditos_EsPrincipal DEFAULT (0),
        Fuente NVARCHAR(300) NULL,
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_PeliculaCreditos_FechaCreacion DEFAULT (SYSUTCDATETIME()),
        FechaActualizacion DATETIME2 NULL,
        CONSTRAINT FK_PeliculaCreditos_Pelicula FOREIGN KEY (PeliculaId) REFERENCES dbo.Peliculas(Id) ON DELETE CASCADE,
        CONSTRAINT FK_PeliculaCreditos_Actor FOREIGN KEY (ActorId) REFERENCES dbo.Actores(Id) ON DELETE CASCADE,
        CONSTRAINT CK_PeliculaCreditos_Tipo CHECK (TipoCredito IN
            (N'ACTOR',N'DIRECTOR',N'PRODUCTOR',N'GUIONISTA',N'COMPOSITOR',N'FOTOGRAFIA',N'EDICION',N'OTRO'))
    );

    CREATE INDEX IX_PeliculaCreditos_PeliculaId ON dbo.PeliculaCreditos(PeliculaId);
    CREATE INDEX IX_PeliculaCreditos_ActorId ON dbo.PeliculaCreditos(ActorId);
    CREATE INDEX IX_PeliculaCreditos_TipoCredito ON dbo.PeliculaCreditos(TipoCredito);
END
GO

/*
  Backfill seguro de créditos de dirección a partir del campo histórico Peliculas.Director.
  No se elimina ese campo todavía para mantener compatibilidad durante la transición.
*/
INSERT INTO dbo.PeliculaCreditos (PeliculaId, ActorId, TipoCredito, EsPrincipal, Fuente)
SELECT DISTINCT
    P.Id,
    A.Id,
    N'DIRECTOR',
    1,
    N'MIGRACION_CAMPO_DIRECTOR'
FROM dbo.Peliculas P
INNER JOIN dbo.Actores A
    ON LOWER(LTRIM(RTRIM(P.Director))) = LOWER(LTRIM(RTRIM(A.NombreCompleto)))
    OR (
        A.NombreArtistico IS NOT NULL
        AND LOWER(LTRIM(RTRIM(P.Director))) = LOWER(LTRIM(RTRIM(A.NombreArtistico)))
    )
WHERE P.Director IS NOT NULL
  AND LTRIM(RTRIM(P.Director)) <> N''
  AND NOT EXISTS
  (
      SELECT 1
      FROM dbo.PeliculaCreditos PC
      WHERE PC.PeliculaId = P.Id
        AND PC.ActorId = A.Id
        AND PC.TipoCredito = N'DIRECTOR'
  );
GO
