USE CRUDPeliculas;
GO

IF OBJECT_ID(N'dbo.PasswordResetTokens', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PasswordResetTokens
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PasswordResetTokens PRIMARY KEY,
        UsuarioId INT NOT NULL,
        TokenHash NVARCHAR(64) NOT NULL,
        ExpiraEn DATETIME2 NOT NULL,
        UsadoEn DATETIME2 NULL,
        CreadoEn DATETIME2 NOT NULL CONSTRAINT DF_PasswordResetTokens_CreadoEn DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_PasswordResetTokens_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id) ON DELETE CASCADE,
        CONSTRAINT UQ_PasswordResetTokens_TokenHash UNIQUE (TokenHash)
    );
END
GO

IF OBJECT_ID(N'dbo.EmailVerificationTokens', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.EmailVerificationTokens
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_EmailVerificationTokens PRIMARY KEY,
        UsuarioId INT NOT NULL,
        TokenHash NVARCHAR(64) NOT NULL,
        ExpiraEn DATETIME2 NOT NULL,
        UsadoEn DATETIME2 NULL,
        CreadoEn DATETIME2 NOT NULL CONSTRAINT DF_EmailVerificationTokens_CreadoEn DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_EmailVerificationTokens_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id) ON DELETE CASCADE,
        CONSTRAINT UQ_EmailVerificationTokens_TokenHash UNIQUE (TokenHash)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name=N'IX_PasswordResetTokens_Usuario_Activo' AND object_id=OBJECT_ID(N'dbo.PasswordResetTokens'))
    CREATE INDEX IX_PasswordResetTokens_Usuario_Activo ON dbo.PasswordResetTokens(UsuarioId, ExpiraEn DESC) INCLUDE(UsadoEn);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name=N'IX_EmailVerificationTokens_Usuario_Activo' AND object_id=OBJECT_ID(N'dbo.EmailVerificationTokens'))
    CREATE INDEX IX_EmailVerificationTokens_Usuario_Activo ON dbo.EmailVerificationTokens(UsuarioId, ExpiraEn DESC) INCLUDE(UsadoEn);
GO
