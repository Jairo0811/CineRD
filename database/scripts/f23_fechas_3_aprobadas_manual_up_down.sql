/*
  CineRD F-2.3 — 3 fechas autorizadas POR TITULAR, cambio MANUAL SQL
  Aprobación editorial documentada: docs/f23-approved-release-dates-2026-11-09.json
  SQL OBJETIVO: CRUDPeliculas (nunca CRUDPeliculas_E2E).
  SOLO IDs 10, 40 y 55; SOLO columna FechaEstreno.
  POR DEFECTO: @Apply = 0 => muestra previa, CERO UPDATE.
  @Direction = 'UP': aplicar las fechas aprobadas.
  @Direction = 'DOWN': revertir SOLO si las 3 filas conservan las fechas nuevas.
  ANTES DE @Apply=1: crear un BACKUP FULL REAL con CHECKSUM, comprobar
  su RESTORE VERIFYONLY y revisar el fichero. Este script valida backup
  reciente de un solo medio, verifica checksum y usa transacción.
  NO registra automaticamente aprobaciones o cambia ledger/snapshot.
*/
USE [CRUDPeliculas];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @Direction NVARCHAR(4) = N'UP';
DECLARE @Apply BIT = 0; -- SEGURO: dejar 0 para inspeccionar; 1 solo al aplicar voluntariamente.
DECLARE @ConfirmedManualReview BIT = 0; -- 1 solo tras revisar SQL, fuentes y copia de seguridad.
DECLARE @BackupFile NVARCHAR(4000) = N''; -- Ruta absoluta VISIBLE AL SERVICIO SQL Server (.bak).

IF DB_NAME() <> N'CRUDPeliculas'
    THROW 51200, 'CineRD: base inesperada; operacion rechazada.', 1;
IF @Direction NOT IN (N'UP', N'DOWN')
    THROW 51201, 'CineRD: direccion invalida (UP o DOWN).', 1;

DECLARE @Targets TABLE (
    FilmId INT NOT NULL PRIMARY KEY,
    TituloEsperado NVARCHAR(255) NOT NULL,
    BeforeDate DATE NOT NULL,
    AfterDate DATE NOT NULL
);

INSERT INTO @Targets (FilmId, TituloEsperado, BeforeDate, AfterDate)
VALUES
    (10, N'Vamos de robo',
        CASE WHEN @Direction=N'UP' THEN '2014-01-15' ELSE '2014-01-16' END,
        CASE WHEN @Direction=N'UP' THEN '2014-01-16' ELSE '2014-01-15' END),
    (40, N'Colao 2',
        CASE WHEN @Direction=N'UP' THEN '2023-12-07' ELSE '2023-11-30' END,
        CASE WHEN @Direction=N'UP' THEN '2023-11-30' ELSE '2023-12-07' END),
    (55, N'El Plan Perfecto',
        CASE WHEN @Direction=N'UP' THEN '2017-01-17' ELSE '2017-01-19' END,
        CASE WHEN @Direction=N'UP' THEN '2017-01-19' ELSE '2017-01-17' END);

-- Vista previa siempre visible; verifica tres IDs, títulos y valores actuales.
SELECT
    T.FilmId, T.TituloEsperado,
    P.Titulo AS TituloReal,
    CONVERT(CHAR(10), TRY_CONVERT(DATE,P.FechaEstreno), 23) AS FechaRealSql,
    CONVERT(CHAR(10), T.BeforeDate, 23) AS EsperadaParaEstaDireccion,
    CONVERT(CHAR(10), T.AfterDate, 23) AS FechaDestino,
    CASE
        WHEN P.Id IS NULL THEN N'FALTA_FILM'
        WHEN P.Titulo IS NULL
          OR CONVERT(NVARCHAR(MAX),P.Titulo) COLLATE Latin1_General_100_BIN2
             <> T.TituloEsperado COLLATE Latin1_General_100_BIN2
          OR DATALENGTH(CONVERT(NVARCHAR(MAX),P.Titulo)) <> DATALENGTH(T.TituloEsperado)
          THEN N'TITULO_DIFERENTE'
        WHEN P.FechaEstreno IS NULL
          OR TRY_CONVERT(DATETIME2(7),P.FechaEstreno) IS NULL
          OR TRY_CONVERT(DATETIME2(7),P.FechaEstreno) <> CONVERT(DATETIME2(7),T.BeforeDate)
          THEN N'FECHA_DIFERENTE'
        ELSE N'APTO_PARA_REVISION'
    END AS Estado
FROM @Targets AS T
LEFT JOIN dbo.Peliculas AS P ON P.Id=T.FilmId
ORDER BY T.FilmId;

IF @Apply = 0
BEGIN
    PRINT N'CineRD F-2.3: MODO PREVIA. CERO ACTUALIZACIONES SQL.';
    RETURN;
END;

-- Guardas de operación: detener ANTES de tocar las filas.
IF @ConfirmedManualReview <> 1
    THROW 51202, 'CineRD: confirme revision del script y respaldo antes de aplicar.', 1;
IF @BackupFile IS NULL OR LEN(LTRIM(RTRIM(@BackupFile)))=0 OR
   RIGHT(LOWER(LTRIM(RTRIM(@BackupFile))),4) <> N'.bak'
    THROW 51203, 'CineRD: configure una ruta absoluta a respaldo .bak.', 1;
IF NOT (@BackupFile LIKE N'[A-Za-z]:\%' OR @BackupFile LIKE N'\\%')
    THROW 51204, 'CineRD: la ruta .bak no parece absoluta en Windows.', 1;

-- Exige respaldo full reciente de UN SOLO MEDIO en msdb, con CHECKSUM.
-- Una copia de CRUDPeliculas_E2E NO satisface este requisito.
IF NOT EXISTS (
    SELECT 1
    FROM msdb.dbo.backupset AS B
    JOIN msdb.dbo.backupmediaset AS M ON M.media_set_id=B.media_set_id
    JOIN msdb.dbo.backupmediafamily AS F ON F.media_set_id=B.media_set_id
    WHERE B.database_name=N'CRUDPeliculas'
      AND B.type='D'
      AND B.has_backup_checksums=1
      AND M.media_family_count=1
      AND F.physical_device_name=@BackupFile
      AND B.backup_finish_date >= DATEADD(HOUR,-24,GETDATE())
)
    THROW 51205, 'CineRD: no consta respaldo FULL reciente, unico y con checksum en esa ruta.', 1;

-- Verifica integridad del archivo del servidor antes de abrir la transaccion.
RESTORE VERIFYONLY FROM DISK = @BackupFile WITH CHECKSUM;
PRINT N'CineRD: respaldo localizado en msdb y RESTORE VERIFYONLY completado.';

DECLARE @Changes TABLE (
    FilmId INT NOT NULL,
    Titulo NVARCHAR(255),
    BeforeDate DATE,
    AfterDate DATE
);

BEGIN TRY
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    BEGIN TRANSACTION;

    DECLARE @Matched INT;
    SELECT @Matched = COUNT(*)
    FROM @Targets AS T
    JOIN dbo.Peliculas AS P WITH (UPDLOCK, HOLDLOCK) ON P.Id=T.FilmId
    WHERE P.Titulo IS NOT NULL
      AND CONVERT(NVARCHAR(MAX),P.Titulo) COLLATE Latin1_General_100_BIN2
          = T.TituloEsperado COLLATE Latin1_General_100_BIN2
      AND DATALENGTH(CONVERT(NVARCHAR(MAX),P.Titulo))=DATALENGTH(T.TituloEsperado)
      AND P.FechaEstreno IS NOT NULL
      AND TRY_CONVERT(DATETIME2(7),P.FechaEstreno)=CONVERT(DATETIME2(7),T.BeforeDate);

    IF @Matched <> 3
        THROW 51206, 'CineRD: preimagen de ID/titulo/fecha no coincide; cero cambios.', 1;

    UPDATE P
      SET P.FechaEstreno = T.AfterDate
      OUTPUT inserted.Id, inserted.Titulo, deleted.FechaEstreno, inserted.FechaEstreno
        INTO @Changes (FilmId, Titulo, BeforeDate, AfterDate)
    FROM dbo.Peliculas AS P
    INNER JOIN @Targets AS T ON T.FilmId=P.Id;

    IF @@ROWCOUNT <> 3 OR (SELECT COUNT(*) FROM @Changes) <> 3
        THROW 51207, 'CineRD: cantidad de filas inesperada; revertir.', 1;

    IF EXISTS (
        SELECT 1
        FROM @Targets AS T
        JOIN dbo.Peliculas AS P ON P.Id=T.FilmId
        WHERE TRY_CONVERT(DATETIME2(7),P.FechaEstreno)<>CONVERT(DATETIME2(7),T.AfterDate)
    )
        THROW 51208, 'CineRD: valores posteriores distintos; revertir.', 1;

    COMMIT TRANSACTION;
    SELECT N'EJECUCION_MANUAL_CONFIRMADA' AS Resultado,
           @Direction AS Direccion,
           FilmId, Titulo,
           CONVERT(CHAR(10),BeforeDate,23) AS ValorAnterior,
           CONVERT(CHAR(10),AfterDate,23) AS ValorNuevo
    FROM @Changes ORDER BY FilmId;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
