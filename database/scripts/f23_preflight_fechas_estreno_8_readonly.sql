/*
 CineRD F-2.3 — PREVIA de ocho fechas de estreno candidatas
 FECHA: 2026-11-09
 MODO: SOLO LECTURA. NO UPDATE, INSERT, DELETE, MERGE NI COMMIT.
 CRITERIO: estreno comercial en salas de República Dominicana.
 ORIGEN: snapshot versionado y SELECT SSMS original CRUDPeliculas (2026-11-09).
 NOTA: consultar NO constituye aprobación humana ni autoriza ejecutar cambios.
*/
USE [CRUDPeliculas];
GO
SET NOCOUNT ON;
IF DB_NAME() <> N'CRUDPeliculas'
    THROW 51100, 'Base de datos no esperada. No ejecutar esta consulta.', 1;

DECLARE @Fechas TABLE (
    FilmId INT NOT NULL PRIMARY KEY,
    TituloEsperado NVARCHAR(255) NOT NULL,
    FechaSqlEsperada DATE NOT NULL,
    FechaCandidata DATE NOT NULL,
    Evidencia NVARCHAR(700) NOT NULL,
    GradoEvidencia NVARCHAR(55) NOT NULL
);

INSERT INTO @Fechas
    (FilmId, TituloEsperado, FechaSqlEsperada, FechaCandidata,
     Evidencia, GradoEvidencia)
VALUES
    (10, N'Vamos de robo', '2014-01-15', '2014-01-16',
     N'https://www.diariolibre.com/amp/revista/cine/vamos-de-robo-DIDL447141',
     N'Prensa contemporanea, estreno constatado'),
    (27, N'Lotoman 003: Volando Bajito', '2014-03-15', '2014-03-27',
     N'https://cinemadominicano.com/lotoman-003-volando-bajito-2014/',
     N'Ficha historica + nota de estreno'),
    (36, N'Nueba Yol 3: Bajo la Nueva Ley', '1997-10-31', '1997-10-23',
     N'https://cinemadominicano.com/nueba-yol-3-bajo-la-nueva-ley-1997/',
     N'Ficha historica; cotejo primario pendiente'),
    (40, N'Colao 2', '2023-12-07', '2023-11-30',
     N'https://cinemadominicano.com/colao-2-llega-a-los-cines-dominicanos/',
     N'Anuncio de distribucion contemporaneo'),
    (42, N'Andrea', '2005-08-16', '2005-08-18',
     N'https://cinemadominicano.com/andrea-la-venganza-de-un-espiritu-2005/',
     N'Ficha historica; cotejo primario pendiente'),
    (44, N'Playball', '2008-02-01', '2008-02-14',
     N'https://cinemadominicano.com/play-ball-2008/',
     N'Ficha historica; cotejo primario pendiente'),
    (55, N'El Plan Perfecto', '2017-01-17', '2017-01-19',
     N'https://dgcine.gob.do/mas-de-50-mil-personas-han-visto-el-plan-perfecto/',
     N'DGCINE confirma estreno en cines RD'),
    (56, N'La Lucha de Ana', '2012-04-13', '2012-05-24',
     N'https://cinemadominicano.com/la-lucha-de-ana-2012/',
     N'Ficha historica; cotejo primario pendiente');

-- Declaracion de resultados, NO modificaciones en la base de datos.
SELECT
    F.FilmId,
    F.TituloEsperado,
    P.Titulo AS TituloSql,
    CONVERT(CHAR(10), F.FechaSqlEsperada, 23) AS FechaEsperada,
    CONVERT(CHAR(10), TRY_CONVERT(DATE, P.FechaEstreno), 23) AS FechaActualSql,
    CONVERT(CHAR(10), F.FechaCandidata, 23) AS FechaCandidata,
    CASE
        WHEN P.Id IS NULL THEN N'NO_EXISTE'
        WHEN LTRIM(RTRIM(P.Titulo)) <> F.TituloEsperado THEN N'TITULO_DISTINTO'
        WHEN TRY_CONVERT(DATE, P.FechaEstreno) = F.FechaCandidata THEN N'YA_COINCIDE_CON_CANDIDATA'
        WHEN TRY_CONVERT(DATE, P.FechaEstreno) = F.FechaSqlEsperada THEN N'PENDIENTE_DECISION_HUMANA'
        ELSE N'DIVERGENCIA_NO_ESPERADA'
    END AS Estado,
    F.GradoEvidencia,
    F.Evidencia AS FuenteParaRevision
FROM @Fechas AS F
LEFT JOIN dbo.Peliculas AS P
    ON P.Id = F.FilmId
ORDER BY F.FilmId;

-- Resumen seguro: un valor candidato NO equivale a una aprobacion.
SELECT
    COUNT(*) AS PeliculasObjetivo,
    SUM(CASE WHEN P.Id IS NOT NULL
                 AND LTRIM(RTRIM(P.Titulo)) = F.TituloEsperado
             THEN 1 ELSE 0 END) AS IdentidadesCoincidentes,
    SUM(CASE WHEN TRY_CONVERT(DATE, P.FechaEstreno) = F.FechaSqlEsperada
             THEN 1 ELSE 0 END) AS FechasSqlOriginales,
    SUM(CASE WHEN TRY_CONVERT(DATE, P.FechaEstreno) = F.FechaCandidata
             THEN 1 ELSE 0 END) AS FechasYaCandidatas,
    CAST(N'SOLO LECTURA - CERO CAMBIOS SQL' AS NVARCHAR(80)) AS Operacion
FROM @Fechas AS F
LEFT JOIN dbo.Peliculas AS P ON P.Id = F.FilmId;
GO
