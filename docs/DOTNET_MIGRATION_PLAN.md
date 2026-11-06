# CineRD — Plan de migración Node.js/Express → ASP.NET Core 10

## Línea de base confirmada (05-11-2026)

- Frontend: React 18 + Vite 6, despliegue estático en Cloudflare Pages.
- Backend actual: Express 5 / Node.js / `mssql`, SQL Server, Multer, Sharp, bcryptjs, JWT.
- Snapshot público v3 validado: 83 talentos, 46 películas, 216 participaciones, 28 créditos, 12 elementos multimedia, 128 imágenes.
- Commit de producción inicial: `0321581`.
- Esta rama incorpora infraestructura paralela en `backend-dotnet/`; `backend/` y `frontend/` permanecen sin modificar.

## Inventario de grupos HTTP existentes

| Prefijo Express | Responsabilidad | Acceso |
| --- | --- | --- |
| `/api/actores` | talento, CRUD, fotografías | lectura pública; escritura ADMINISTRADOR |
| `/api/peliculas` | películas, perfiles, créditos, traducciones | lectura pública; escritura ADMINISTRADOR |
| `/api/actores-peliculas` | participaciones, debuts y reparto | lectura pública; escritura ADMINISTRADOR |
| `/api/auth` | registro, login, refresh, logout, perfil, recuperación y verificación | público/protegido según ruta |
| `/api/verificaciones` | identidad de talento y vinculación | USUARIO, TALENTO_VERIFICADO, ADMINISTRADOR |
| `/api/solicitudes-creditos` | reclamaciones y evidencias privadas | TALENTO_VERIFICADO y ADMINISTRADOR |
| `/api/tmdb` | consultas TMDb y vinculación | lectura pública; vinculación ADMINISTRADOR |
| `/api/busqueda` | búsqueda global | pública |
| `/api/premios` | premios y nominaciones | lectura pública; escritura ADMINISTRADOR |
| `/api/galeria` | medios de catálogo | lectura pública; escritura ADMINISTRADOR |
| `/uploads` | imágenes públicas | archivos públicos; NO evidencias privadas |
| `/health`, `/ready` | salud y conectividad SQL | monitoreo |

Fuentes primarias: `backend/src/app.js`, `backend/src/routes/*.js`, `backend/src/controllers/*.js`.

## Fases de ejecución

0. **Fundación:** 4 proyectos `net10.0`, API mínima, health real, readiness 503 intencional. Sin tráfico real.
1. **Paridad contractual:** extraer lista exacta de endpoints con DTOs, casing, nombres de campos, status codes, validaciones, errores, cookies y archivos; crear pruebas de contrato.
2. **SQL Server:** revisar migraciones y esquema existentes; adaptar lecturas con Dapper/EF Core según necesidad; introducir `/ready` con chequeo SQL real. No aplicar migraciones destructivas.
3. **Catálogo público:** lectura de actores, películas, filmografías, créditos y búsqueda; probar respuestas equivalentes.
4. **Escrituras y medios:** CRUD, carga/normalización, compatibilidad de rutas y migración opcional a R2 con respaldos.
5. **Identidad y confianza:** bcrypt y formato de hash existentes, JWT/refresh, cookies, revocación, RBAC, verificación y reclamaciones. No sustituir por Identity sin plan de compatibilidad.
6. **Integraciones y endurecimiento:** TMDb, correo, auditoría, rate limiting, pruebas y Docker.
7. **Cutover:** ejecutar ambos backends, comparar contratos, activar gradualmente con rollback; retirar Express solo después de paridad aprobada.

## Contratos críticos a preservar

- Nombres originales de rutas y claves JSON en español (por ejemplo `Foto`, `NombreCompleto`).
- Roles: `USUARIO`, `TALENTO_VERIFICADO`, `ADMINISTRADOR`.
- JWT, refresh tokens rotativos, cookies `HttpOnly`, controles de revocación y seguridad.
- CORS de `https://cinerd.pages.dev`, con credenciales según contrato existente.
- `/uploads/actores`, `/uploads/peliculas`, `/uploads/galerias` y evidencia protegida.
- Snapshot de demo estática: debe continuar funcionando independiente del nuevo backend.

## Definición de terminado de la fase 0

- [x] Rama separada desde `0321581`.
- [x] Proyectos Domain/Application/Infrastructure/API definidos.
- [x] Endpoints básicos de health/readiness.
- [x] Compilación verificada en Windows con SDK .NET 10.0.403 (cuatro proyectos, Release).
- [x] Pruebas HTTP locales: `/health` respondió 200, `/ready` respondió 503 intencional por SQL sin configurar.
- [x] Inventario endpoint-por-endpoint (ver `DOTNET_API_CONTRACTS.md`).

## Definición de terminado de la fase 1 (SQL Server + lecturas de actores)

Alcance: `GET /api/actores`, `GET /api/actores/{id}` y `/ready` con comprobación real de SQL Server. Sin escrituras, sin autenticación, sin cambios en el frontend.

- [x] `feature/dotnet10-migration` sincronizada con `main` (merge sin conflictos).
- [x] Cuatro proyectos compilan en Release con advertencias como errores.
- [x] Acceso a SQL Server de solo lectura: `System.Data.Common` + `Microsoft.Data.SqlClient`, consultas parametrizadas, timeouts, `CancellationToken`, ORDER BY por lista blanca.
- [x] Contrato JSON de actores igual al de Express (nombres PascalCase, orden de claves, `null`, booleanos, fechas `...T00:00:00.000Z`).
- [x] `/ready`: 200 con SQL accesible, 503 si no está configurado o no responde, sin exponer datos de conexión.
- [x] Pruebas automatizadas escritas (unitarias, repositorio con base en memoria, API en proceso).
- [x] Aceptación funcional contra SQL Server real (05-11-2026, base `CRUDPeliculas`): 83/83 pruebas xUnit, incluidas `SqlServerIntegrationTests`.
- [x] Paridad Express vs .NET con `scripts/compareActoresParity.mjs`: 104 comparaciones, 0 diferencias (83 actores, 16 variantes de consulta, todos los ids, ids inválidos/inexistentes).
- [x] Suite ejecutada con xunit real tras `dotnet restore`.

## Verificación local y advertencia de HTTPS

El perfil `http` escucha en `http://localhost:5100`. En Development no se aplica redirección HTTPS porque no existe un puerto TLS configurado. En producción, antes de publicar la API se deberá configurar TLS, terminación de proxy y cabeceras reenviadas seguras, y validar el comportamiento HTTPS end-to-end.

## Seguridad de entrega

No convertir el nuevo backend en destino de producción antes de tener prueba de contrato, verificación SQL, autenticación, CORS y manejo de archivos. No guardar credenciales, respaldos, tokens ni evidencias en Git.

## Fase 2 (en curso)

- [x] CORS con la misma política que `backend/src/config/cors.js` (403 para orígenes no permitidos, credenciales, preflight) y cabeceras de seguridad.
- [x] `GET /uploads/**` solo para la carpeta pública; carpeta privada nunca servida; archivos ocultos denegados.
- [x] Pruebas: 119 casos pasan con runner local (xunit real pendiente de ejecutar en tu máquina); sondeos HTTP con rutas sin normalizar (`--path-as-is`) confirman que no se alcanza `private/`.
- [x] Lecturas de películas: `GET /api/peliculas`, `/director/{nombre}`, `/{id}` (157 casos con runner local; xunit real y paridad contra Express pendientes en tu máquina).
- [ ] Lecturas de películas restantes: perfil, créditos, traducciones.
- [ ] Paridad de `/uploads` y de CORS contra Express con datos reales.
