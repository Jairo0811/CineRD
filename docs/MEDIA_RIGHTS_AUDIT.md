# CineRD — Registro de derechos de medios públicos

**Fecha de inventario:** 7 de noviembre de 2026  
**Catálogo de referencia:** `database/seeds/catalog.snapshot.json` (exportado el 5 de noviembre de 2026)  
**Archivo editable:** [media-rights-ledger.csv](./media-rights-ledger.csv)

## Qué se auditó

El snapshot público contiene **128 archivos visuales distintos** referenciados como:
- **82 fotos de talentos** (`Actores.Foto`).
- **46 imágenes/pósteres de películas** (`Peliculas.Foto`).
- **0 backdrops** (`Peliculas.Backdrop`).
- **0 archivos de galería** (`GaleriaMultimedia.Archivo`, aunque existen 12 registros multimedia con otros campos).

**Resultado documental inicial: 128 `PENDIENTE`, 0 `AUTORIZADO`.**

Esta cifra solo significa que **no se identificaron permisos verificables en el repositorio**: no prueba por sí sola que haya infracción ni que la imagen sea libre de derechos. Tampoco incluye imágenes decorativas, logos u otros recursos de `frontend/public` o de paquetes externos; deberán auditarse por separado antes de una monetización general.

## Campos por archivo

Cada fila del CSV identifica `file_path`, `kind`, `entity_id`, `entity_name` y `field`. Los campos que debe completar una persona tras comprobar las pruebas son:

| Campo | Uso |
|---|---|
| `source_url` | Dónde se obtuvo la imagen, si hay URL verificable (HTTPS) |
| `rights_holder` | Persona o entidad que puede autorizar la reproducción |
| `permission_basis` | `PROPIEDAD`, `LICENCIA`, `PERMISO` o `DOMINIO_PUBLICO` documentado |
| `evidence_ref` | Código de referencia a documento privado o prueba verificable (no almacenar contratos personales en Git) |
| `commercial_use_authorized` | `SI` solo si está comprobado que cubre uso comercial, `NO` o vacío en otro caso |
| `attribution` | Texto de atribución requerido por el acuerdo, si existe |
| `reviewed_on` / `reviewed_by` | Fecha ISO 8601 (`AAAA-MM-DD`) y responsable de la revisión |
| `status` | `PENDIENTE`, `AUTORIZADO`, `RESTRINGIDO`, `RETIRAR` |
| `notes` | Alcance, condiciones, restricciones y acciones pendientes sin datos confidenciales |

**IMPORTANTE:** una URL de TMDb, ID TMDb, Google Images, IMDb, Facebook, Wikipedia o una captura de pantalla **no constituye por sí sola prueba de autorización comercial**. Tampoco basta mostrar una atribución.

### Procedimiento de revisión

1. Abrir la imagen y localizar su procedencia real. Si proviene de un proveedor, revisar la licencia **del proveedor y del titular de la fotografía/póster**, no solo el acceso técnico por API.
2. Obtener y conservar evidencia de propiedad, licencia aplicable o permiso del titular; confirmar expresamente si incluye almacenamiento/republicación en CineRD y uso en páginas monetizadas.
3. Documentar fechas, alcance territorial, condiciones de atribución, duración, restricciones y si hay permiso para modificar o recortar. Las pruebas confidenciales se archivan **fuera de Git**.
4. Marcar `AUTORIZADO` solo con `rights_holder`, `permission_basis`, `evidence_ref`, `commercial_use_authorized=SI`, fecha y revisor. Una revisión de derechos excepcional o discutible necesita asesoría jurídica; no aprobar por intuición.
5. Marcar `RESTRINGIDO` cuando los términos no cubran uso comercial o existan condiciones incumplidas; marcar `RETIRAR` si no puede utilizarse. **Estos estados no retiran automáticamente imágenes del sitio**. Debe planificarse su sustitución o eliminación segura mediante un cambio separado.
6. No solicitar otra revisión de AdSense hasta resolver los medios problemáticos y revisar sustancialmente el contenido editorial.

### Priorización

Revisar primero los **46 pósteres de películas**, especialmente las fichas destacadas en portada y los artículos editoriales. Después revisar las **82 fotografías de talentos**, empezando por las más visibles. Esta es una prioridad práctica para organizar el trabajo, **no una conclusión sobre quién posee los derechos**.

## Control técnico automatizado

Ejecutar desde la raíz:

```powershell
node scripts/verifyMediaRightsLedger.mjs
node --test scripts/verifyMediaRightsLedger.test.mjs
```

O desde frontend:

```powershell
npm --prefix frontend run rights:audit
npm --prefix frontend run build
```

La validación está incorporada en `frontend/package.json` **antes de cada build** (GitHub Actions/Cloudflare). Comprueba que todo archivo referenciado por el snapshot esté inventariado; evita duplicados, rutas inseguras, estados desconocidos y falsos `AUTORIZADO` sin evidencia. Si una exportación futura añade fotos, el build pedirá que se registren nuevas filas `PENDIENTE`. No bloqueará el build únicamente por mantener archivos en `PENDIENTE`: es un mecanismo de trazabilidad, **no una certificación legal**.

No publicar el CSV en `frontend/public`: aunque no contiene contraseñas, la documentación interna sobre licencias no forma parte del catálogo público.

## Fuentes oficiales

- [Google Publisher Policies — Copyright](https://support.google.com/adsense/answer/10502938)
- [TMDb API FAQ — usos comerciales, no comerciales y atribución](https://developer.themoviedb.org/docs/faq)
- [TMDb Logos & Attribution](https://www.themoviedb.org/about/logos-attribution)

La API gratuita de TMDb está concebida para uso no comercial con atribución; para usos comerciales TMDb indica contactar a su equipo de licencias. **La fuente de los archivos actuales de CineRD no está probada**, por lo que no debemos atribuir automáticamente todas las 128 imágenes a TMDb.
