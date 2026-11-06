# CineRD — Matriz inicial de contratos HTTP (Express → ASP.NET Core 10)

> Inventario de rutas extraído de `backend/src/app.js` y `backend/src/routes/*.js` en la línea de base `0321581`. La **ruta + método + política de acceso** están documentados; DTOs, códigos HTTP concretos, forma exacta del JSON y validaciones requieren inspeccionar controladores y frontend antes de implementar (no se infieren aquí).

## 1. API pública / administración

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/api/actores` | Pública |
| GET | `/api/actores/:id` | Pública |
| POST | `/api/actores` | ADMINISTRADOR, multipart `Foto` |
| PUT | `/api/actores/:id` | ADMINISTRADOR, multipart `Foto` |
| DELETE | `/api/actores/:id` | ADMINISTRADOR |
| GET | `/api/peliculas` | Pública |
| GET | `/api/peliculas/director/:nombre` | Pública |
| GET | `/api/peliculas/creditos/actor/:actorId` | Pública |
| GET | `/api/peliculas/:id/perfil` | Pública |
| GET | `/api/peliculas/:id/traducciones` | Pública |
| GET | `/api/peliculas/:id/creditos` | Pública |
| GET | `/api/peliculas/:id` | Pública |
| POST | `/api/peliculas` | ADMINISTRADOR, multipart `Foto` |
| PUT | `/api/peliculas/:id` | ADMINISTRADOR, multipart `Foto` |
| PUT | `/api/peliculas/:id/traducciones/:idioma` | ADMINISTRADOR |
| POST | `/api/peliculas/:id/creditos` | ADMINISTRADOR |
| DELETE | `/api/peliculas/:id/creditos/:creditoId` | ADMINISTRADOR |
| DELETE | `/api/peliculas/:id` | ADMINISTRADOR |
| GET | `/api/actores-peliculas/debuts` | Pública |
| GET | `/api/actores-peliculas/pelicula/:peliculaId` | Pública |
| GET | `/api/actores-peliculas/actor/:actorId` | Pública |
| POST | `/api/actores-peliculas` | ADMINISTRADOR |
| PUT | `/api/actores-peliculas/:peliculaId/:actorId` | ADMINISTRADOR |
| DELETE | `/api/actores-peliculas/:peliculaId/:actorId` | ADMINISTRADOR |
| GET | `/api/busqueda` | Pública |
| GET | `/api/premios` | Pública |
| GET | `/api/premios/nominaciones` | Pública |
| GET | `/api/premios/:id` | Pública |
| POST | `/api/premios` | ADMINISTRADOR |
| PUT | `/api/premios/:id` | ADMINISTRADOR |
| DELETE | `/api/premios/:id` | ADMINISTRADOR |
| POST | `/api/premios/nominaciones` | ADMINISTRADOR |
| PUT | `/api/premios/nominaciones/:id` | ADMINISTRADOR |
| DELETE | `/api/premios/nominaciones/:id` | ADMINISTRADOR |
| GET | `/api/galeria` | Pública |
| POST | `/api/galeria` | ADMINISTRADOR, multipart `Imagen` |
| PUT | `/api/galeria/:id` | ADMINISTRADOR, multipart `Imagen` |
| DELETE | `/api/galeria/:id` | ADMINISTRADOR |

## 2. Identidad y confianza — NO migrar sin estudio de compatibilidad

| Método | Ruta | Autorización |
| --- | --- | --- |
| POST | `/api/auth/registro` | Pública + rate limit |
| POST | `/api/auth/login` | Pública + rate limit |
| POST | `/api/auth/refresh` | Pública + rate limit; cookie de sesión |
| POST | `/api/auth/logout` | Implementación actual define controles específicos |
| GET | `/api/auth/perfil` | Autenticada |
| POST | `/api/auth/password/solicitar` | Pública + rate limit |
| POST | `/api/auth/password/restablecer` | Pública + rate limit |
| POST | `/api/auth/email/reenviar-verificacion` | Autenticada + rate limit |
| POST | `/api/auth/email/verificar` | Pública + rate limit |
| POST | `/api/verificaciones/actor/:actorId` | USUARIO |
| GET | `/api/verificaciones/mis-solicitudes` | Autenticada |
| GET | `/api/verificaciones/mi-perfil` | TALENTO_VERIFICADO |
| GET | `/api/verificaciones/admin/pendientes` | ADMINISTRADOR |
| GET | `/api/verificaciones/admin/vinculaciones` | ADMINISTRADOR |
| PATCH | `/api/verificaciones/admin/:id/revisar` | ADMINISTRADOR |
| PATCH | `/api/verificaciones/admin/vinculaciones/:id/revocar` | ADMINISTRADOR |
| POST | `/api/solicitudes-creditos` | TALENTO_VERIFICADO, multipart `Evidencia` |
| GET | `/api/solicitudes-creditos/mias` | TALENTO_VERIFICADO |
| GET | `/api/solicitudes-creditos/admin` | ADMINISTRADOR |
| GET | `/api/solicitudes-creditos/evidencias/:evidenciaId/archivo` | TALENTO_VERIFICADO o ADMINISTRADOR; comprobar propiedad de recurso |
| PATCH | `/api/solicitudes-creditos/:id/revision` | ADMINISTRADOR |

## 3. Integración TMDb

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/api/tmdb/peliculas/buscar` | Pública |
| GET | `/api/tmdb/peliculas/:tmdbId/reparto` | Pública |
| GET | `/api/tmdb/peliculas/:tmdbId` | Pública |
| GET | `/api/tmdb/personas/buscar` | Pública |
| GET | `/api/tmdb/personas/:tmdbId` | Pública |
| PATCH | `/api/tmdb/actores/:actorId/vincular` | ADMINISTRADOR |

## 4. Rutas operativas fuera de /api

- `GET /`: respuesta de bienvenida JSON.
- `GET /health`: 200 cuando el proceso HTTP está vivo.
- `GET /ready`: 503 hasta verificar SQL Server; posteriormente 200 solo cuando la consulta de conectividad tenga éxito.
- `GET /uploads/**`: archivos públicos de medios; **nunca** servir `private/` ni evidencias protegidas por esta ruta.

## 5. Primer lote de migración — lecturas de talento

Alcance propuesto para Claude después de la auditoría de contratos:

1. `GET /api/actores` y `GET /api/actores/{id}` en ASP.NET Core.
2. Leer `backend/src/controllers/actoresController.js` completo y frontend consumidor; conservar el comportamiento de filtros `buscar`, `estado`, `anio`, `profesion`, `orden`.
3. Implementar acceso a SQL Server **solo lectura**, con consultas parametrizadas, timeouts y cancelación; no recrear el esquema ni ejecutar migraciones destructivas.
4. Preservar nombres JSON en PascalCase/español, `null`, tipos booleanos y numéricos, arreglos, orden y errores del API Express. La serialización ASP.NET Core por defecto usa camelCase: configurarla explícitamente según el contrato.
5. No usar un catálogo ficticio ni leer el snapshot estático como sustituto silencioso de SQL Server.
6. Crear pruebas que comparen resultados sanitizados en Node.js y .NET apuntando a **la misma base de prueba**, sin guardar datos personales en fixtures públicos.
7. Mantener `/ready` en 503 hasta que exista una comprobación real de SQL Server; entonces probar 200 conectado y 503 desconectado.
8. Mantener Node.js, React y Cloudflare operativos durante toda la etapa.

## 6. Riesgos por validar antes de cambiar el tráfico

- bcryptjs y hashes históricos; migrar a ASP.NET Identity sin conversión compatible provocaría rechazo de credenciales.
- JWT y rotación/revocación de refresh tokens; cookies `HttpOnly`, `Secure`, `SameSite`, CORS y política de orígenes.
- Diferencias de JSON entre JavaScript y System.Text.Json: PascalCase, fechas, nulos, booleanos y decimales.
- Nombres multipart exactos: `Foto`, `Imagen`, `Evidencia`.
- Archivos referenciados por SQL Server y snapshot v3: 128 recursos públicos hoy en la demo.
- La API .NET todavía no implementa HTTPS detrás de proxy, secretos, autenticación ni acceso a datos de producción.

**Regla de aceptación:** no se redirige tráfico real al nuevo backend hasta que pruebas contractuales, funcionales y de seguridad de cada módulo hayan pasado.

## 7. Contrato implementado — Fase 1 (actores, solo lectura)

Fuente de verdad: `backend/src/controllers/actoresController.js` (`obtenerActores`, `obtenerActorPorId`) y `CRUD-Peliculas.sql` (`dbo.Actores`).

### GET /api/actores

Parámetros de consulta (todos opcionales):

| Parámetro | Regla (idéntica a Express) |
| --- | --- |
| `buscar` | Si no está vacío: `LIKE %texto recortado%` sobre `Nombres`, `Apellidos`, `NombreCompleto`, `NombreArtistico`, `Profesion`. Una cadena de solo espacios activa el filtro con `%%`. |
| `estado` | `vivo` → `EstaVivo = 1`; `fallecido` → `EstaVivo = 0`; otro valor no filtra. |
| `anio` | Entero (prefijo numérico, como `parseInt`): `YEAR(FechaNacimiento) = anio OR AnioNacimiento = anio`. |
| `profesion` | `Profesion LIKE %texto recortado%`. |
| `orden` | `az` (defecto), `za`, `masPeliculas`, `menosPeliculas`, `nacimientoReciente`, `nacimientoAntiguo`. Valores desconocidos usan `az`. |

Respuesta 200: arreglo de objetos con las claves, **en este orden**:
`Id, TMDbId, Nombres, Apellidos, NombreCompleto, NombreArtistico, Profesion, FechaNacimiento, AnioNacimiento, Sexo, EstaVivo, FechaFallecimiento, Foto, InstagramUrl, FacebookUrl, TikTokUrl, YouTubeUrl, SpotifyUrl, XUrl, SitioWebUrl, EsVerificado, CantidadPeliculas, CantidadPeliculasDirigidas`.

### GET /api/actores/{id}

Mismas claves que el listado **sin** `CantidadPeliculas` ni `CantidadPeliculasDirigidas`.

| Situación | HTTP | Cuerpo |
| --- | --- | --- |
| Encontrado | 200 | actor |
| `id` no es entero positivo | 400 | `{ "mensaje": "El identificador del actor no es válido" }` |
| No existe | 404 | `{ "mensaje": "Actor no encontrado" }` |
| Error interno | 500 | `{ "mensaje": "Error al obtener el actor" }` |

### Tipos y formatos

- `Id`, `TMDbId`, `AnioNacimiento`, conteos: número entero (`TMDbId`/`AnioNacimiento` pueden ser `null`).
- `EstaVivo`, `EsVerificado`: booleanos JSON.
- `FechaNacimiento`, `FechaFallecimiento` (columnas SQL `DATE`): texto UTC `"1990-05-01T00:00:00.000Z"` o `null`, como serializa Express.
- `EsVerificado` = existe un registro `TalentosUsuarios` con `Estado = 'ACTIVO'` para el actor.

### GET /ready

| Situación | HTTP | Cuerpo |
| --- | --- | --- |
| SQL Server responde a `SELECT 1;` | 200 | `{ "status": "ready", "database": "ok", "requestId": "..." }` |
| Sin configuración | 503 | `{ "status": "not-ready", "database": "not-configured", "requestId": "..." }` |
| Inaccesible / error / timeout | 503 | `{ "status": "not-ready", "database": "unavailable", "requestId": "..." }` |

### Diferencias deliberadas respecto a Express

| Caso | Express | ASP.NET Core | Motivo |
| --- | --- | --- | --- |
| Error 500 | Incluye `error: error.message` | Solo `mensaje` | El mensaje de SQL Server puede revelar servidor, usuario o esquema. |
| `anio` sin número (`?anio=abc`) | 500 (NaN rechazado por el driver) | 400 `"El año de nacimiento no es válido"` | Error del cliente, no del servidor. |
| `id` mayor que `int.MaxValue` | 500 | 400 (id no válido) | Igual que el anterior. |
| SQL Server sin configurar | El proceso no arranca | 503 `"Base de datos no disponible"` en los endpoints de datos | La API puede iniciar y reportar `/ready`. |
| `buscar`/`profesion` > 148/98 caracteres | Depende del driver | Se truncan al tamaño del parámetro | Evita errores de truncamiento. |

Se conservan a propósito: los comodines `%` y `_` escritos por el usuario actúan como comodines (Express no los escapa), y los empates de `za` no tienen desempate (igual que Express).

### Pendiente en esta fase

- CORS para que el frontend (`cinerd.pages.dev`, `localhost`) pueda consumir la API .NET desde el navegador: no está implementado; el frontend sigue apuntando a Express.
- `/uploads/**` (las fotos se devuelven como ruta, igual que Express, pero la API .NET aún no las sirve).
