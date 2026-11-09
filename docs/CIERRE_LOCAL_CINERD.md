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
