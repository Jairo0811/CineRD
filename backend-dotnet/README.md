# CineRD.API — migración incremental a ASP.NET Core 10

**Estado:** Fase 0 (fundación técnica). No sustituye al backend Express.

## Estructura

- `CineRD.Domain`: entidades, reglas de dominio (sin dependencias externas).
- `CineRD.Application`: contratos, DTOs, casos de uso.
- `CineRD.Infrastructure`: persistencia SQL Server y almacenamiento R2 futuro.
- `CineRD.API`: transporte HTTP y composición de servicios.

## Requisitos

SDK .NET 10 instalado. Esta primera entrega no incluye paquetes NuGet externos, conexión SQL ni endpoints de catálogo; evita generar respuestas simuladas de datos reales.

## Ejecutar desde la raíz del repositorio

```powershell
dotnet restore backend-dotnet/src/CineRD.API/CineRD.API.csproj
dotnet build backend-dotnet/src/CineRD.API/CineRD.API.csproj -c Release
dotnet run --project backend-dotnet/src/CineRD.API/CineRD.API.csproj --launch-profile http
```

Comprobar `http://localhost:5100/health` (200); `http://localhost:5100/ready` debe devolver 503 hasta implementar la conectividad SQL. La aplicación Express continúa en su puerto normal.

## Reglas de migración

1. No cambiar React, SQL Server, el snapshot público ni los despliegues en esta fase.
2. Conservar rutas, métodos, JSON, códigos HTTP y reglas de autorización del backend actual.
3. Migrar esquema y contraseña **sin** recrear usuarios, regenerar hashes ni invalidar sesiones.
4. Los archivos públicos actuales y las evidencias privadas requieren migración separada y verificada.
5. No exponer `PRIVATE_STORAGE_DIR`, secretos ni datos personales.
6. Implementar pruebas de contratos y paridad antes de cambiar el tráfico.

Ver `docs/DOTNET_MIGRATION_PLAN.md` para inventario y condiciones de salida.
