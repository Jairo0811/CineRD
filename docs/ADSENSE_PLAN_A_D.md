# CineRD — Plan A–D previo a la nueva revisión de AdSense

**Fecha de preparación:** 7 de noviembre de 2026  
**Objetivo:** resolver el rechazo «Anuncios publicados por Google en pantallas sin contenido de publicadores».  
**Estado:** trabajo técnico en curso. **No listo para solicitar otra revisión.**

Guías oficiales:
- https://support.google.com/publisherpolicies/answer/11112688?hl=es
- https://support.google.com/adsense/answer/12176698?hl=es

## A — Edición y valor original

Se añadieron **ocho** nuevos textos contextuales en español e inglés a las fichas de:

- Ladrones a Domicilio (2008)
- Lotoman (2011)
- Vamos de robo (2014)
- Santicló: La Vaina de la Navidad (2008)
- I Love Bachata (2011)
- Cristiano de la Secreta (2009)
- Colao (2017)
- Yuniol (2007)

Más cuatro editoriales anteriores, el repositorio incorpora **12 lecturas** asociadas a películas y enlaces de fuentes consultables. Se evita declarar una crítica basada en visionados no realizados.

**Pendiente indispensable:** el titular debe leer los doce textos, verificar citas, corregir hechos y aprobarlos; hasta entonces siguen `pendiente_revision`. No existe un mínimo universal de artículos exigido por Google. Las otras películas y **83 fichas de talentos** necesitan revisión de calidad, no solo texto autogenerado.

### Lista de comprobación de una ficha

- [ ] Título, estreno, director y elenco contrastados
- [ ] Texto propio que responda a una pregunta real sobre la obra
- [ ] Fuentes verificables; lectura editorial separada de hechos
- [ ] Fuentes URL operativas sin copiar descripciones largas
- [ ] Sinopsis original o autorización documentada si procede
- [ ] Imágenes con derechos de uso documentados o sustituidas
- [ ] Lectura móvil, enlaces y accesibilidad comprobados
- [ ] Revisión final del titular y estado `aprobado`/ `publicado` si procede

## B — Derechos de medios

- El CSV `docs/media-rights-ledger.csv` conserva una fila por imagen registrada y marca todos los medios actuales como `PENDIENTE`.
- Se incorporó el modo `VITE_MEDIA_RIGHTS_MODE=review` para omitir por defecto **todas las imágenes sin licencia válida** del catálogo público exportado.
- Las películas sin cartel utilizan `PosterOriginal`; los talentos emplean los placeholders existentes. Revisar también los derechos de esos placeholders, recursos decorativos, marcas y fuentes.
- Los permisos se aplican por **archivo concreto** y deben incluir uso web con monetización y vigencia acreditados.
- Los archivos originales siguen en `backend/uploads`: la vista segura **no borra el catálogo interno**.
- El modo `review` **no se activó automáticamente en Cloudflare**. Primero revisar su diseño en vista previa; después activarlo explícitamente como variable de compilación y verificar que el manifiesto público indica `review`.

### Revisión local segura

```powershell
git fetch origin
git switch --detach origin/main
$env:VITE_DEMO_MODE = "true"
$env:VITE_MEDIA_RIGHTS_MODE = "review"
npm --prefix frontend ci
npm --prefix frontend run build
node scripts/verifyRightsReviewBuild.mjs
npm --prefix frontend run preview
```

El trabajo visual de estos cambios debe realizarse preferiblemente en el worktree `CineRD-media-review`, nunca alterando a ciegas la rama .NET 10.

## C — Publicación y Search Console

Después de desplegar la revisión elegida en Cloudflare:

```powershell
node scripts/auditProduction.mjs
node scripts/auditProduction.mjs --require-review
```

La auditoría comprueba HTTP, canonical, HTML inicial, sitemap, robots, noindex del buscador, manifiesto y ads.txt. **Requiere acceso a Internet desde la máquina que ejecuta el script**. No puede certificar la indexación de Google.

- [ ] Confirmar que Cloudflare sirve el último commit verificado
- [ ] Revisar las fichas y componentes visuales en móvil
- [ ] Inspeccionar URL inicial, catálogos, artículos y fichas en Google Search Console
- [ ] Revisar páginas excluidas y errores de indexación
- [ ] Validar enlaces externos y páginas legales
- [ ] Revisar origen/autoría de recursos restantes y de cualquier sinopsis
- [ ] Asegurar que no existan anuncios en pantallas vacías ni búsquedas

## D — Solicitud a Google

**No automatizar ni solicitar aún.** La revisión debe pedirse solo cuando A/B/C estén realmente comprobadas.

- [ ] El titular revisó y aprobó las fichas editoriales.
- [ ] Se resolvieron los materiales de terceros sin licencia o se ocultaron de manera verificable.
- [ ] La auditoría real de producción y Search Console no muestran bloqueos importantes.
- [ ] El sitio tiene contenido suficientemente útil en sus rutas visibles, sin fichas vacías.
- [ ] Política de privacidad, contacto, CMP y anuncios configurados conforme al uso efectivo.
- [ ] Google AdSense → **Sitios** → CineRD → confirmar código → **Solicitar revisión**, si el panel ofrece esa acción; revisar **Centro de Políticas** si el problema aparece allí.
- [ ] Guardar fecha y respuesta del panel en privado; no inventar aceptación.

**Informe de diagnóstico local:** `node scripts/reportAdSenseReadiness.mjs`.

**Riesgo residual:** ocho textos más y retirar imágenes no garantizan aprobación: Google evalúa el valor del contenido y la experiencia total, no un número fijo de páginas.
