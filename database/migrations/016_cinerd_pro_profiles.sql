IF OBJECT_ID(N'dbo.TalentoProPerfiles', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.TalentoProPerfiles (
    ActorId INT NOT NULL PRIMARY KEY,
    PlanCodigo NVARCHAR(20) NOT NULL CONSTRAINT DF_TalentoProPerfiles_Plan DEFAULT N'FREE',
    EstadoSuscripcion NVARCHAR(20) NOT NULL CONSTRAINT DF_TalentoProPerfiles_Estado DEFAULT N'INACTIVA',
    TitularProfesional NVARCHAR(180) NULL,
    BiografiaProfesional NVARCHAR(3000) NULL,
    Ciudad NVARCHAR(120) NULL,
    Pais NVARCHAR(120) NULL,
    DisponibleCasting BIT NOT NULL CONSTRAINT DF_TalentoProPerfiles_Casting DEFAULT 0,
    EmailContacto NVARCHAR(255) NULL,
    TelefonoContacto NVARCHAR(50) NULL,
    NombreRepresentante NVARCHAR(180) NULL,
    EmailRepresentante NVARCHAR(255) NULL,
    TelefonoRepresentante NVARCHAR(50) NULL,
    ReelUrl NVARCHAR(500) NULL,
    PortfolioUrl NVARCHAR(500) NULL,
    FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_TalentoProPerfiles_Creacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion DATETIME2 NOT NULL CONSTRAINT DF_TalentoProPerfiles_Actualizacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_TalentoProPerfiles_Actores FOREIGN KEY (ActorId) REFERENCES dbo.Actores(Id) ON DELETE CASCADE,
    CONSTRAINT CK_TalentoProPerfiles_Plan CHECK (PlanCodigo IN (N'FREE', N'PRO')),
    CONSTRAINT CK_TalentoProPerfiles_Estado CHECK (EstadoSuscripcion IN (N'INACTIVA', N'ACTIVA', N'SUSPENDIDA', N'CANCELADA'))
  );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_TalentoProPerfiles_PlanEstado' AND object_id = OBJECT_ID(N'dbo.TalentoProPerfiles'))
BEGIN
  CREATE INDEX IX_TalentoProPerfiles_PlanEstado ON dbo.TalentoProPerfiles(PlanCodigo, EstadoSuscripcion);
END;
GO
