USE CRUDPeliculas;
GO

IF COL_LENGTH('dbo.Actores', 'InstagramUrl') IS NULL
    ALTER TABLE dbo.Actores ADD InstagramUrl NVARCHAR(300) NULL;
GO

IF COL_LENGTH('dbo.Actores', 'FacebookUrl') IS NULL
    ALTER TABLE dbo.Actores ADD FacebookUrl NVARCHAR(300) NULL;
GO

IF COL_LENGTH('dbo.Actores', 'TikTokUrl') IS NULL
    ALTER TABLE dbo.Actores ADD TikTokUrl NVARCHAR(300) NULL;
GO

IF COL_LENGTH('dbo.Actores', 'YouTubeUrl') IS NULL
    ALTER TABLE dbo.Actores ADD YouTubeUrl NVARCHAR(300) NULL;
GO

IF COL_LENGTH('dbo.Actores', 'XUrl') IS NULL
    ALTER TABLE dbo.Actores ADD XUrl NVARCHAR(300) NULL;
GO

IF COL_LENGTH('dbo.Actores', 'SitioWebUrl') IS NULL
    ALTER TABLE dbo.Actores ADD SitioWebUrl NVARCHAR(300) NULL;
GO
