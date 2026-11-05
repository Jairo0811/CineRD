# CineRD · Catálogo portable (snapshot público v3)

Este directorio contiene una copia reproducible del catálogo **público** para desarrollo entre PCs y para la demo estática de Netlify. **No es una sincronización automática ni en tiempo real** con el SQL Server local.

## Exportación de datos

Desde CineRD 3, el exportador incluye:

- `Actores`
- `Peliculas`
- `ActoresPeliculas`
- `PeliculaCreditos`
- `PeliculaTraducciones`
- `Premios`
- `Nominaciones`
- `GaleriaMultimedia` (fotos, tráilers, temas oficiales, canciones originales, bandas sonoras/OST y score)

Las tres últimas colecciones tienen **listas explícitas de campos públicos** en el exportador. La demo sigue siendo de solo lectura: no existen cuentas ni edición en Netlify.

### Nunca se incluyen

- `Usuarios`, contraseñas ni `RefreshTokens`;
- `TalentosUsuarios` y solicitudes de verificación;
- solicitudes y evidencias privadas de créditos;
- `AuditLogs`, secretos y `.env`.

**Atención:** cualquier título, descripción, fotografía, audio URL o crédito profesional que exportes a este snapshot será público en GitHub y Netlify. Revisa los datos y los derechos de publicación antes de confirmar el commit.

## Publicar los soundtracks que tienes en SQL Server

En tu PC, en PowerShell, desde la raíz de CineRD:

```powershell
git switch main
git pull --ff-only origin main
npm --prefix backend run catalog:export
npm --prefix backend run catalog:validate
```

El exportador ahora produce el snapshot **v3**, incluyendo los registros de `GaleriaMultimedia` (Spotify y YouTube), `Premios` y `Nominaciones` presentes en **tu base de datos local**.

Revisa los conteos en la consola y el diff antes de publicar:

```powershell
git diff --stat -- database/seeds/catalog.snapshot.json
git diff -- database/seeds/catalog.snapshot.json
git status
```

Si solo hay URLs externas de Spotify/YouTube, no hace falta versionar archivos de audio. CineRD muestra los reproductores oficiales externos; no aloja canciones.

Para imágenes públicas referenciadas dentro de `backend/uploads/galerias/`, añade únicamente los archivos necesarios. No publiques `backend/private/` ni evidencias.

```powershell
git add database/seeds/catalog.snapshot.json
git add backend/uploads/galerias/
git status
```

Si la carpeta no existe o no hay archivos de galería nuevos, omite el segundo `git add`. Si Git ignora algún archivo de galería que **sí** quieres publicar, revisa la regla correspondiente antes de usar `git add -f`; nunca fuerces contenido privado.

Haz los cambios mediante una rama y PR para que GitHub CI y Netlify validen el snapshot antes del merge a `main`. Tras el merge, Netlify reconstruirá `/demo/catalog.json` con los datos nuevos.

## Instalar en otra PC

```bash
cd backend
npm ci
npm run setup:local
```

`setup:local` crea la base si falta, aplica el esquema/migraciones y restaura el snapshot si las tablas del catálogo principal están vacías.

`npm run catalog:import:replace` es **destructivo para datos del catálogo**: crea backup local y reemplaza el catálogo de forma explícita. Para evitar perder premios o multimedia, rechaza snapshots v2 al reemplazar cuando existen esos registros.

## Validación y demo

```bash
npm run catalog:validate
node ../scripts/prepareNetlifyDemo.mjs
```

Netlify ejecuta automáticamente el preparador de la demo en su pipeline. Se preserva la compatibilidad de lectura con snapshots v2, pero estos **no contienen** los datos nuevos: las secciones aparecerán solo cuando existan registros públicos exportados en v3.

**No confundir este snapshot público con un backup de producción.** Mantén respaldos independientes de SQL Server y de las evidencias/archivos privados.
