/* CineRD F2.3 — comprobación posterior a la migración, SOLO LECTURA.
   Uso: ejecutar en SSMS conectado a SQL Server con permisos de lectura.
   Deben aparecer 8 filas CORRECTO, TotalVerificadas=8 y TotalCorrectas=8.
*/
USE [CRUDPeliculas];
GO

WITH Esperadas AS (
    SELECT * FROM (VALUES
        (10, N'Vamos de robo', '2014-01-16'),
        (27, N'Lotoman 003: Volando Bajito', '2014-03-27'),
        (36, N'Nueba Yol 3: Bajo la Nueva Ley', '1997-10-23'),
        (40, N'Colao 2', '2023-11-30'),
        (42, N'Andrea', '2005-08-18'),
        (44, N'Playball', '2008-02-14'),
        (55, N'El Plan Perfecto', '2017-01-19'),
        (56, N'La Lucha de Ana', '2012-05-24')
    ) AS V(Id, TituloEsperado, FechaEsperada)
),
Auditoria AS (
    SELECT E.Id, E.TituloEsperado, P.Titulo AS TituloSQL,
           E.FechaEsperada,
           CONVERT(CHAR(10), TRY_CONVERT(DATE, P.FechaEstreno), 23) AS FechaSQL,
           CASE
               WHEN P.Id IS NULL THEN 'NO_ENCONTRADA'
               WHEN P.Titulo IS NULL
                 OR P.Titulo COLLATE Latin1_General_100_BIN2
                    <> E.TituloEsperado COLLATE Latin1_General_100_BIN2
                 OR DATALENGTH(CONVERT(NVARCHAR(MAX),P.Titulo)) <> DATALENGTH(E.TituloEsperado)
                   THEN 'TITULO_DIFERENTE'
               WHEN P.FechaEstreno IS NULL
                 OR TRY_CONVERT(DATETIME2(7), P.FechaEstreno) IS NULL
                 OR TRY_CONVERT(DATETIME2(7), P.FechaEstreno)
                    <> CONVERT(DATETIME2(7), CONVERT(DATE,E.FechaEsperada,23))
                   THEN 'FECHA_DIFERENTE'
               ELSE 'CORRECTO'
           END AS Estado
    FROM Esperadas AS E
    LEFT JOIN dbo.Peliculas AS P ON P.Id=E.Id
)
SELECT *, COUNT(*) OVER () AS TotalVerificadas,
       SUM(CASE WHEN Estado='CORRECTO' THEN 1 ELSE 0 END) OVER () AS TotalCorrectas
FROM Auditoria
ORDER BY Id;
