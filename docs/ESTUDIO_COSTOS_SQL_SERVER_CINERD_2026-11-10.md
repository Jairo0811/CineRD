# CineRD — comparación de SQL Server administrado y presupuesto de lanzamiento

**Fecha del estudio:** 2026-11-10. **Moneda:** USD, mes de 730 horas, impuestos y descuentos excluidos. **No se ha comprado ni creado ningún recurso.**
**Estado:** presupuesto orientativo para toma de decisión; presupuestos finales deben confirmarse dentro de las consolas oficiales para la región elegida.

## Resumen ejecutivo

**Propuesta prioritaria para CineRD:** `Render Starter (Node.js) + disco 5 GB + Azure SQL Database Basic`, **US$13.15/mes** de tarifa de referencia, *condicionado a demostrar compatibilidad de esquema, importación y capacidad de 2 GB*. Si Basic no cumple, evaluar Azure SQL S0 **US$22.97/mes**. Para pruebas aisladas, Azure SQL Free + Render Starter puede bajar el componente SQL a cero, pero **no es una configuración de producción garantizada** y no permite restaurar una base SQL preexistente al nivel gratuito. AWS RDS for SQL Server Express es alternativa de motor más cercano a una instancia, pero suele encarecer el proyecto.

No alojar SQL Server dentro del contenedor Node de Render, no sustituirlo por PostgreSQL de forma implícita, no publicar SQL Server local en Internet y no abrir firewall a todo el mundo.

### Comparación mensual por proveedor

| Alternativa de base de datos | SQL al mes aprox. | Render Starter + disco 5 GB | Subtotal mensual orientativo | Uso recomendado | Observaciones |
|---|---:|---:|---:|---|---|
| **Azure SQL Database Free** | $0 dentro de cuotas | $8.25 | **$8.25** | Desarrollo/PoC | 100.000 vCore-segundos/mes, 32 GB datos y 32 GB backups; sin SLA; al agotar cuota puede quedar indisponible hasta mes siguiente; crear base nueva, no restaurar DB existente al nivel gratuito |
| **Azure SQL Basic (5 DTU)** | ~$4.90 | $8.25 | **~$13.15** | Catálogo pequeño, piloto estable | 2 GB de almacenamiento total; rendimiento muy limitado, validar consultas, concurrencia y capacidad; precio de referencia East US |
| **Azure SQL Standard S0 (10 DTU)** | ~$14.72 | $8.25 | **~$22.97** | Piloto/producto pequeño con holgura | 250 GB incluidos según modelo DTU S0; probar antes de elegir; fuente de tarifa regional no contractual |
| **AWS RDS SQL Server Express Single-AZ db.t3.micro** | ~$16.06 instancia + ~$2.30/20 GiB gp3 = **~$18.36** | $8.25 | **~$26.61** | Cuando se necesita instancia SQL Server y no Azure SQL DB | Precio ejemplo us-east-1, 730 h; almacenamiento, CPU excedente, snapshots/transferencia podrían aumentar; confirmar edición/versiones y elegibilidad de instancia |

**Costos adicionales no necesariamente recurrentes:** dominio propio (si se necesita para `EMAIL_FROM`), servicios de monitoreo, retención extendida o exportación de backups, tráfico entre proveedores/regiones, salidas de Render, transferencia de base de datos, herramientas de migración y cualquier impuesto aplicable. Se requieren presupuestos específicos antes de cobrar. No sumar plan de espacio de trabajo Render Pro salvo que se elija expresamente; la cuenta permite Hobby + consumo de servicios.

### Supuestos verificables de Render

- El Blueprint actual `render.yaml` usa **web Starter**, `/ready`, **disco persistente de 5 GB** en `/var/data`, subdirectorios `/var/data/uploads` y `/var/data/private`.
- Render publica Starter a **$7/mes** y discos a **$0.25/GB-mes**; 5 × 0.25 = $1.25. Base Render: **$8.25/mes**.
- Disco persistente exige servicio pagado, no plan Free. Hace que el despliegue pierda modalidad zero-downtime y no debe considerarse un respaldo aislado.
- Datos de Render confirmados en esta investigación: solo existe un servicio ajeno a CineRD, `eventix` (Free, Oregon). **No se modifica Eventix** ni se crea `cinerd-api` por estudiar el costo.
- Render tiene rangos de IP saliente por región. Para Azure SQL usar regla de firewall restringida a rangos aplicables, comprobar seguridad/riesgo de rangos compartidos y planificar IP dedicada si es requisito contractual; **NO** habilitar acceso SQL indiscriminado `0.0.0.0/0`.

### Correo, dominio y publicación

- Resend Free: **$0/mes, 3.000 emails/mes, máximo 100/día**; suficiente como presupuesto inicial, *no prueba que el dominio/remitente esté verificado*.
- Cloudflare Pages ya proporciona un subdominio de catálogo; presupuesto incremental de ese hosting **$0 dentro del uso gratuito**, sujeto a límites propios y a comprobar que el plan aplicado sea realmente gratuito.
- Si se exige dominio propio para envíos y branding, **no inventar precio**: elegir registrador/TLD y cotizar compra/renovación y condiciones de privacidad de dominio. No asumir que una dirección gratuita de correo autoriza enviar desde cualquier dominio.
- Publicidad: **$0 ingresados en presupuesto** mientras `VITE_ADSENSE_ENABLED` siga desactivado y Google no haya confirmado autorización; ingresos esperados **$0** para justificar gasto.

## Medición SSMS de tamaño — 2026-11-10

El titular ejecutó una consulta `SELECT` contra `sys.database_files` de la base local `CRUDPeliculas` en SSMS. La captura compartida muestra **DatosAsignadosMB = 8.00**, **LogAsignadoMB = 8.00** y ejecución correcta. **Total asignado = 16 MB; datos asignados = 8 MB (~0.39% de los 2,048 MB disponibles en Azure SQL Basic)**.

**Alcance y cautelas:** las cifras son **espacio asignado**, no bytes usados ni tamaño definitivo de importación. La captura no prueba capacidad de cómputo, compatibilidad Azure SQL, migración exitosa, el rendimiento de 5 DTU ni si hay archivos de usuario fuera de la base (por ejemplo, `uploads`). El archivo log no se suma al límite de 2 GB de datos de Basic como si fuera la misma categoría de almacenamiento. **Basic sigue siendo candidato, no una contratación autorizada.** 

### Segunda medición SSMS — utilización efectiva de las páginas asignadas

La segunda consulta de solo lectura aportada por el titular devuelve **DatosAsignadosMB = 8.00** y **DatosUsadosMB = 7.38**, sobre la misma base `CRUDPeliculas`; diferencia: **0.62 MB asignados sin usar**. El resultado equivale a **92.25% del archivo de datos ya asignado** y **~0.36% de un límite referencial de 2,048 MB de Azure SQL Basic**. El archivo de datos pequeño puede crecer conforme se incorporen registros: ese 92.25% no representa proximidad al máximo de la nube.

**Interpretación:** el almacenamiento **no es el impedimento actual** para un piloto Basic. La consulta de `FILEPROPERTY(name, 'SpaceUsed')` mide espacio de páginas utilizado; no garantiza que una importación a Azure SQL mantenga un tamaño idéntico, ni evidencia rendimiento, compatibilidad de migraciones, tamaño de archivos fuera de SQL o necesidad de respaldos.

### Comprobación complementaria de solo lectura en SSMS

```sql
USE CRUDPeliculas;
GO
SELECT
    DB_NAME() AS BaseDeDatos,
    SUM(CASE WHEN type_desc = 'ROWS' THEN size ELSE 0 END) * 8.0 / 1024 AS DatosAsignadosMB,
    SUM(CASE WHEN type_desc = 'ROWS' THEN FILEPROPERTY(name,'SpaceUsed') ELSE 0 END) * 8.0 / 1024 AS DatosUsadosMB,
    SUM(CASE WHEN type_desc = 'LOG' THEN size ELSE 0 END) * 8.0 / 1024 AS LogAsignadoMB
FROM sys.database_files;
GO
SELECT
    t.name AS Tabla,
    SUM(p.row_count) AS Filas,
    CAST(SUM(p.reserved_page_count) * 8.0 / 1024 AS DECIMAL(12,2)) AS ReservadoMB,
    CAST(SUM(p.used_page_count) * 8.0 / 1024 AS DECIMAL(12,2)) AS UsadoMB
FROM sys.dm_db_partition_stats AS p
JOIN sys.tables AS t ON t.object_id = p.object_id
WHERE p.index_id IN (0, 1)
GROUP BY t.name
ORDER BY ReservadoMB DESC, t.name;
```

No contiene escritura, migración ni cambios de permisos. Las métricas `sys.dm_db_partition_stats` dependen de permisos de consulta sobre metadatos concedidos al usuario local.
 
## Restricciones técnicas detectadas en el repositorio

**Hechos observados en GitHub (`feat/cinerd-abc-release-gates-20261110`):**

1. `backend/src/config/db.js` usa `mssql`, credenciales `DB_*`, cifrado y `trustServerCertificate: false` por defecto; puede conectar a Azure SQL por TCP/TLS si la red y el usuario están configurados, pero la compatibilidad del esquema **no está probada**.
2. `database/migrations/002_*.sql` hasta `015_*.sql` contienen `USE CRUDPeliculas`. Azure SQL Database no permite cambiar a otra base con `USE`; solo admite indicar la base de destino al conectarse. El nombre real debe ser `CRUDPeliculas` si se reutilizan las migraciones tal cual, y conviene eliminar `USE` en una variante Azure explícitamente revisada sin ejecutar SQL de manera automática.
3. `CRUD-Peliculas.sql` intenta crear una base con `CREATE DATABASE CRUDPeliculas` e incluye `USE` y `UPDATE` de normalización. **No ejecutar el script monolítico de desarrollo sobre una base Azure ni sobre producción existente**. Diseñar DDL para esquema de base ya aprovisionada, sin creación de servidor y con preflight/backups.
4. `Login-CRUD-Peliculas.sql` contiene un bloque SQLCMD/contraseña **duplicado y con una cadena T-SQL interrumpida visible en la versión consultada**. **No ejecutarlo sin reparar y validar en una instancia aislada**. Ese script contiene `USE master`, login a nivel de servidor y `db_owner` que no representan el proceso de alta de usuario de aplicación de mínimo privilegio en Azure SQL Database.
5. `backend/scripts/migrate.js` valida instrucciones `USE` contra `DB_DATABASE`, pero no certifica que cada operación sea compatible con Azure SQL ni sustituye un backup/rollback.
6. Históricamente se verificaron 8 fechas F2.3 y 7 valores E-4 ya presentes en SQL. **No repetir UPDATE** en un nuevo alojamiento ni deducir aprobación de la coincidencia.

### Alternativas de transferencia de datos

- **Azure SQL Database pagada:** estudiar `SqlPackage` **Export (.bacpac) / Import** en una base *nueva* y comprobar restricciones de esquema. Se requiere comparador de tablas, recuentos y claves, y prueba de `/ready`. `.bacpac` incluye datos y **no va cifrado automáticamente**: custodiarlo fuera de GitHub. Alternativa: esquema portable + importación parametrizada desde snapshot validado; no tomar `.bak` como soporte nativo de Azure SQL Database.
- **Azure SQL Free:** Microsoft limita la oferta a bases nuevas; **no** hacer promesas de restaurar o importar una base existente directamente a una base Free. La prueba podría recrear esquema y cargar un catálogo de demostración nuevo, únicamente después de validar la ruta de datos permitida y sin riesgos de producción.
- **AWS RDS SQL Server:** mayor similitud con SQL Server clásico; verificar versión, edición/licencia y método documentado de `BACKUP/RESTORE` con S3 para la instancia elegida. No asumir soporte de comandos de instancia local sin preflight.
- **Cualquier proveedor:** mantener una ruta de restauración en instancia aislada y evidencia real; `RESTORE VERIFYONLY` solo valida estructura de backup, no es un restore drill completo.

## Presupuesto y decisión sugerida

| Presupuesto | API + disco | SQL | Resend inicial | Total/mes estimado |
|---|---:|---:|---:|---:|
| **Validación no comercial (Free SQL)** | $8.25 | $0 | $0 | **$8.25** |
| **Piloto estable de bajo costo (Basic)** | $8.25 | $4.90 | $0 | **$13.15** |
| **Piloto de mayor capacidad (S0)** | $8.25 | $14.72 | $0 | **$22.97** |
| **Motor SQL Server administrado (AWS Express ejemplo)** | $8.25 | $18.36 | $0 | **$26.61** |

**Presupuesto anual de base para Basic:** ~$157.80 (12 × $13.15), **sin impuestos, tráfico adicional, dominio, costos de copia/monitoreo ni ajuste de niveles**. No equivale a factura contractual.

**Recomendación condicionada:** estudiar **Azure SQL Database Basic** primero por coste y SQL compatible, siempre que el esquema, las funciones, datos y cargas superen pruebas en una base aislada y que 2 GB sean suficientes. Si Basic no cumple, considerar **S0**; si hay dependencia insalvable de funciones de instancia/backup nativo, **AWS RDS SQL Server Express**. **Azure Free solo para validación/PoC sin SLA**.

## Ruta operativa para decisión sin cargos

1. Confirmar región deseada (por latencia con Render, elegir ubicaciones compatibles y cotizar transferencia) y medir tamaño real de `CRUDPeliculas` desde SSMS mediante consulta de solo lectura.
2. Ejecutar un análisis de compatibilidad de migraciones SQL en copia/instancia de prueba. Reparar primero el script `Login-CRUD-Peliculas.sql` en una rama separada con pruebas, no en SQL de producción.
3. Verificar si Azure SQL Basic soporta el esquema, colaciones, índices, constraints y permisos sin cambiar IDs, fechas ni sinopsis. No basta con una conexión al puerto 1433.
4. Preparar un BACPAC local cifrado en tránsito/custodiado en repositorio **privado fuera de GitHub** o transferencia segura de esquema/datos; no subir texto editorial de terceros ni licencias sin autorización.
5. Simular con datos no sensibles la conexión Render → Azure SQL mediante TLS y firewall restrictivo, seguido de `/health` y `/ready`.
6. Cotizar y mostrar en consolas oficiales Azure/AWS/Render el importe final mensual, transferencias, backups, retenciones y moneda de factura **antes de cualquier creación facturable**.
7. Registrar evidencia de backup restaurado, email real, flujos de roles/usuarios y auditoría de seguridad. Mantener API, medios y Ads con controles existentes hasta ese momento.

## Fuentes para confirmar antes de contratar

- Microsoft Free tier: https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier
- Microsoft FAQ Free: https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier-faq
- Microsoft Basic DTU limits: https://learn.microsoft.com/en-us/azure/azure-sql/database/resource-limits-dtu-single-databases
- Microsoft SqlPackage/BACPAC: https://learn.microsoft.com/en-us/sql/tools/sqlpackage/sqlpackage
- Microsoft Azure SQL `USE` restrictions: https://learn.microsoft.com/en-us/sql/t-sql/language-elements/use-transact-sql
- Microsoft Azure SQL pricing/cost: https://azure.microsoft.com/en-us/pricing/details/azure-sql-database/single/ y https://learn.microsoft.com/en-us/azure/azure-sql/database/cost-management
- Precio de referencia Azure East US (oct 2026), fuente secundaria para valores concretos sujetos a calculadora: https://codewithsql.com/cloud-databases/azure/azure-sql-database/pricing
- Render price: https://render.com/pricing
- Render persistent disks: https://render.com/docs/disks
- Render outbound ranges: https://render.com/docs/outbound-ip-addresses
- Amazon RDS SQL Server licensing/pricing: https://aws.amazon.com/rds/sqlserver/pricing/
- Ejemplo de precios AWS SQL Express 2026, fuente secundaria/no contractual: https://cloudcostdb.com/aws/databases/rds/sql-server/
- AWS minimum storage: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Storage.html
- Resend: https://resend.com/pricing

**Control de cambios:** este documento no crea ninguna base, servicio de pago, regla de firewall, contraseña ni migración; Render/Eventix, SQL local, PRs y AdSense quedan sin cambios operativos.
