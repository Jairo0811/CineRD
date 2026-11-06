# CineRD.API — migración incremental a ASP.NET Core 10

**Estado:** Fase 1 — lecturas de actores sobre SQL Server. **No sustituye al backend Express** y el frontend sigue usando Express.

## Arquitectura

| Proyecto | Responsabilidad | Contenido de la Fase 1 |
| --- | --- | --- |
| `CineRD.Domain` | Entidades sin dependencias | `Actor`, `ActorConConteos` |
| `CineRD.Application` | DTOs, contratos, casos de uso | `ActorService`, `IActorRepository`, `IDatabaseReadiness`, `ActorListQuery`, `ActorOrden` (lista blanca), DTOs |
| `CineRD.Infrastructure` | SQL Server | `ActorSqlBuilder` (SQL parametrizado), `SqlActorRepository`, `SqlDatabaseReadiness`, `SqlServerConnectionFactory`, `SqlServerOptions`, DI |
| `CineRD.API` | HTTP | `ApiApplication`, endpoints de actores y operativos, conversor JSON de fechas |
| `tests/CineRD.Tests` | xUnit | Unitarias, repositorio en memoria, API en proceso, integración SQL (se omite sin base de pruebas) |

Application no depende de Infrastructure. Solo `SqlServerConnectionFactory` conoce `Microsoft.Data.SqlClient`; el resto usa `System.Data.Common`. No hay SQL en `Program.cs`.

## Dependencias nuevas

- `Microsoft.Data.SqlClient` 6.0.2 (Infrastructure). Sin Dapper: el mapeo es explícito, columna a columna, para controlar tipos y nulos.
- Pruebas: `Microsoft.NET.Test.Sdk` 17.14.1, `xunit` 2.9.3, `xunit.runner.visualstudio` 3.1.0.

> Las versiones se fijaron sin poder restaurar NuGet en el entorno de desarrollo de esta fase. Si `dotnet restore` indica otra versión disponible o un aviso de seguridad, actualízalas.

## Configuración de SQL Server

Prioridad (la última gana): sección `SqlServer` de appsettings → variables `DB_*` del backend Express → `ConnectionStrings:CineRD`.

| Variable | Descripción | Defecto |
| --- | --- | --- |
| `ConnectionStrings__CineRD` | Cadena completa (prioridad máxima) | — |
| `DB_SERVER`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` | Mismas variables que Express | — |
| `DB_PORT` | Puerto | 1433 |
| `DB_ENCRYPT`, `DB_TRUST_CERT` | `true`/`false` | `true` / `false` |
| `DB_CONNECTION_TIMEOUT_MS`, `DB_REQUEST_TIMEOUT_MS` | Timeouts | 15000 / 30000 |
| `DB_POOL_MAX` | Tamaño máximo del pool | 10 |
| `SqlServer__ReadinessTimeoutSeconds` | Timeout de `/ready` | 5 |

Los secretos **no** van en Git. Opciones: variables de entorno, o User Secrets (ya configurado `UserSecretsId`):

```powershell
dotnet user-secrets set "ConnectionStrings:CineRD" "Server=...;Database=...;User ID=...;Password=...;Encrypt=True" --project backend-dotnet/src/CineRD.API/CineRD.API.csproj
```

`appsettings.Development.json` solo contiene valores no secretos. La cadena de conexión nunca se registra en logs; los errores de SQL se registran únicamente por tipo de excepción.

## Ejecutar (desde la raíz del repositorio)

```powershell
dotnet restore backend-dotnet/src/CineRD.API/CineRD.API.csproj
dotnet build backend-dotnet/src/CineRD.API/CineRD.API.csproj -c Release
dotnet run --project backend-dotnet/src/CineRD.API/CineRD.API.csproj --launch-profile http
```

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Mensaje de bienvenida |
| GET | `/health` | 200 si el proceso está vivo (independiente de SQL) |
| GET | `/ready` | 200 si `SELECT 1;` funciona; 503 si SQL no está configurado o no responde |
| GET | `/api/actores` | Listado con filtros `buscar`, `estado`, `anio`, `profesion`, `orden` |
| GET | `/api/actores/{id}` | Detalle de un talento |

Contrato detallado y diferencias con Express: `docs/DOTNET_API_CONTRACTS.md` (sección 7).

Ejemplo (`GET /api/actores/1`, valores ilustrativos):

```json
{ "Id": 1, "TMDbId": null, "Nombres": "Ana", "Apellidos": "Pérez", "NombreCompleto": "Ana Pérez",
  "NombreArtistico": null, "Profesion": "Actriz", "FechaNacimiento": "1990-05-01T00:00:00.000Z",
  "AnioNacimiento": null, "Sexo": "Femenino", "EstaVivo": true, "FechaFallecimiento": null, "Foto": null,
  "InstagramUrl": null, "FacebookUrl": null, "TikTokUrl": null, "YouTubeUrl": null, "SpotifyUrl": null,
  "XUrl": null, "SitioWebUrl": null, "EsVerificado": false }
```

## Pruebas

```powershell
dotnet test backend-dotnet/tests/CineRD.Tests/CineRD.Tests.csproj
```

Las pruebas contra SQL Server real se omiten (aparecen como *Skipped*) salvo que definas `CINERD_TEST_SQL_CONNECTION` con la cadena de una base de **pruebas**:

```powershell
$env:CINERD_TEST_SQL_CONNECTION = "Server=...;Database=CineRD_Test;..."
dotnet test backend-dotnet/tests/CineRD.Tests/CineRD.Tests.csproj
```

### Paridad Express vs .NET (misma base de pruebas)

```powershell
# terminal 1: Express (puerto 3000); terminal 2: API .NET (puerto 5100)
node scripts/compareActoresParity.mjs --express http://localhost:3000 --dotnet http://localhost:5100
```

Compara código HTTP, claves y su orden, tipos, valores, `null`, fechas y orden de filas en 16 variantes de consulta y en todos los ids del listado. Termina con código distinto de 0 si hay diferencias. No escribe datos.

## Pruebas ejecutadas en esta fase

- Compilación Release de los cuatro proyectos con el SDK .NET 10.0.401: correcta, 0 advertencias (advertencias tratadas como errores).
- El código real de las pruebas (81 casos) se ejecutó con un runner mínimo propio sustituyendo xunit y el proveedor SQL por stand-ins locales (NuGet no era accesible): **81 pasaron, 0 fallaron**, 2 omitidas (integración SQL real). **No es una ejecución con xunit real** ni contra SQL Server.
- HTTP real contra la API compilada: `/health` 200; `/ready` 503 (`not-configured` y `unavailable`); ids inválidos 400; sin filtrar secretos en respuestas ni logs.
- `compareActoresParity.mjs` validado contra servidores simulados (detecta diferencias de tipo y devuelve código 1).

## Pendiente / limitaciones

- **Aceptación funcional contra SQL Server real** (consultas, conteos, ordenaciones, paridad con Express).
- Ejecutar la suite con xunit real tras `dotnet restore`.
- CORS y `/uploads/**` no implementados: el frontend no puede consumir esta API desde el navegador todavía.
- Sin autenticación ni escrituras (Fase 5 y 4 del plan).
- `COUNT`/subconsulta de directores se replica tal cual de Express (coste O(actores × películas)); optimizar después de la paridad.

## Reglas de migración

1. No cambiar React, SQL Server, el snapshot público ni los despliegues en esta fase.
2. Conservar rutas, métodos, JSON, códigos HTTP y reglas de autorización del backend actual.
3. Migrar esquema y contraseña **sin** recrear usuarios, regenerar hashes ni invalidar sesiones.
4. Los archivos públicos actuales y las evidencias privadas requieren migración separada y verificada.
5. No exponer `PRIVATE_STORAGE_DIR`, secretos ni datos personales.
6. Implementar pruebas de contratos y paridad antes de cambiar el tráfico.

Ver `docs/DOTNET_MIGRATION_PLAN.md` para inventario y condiciones de salida.
