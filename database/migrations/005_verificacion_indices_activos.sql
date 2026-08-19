USE CRUDPeliculas;
GO

IF OBJECT_ID(N'dbo.TalentosUsuarios', N'U') IS NULL
BEGIN
    THROW 50001, 'La tabla dbo.TalentosUsuarios no existe. Ejecute primero la migración 003.', 1;
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.key_constraints
    WHERE name = N'UQ_TalentosUsuarios_Usuario'
      AND parent_object_id = OBJECT_ID(N'dbo.TalentosUsuarios')
)
BEGIN
    ALTER TABLE dbo.TalentosUsuarios DROP CONSTRAINT UQ_TalentosUsuarios_Usuario;
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.key_constraints
    WHERE name = N'UQ_TalentosUsuarios_Actor'
      AND parent_object_id = OBJECT_ID(N'dbo.TalentosUsuarios')
)
BEGIN
    ALTER TABLE dbo.TalentosUsuarios DROP CONSTRAINT UQ_TalentosUsuarios_Actor;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_TalentosUsuarios_Usuario_Activo'
      AND object_id = OBJECT_ID(N'dbo.TalentosUsuarios')
)
BEGIN
    CREATE UNIQUE INDEX UX_TalentosUsuarios_Usuario_Activo
        ON dbo.TalentosUsuarios (UsuarioId)
        WHERE Estado = N'ACTIVO';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_TalentosUsuarios_Actor_Activo'
      AND object_id = OBJECT_ID(N'dbo.TalentosUsuarios')
)
BEGIN
    CREATE UNIQUE INDEX UX_TalentosUsuarios_Actor_Activo
        ON dbo.TalentosUsuarios (ActorId)
        WHERE Estado = N'ACTIVO';
END
GO

SELECT
    i.name,
    i.is_unique,
    i.filter_definition
FROM sys.indexes i
WHERE i.object_id = OBJECT_ID(N'dbo.TalentosUsuarios')
  AND i.name IN (
      N'UX_TalentosUsuarios_Usuario_Activo',
      N'UX_TalentosUsuarios_Actor_Activo'
  );
GO
