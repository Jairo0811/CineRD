# CineRD — cierre funcional en desarrollo local (noviembre de 2026)

## Decisión de alcance

**Primero se termina y prueba el producto localmente.** No crear ni contratar Render, Azure SQL, almacenamiento persistente cloud ni configurar API pública nueva durante este ciclo. La demo estática existente en Cloudflare continúa separada; AdSense sigue desactivado.

El pase de CI **no** equivale a prueba integral de uso ni aprobación editorial/legal. PR #55 sigue en borrador. No cambiar `main` o SQL Server mediante tareas automáticas de esta lista.

## Etapa A — estabilidad de CRUD y formularios

- [x] Formularios de edición de películas y talentos: vistas previas desde `resolveMediaUrl`, no `http://localhost:3000` fijo.
- [x] Reparto: vistas previas con resolución central de medios.
- [x] Bloquear solicitudes duplicadas al guardar películas/talentos.
- [x] Añadir pruebas automatizadas de regresión para los comportamientos anteriores.
- [ ] Probar manualmente alta, consulta, edición, cancelación, eliminación y errores de red para películas y talentos.
- [ ] Probar reparto, créditos profesionales, premios, galerías y metadatos de TMDb; verificar integridad referencial tras errores.
- [ ] Revisar validaciones cliente-servidor (tamaño/MIME, fechas, URLs, datos requeridos) y mensajes de error accesibles.
- [ ] Confirmar guardado de fotos autorizadas en local y ausencia de referencias a rutas incorrectas.

## Etapa B — integridad, cuentas y seguridad local

- [ ] Comprobar `GET /health` (proceso) y `GET /ready` (SQL local).
- [ ] Probar registro, verificación de correo, login, renovación, logout, recuperación y restablecimiento; para pruebas sin correo real usar el proveedor de pruebas, sin simular entrega real.
- [ ] Verificar rol USUARIO, TALENTO_VERIFICADO y ADMINISTRADOR; rechazar accesos no autorizados a cada endpoint y recurso privado.
- [ ] Probar reclamaciones de perfil/créditos, archivos de evidencia y flujos administrativos completos.
- [ ] Preparar respaldo de la base local **antes** de pruebas que escriban datos o creen usuarios.
- [ ] Confirmar que pruebas automatizadas no usan datos reales ni provocan migraciones o borrados involuntarios.

## Etapa C — calidad visual, editorial y entrega local

- [ ] Revisión responsive (móvil/tableta/escritorio), teclado, etiquetas, estados vacíos/carga/error y navegación ES/EN.
- [ ] Revisar textos, fechas, géneros y fichas del catálogo frente a fuentes verificables.
- [ ] Registrar decisiones humanas sobre las **58 piezas editoriales** pendientes; no cambiar aprobaciones ni SQL sin autorización y trazabilidad.
- [ ] Mantener **128 archivos multimedia sin licencia comercial acreditada** excluidos de los builds públicos, hasta revisión documental individual.
- [ ] Cerrar errores críticos y regresiones; documentar limitaciones restantes y evidencia del recorrido funcional.

## Comandos de calidad seguros (sin escribir en SQL)

Desde la raíz del repositorio, con Node.js/npm instalados:

```powershell
npm --prefix backend ci
npm --prefix backend test
npm --prefix backend run catalog:validate
npm --prefix backend run catalog:metadata:validate

npm --prefix frontend ci
npm --prefix frontend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

Estas pruebas y el build pueden escribir en `node_modules` y `frontend/dist`, **pero no deben modificar SQL Server**. No ejecutar `setup:local`, `catalog:import:replace`, `migrate`, ni scripts de correcciones SQL sobre una base con datos sin respaldo y revisión de efectos.

## Pruebas de integración local (manuales)

Abrir dos terminales en la raíz, con `backend/.env` local y sin compartir secretos:

```powershell
# Terminal A
npm --prefix backend run dev
# Terminal B
npm --prefix frontend run dev
```

Comprobar `http://localhost:3000/health`, `http://localhost:3000/ready` y `http://localhost:5173`. Una respuesta `503` en `/ready` indica que SQL no está listo, aunque `/health` responda `200`.

## Criterio de salida de este ciclo

**`LOCAL_READY`** solo cuando no existan defectos críticos abiertos, los comandos automáticos pasen y se complete con evidencia el recorrido funcional con una base local de pruebas. **`COMMERCIAL_READY` es una evaluación distinta**: exige derechos, revisión editorial/legal y, posteriormente, infraestructura y aprobación AdSense. No inferirla de `LOCAL_READY`.


## Galería de originales antiguos — revisión visual local sin nube

El sitio público `cinerd.pages.dev` permanece en modo `review`: no publica
fotos de talentos ni carteles de películas de `backend/uploads` que aún figuren
con derechos comerciales `PENDIENTE`. Los medios no se han borrado: el snapshot
actual referencia **82 fotografías de talentos** y **46 pósteres** originales.

Para **ver los 128 archivos en tu propio equipo, incluso sin SQL Server activo**,
desde la raíz de CineRD ejecuta:

```powershell
node scripts/previewLocalMedia.mjs
```

Abre `http://127.0.0.1:4348`. Verás pestañas **Todos**, **Talentos** y
**Películas**, con los archivos originales que todavía constan en el catálogo.
Cierra con `Ctrl+C` en PowerShell.

Este visor:
- Escucha **exclusivamente en `127.0.0.1`**, nunca `0.0.0.0`.
- No requiere API, SQL, nube ni anuncios.
- Lee directamente `backend/uploads`, no copia a `frontend/public` ni `dist`.
- Solo sirve rutas exactas del inventario de catálogo, no evidencia privada.
- No cambia `media-rights-ledger.csv`, `main` ni los despliegues.
- **No se debe exponer con túneles, proxies, port forwarding ni alojar públicamente.**

Las cubiertas propias `PosterOriginal` continúan representando las 46 películas
en el sitio público donde el archivo original no está autorizado. El visor
únicamente permite revisarlas lado a lado durante la terminación local del producto.


## Cierre técnico implementado (tanda de permisos, multimedia y TMDb)

- [x] Los administradores conservan edición de cualquier ficha, y un talento `TALENTO_VERIFICADO` solo puede actualizar **su propio perfil vinculado y activo**: doble verificación SQL, incluido el UPDATE.
- [x] Por seguridad, el titular solo puede editar nombre artístico, profesión, enlaces oficiales y fotografía; identidad legal, nacimiento, sexo, estado vital y TMDb continúan bajo revisión editorial. El formulario indica las restricciones.
- [x] Los enlaces públicos de talentos rechazan esquemas `javascript:`, `data:`, `file:` y URLs con credenciales.
- [x] Las fotografías nuevas utilizan UUID; si el INSERT/UPDATE del catálogo falla o se interrumpe la respuesta, se retira exclusivamente el archivo nuevo. No borrar los 128 originales anteriores.
- [x] La acción **Desvincular TMDb** de una película persiste `NULL` en SQL cuando el campo se envía vacío; si una integración antigua omite el campo, conserva el identificador previo.
- [x] Pruebas en Node y Vitest de permisos, URLs, edición personal, limpieza de archivos, TMDb y bloqueo visual de campos de identidad.

Los tests de esos módulos usan mocks/fixtures: **no confirman aún un recorrido real contra tu SQL Server**.

## Diagnóstico automático local — solo lectura

Con el servidor de Node.js levantado en `127.0.0.1:3000` y SQL Server configurado localmente:

```powershell
node scripts/auditLocalCineRD.mjs
node scripts/auditLocalCineRD.mjs --json
```

El auditor consulta solo `GET /health`, `GET /ready`, el catálogo de películas y talentos, una ficha de cada tipo y tres rutas privadas anónimas (deben devolver 401). Rechaza URL de auditoría que no sea `http://localhost` o `http://127.0.0.1`.

Resultados:
- `API_STOPPED`: no hay API local accesible.
- `INCOMPLETE`: API presente, pero SQL o una ruta comprobada no está lista.
- `SMOKE_PASS`: **pasa la lectura y el control anónimo**, no significa `LOCAL_READY`. Deben ejecutarse las operaciones CRUD y cuentas con usuarios de pruebas, backup comprobado y revisión visual manual.

No ejecuta operaciones de escritura, no migra ni reemplaza SQL y no cambia el sitio en Cloudflare.


## Cierre solicitado: puntos 1-3 — SQL, CRUD, permisos y expediente editorial

El usuario confirmó el 9/11/2026: API local 200, SQL Server `ready` 200,
46 películas, 83 talentos y 3 rutas anónimas 401; auditoría `SMOKE_PASS`.
**Estos resultados son de lectura**, no un backup ni aprobación editorial.

### 1. Respaldo SQL verificable y CRUD aislado

Vista previa de respaldo, **no escribe ni conecta**:

```powershell
npm --prefix backend run sql:backup:preview
```

Solo cuando el operador tenga una carpeta en el **servidor de SQL Server** con
permisos para el servicio (ej.: `D:\SQLBackups`), crea un nombre de archivo
**nuevo** y ejecuta en PowerShell desde la raíz:

```powershell
$env:CINERD_SQL_BACKUP_CONFIRM = "YES"
npm --prefix backend run sql:backup -- --backup --confirm-backup --database CRUDPeliculas --file "D:\SQLBackups\CineRD-20261109-UNICO.bak"
Remove-Item Env:\CINERD_SQL_BACKUP_CONFIRM
```

El script se niega a ejecutar sin flags y variable de confirmación, comprueba
`DB_DATABASE`, ejecuta `BACKUP DATABASE WITH COPY_ONLY,CHECKSUM,NOINIT`,
inspecciona `RESTORE HEADERONLY` y ejecuta `RESTORE VERIFYONLY WITH CHECKSUM`.
**RESTORE VERIFYONLY NO sustituye restaurar de verdad el backup en otra base.**
No modificar ni trasladar el archivo `.bak` al repositorio.

Después, **en SSMS**, restaura ese `.bak` en una base **diferente** llamada
`CRUDPeliculas_E2E`, reubicando los archivos `.mdf/.ldf` mediante el cuadro
`Files / Relocate all files to folder`. Verifica que conserva las tablas y
que **NO** se ha usado `WITH REPLACE` sobre `CRUDPeliculas` principal.
La restauración aislada puede contener cuentas reales: úsala sin red pública,
con permisos restringidos y no compartas ni publiques datos personales.

Vista previa sin SQL:

```powershell
npm --prefix backend run crud:e2e:preview
```

Solo cuando exista y esté verificada **la base aislada** en el mismo servidor
configurado por `backend/.env` (el `DB_DATABASE` del proceso se sobrescribe,
sin modificar el archivo):

```powershell
$env:DB_DATABASE = "CRUDPeliculas_E2E"
$env:CINERD_E2E_CONFIRM = "CRUDPeliculas_E2E"
npm --prefix backend run crud:e2e -- --run --confirm-isolated-db CRUDPeliculas_E2E
Remove-Item Env:\DB_DATABASE
Remove-Item Env:\CINERD_E2E_CONFIRM
```

El script ejecuta **13 operaciones** sobre tablas de película, talento,
reparto, créditos y galería bajo **una única transacción revertida
obligatoriamente**. Comprueba de nuevo `DB_NAME()` antes de comenzar.
Requiere `DB_DATABASE` coincidente con el nombre E2E y no permite usar
`CRUDPeliculas`. No activa backend web ni escribe en la base principal.
**Esto prueba SQL directo**, no los formularios ni todas las rutas HTTP.

### 2. Seguridad y permisos

`backend/tests/routeRoleMatrix.test.js` monta los **routers reales de Express**
y el middleware JWT verdadero, pero reemplaza controladores y SQL por stubs.
Valida rutas administrativas de escritura, accesos anónimos (401), usuarios sin
permisos (403), talentos verificados, titular del perfil y JWT inválidos.
Es apto para CI Linux/Windows; **no crea ni modifica datos SQL**.

Revisión MANUAL pendiente contra el servidor local en la copia E2E:
registro/login, email de confirmación y recuperación, renovación/revocación
de refresh tokens, vinculación/revocación de talentos, reclamaciones de
participación y límites con las tres cuentas de prueba.
No colocar credenciales en el chat, Git ni capturas públicas.

### 3. Cola editorial E-4 + E-5, sin alterar aprobaciones

```powershell
node scripts/prepareClosureEditorial.mjs
node scripts/prepareClosureEditorial.mjs --create
node scripts/editorialReadinessF23.mjs --json
npm --prefix backend run catalog:corrections:live:preview
```

`--create` construye una planilla privada en
`backend/private/editorial/CIERRE_E4_E5_REVISION_HUMANA.md` (ignorada por Git);
**no sobrescribe** si ya existe. Incluye las **7 propuestas E-4** con fuentes,
valores previos/nuevos y criterio de estreno, y los **58 textos E-5** por
prioridad con observación, fuente/huella vigente y casillas vacías para decisión.
Ninguna ejecución genera firmas, aprobaciones, licencias ni cambios SQL.
Las siete correcciones E-4 siguen bloqueadas por
`docs/catalog-corrections-e4-approvals.json` hasta siete autorizaciones
humanas atribuibles, y los textos E-5 hasta su propia revisión independiente.

**Estado honesto de cierre:**
- Automatización del backup, gate CRUD de SQL y matriz de roles: implementados,
  pendientes de ejecución real en la computadora/instancia SQL del usuario.
- Revisión editorial: inventario y cola preparados; decisiones de personas
  revisoras **pendientes**. No marcar `LOCAL_READY` por CI sin el ejercicio E2E.
- `main`, Cloudflare, AdSense y los 128 archivos originales no se alteraron.

### Cierre adicional de seguridad local

El servidor de desarrollo ahora escucha en `127.0.0.1` si `HOST` no está configurada; producción sigue con `0.0.0.0` por defecto para contenedores. Si el log de `npm --prefix backend run dev` todavía muestra `0.0.0.0`, revisa en tu propio `backend/.env` si hay una variable `HOST` explícita. No compartas el contenido completo del `.env`.

Antes de autorizar cualquier acción protegida, el backend vuelve a consultar en `dbo.Usuarios` el rol y estado `ACTIVO`: un JWT vigente no conserva permisos de una cuenta bloqueada o degradada. La edición de fichas por un administrador también exige esa verificación. El cierre editorial privado ahora incluye textos reales ES/EN y referencias registradas para que la persona revisora pueda cotejarlos sin buscar cada archivo manualmente. **Estos cambios requieren repetir la auditoría local después del próximo `git pull`**.
