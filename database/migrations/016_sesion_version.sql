-- CineRD: server-side JWT session version. Applied only to the database
-- selected by the connection. No USE instruction (safe for isolated DBs).
-- Must be applied BEFORE deploying code that reads dbo.Usuarios.SesionVersion.
IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
    THROW 51016, 'No existe dbo.Usuarios en la base de datos conectada.', 1;
GO

IF COL_LENGTH(N'dbo.Usuarios', N'SesionVersion') IS NULL
BEGIN
    ALTER TABLE dbo.Usuarios ADD SesionVersion INT NOT NULL
        CONSTRAINT DF_Usuarios_SesionVersion DEFAULT (1) WITH VALUES;
END;
GO
