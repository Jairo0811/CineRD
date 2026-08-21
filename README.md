<div align="center">

<img src="frontend/src/branding/cinerd-logo.png" alt="Logo de CineRD" width="720" />

### La base de datos del cine dominicano

Plataforma Full Stack inspirada en IMDb para preservar, organizar y consultar información sobre películas, talentos y producciones cinematográficas de la República Dominicana.

[![Version](https://img.shields.io/badge/version-2.4.0-success)](https://github.com/Jairo0811/CineRD)
[![Status](https://img.shields.io/badge/status-en%20desarrollo-2563eb)](https://github.com/Jairo0811/CineRD)
[![License](https://img.shields.io/badge/license-portafolio-f59e0b)](#-licencia)
[![Last Commit](https://img.shields.io/github/last-commit/Jairo0811/CineRD)](https://github.com/Jairo0811/CineRD/commits/main)

</div>

---

## 🌟 ¿Qué es CineRD?

**CineRD** es un catálogo digital del cine dominicano orientado a preservar, organizar y conectar información sobre películas, talentos, repartos y producción audiovisual de la República Dominicana.

El proyecto evolucionó desde una prueba técnica de React de 2021 hacia una plataforma Full Stack con identidad visual propia, perfiles cinematográficos, autenticación, control de acceso por roles, verificación de talentos, internacionalización editorial, búsqueda global, navegación contextual e integración con **TMDb**.

La arquitectura actual mantiene **Node.js + Express** en el backend durante la etapa de catálogo. Una futura migración a **.NET** queda reservada para la evolución de CineRD hacia una plataforma de streaming.

---

## ✨ Funcionalidades principales

### 🎬 Películas

- CRUD completo de películas.
- Póster, backdrop, género, director, productora y fecha de estreno.
- Perfil cinematográfico individual.
- Sinopsis, eslogan, duración, calificación, estado e idioma original.
- Presupuesto, recaudación y tráiler.
- Reparto completo y orden de créditos.
- Créditos profesionales estructurados para dirección, producción, guion, interpretación, música, fotografía y edición.
- Navegación directa desde cada crédito hacia el perfil del talento relacionado.
- Indicadores de créditos y participaciones verificadas por evidencia.
- Ranking de producciones con mayor reparto.
- Efemérides con todas las películas del catálogo estrenadas durante el mes actual.
- Integración con TMDb para acelerar el registro y enriquecer metadatos.
- Traducciones editoriales por película para título, sinopsis y eslogan.
- Fuente de traducción diferenciada entre `OFICIAL`, `DISTRIBUCION` y `EDITORIAL`.
- Fallback al título y contenido original cuando no existe una traducción aprobada.

### 🎭 Talentos

- Actores, actrices, directores, productores, guionistas, artistas urbanos y otros perfiles profesionales.
- Nombre real y nombre artístico preservados como identidad propia, sin traducciones artificiales.
- Fotografía, profesión y estado.
- Fecha de nacimiento y fallecimiento.
- Edad calculada automáticamente.
- Perfil artístico individual.
- Filmografía como intérprete y películas dirigidas diferenciadas.
- Créditos profesionales estructurados visibles en el perfil.
- Acceso rápido `🎬 Ver filmografía` sin regresar al catálogo general.
- Navegación contextual **Talento → Película** y **Película → Talento**.
- Indicador público de talento verificado.
- Top 10 de talentos con mayor presencia en el catálogo.
- Efemérides de cumpleaños del mes, ordenadas desde el año de nacimiento más antiguo al más reciente.
- Presencia digital mediante perfiles oficiales o profesionales:
  - Facebook
  - X / Twitter
  - Instagram
  - YouTube
  - Spotify
  - TikTok
  - Sitio web oficial

### 🧾 Reclamación y verificación de créditos

Los talentos verificados pueden solicitar la incorporación de una participación que no esté registrada en CineRD.

**Regla de integridad:** una participación no se incorpora al catálogo únicamente por declaración de la persona interesada. Cada reclamación debe incluir evidencia verificable.

El flujo permite registrar:

- película;
- tipo de participación;
- personaje o función;
- indicación de si aparece en los créditos oficiales;
- minuto inicial y final de la escena (`HH:MM:SS`);
- descripción de la escena;
- tipo de evidencia;
- archivo privado JPG, PNG, WEBP o PDF de hasta 10 MB;
- URL externa verificable;
- descripción de la evidencia.

Tipos de evidencia contemplados:

- captura de escena;
- clip o referencia temporal;
- créditos oficiales;
- hoja de llamado / call sheet;
- contrato o documento de producción;
- fotografía de rodaje / backstage;
- publicación oficial;
- perfil profesional verificable;
- otra evidencia documentada.

Estados de revisión:

- `PENDIENTE`
- `EN_REVISION`
- `REQUIERE_MAS_EVIDENCIA`
- `APROBADO`
- `RECHAZADO`

El administrador puede revisar la evidencia, solicitar información adicional, aprobar o rechazar la reclamación. Cuando se aprueba, CineRD crea o actualiza el crédito profesional y conserva la trazabilidad mediante `SolicitudCreditoId`, `FuenteCredito` y `AuditLogs`.

CineRD diferencia entre:

- **Crédito oficial verificado:** existe evidencia de que la producción acreditó formalmente a la persona.
- **Participación verificada:** CineRD confirmó mediante evidencia que la persona participó, aunque no figure necesariamente en los créditos oficiales de la obra.

Los archivos aportados como evidencia se almacenan fuera de `/uploads` y **no son públicos automáticamente**. Solo el solicitante correspondiente y los administradores autorizados pueden acceder a ellos.

### 🔎 Búsqueda y descubrimiento

- Buscador global desde el navbar.
- Resultados combinados de películas y talentos.
- Coincidencias por título, director, productora, género, nombre real, nombre artístico o profesión.
- Navegación directa desde los resultados hacia la ficha correspondiente.

### 👥 Roles y autenticación

CineRD utiliza tres experiencias privadas diferenciadas:

- **USUARIO:** explora el catálogo y puede solicitar la verificación de un perfil.
- **TALENTO_VERIFICADO:** accede a su espacio profesional, gestiona únicamente su propio perfil y puede reclamar participaciones aportando evidencia.
- **ADMINISTRADOR:** administra películas, talentos, repartos, verificaciones, traducciones, créditos profesionales, reclamaciones de crédito y métricas globales.

Incluye registro de usuarios, login con contraseña hasheada, JWT Access Token, middleware de autenticación/autorización y protección de rutas en backend y frontend.

### ✅ Verificación de talentos

- Búsqueda del perfil correspondiente.
- Acción `Este soy yo`.
- Métodos de verificación profesional.
- Revisión administrativa.
- Aprobación, rechazo y revocación.
- Vinculación única entre cuenta y perfil artístico.
- Desvinculación administrativa para devolver la cuenta a `USUARIO`.
- Auditoría mediante `AuditLogs`.
- Protección contra vinculaciones profesionales duplicadas.

> La identidad verificada no equivale automáticamente a un crédito verificado. Cada participación reclamada requiere evidencia propia.

### 📊 Dashboards por rol

- **Administrador:** Centro de Control con KPIs, Top 10 de talentos, películas con mayor reparto, distribución por género, estrenos documentados por año y actividad reciente.
- **Talento verificado:** espacio profesional conectado con su identidad, filmografía, estado de verificación y acceso rápido para reclamar participaciones faltantes.
- **Usuario:** Mi CineRD con exploración y seguimiento de solicitudes.

### 🌐 Internacionalización editorial

CineRD incorpora interfaz bilingüe **Español / Inglés** mediante i18n.

El navbar utiliza selector visual con banderas 🇩🇴 / 🇺🇸 (`DO ES` / `US EN`) y un logotipo horizontal específico para navegación (`frontend/src/branding/cinerd-navbar.png`).

La interfaz, navegación, etiquetas y estados se traducen automáticamente. El contenido cinematográfico utiliza un modelo editorial:

- los nombres reales y artísticos nunca se traducen;
- el contenido original permanece como fuente canónica;
- títulos, sinopsis y eslóganes solo se localizan cuando existe una versión registrada;
- la procedencia puede ser `OFICIAL`, `DISTRIBUCION` o `EDITORIAL`;
- las traducciones editoriales revisadas muestran `✓ Revisada por CineRD`;
- si no existe título localizado aprobado se mantiene el título original;
- cuando el título público está localizado, la ficha puede mostrar también el título original;
- el perfil de la película vuelve a consultar el contenido según el idioma seleccionado mediante `?lang=es|en`.

### 🌐 Integración con TMDb

- Búsqueda de películas y talentos.
- Importación de información e imágenes.
- Importación de repartos.
- Identificación mediante `TMDbId`.
- Detección de coincidencias y duplicados.

---

## 📦 Catálogo portable para desarrollo

CineRD incorpora un mecanismo reproducible para transportar el catálogo de desarrollo entre computadoras sin copiar manualmente la base de datos ni versionar información sensible.

### Qué se exporta

El snapshot portable incluye:

- `Actores`
- `Peliculas`
- `ActoresPeliculas`
- `PeliculaCreditos`
- `PeliculaTraducciones`

La multimedia pública del catálogo continúa almacenándose en:

```text
backend/uploads/actores/
backend/uploads/peliculas/
```

El exportador valida que las fotografías, pósteres y backdrops referenciados por la base existan realmente en `backend/uploads`.

### Qué NO se exporta

Por seguridad, el snapshot no incluye:

- `Usuarios`
- contraseñas
- `RefreshTokens`
- `SolicitudesVerificacion`
- `TalentosUsuarios`
- `SolicitudesCredito`
- `SolicitudCreditoEvidencias`
- `AuditLogs`
- evidencias privadas de créditos
- secretos del archivo `.env`
- JWT o claves privadas

### Comandos disponibles

Desde `backend/`:

```bash
npm run catalog:export
npm run catalog:validate
npm run catalog:import
npm run catalog:import:replace
npm run setup:local
```

#### `npm run catalog:export`

Genera o actualiza `database/seeds/catalog.snapshot.json` con el catálogo actual.

#### `npm run catalog:validate`

Comprueba formato, versión, IDs duplicados, referencias huérfanas y archivos multimedia faltantes antes de importar o versionar un snapshot.

#### `npm run catalog:import`

Restaura el snapshot en una base vacía. Si detecta películas o talentos existentes, se detiene para evitar sobrescribir información accidentalmente.

#### `npm run catalog:import:replace`

Reemplaza intencionalmente el catálogo local existente por el snapshot versionado. Antes de eliminar los datos actuales crea automáticamente un backup local en:

```text
database/seeds/backups/
```

Ese directorio está excluido de Git.

#### `npm run setup:local`

Automatiza una instalación nueva:

1. crea `CRUDPeliculas` si no existe;
2. ejecuta `CRUD-Peliculas.sql`;
3. aplica las migraciones `002` a `008`;
4. valida el snapshot si existe;
5. importa `database/seeds/catalog.snapshot.json`;
6. deja la base preparada para iniciar el backend.

---

## 🎨 Experiencia visual

CineRD utiliza una identidad inspirada en el cine dominicano, combinando azul, rojo, blanco y navy con una estética cinematográfica moderna.

La interfaz incluye:

- Home pública cinematográfica.
- Catálogo visual de películas.
- Directorio visual de talentos.
- Perfiles editoriales de películas y talentos.
- Navbar dinámico según sesión y rol.
- Logo horizontal específico para el navbar.
- Selector de idioma con banderas de República Dominicana y Estados Unidos.
- Navegación contextual entre talentos y películas.
- Centro de Control administrativo.
- Panel administrativo de reclamaciones de crédito.
- **Light mode y Dark mode** con sistema de tema persistente.
- Contraste específico para componentes claros dentro del modo oscuro.
- Overrides globales para tablas, formularios, modales, verificaciones y utilidades Bootstrap.
- Diseño responsive para escritorio, tablet y móvil.

---

## 🛡️ Seguridad

La etapa de catálogo incorpora:

- contraseñas hasheadas;
- autenticación JWT;
- autorización RBAC;
- rate limiting para login y registro;
- eliminación de `X-Powered-By`;
- cabeceras defensivas `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`;
- CORS configurado por `FRONTEND_URL`;
- límite JSON de 1 MB;
- uploads públicos restringidos a JPG, PNG y WEBP;
- tamaño máximo de imagen pública de 8 MB;
- evidencias de crédito restringidas a JPG, PNG, WEBP o PDF y máximo 10 MB;
- almacenamiento privado de evidencias fuera de `/uploads`;
- acceso a evidencia protegido por autenticación y autorización;
- prevención de reclamaciones activas duplicadas por talento, película y tipo de participación;
- URL de evidencia limitada a protocolos HTTP/HTTPS;
- trazabilidad administrativa mediante `AuditLogs`;
- exclusión de secretos, evidencias privadas y backups locales del repositorio.

---

## 🚀 Tecnologías

### Frontend

<p>
  <img src="https://skillicons.dev/icons?i=react,vite,html,css,js,bootstrap" alt="React, Vite, JavaScript, HTML, CSS y Bootstrap" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg" alt="React Router" title="React Router" width="48" height="48" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg" alt="Axios" title="Axios" width="48" height="48" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chartjs/chartjs-original.svg" alt="Chart.js" title="Chart.js" width="48" height="48" />
</p>

- React + Vite
- React Router
- Axios
- Bootstrap 5
- Chart.js
- i18n ES/EN
- Sistema de temas Light/Dark

### Backend

<p>
  <img src="https://skillicons.dev/icons?i=nodejs,express" alt="Node.js y Express" />
</p>

- Node.js
- Express
- MSSQL
- Multer
- Sharp
- bcrypt
- JWT
- dotenv
- CORS

### Base de datos

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg" alt="Microsoft SQL Server" width="48" height="48" />
</p>

- Microsoft SQL Server
- Migraciones SQL idempotentes
- Snapshot portable del catálogo de desarrollo
- Relaciones estructuradas de créditos profesionales
- Flujo auditable de reclamaciones y evidencias

### Integraciones

- TMDb API
- YouTube
- Redes y perfiles profesionales externos

---

## 🏗️ Arquitectura

```text
CineRD/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── private/                  # local, ignorado por Git
│   │   └── evidencias-creditos/
│   ├── scripts/
│   │   ├── exportCatalog.js
│   │   ├── importCatalog.js
│   │   ├── validateCatalog.js
│   │   ├── setupLocal.js
│   │   └── seedAdmin.js
│   ├── tests/
│   ├── uploads/
│   │   ├── actores/
│   │   └── peliculas/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   └── src/
│       ├── assets/
│       ├── branding/
│       ├── components/
│       ├── i18n/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── utils/
├── database/
│   ├── migrations/
│   │   └── 008_solicitudes_creditos.sql
│   └── seeds/
│       ├── catalog.snapshot.json
│       └── README.md
├── CRUD-Peliculas.sql
└── README.md
```

---

## ⚙️ Instalación completa

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jairo0811/CineRD.git
cd CineRD
```

### 2. Configurar variables de entorno

Crea `backend/.env` usando como referencia `backend/.env.example`.

```env
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_DATABASE=CRUDPeliculas
DB_ENCRYPT=false
DB_TRUST_CERT=true

TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

JWT_ACCESS_SECRET=change_this_for_a_long_random_secret
JWT_ACCESS_EXPIRES_IN=15m

SEED_ADMIN_NAME=Administrador CineRD
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change_this_password
```

> Nunca subas `backend/.env` al repositorio.

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 4. Preparar SQL Server y restaurar catálogo

```bash
npm run setup:local
```

Internamente ejecuta:

```text
CRUD-Peliculas.sql
database/migrations/002_peliculas_metadatos.sql
database/migrations/003_usuarios_roles_verificacion.sql
database/migrations/004_actores_redes_sociales.sql
database/migrations/005_verificacion_indices_activos.sql
database/migrations/006_peliculas_traducciones.sql
database/migrations/007_pelicula_creditos.sql
database/migrations/008_solicitudes_creditos.sql
```

### 5. Crear administrador inicial

```bash
npm run seed:admin
```

### 6. Ejecutar backend

```bash
npm run dev
```

Backend: `http://localhost:3000`

### 7. Instalar y ejecutar frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

---

## 🔄 Sincronizar el catálogo entre PCs

### PC principal

```powershell
cd backend
npm run catalog:export
npm run catalog:validate
cd ..
git add database/seeds/catalog.snapshot.json backend/uploads
git commit -m "data: update CineRD development catalog"
git push origin main
```

### Segunda PC

```powershell
git switch main
git pull origin main
cd backend
npm install
npm run setup:local
```

Con esto la segunda computadora obtiene estructura actualizada de SQL Server, talentos, películas, repartos, créditos profesionales, traducciones cinematográficas y multimedia versionada.

Las solicitudes de crédito y sus evidencias privadas **no forman parte del snapshot portable**.

Si la segunda PC ya contiene datos y deseas reemplazarlos expresamente:

```powershell
npm run catalog:import:replace
```

Antes del reemplazo se genera un backup local automático.

---

## 🛡️ Qué se versiona y qué no

### Sí se versiona

```text
database/seeds/catalog.snapshot.json
backend/uploads/actores/
backend/uploads/peliculas/
database/migrations/
CRUD-Peliculas.sql
```

### No se versiona

```text
backend/.env
backend/private/
backend/node_modules/
frontend/node_modules/
frontend/dist/
database/seeds/backups/
```

Tampoco se incluyen en el snapshot cuentas de usuario, contraseñas, tokens, solicitudes de verificación, reclamaciones de créditos, evidencias privadas ni registros de auditoría.

---

## 🧪 Calidad y CI

Desde `backend/`:

```bash
npm test
npm run catalog:validate
```

Desde `frontend/`:

```bash
npm run build
```

GitHub Actions ejecuta automáticamente:

- `npm ci` + `npm test` para backend;
- `npm ci` + `npm run build` para frontend.

---

## 🧪 Comandos de desarrollo

Desde `backend/`:

```bash
npm run dev
npm test
npm run seed:admin
npm run catalog:export
npm run catalog:validate
npm run catalog:import
npm run catalog:import:replace
npm run setup:local
```

Desde `frontend/`:

```bash
npm run dev
npm run build
```

---

## 🔌 Endpoints destacados

```http
GET    /api/busqueda?q=termino
GET    /api/peliculas
GET    /api/peliculas/:id/perfil?lang=en
GET    /api/peliculas/:id/traducciones
PUT    /api/peliculas/:id/traducciones/:idioma
GET    /api/peliculas/:id/creditos
GET    /api/peliculas/creditos/actor/:actorId
POST   /api/peliculas/:id/creditos
DELETE /api/peliculas/:id/creditos/:creditoId
GET    /api/actores
GET    /api/actores/:id
POST   /api/auth/registro
POST   /api/auth/login
GET    /api/verificaciones/mis-solicitudes
GET    /api/verificaciones/mi-perfil
GET    /api/verificaciones/admin/pendientes
GET    /api/verificaciones/admin/vinculaciones
PATCH  /api/verificaciones/admin/:id/revisar
PATCH  /api/verificaciones/admin/vinculaciones/:id/revocar
POST   /api/solicitudes-creditos
GET    /api/solicitudes-creditos/mias
GET    /api/solicitudes-creditos/admin
GET    /api/solicitudes-creditos/evidencias/:evidenciaId/archivo
PATCH  /api/solicitudes-creditos/:id/revision
```

---

## 🗺️ Roadmap

| Estado | Funcionalidad |
|---|---|
| ✅ | CRUD de películas y talentos |
| ✅ | Gestión de repartos |
| ✅ | Perfiles cinematográficos y artísticos |
| ✅ | Autenticación y RBAC |
| ✅ | Verificación, revocación y desvinculación de talentos |
| ✅ | Dashboards por rol y Centro de Control |
| ✅ | Renovación visual integral |
| ✅ | Redes sociales y Spotify para talentos |
| ✅ | Efemérides de cumpleaños y estrenos |
| ✅ | Top 10 de talentos |
| ✅ | Internacionalización Español / Inglés |
| ✅ | Traducciones editoriales de películas |
| ✅ | Selector de idioma con banderas y branding de navbar |
| ✅ | Light mode / Dark mode |
| ✅ | Buscador global |
| ✅ | Créditos profesionales estructurados |
| ✅ | Navegación contextual Talento ↔ Película |
| ✅ | Reclamación de participaciones con evidencia |
| ✅ | Revisión administrativa y trazabilidad de créditos |
| ✅ | Evidencias privadas protegidas |
| ✅ | Catálogo portable validado y con backup previo |
| ✅ | CI básico y pruebas backend |
| 🟡 | Galerías multimedia |
| 🟡 | Premios y nominaciones |
| 🟡 | Series dominicanas |
| 🟡 | Estadísticas avanzadas |
| 🟡 | Mapa del cine dominicano |
| 🟡 | Despliegue en la nube |
| 🔵 | Evolución futura hacia streaming |
| 🔵 | Migración futura del backend a .NET para la etapa streaming |

---

## 📌 Estado del proyecto

🟢 **Versión 2.4.0 — Catálogo profesional en consolidación**

CineRD funciona actualmente como un portal cinematográfico dominicano con catálogo público, perfiles profesionales, autenticación, RBAC, verificación de talentos, Centro de Control, efemérides, internacionalización editorial, búsqueda global, soporte Light/Dark, créditos profesionales estructurados, navegación contextual entre películas y talentos y un flujo auditable para reclamar participaciones faltantes mediante evidencia.

La prioridad sigue siendo consolidar CineRD como **archivo y plataforma de descubrimiento del cine dominicano** antes de abordar una futura etapa de distribución/streaming.

---

## 👨‍💻 Autor

### Francis Jairo Matías Rosario

**Ingeniero de Software · Desarrollador Full Stack**  
República Dominicana

- [GitHub](https://github.com/Jairo0811)
- [LinkedIn](https://www.linkedin.com/in/jairomatias0811/)

---

## 📄 Licencia

Este proyecto forma parte de mi **portafolio profesional** y fue desarrollado con fines educativos, culturales y de investigación.

CineRD no está afiliado, patrocinado ni respaldado por **TMDb**.

© 2026 Francis Jairo Matías Rosario.
