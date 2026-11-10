/*
  CineRD F-2.3 — SEGUNDO LOTE: cinco fechas autorizadas por el titular.
  Fuente: docs/f23-approved-remaining-5-dates-2026-11-09.json
  FECHA DE NUEBA YOL 3 (#36): aprobación del titular, no prueba independiente
  del estreno comercial en RD; diferencia con fecha de EE. UU. en IMDb.
  OBJETIVO: SOLO dbo.Peliculas.FechaEstreno en CRUDPeliculas,
  IDs exactamente 27,36,42,44,56; NO tocar los IDs 10,40,55 ya corregidos.
  PREDETERMINADO @Apply=0: SOLO VISTA PREVIA, NO UPDATE.
  ANTES DE @Apply=1: ejecutar backup F23_5 manual completo y VERIFICAR archivo;
  leer ruta, cinco preimágenes, fuentes y caveat de #36.
  @Direction UP aplica; DOWN revierte exclusivamente si ya están las cinco nuevas.
  Esta tarea nunca registra firmas, autoriza sinopsis ni altera derechos multimedia.
*/
USE [CRUDPeliculas];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;

-- MODIFICAR ESTAS DOS VARIABLES SOLO AL APLICAR DELIBERADAMENTE.
DECLARE @Direction NVARCHAR(4) = N'UP';
DECLARE @Apply BIT = 0; -- 0: previa, 1: aplicación real.
DECLARE @ConfirmedManualReview BIT = 0; -- 1 solo tras comprobar respaldo nuevo y fuentes.

IF DB_NAME() <> N'CRUDPeliculas'
    THROW 51500, 'CineRD: la base activa no es CRUDPeliculas.', 1;
IF @Direction NOT IN (N'UP',N'DOWN')
    THROW 51501, 'CineRD: direccion invalida (UP/DOWN).', 1;

DECLARE @Targets TABLE (
  FilmId INT NOT NULL PRIMARY KEY,
  TituloEsperado NVARCHAR(255) NOT NULL,
  BeforeDate DATE NOT NULL,
  AfterDate DATE NOT NULL
);
INSERT INTO @Targets (FilmId,TituloEsperado,BeforeDate,AfterDate)
VALUES
    (27,N'Lotoman 003: Volando Bajito',
      CASE WHEN @Direction=N'UP' THEN '2014-03-15' ELSE '2014-03-27' END,
      CASE WHEN @Direction=N'UP' THEN '2014-03-27' ELSE '2014-03-15' END),
    (36,N'Nueba Yol 3: Bajo la Nueva Ley',
      CASE WHEN @Direction=N'UP' THEN '1997-10-31' ELSE '1997-10-23' END,
      CASE WHEN @Direction=N'UP' THEN '1997-10-23' ELSE '1997-10-31' END),
    (42,N'Andrea',
      CASE WHEN @Direction=N'UP' THEN '2005-08-16' ELSE '2005-08-18' END,
      CASE WHEN @Direction=N'UP' THEN '2005-08-18' ELSE '2005-08-16' END),
    (44,N'Playball',
      CASE WHEN @Direction=N'UP' THEN '2008-02-01' ELSE '2008-02-14' END,
      CASE WHEN @Direction=N'UP' THEN '2008-02-14' ELSE '2008-02-01' END),
    (56,N'La Lucha de Ana',
      CASE WHEN @Direction=N'UP' THEN '2012-04-13' ELSE '2012-05-24' END,
      CASE WHEN @Direction=N'UP' THEN '2012-05-24' ELSE '2012-04-13' END);

-- Buscar EXCLUSIVAMENTE un backup NUEVO de este segundo lote;
-- nunca reutilizar el backup F23 del grupo anterior de tres películas.
DECLARE @BackupFile NVARCHAR(4000)=NULL;
SELECT TOP (1) @BackupFile=F.physical_device_name
FROM msdb.dbo.backupset AS B
JOIN msdb.dbo.backupmediaset AS M ON M.media_set_id=B.media_set_id
JOIN msdb.dbo.backupmediafamily AS F ON F.media_set_id=B.media_set_id
WHERE B.database_name=N'CRUDPeliculas'
  AND B.type='D' AND B.is_copy_only=1 AND B.has_backup_checksums=1
  AND M.media_family_count=1
  AND B.backup_finish_date >= DATEADD(HOUR,-24,GETDATE())
  AND F.physical_device_name LIKE N'%CRUDPeliculas[_]F23[_]5[_]%.bak'
ORDER BY B.backup_finish_date DESC,B.backup_set_id DESC;

SELECT
    T.FilmId, T.TituloEsperado, P.Titulo AS TituloSql,
    CONVERT(CHAR(10),TRY_CONVERT(DATE,P.FechaEstreno),23) AS FechaSqlActual,
    CONVERT(CHAR(10),T.BeforeDate,23) AS FechaEsperada,
    CONVERT(CHAR(10),T.AfterDate,23) AS FechaNueva,
    CASE
      WHEN P.Id IS NULL THEN N'FALTA_PELICULA'
      WHEN P.Titulo IS NULL
        OR CONVERT(NVARCHAR(MAX),P.Titulo) COLLATE Latin1_General_100_BIN2
           <> T.TituloEsperado COLLATE Latin1_General_100_BIN2
        OR DATALENGTH(CONVERT(NVARCHAR(MAX),P.Titulo))<>DATALENGTH(T.TituloEsperado)
        THEN N'TITULO_NO_COINCIDE'
      WHEN P.FechaEstreno IS NULL
        OR TRY_CONVERT(DATETIME2(7),P.FechaEstreno)
           <> CONVERT(DATETIME2(7),T.BeforeDate)
        THEN N'FECHA_NO_COINCIDE'
      ELSE N'APTO_PARA_REVISION'
    END AS Estado
FROM @Targets T
LEFT JOIN dbo.Peliculas P ON P.Id=T.FilmId
ORDER BY T.FilmId;
SELECT @BackupFile AS RutaBackupSeleccionado,
       CASE WHEN @BackupFile IS NULL THEN N'FALTA_BACKUP_NUEVO_F23_5'
       ELSE N'ENCONTRADO_NO_VERIFICADO_EN_PREVIA' END AS EstadoBackup;

IF @Apply=0
BEGIN
  PRINT N'CineRD F-2.3 (5 fechas): VISTA PREVIA, CERO ACTUALIZACIONES.';
  RETURN;
END;

IF @ConfirmedManualReview<>1
  THROW 51502, 'CineRD: confirmar lectura de fuentes, caveat de #36 y respaldo.', 1;
IF @BackupFile IS NULL
  THROW 51503, 'CineRD: no se encontro backup nuevo F23_5 reciente (24h).', 1;

RESTORE VERIFYONLY FROM DISK=@BackupFile WITH CHECKSUM;
PRINT N'CineRD: respaldo del segundo lote verificado.';

DECLARE @Changes TABLE (
  FilmId INT NOT NULL,
  Titulo NVARCHAR(255),
  OldDate DATE,
  NewDate DATE
);
BEGIN TRY
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  BEGIN TRANSACTION;
  DECLARE @Matched INT;
  SELECT @Matched=COUNT(*)
  FROM @Targets T
  JOIN dbo.Peliculas P WITH (UPDLOCK,HOLDLOCK) ON P.Id=T.FilmId
  WHERE P.Titulo IS NOT NULL
    AND CONVERT(NVARCHAR(MAX),P.Titulo) COLLATE Latin1_General_100_BIN2
        = T.TituloEsperado COLLATE Latin1_General_100_BIN2
    AND DATALENGTH(CONVERT(NVARCHAR(MAX),P.Titulo))=DATALENGTH(T.TituloEsperado)
    AND P.FechaEstreno IS NOT NULL
    AND TRY_CONVERT(DATETIME2(7),P.FechaEstreno)
        = CONVERT(DATETIME2(7),T.BeforeDate);

  IF @Matched<>5
    THROW 51504, 'CineRD: no coinciden las CINCO preimagenes; cero cambios.', 1;

  UPDATE P SET P.FechaEstreno=T.AfterDate
    OUTPUT inserted.Id,inserted.Titulo,deleted.FechaEstreno,inserted.FechaEstreno
      INTO @Changes (FilmId,Titulo,OldDate,NewDate)
  FROM dbo.Peliculas P
  JOIN @Targets T ON T.FilmId=P.Id;

  IF @@ROWCOUNT<>5 OR (SELECT COUNT(*) FROM @Changes)<>5
    THROW 51505, 'CineRD: no fueron exactamente cinco cambios; revertir.', 1;
  IF EXISTS (
    SELECT 1 FROM @Targets T
    JOIN dbo.Peliculas P ON P.Id=T.FilmId
    WHERE P.FechaEstreno IS NULL
       OR TRY_CONVERT(DATETIME2(7),P.FechaEstreno)
          <> CONVERT(DATETIME2(7),T.AfterDate)
  )
    THROW 51506, 'CineRD: validacion posterior incorrecta; revertir.', 1;

  COMMIT TRANSACTION;
  SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
  SELECT N'EJECUCION_MANUAL_CONFIRMADA' AS Resultado,
         @Direction AS Direccion, FilmId, Titulo,
         CONVERT(CHAR(10),OldDate,23) AS FechaAnterior,
         CONVERT(CHAR(10),NewDate,23) AS FechaNueva
  FROM @Changes ORDER BY FilmId;
END TRY
BEGIN CATCH
  IF XACT_STATE()<>0 ROLLBACK TRANSACTION;
  SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
  THROW;
END CATCH;
GO
