/*
 CineRD — E-4 (7 metadatos) y F-2.3 (5 sinopsis SQL) — SOLO LECTURA.
 NO ejecuta migraciones, respaldos, imports, deletes ni aprobaciones.
 Ejecutar sobre la base original CRUDPeliculas, en una NUEVA pestaña SSMS.
 Valores del snapshot son observaciones, no pruebas del estado real de SQL.
 El hecho de que un valor propuesto ya esté presente NO representa aprobación.
 No muestra texto completo de las sinopsis (solo longitud y hash SHA-256).
*/
USE [CRUDPeliculas];
GO
SET NOCOUNT ON;
IF DB_NAME() <> N'CRUDPeliculas'
    THROW 51800, 'E-4: base de datos incorrecta.', 1;

DECLARE @Cambios TABLE (
   FilmId INT NOT NULL,
   TituloEsperado NVARCHAR(255) NOT NULL,
   Campo NVARCHAR(30) NOT NULL,
   Anterior NVARCHAR(255) NULL,
   Candidato NVARCHAR(255) NULL,
   PRIMARY KEY(FilmId, Campo)
);
INSERT INTO @Cambios (FilmId,TituloEsperado,Campo,Anterior,Candidato)
VALUES
    (9, N'Lotoman', N'Genero', N'Infantil', N'Comedia'),
    (9, N'Lotoman', N'FechaEstreno', N'2011-03-10', N'2011-01-20'),
    (24, N'Sanky Panky 3', N'Director', CAST(NULL AS NVARCHAR(255)), N'Eduardo Transfor Ortiz'),
    (24, N'Sanky Panky 3', N'FechaEstreno', N'2018-03-18', N'2018-03-29'),
    (30, N'El Diablo no duerme en su cama', N'Director', CAST(NULL AS NVARCHAR(255)), N'Amauris Pérez'),
    (32, N'Los Rechazados 2: Operación Espacial', N'Director', CAST(NULL AS NVARCHAR(255)), N'Yasser Michelén'),
    (32, N'Los Rechazados 2: Operación Espacial', N'FechaEstreno', N'2026-09-13', N'2026-08-13');

-- Conservar NULL real: un campo Director antes no informado NO es cadena vacía.
SELECT
   C.FilmId,C.TituloEsperado,C.Campo,
   P.Titulo AS TituloRealSql,
   Actual.Valor AS ValorActualSql,
   C.Anterior AS ValorAnteriorDocumentado,
   C.Candidato AS ValorCandidatoDocumentado,
   CASE
     WHEN P.Id IS NULL THEN N'PELÍCULA_AUSENTE'
     WHEN P.Titulo IS NULL OR
       LTRIM(RTRIM(CONVERT(NVARCHAR(255),P.Titulo))) COLLATE Latin1_General_100_BIN2
       <> C.TituloEsperado COLLATE Latin1_General_100_BIN2
       THEN N'TITULO_DIFERENTE'
     WHEN (Actual.Valor=C.Candidato OR
          (Actual.Valor IS NULL AND C.Candidato IS NULL))
       THEN N'CANDIDATO_YA_PRESENTE_SIN_APROBACIÓN_E4'
     WHEN (Actual.Valor=C.Anterior OR
          (Actual.Valor IS NULL AND C.Anterior IS NULL))
       THEN N'VALOR_ANTERIOR_PRESENTE'
     ELSE N'VALOR_NO_ESPERADO_REVISAR'
   END AS Estado
FROM @Cambios AS C
LEFT JOIN dbo.Peliculas AS P ON P.Id=C.FilmId
OUTER APPLY (
  SELECT CASE C.Campo
    WHEN N'FechaEstreno' THEN CONVERT(NVARCHAR(255),
        CONVERT(CHAR(10),P.FechaEstreno,23))
    WHEN N'Genero' THEN CONVERT(NVARCHAR(255),P.Genero)
    WHEN N'Director' THEN CONVERT(NVARCHAR(255),P.Director)
    ELSE NULL
  END AS Valor
) AS Actual
ORDER BY C.FilmId,C.Campo;

-- No exponer las cinco sinopsis completas a terminales / capturas.
DECLARE @SqlSynopsis TABLE (FilmId INT NOT NULL PRIMARY KEY, Titulo NVARCHAR(255));
INSERT INTO @SqlSynopsis VALUES
 (5,N'Perico Ripiao'),
 (6,N'Ladrones a Domicilio'),
 (10,N'Vamos de robo'),
 (55,N'El Plan Perfecto'),
 (56,N'La Lucha de Ana');

SELECT S.FilmId,S.Titulo AS TituloEsperado,
       P.Titulo AS TituloRealSql,
       CASE WHEN P.Id IS NULL THEN N'PELÍCULA_AUSENTE'
            WHEN P.Titulo IS NULL OR
                LTRIM(RTRIM(CONVERT(NVARCHAR(255),P.Titulo)))
                  COLLATE Latin1_General_100_BIN2
                <> S.Titulo COLLATE Latin1_General_100_BIN2
              THEN N'TITULO_DIFERENTE'
            WHEN NULLIF(LTRIM(RTRIM(CONVERT(NVARCHAR(MAX),P.Sinopsis))),N'') IS NULL
              THEN N'SINOPSIS_SQL_AUSENTE'
            ELSE N'SINOPSIS_SQL_PRESENTE_PENDIENTE_REVISION'
       END AS Estado,
       DATALENGTH(CONVERT(NVARCHAR(MAX),P.Sinopsis)) AS BytesSinopsisSql,
       CONVERT(VARCHAR(64),HASHBYTES('SHA2_256',
           CONVERT(NVARCHAR(MAX),P.Sinopsis)),2) AS Sha256SinopsisSql
FROM @SqlSynopsis AS S
LEFT JOIN dbo.Peliculas AS P ON P.Id=S.FilmId
ORDER BY S.FilmId;

PRINT N'CineRD E-4 / 5 sinopsis: solo consultas, sin escritura.';
GO
