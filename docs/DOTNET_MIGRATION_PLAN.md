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
- [ ] Inventario endpoint-por-endpoint y pruebas comparativas (Fase 1).

## Verificación local y advertencia de HTTPS

El perfil `http` escucha en `http://localhost:5100`. En Development no se aplica redirección HTTPS porque no existe un puerto TLS configurado. En producción, antes de publicar la API se deberá configurar TLS, terminación de proxy y cabeceras reenviadas seguras, y validar el comportamiento HTTPS end-to-end.

## Seguridad de entrega

No convertir el nuevo backend en destino de producción antes de tener prueba de contrato, verificación SQL, autenticación, CORS y manejo de archivos. No guardar credenciales, respaldos, tokens ni evidencias en Git.
