# CineRD · Catálogo portable

Esta carpeta permite versionar una copia reproducible del catálogo de desarrollo de CineRD sin incluir cuentas, contraseñas, tokens ni datos de autenticación.

## Qué se exporta

- `Actores`
- `Peliculas`
- `ActoresPeliculas`
- `PeliculaTraducciones`

El snapshot conserva las rutas de fotografías, pósteres y backdrops. Los archivos multimedia reales siguen viviendo en `backend/uploads`, por lo que también deben estar sincronizados mediante Git.

## Qué NO se exporta

Por seguridad, el snapshot no incluye:

- `Usuarios`
- `RefreshTokens`
- `SolicitudesVerificacion`
- `TalentosUsuarios`
- `AuditLogs`
- secretos del archivo `.env`

## Crear o actualizar el snapshot

En la PC que contiene el catálogo completo:

```bash
cd backend
npm run catalog:export
```

El comando genera o actualiza:

```text
database/seeds/catalog.snapshot.json
```

Además valida cuántos archivos multimedia referenciados existen realmente dentro de `backend/uploads`.

Después súbelo junto con cualquier imagen nueva:

```bash
git add database/seeds/catalog.snapshot.json backend/uploads
git commit -m "data: update CineRD development catalog"
git push
```

## Restaurar en otra PC

Después de clonar el repositorio, configurar `backend/.env` e instalar dependencias:

```bash
cd backend
npm install
npm run setup:local
```

`setup:local` crea la base si hace falta, aplica el esquema y las migraciones en orden y, si existe un snapshot versionado, restaura automáticamente películas, talentos, repartos y traducciones. Las imágenes ya estarán disponibles porque `backend/uploads` viaja con Git.

Si la base ya contiene películas o talentos, la importación normal se detiene para evitar sobrescribir información accidentalmente. Para reemplazar intencionalmente un catálogo local existente:

```bash
npm run catalog:import:replace
```

> El snapshot está pensado para desarrollo, demos y portabilidad entre equipos. Para producción, las imágenes deberían migrar a almacenamiento de objetos (por ejemplo Azure Blob, S3 o Cloudinary) y la base de datos debería administrarse como un servicio centralizado.
