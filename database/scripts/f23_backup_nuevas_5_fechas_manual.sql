/*
  CineRD F-2.3 — respaldo NUEVO para segundo lote de 5 fechas aprobadas.
  SOLO ejecutarlo manualmente en SSMS conectado al servidor original.
  FULL COPY_ONLY + CHECKSUM + RESTORE VERIFYONLY.
  Requiere permisos de backup y carpeta predeterminada válida.
  NO modifica registros dbo.Peliculas.
  No sustituye una restauración de prueba.
*/
USE [master];
GO
SET NOCOUNT ON;
IF DB_ID(N'CRUDPeliculas') IS NULL
    THROW 51400, 'No existe CRUDPeliculas.', 1;
DECLARE @Dir NVARCHAR(4000) =
    CONVERT(NVARCHAR(4000),SERVERPROPERTY('InstanceDefaultBackupPath'));
IF @Dir IS NULL OR LEN(@Dir)=0
    THROW 51401, 'Falta directorio de respaldos del servidor SQL.', 1;
IF RIGHT(@Dir,1) NOT IN (N'\',N'/') SET @Dir=@Dir+N'\';
DECLARE @File NVARCHAR(4000) = @Dir + N'CRUDPeliculas_F23_5_' +
    CONVERT(NVARCHAR(8),GETDATE(),112)+N'_'+
    REPLACE(CONVERT(NVARCHAR(36),NEWID()),N'-',N'')+N'.bak';
BACKUP DATABASE [CRUDPeliculas]
TO DISK=@File
WITH COPY_ONLY,CHECKSUM,STATS=10;
RESTORE VERIFYONLY FROM DISK=@File WITH CHECKSUM;
SELECT N'BACKUP_F23_5_VERIFICADO' AS Estado,
       @File AS RutaBackup,
       N'CRUDPeliculas' AS BaseDatos;
GO
