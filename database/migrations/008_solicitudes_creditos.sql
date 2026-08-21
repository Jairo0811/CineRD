USE CRUDPeliculas;
GO

IF OBJECT_ID(N'dbo.SolicitudesCredito', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SolicitudesCredito
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SolicitudesCredito PRIMARY KEY,
        UsuarioId INT NOT NULL,
        ActorId INT NOT NULL,
        PeliculaId INT NOT NULL,
        TipoParticipacion NVARCHAR(40) NOT NULL,
        PersonajeFuncion NVARCHAR(200) NULL,
        EstaAcreditado BIT NOT NULL CONSTRAINT DF_SolicitudesCredito_EstaAcreditado DEFAULT 0,
        MinutoInicio NVARCHAR(8) NULL,
        MinutoFin NVARCHAR(8) NULL,
        DescripcionEscena NVARCHAR(1500) NULL,
        Estado NVARCHAR(30) NOT NULL CONSTRAINT DF_SolicitudesCredito_Estado DEFAULT N'PENDIENTE',
        ComentarioAdmin NVARCHAR(1500) NULL,
        FechaSolicitud DATETIME2 NOT NULL CONSTRAINT DF_SolicitudesCredito_FechaSolicitud DEFAULT SYSUTCDATETIME(),
        FechaRevision DATETIME2 NULL,
        RevisadoPorUsuarioId INT NULL,
        CONSTRAINT FK_SolicitudesCredito_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
        CONSTRAINT FK_SolicitudesCredito_Actores FOREIGN KEY (ActorId) REFERENCES dbo.Actores(Id),
        CONSTRAINT FK_SolicitudesCredito_Peliculas FOREIGN KEY (PeliculaId) REFERENCES dbo.Peliculas(Id),
        CONSTRAINT FK_SolicitudesCredito_Revisor FOREIGN KEY (RevisadoPorUsuarioId) REFERENCES dbo.Usuarios(Id),
        CONSTRAINT CK_SolicitudesCredito_Tipo CHECK (TipoParticipacion IN (N'ACTOR',N'DIRECTOR',N'PRODUCTOR',N'GUIONISTA',N'COMPOSITOR',N'FOTOGRAFIA',N'EDICION',N'OTRO')),
        CONSTRAINT CK_SolicitudesCredito_Estado CHECK (Estado IN (N'PENDIENTE',N'EN_REVISION',N'REQUIERE_MAS_EVIDENCIA',N'APROBADO',N'RECHAZADO'))
    );
END
GO

IF OBJECT_ID(N'dbo.SolicitudCreditoEvidencias', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SolicitudCreditoEvidencias
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SolicitudCreditoEvidencias PRIMARY KEY,
        SolicitudCreditoId INT NOT NULL,
        TipoEvidencia NVARCHAR(40) NOT NULL,
        ArchivoPrivado NVARCHAR(500) NULL,
        UrlExterna NVARCHAR(1000) NULL,
        NombreOriginal NVARCHAR(255) NULL,
        MimeType NVARCHAR(100) NULL,
        Descripcion NVARCHAR(1000) NULL,
        FechaRegistro DATETIME2 NOT NULL CONSTRAINT DF_SolicitudCreditoEvidencias_FechaRegistro DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_SolicitudCreditoEvidencias_Solicitud FOREIGN KEY (SolicitudCreditoId) REFERENCES dbo.SolicitudesCredito(Id) ON DELETE CASCADE,
        CONSTRAINT CK_SolicitudCreditoEvidencias_Tipo CHECK (TipoEvidencia IN (N'CAPTURA_ESCENA',N'CLIP_REFERENCIA',N'CREDITOS_OFICIALES',N'CALL_SHEET',N'CONTRATO',N'BACKSTAGE',N'PUBLICACION_OFICIAL',N'PERFIL_PROFESIONAL',N'OTRO')),
        CONSTRAINT CK_SolicitudCreditoEvidencias_Contenido CHECK (ArchivoPrivado IS NOT NULL OR UrlExterna IS NOT NULL)
    );
END
GO

IF COL_LENGTH(N'dbo.PeliculaCreditos', N'CreditoVerificado') IS NULL
    ALTER TABLE dbo.PeliculaCreditos ADD CreditoVerificado BIT NOT NULL CONSTRAINT DF_PeliculaCreditos_CreditoVerificado DEFAULT 0;
GO
IF COL_LENGTH(N'dbo.PeliculaCreditos', N'FuenteCredito') IS NULL
    ALTER TABLE dbo.PeliculaCreditos ADD FuenteCredito NVARCHAR(40) NULL;
GO
IF COL_LENGTH(N'dbo.PeliculaCreditos', N'SolicitudCreditoId') IS NULL
    ALTER TABLE dbo.PeliculaCreditos ADD SolicitudCreditoId INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_PeliculaCreditos_SolicitudesCredito')
    ALTER TABLE dbo.PeliculaCreditos ADD CONSTRAINT FK_PeliculaCreditos_SolicitudesCredito FOREIGN KEY (SolicitudCreditoId) REFERENCES dbo.SolicitudesCredito(Id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name=N'IX_SolicitudesCredito_Estado' AND object_id=OBJECT_ID(N'dbo.SolicitudesCredito'))
    CREATE INDEX IX_SolicitudesCredito_Estado ON dbo.SolicitudesCredito(Estado, FechaSolicitud DESC);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name=N'IX_SolicitudesCredito_ActorPelicula' AND object_id=OBJECT_ID(N'dbo.SolicitudesCredito'))
    CREATE INDEX IX_SolicitudesCredito_ActorPelicula ON dbo.SolicitudesCredito(ActorId, PeliculaId, TipoParticipacion);
GO
