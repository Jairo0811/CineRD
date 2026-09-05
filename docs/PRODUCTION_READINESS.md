# CineRD — Production Readiness

Este documento define el criterio de salida para **CineRD 2.5 — Production & Commercial Hardening**.

## Estado

CineRD 2.4 ya funciona como catálogo profesional y plataforma de descubrimiento. La versión 2.5 no busca añadir grandes módulos de producto: busca reducir riesgo operativo, de seguridad y de mantenimiento antes de utilizar CineRD con usuarios reales y una futura oferta comercial.

## Completado en 2.5

### Sesiones y autenticación

- Access tokens JWT de vida corta.
- Refresh tokens aleatorios almacenados únicamente como SHA-256 en SQL Server.
- Rotación de refresh token en cada renovación.
- Revocación del token anterior durante la rotación.
- Cookie de refresh token `HttpOnly`.
- `Secure` + `SameSite=None` en producción para frontend/API desplegados en orígenes distintos.
- Logout con revocación de refresh token.
- Renovación transparente de sesión desde el cliente cuando un access token expira.
- Rate limiting independiente para renovación de sesión.

### Infraestructura existente

- Health endpoint `/health`.
- Configuración CORS por lista de orígenes.
- SQL Server configurable por variables de entorno.
- CI para backend y frontend.
- Migraciones SQL idempotentes.
- Catálogo portable para desarrollo.

## Bloqueadores antes de aceptar datos reales sensibles

### 1. Persistencia de archivos

Los uploads locales bajo `backend/uploads` y las evidencias privadas guardadas en disco **no deben depender del filesystem efímero de una instancia cloud**.

Antes de habilitar reclamaciones reales de créditos en producción se debe usar una de estas estrategias:

- object storage S3-compatible (AWS S3, Cloudflare R2, Backblaze B2 o equivalente), o
- Azure Blob Storage, o
- volumen/disco persistente administrado con backups.

Las evidencias privadas deben mantenerse fuera de rutas públicas y entregarse únicamente tras autorización. Si se adopta object storage, usar URLs firmadas de corta duración o streaming autenticado desde la API.

### 2. Recuperación y verificación de cuenta

Antes de comercializar:

- verificación real de email;
- recuperación/restablecimiento de contraseña con tokens de un solo uso;
- revocación de todas las sesiones tras cambio de contraseña cuando corresponda;
- registro auditable de cambios sensibles.

### 3. Cobertura de pruebas

La suite actual debe ampliarse para cubrir como mínimo:

- login válido/inválido;
- RBAC;
- refresh rotation y replay del refresh anterior;
- logout/revocación;
- reclamación de crédito;
- autorización de acceso a evidencia privada;
- aprobación/rechazo de verificaciones;
- CRUD administrativo crítico;
- navegación pública principal mediante E2E.

Objetivo para 2.5: pruebas de integración del backend y smoke/E2E del frontend para los flujos de mayor riesgo.

### 4. Observabilidad y backups

Antes de producción comercial:

- logs estructurados;
- captura centralizada de errores;
- uptime/health monitoring;
- backup automatizado de SQL Server;
- política de retención y restauración probada;
- backup de archivos persistentes u object storage versionado.

### 5. Cumplimiento y operación comercial

Antes de activar monetización:

- Política de Privacidad;
- Términos de Uso;
- mecanismo de reporte/corrección de información;
- proceso para solicitudes de eliminación o rectificación de datos personales;
- política editorial para créditos verificados;
- revisión de derechos/licencias de imágenes y multimedia;
- revisión de las condiciones comerciales de las APIs externas utilizadas, incluyendo TMDb;
- identificación clara de contenido patrocinado si se incorpora promoción pagada.

## Criterio de salida de CineRD 2.5

CineRD podrá etiquetarse como **Production Ready** cuando:

1. SQL Server use un servicio persistente con backups.
2. Los uploads y evidencias sean persistentes y recuperables.
3. La autenticación completa tenga renovación, revocación, recuperación y verificación de email.
4. Los flujos críticos tengan pruebas automatizadas.
5. CI bloquee regresiones de build/tests.
6. Exista monitoreo de salud y errores.
7. Existan documentos legales mínimos para usuarios reales.
8. La documentación coincida con las migraciones y módulos realmente implementados.

## Dirección comercial posterior

La versión 3.x debería enfocarse en negocio y adopción, no en reescribir el núcleo:

- CineRD Pro para talentos;
- perfiles de productoras;
- casting y shortlists;
- analítica profesional;
- herramientas B2B;
- promoción cinematográfica identificada como patrocinada.

El streaming permanece como una evolución futura independiente y no es requisito para monetizar CineRD como plataforma profesional.
