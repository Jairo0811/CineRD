USE CRUDPeliculas;
GO

IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuarios
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Usuarios PRIMARY KEY,
        Nombre NVARCHAR(150) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        Rol NVARCHAR(30) NOT NULL CONSTRAINT DF_Usuarios_Rol DEFAULT N'USUARIO',
        Estado NVARCHAR(20) NOT NULL CONSTRAINT DF_Usuarios_Estado DEFAULT N'ACTIVO',
        EmailVerificado BIT NOT NULL CONSTRAINT DF_Usuarios_EmailVerificado DEFAULT 0,
        FechaRegistro DATETIME2 NOT NULL CONSTRAINT DF_Usuarios_FechaRegistro DEFAULT SYSUTCDATETIME(),
        UltimoAcceso DATETIME2 NULL,
        CONSTRAINT UQ_Usuarios_Email UNIQUE (Email),
        CONSTRAINT CK_Usuarios_Rol CHECK (Rol IN (N'USUARIO', N'TALENTO_VERIFICADO', N'ADMINISTRADOR')),
        CONSTRAINT CK_Usuarios_Estado CHECK (Estado IN (N'ACTIVO', N'BLOQUEADO', N'INACTIVO'))
    );
END
GO

IF OBJECT_ID(N'dbo.RefreshTokens', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.RefreshTokens
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_RefreshTokens PRIMARY KEY,
        UsuarioId INT NOT NULL,
        TokenHash NVARCHAR(255) NOT NULL,
        ExpiraEn DATETIME2 NOT NULL,
        RevocadoEn DATETIME2 NULL,
        CreadoEn DATETIME2 NOT NULL CONSTRAINT DF_RefreshTokens_CreadoEn DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_RefreshTokens_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id) ON DELETE CASCADE,
        CONSTRAINT UQ_RefreshTokens_TokenHash UNIQUE (TokenHash)
    );
END
GO

IF OBJECT_ID(N'dbo.SolicitudesVerificacion', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SolicitudesVerificacion
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SolicitudesVerificacion PRIMARY KEY,
        UsuarioId INT NOT NULL,
        ActorId INT NOT NULL,
        Metodo NVARCHAR(40) NOT NULL,
        EvidenciaUrl NVARCHAR(500) NULL,
        CodigoVerificacion NVARCHAR(30) NULL,
        Mensaje NVARCHAR(1000) NULL,
        Estado NVARCHAR(20) NOT NULL CONSTRAINT DF_SolicitudesVerificacion_Estado DEFAULT N'PENDIENTE',
        FechaSolicitud DATETIME2 NOT NULL CONSTRAINT DF_SolicitudesVerificacion_FechaSolicitud DEFAULT SYSUTCDATETIME(),
        FechaRevision DATETIME2 NULL,
        RevisadoPorUsuarioId INT NULL,
        Observaciones NVARCHAR(1000) NULL,
        CONSTRAINT FK_SolicitudesVerificacion_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
        CONSTRAINT FK_SolicitudesVerificacion_Actores FOREIGN KEY (ActorId) REFERENCES dbo.Actores(Id),
        CONSTRAINT FK_SolicitudesVerificacion_Revisor FOREIGN KEY (RevisadoPorUsuarioId) REFERENCES dbo.Usuarios(Id),
        CONSTRAINT CK_SolicitudesVerificacion_Metodo CHECK (Metodo IN (N'RED_SOCIAL', N'CORREO_PROFESIONAL', N'REPRESENTANTE', N'DOCUMENTACION_PROFESIONAL')),
        CONSTRAINT CK_SolicitudesVerificacion_Estado CHECK (Estado IN (N'PENDIENTE', N'APROBADA', N'RECHAZADA', N'REVOCADA'))
    );
END
GO

IF OBJECT_ID(N'dbo.TalentosUsuarios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TalentosUsuarios
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TalentosUsuarios PRIMARY KEY,
        UsuarioId INT NOT NULL,
        ActorId INT NOT NULL,
        FechaVerificacion DATETIME2 NOT NULL CONSTRAINT DF_TalentosUsuarios_FechaVerificacion DEFAULT SYSUTCDATETIME(),
        VerificadoPorUsuarioId INT NOT NULL,
        Estado NVARCHAR(20) NOT NULL CONSTRAINT DF_TalentosUsuarios_Estado DEFAULT N'ACTIVO',
        CONSTRAINT FK_TalentosUsuarios_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
        CONSTRAINT FK_TalentosUsuarios_Actores FOREIGN KEY (ActorId) REFERENCES dbo.Actores(Id),
        CONSTRAINT FK_TalentosUsuarios_Verificador FOREIGN KEY (VerificadoPorUsuarioId) REFERENCES dbo.Usuarios(Id),
        CONSTRAINT CK_TalentosUsuarios_Estado CHECK (Estado IN (N'ACTIVO', N'REVOCADO'))
    );
END
GO

IF OBJECT_ID(N'dbo.AuditLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLogs
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AuditLogs PRIMARY KEY,
        UsuarioId INT NULL,
        Accion NVARCHAR(80) NOT NULL,
        Entidad NVARCHAR(80) NOT NULL,
        EntidadId NVARCHAR(80) NULL,
        Detalle NVARCHAR(MAX) NULL,
        Ip NVARCHAR(64) NULL,
        Fecha DATETIME2 NOT NULL CONSTRAINT DF_AuditLogs_Fecha DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_AuditLogs_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SolicitudesVerificacion_Estado' AND object_id = OBJECT_ID(N'dbo.SolicitudesVerificacion'))
    CREATE INDEX IX_SolicitudesVerificacion_Estado ON dbo.SolicitudesVerificacion (Estado, FechaSolicitud DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SolicitudesVerificacion_UsuarioActor' AND object_id = OBJECT_ID(N'dbo.SolicitudesVerificacion'))
    CREATE INDEX IX_SolicitudesVerificacion_UsuarioActor ON dbo.SolicitudesVerificacion (UsuarioId, ActorId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_TalentosUsuarios_Usuario_Activo' AND object_id = OBJECT_ID(N'dbo.TalentosUsuarios'))
    CREATE UNIQUE INDEX UX_TalentosUsuarios_Usuario_Activo ON dbo.TalentosUsuarios (UsuarioId) WHERE Estado = N'ACTIVO';
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_TalentosUsuarios_Actor_Activo' AND object_id = OBJECT_ID(N'dbo.TalentosUsuarios'))
    CREATE UNIQUE INDEX UX_TalentosUsuarios_Actor_Activo ON dbo.TalentosUsuarios (ActorId) WHERE Estado = N'ACTIVO';
GO
