USE CRUDPeliculas;
GO

IF OBJECT_ID(N'dbo.CK_PeliculaCreditos_Tipo', N'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.PeliculaCreditos DROP CONSTRAINT CK_PeliculaCreditos_Tipo;
END
GO

ALTER TABLE dbo.PeliculaCreditos ADD CONSTRAINT CK_PeliculaCreditos_Tipo CHECK
(
    TipoCredito IN
    (
        N'ACTOR',
        N'DIRECTOR',
        N'DIRECTOR_CASTING',
        N'PRODUCTOR',
        N'GUIONISTA',
        N'COMPOSITOR',
        N'FOTOGRAFIA',
        N'EDICION',
        N'OTRO'
    )
);
GO
