# CineRD — Primera curaduría editorial (noviembre de 2026)

## Propósito

Publicar contexto histórico original y verificable en las fichas seleccionadas de CineRD. Los textos son **borradores pendientes de revisión final del titular**. No se atribuye a terceros la autoría de la redacción y no se presentan como entrevistas, críticas escritas tras visionado o estudios de campo propios.

## Películas y fuentes

| ID | Ficha de CineRD | Fuente principal | Otra referencia |
|---|---|---|---|
| 16 | Nueba Yol (1995) | DGCINE, «El cine en República Dominicana» | INTEC, Ciencia y Sociedad (2018) |
| 5 | Perico Ripiao (2003) | Cinema Dominicano, ficha de 2003 | CineDominicano.com |
| 4 | Sanky Panky (2007) | Cinema Dominicano, ficha de 2007 | Universidad Carlos III, Cine de movilidad |
| 56 | La Lucha de Ana (2012) | Programa Ibermedia | Cinema Dominicano |

Las URLs completas se encuentran en `frontend/src/data/editorialPeliculas.js`, se muestran en cada página y también aparecen en el HTML prerenderizado.

## Criterios de publicación

1. La coincidencia por ID, título y año evita que un texto se aplique accidentalmente a otra película.
2. No insertar información inexistente en el catálogo como si fuera un dato de SQL Server.
3. Distinguir interpretaciones editoriales de hechos verificables; no copiar sinopsis ni críticas de otras páginas.
4. La etiqueta `pendiente_revision` no significa que el editor humano ya haya aprobado el contenido.
5. No agregar ni activar anuncios en fichas generadas desde el snapshot hasta confirmar contenido, derechos y política publicitaria.
6. No confundir **citar hechos** con **tener licencia para reproducir** pósteres y fotografías.
7. Antes de solicitar revisión de AdSense, verificar indexabilidad real en Cloudflare/Search Console y revisar al menos las principales fichas manualmente.

## Auditoría de medios iniciada

El inventario de las 128 imágenes del catálogo público ya está registrado en [`media-rights-ledger.csv`](./media-rights-ledger.csv): 82 fotografías de talentos y 46 medios de películas. Los 128 constan como `PENDIENTE`, no como autorizados. El procedimiento de verificación documental y comercial está en [`MEDIA_RIGHTS_AUDIT.md`](./MEDIA_RIGHTS_AUDIT.md). La mera disponibilidad pública de un póster o imagen no autoriza su reutilización; ninguna licencia individual fue confirmada en esta ronda.

## Validación técnica

- `npm --prefix frontend run lint`
- `npm --prefix frontend run test`
- `npm --prefix frontend run build`
- Verificar las cuatro fichas con React y su HTML `dist/peliculas/<id>.html` y comprobar los enlaces externos.
- Confirmar que `main` y el backend .NET siguen independientes.
