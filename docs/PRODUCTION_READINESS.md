# CineRD — Production Readiness

Este documento define el criterio de salida de **CineRD 2.5 — Production & Commercial Hardening**.

## Estado de implementación

🟢 **Hardening de código 2.5 completado.**

La rama 2.5 incorpora los mecanismos técnicos necesarios para operar CineRD como candidato a producción. La activación pública/comercial todavía exige configurar y validar la infraestructura externa indicada al final de este documento.

## Completado en 2.5

### Autenticación y cuentas

- Access tokens JWT de vida corta.
- Refresh tokens aleatorios almacenados únicamente como SHA-256 en SQL Server.
- Rotación y revocación de refresh tokens.
- Cookie `HttpOnly`, `Secure` y `SameSite=None` en producción.
- Renovación transparente de sesión desde React.
- Logout con revocación.
- Recuperación de contraseña con token de un solo uso y expiración de 30 minutos.
- Revocación de todas las sesiones después de un cambio de contraseña.
- Verificación real de correo con token de un solo uso y expiración de 24 horas.
- Envío transaccional mediante Resend, sin dependencia adicional de runtime.
- Rate limiting para autenticación, renovación y recuperación.
- Auditoría de cambios sensibles.

### Persistencia

- `UPLOADS_DIR` y `PRIVATE_STORAGE_DIR` configurables.
- Inicialización automática de estructura de almacenamiento.
- Compatibilidad con el flujo histórico de evidencias privadas mediante enlace al almacenamiento persistente.
- Blueprint de Render con disco persistente `/var/data`.
- Separación entre `/var/data/uploads` y `/var/data/private`.
- Las evidencias privadas continúan fuera de `express.static` y solo se entregan mediante endpoints autorizados.

### Operación y observabilidad

- `/health` para liveness.
- `/ready` para proceso + SQL Server.
- `X-Request-ID` por solicitud.
- Logs HTTP JSON estructurados con método, ruta, estado, latencia, usuario e IP.
- Error handler central con request ID.
- `trust proxy` para operación detrás de reverse proxy.
- `npm run migrate` para aplicar migraciones SQL idempotentes explícitamente en despliegues.
- Runbook de backups, restore drills e incidentes en `docs/OPERATIONS_RUNBOOK.md`.

### Calidad

- Pruebas de primitivas JWT/refresh token.
- Pruebas del layout de almacenamiento persistente.
- Prueba de integración aislada del proveedor de correo transaccional.
- Prueba del middleware de request IDs.
- CI ejecuta backend tests, validación del catálogo, frontend lint y frontend build.

### SEO y descubrimiento

- Metadata descriptiva y Open Graph.
- Canonical URL.
- JSON-LD `WebSite` + `SearchAction`.
- `robots.txt`.
- `sitemap.xml` público.

### Cumplimiento/editorial

Se añadieron borradores operativos para revisión antes del lanzamiento:

- `docs/PRIVACY_POLICY.md`
- `docs/TERMS_OF_USE.md`
- `docs/EDITORIAL_POLICY.md`
- `docs/OPERATIONS_RUNBOOK.md`

Estos documentos no sustituyen una revisión jurídica aplicable al país y modelo comercial definitivo.

## Migraciones

`npm run setup:local` y `npm run migrate` reconocen las migraciones `002`–`015`, incluyendo `015_account_security.sql` para recuperación y verificación de cuentas.

## Requisitos externos antes de activar producción comercial

Estos puntos no se resuelven únicamente mediante código del repositorio:

1. Provisionar SQL Server persistente y configurar backups automáticos.
2. Desplegar la API con el disco persistente definido en `render.yaml` o infraestructura equivalente.
3. Configurar `RESEND_API_KEY` y un remitente/dominio autorizado en `EMAIL_FROM`.
4. Configurar un monitor externo contra `/ready` y, si se desea, un agregador de logs JSON.
5. Ejecutar y documentar al menos un restore drill antes de aceptar evidencias reales de terceros.
6. Revisar jurídicamente Política de Privacidad y Términos de Uso.
7. Confirmar licencias/derechos del contenido y condiciones comerciales de APIs externas, especialmente TMDb, antes de monetizar.
8. Validar en producción los flujos completos: registro → verificación → login → refresh → recuperación → reclamación de crédito → acceso autorizado a evidencia.

## Criterio de salida

Cuando los requisitos externos anteriores estén configurados y el CI del PR esté verde, CineRD 2.5 puede etiquetarse como **Production Candidate**. Después de un smoke test de despliegue, backup/restore y revisión legal, puede promoverse a **Production Ready**.

## Dirección posterior

La versión 3.x debe enfocarse en adopción y negocio, no en reescribir el núcleo: CineRD Pro, productoras, casting/shortlists, analítica profesional, herramientas B2B y promoción patrocinada claramente identificada. El streaming permanece como una evolución futura independiente.
