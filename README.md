<div align="center">

<img src="frontend/src/branding/cinerd-logo.png" alt="Logo de CineRD" width="720" />

### Cine dominicano: catálogo, talento, historia y herramientas profesionales

**CineRD** es una plataforma Full Stack dedicada a preservar, organizar, descubrir y conectar información sobre películas, talentos y producción cinematográfica de la República Dominicana.

[![Stage](https://img.shields.io/badge/stage-Pre--3.0-2563eb)](https://github.com/Jairo0811/CineRD)
[![Base](https://img.shields.io/badge/base-2.5.x%20%2B%20Historia-success)](https://github.com/Jairo0811/CineRD)
[![CI](https://github.com/Jairo0811/CineRD/actions/workflows/ci.yml/badge.svg)](https://github.com/Jairo0811/CineRD/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-portafolio-f59e0b)](#-licencia)
[![Last Commit](https://img.shields.io/github/last-commit/Jairo0811/CineRD)](https://github.com/Jairo0811/CineRD/commits/main)

</div>

---

## 🌟 ¿Qué es CineRD?

CineRD comenzó como una prueba técnica de React en 2021 y evolucionó hasta convertirse en una plataforma cinematográfica dominicana con cuatro ejes principales:

- **Catálogo y descubrimiento:** películas, talentos, filmografías, reparto, créditos, búsqueda y navegación contextual.
- **Identidad y confianza:** cuentas, roles, verificación de talentos, reclamaciones de perfil y reclamaciones de créditos con evidencia.
- **Patrimonio cinematográfico:** CineRD Historia, cronología editorial del cine dominicano y exploración por décadas.
- **Base profesional:** perfiles y herramientas para talento y administración, con una evolución planificada hacia CineRD Pro y funcionalidades B2B.

CineRD no ofrece streaming actualmente. La distribución de películas se considera una evolución futura y estará condicionada a derechos de exhibición, territorios, ventanas de disponibilidad y una infraestructura específica de video.

---

## 📌 Estado actual

**CineRD 2.5.x + CineRD Historia — base técnica cerrada antes de CineRD 3.0.**

El estado actual incluye hardening de producción, sesiones seguras, recuperación de cuenta, observabilidad, almacenamiento persistente configurable, SEO básico, AdSense readiness, CI, catálogo portable, premios, galerías, multimedia, historia editorial y optimización del frontend.

El proyecto se considera **Production Candidate**, no un servicio comercial definitivo. Antes de un lanzamiento formal deben completarse las tareas operativas, legales y de derechos descritas en la documentación del repositorio.

Documentación relevante:

- [Production Readiness](docs/PRODUCTION_READINESS.md)
- [Operations Runbook](docs/OPERATIONS_RUNBOOK.md)
- [AdSense Readiness](docs/ADSENSE_READINESS.md)
- [Privacy Policy](docs/PRIVACY_POLICY.md)
- [Terms of Use](docs/TERMS_OF_USE.md)
- [Editorial Policy](docs/EDITORIAL_POLICY.md)

---

## ✨ Capacidades principales

### 🎬 Películas

- Catálogo y CRUD administrativo.
- Póster, backdrop, género, director, productora y fecha de estreno.
- Sinopsis, eslogan, duración, estado, idioma original, presupuesto y recaudación.
- Perfil cinematográfico individual.
- Reparto y tipos de participación.
- Créditos profesionales estructurados.
- Premios y nominaciones.
- Galería multimedia.
- Tráilers mediante YouTube.
- Música mediante Spotify y YouTube.
- Navegación directa entre películas y talentos.
- Traducciones editoriales ES/EN con procedencia diferenciada.
- Integración con TMDb para búsqueda, importación de metadatos y apoyo al registro.

### 🎭 Talentos

- Actores, actrices, directores, productores, guionistas y otros profesionales.
- Nombre real y nombre artístico.
- Fotografía, profesión, estado y datos biográficos.
- Filmografía como intérprete y créditos profesionales.
- Películas dirigidas diferenciadas.
- Premios y nominaciones relacionados.
- Galería y presencia digital.
- Redes y perfiles profesionales externos.
- Indicador público de talento verificado.
- Edición restringida al talento vinculado o al administrador, según las reglas actuales.

### 🏛️ CineRD Historia

CineRD incorpora una capa editorial dedicada al patrimonio cinematográfico dominicano:

- ruta pública **`/historia`**;
- cronología del cine dominicano;
- exploración por décadas;
- soporte de navegación mediante `?decada=`;
- integración de películas del catálogo dentro de la narrativa histórica;
- mini línea de tiempo en la portada;
- contenido bilingüe ES/EN;
- identidad visual editorial basada en **Fraunces + Inter**.

La cronología se mantiene separada de los datos transaccionales principales para conservar una experiencia editorial controlada.

### 🔎 Búsqueda y descubrimiento

- Buscador global.
- Resultados combinados de películas y talentos.
- Coincidencias por título, director, productora, género, nombre real, nombre artístico o profesión.
- Navegación contextual Talento ↔ Película.
- Efemérides y rankings editoriales.
- Exploración histórica por décadas.

### 👥 Roles

CineRD utiliza tres roles:

- **USUARIO:** explora el catálogo y puede solicitar la verificación de un perfil.
- **TALENTO_VERIFICADO:** administra las capacidades permitidas sobre su identidad vinculada y puede reclamar participaciones faltantes.
- **ADMINISTRADOR:** administra catálogo, reparto, verificaciones, créditos, premios, galería, traducciones y solicitudes.

> **Talento verificado** significa que CineRD validó la relación entre una cuenta y un perfil. No equivale a una suscripción de pago ni convierte automáticamente todas sus participaciones en créditos verificados.

---

## ✅ Verificación de talento y reclamación de créditos

### Verificación de perfil

El flujo permite:

1. localizar el perfil correspondiente;
2. usar la acción **Este soy yo**;
3. enviar una solicitud;
4. revisión administrativa;
5. aprobación, rechazo o revocación;
6. vinculación entre cuenta y perfil.

Las operaciones quedan protegidas por autenticación, autorización y trazabilidad administrativa.

### Reclamaciones de créditos

Un talento verificado puede solicitar la incorporación o corrección de una participación aportando evidencia.

La solicitud puede incluir:

- película;
- tipo de participación;
- personaje o función;
- indicación de crédito oficial;
- referencia temporal;
- descripción;
- archivo privado JPG, PNG, WEBP o PDF;
- URL externa verificable;
- descripción de la evidencia.

Estados soportados:

- `PENDIENTE`
- `EN_REVISION`
- `REQUIERE_MAS_EVIDENCIA`
- `APROBADO`
- `RECHAZADO`

CineRD diferencia entre:

- **Crédito oficial verificado:** la producción acreditó formalmente a la persona.
- **Participación verificada:** existe evidencia suficiente de participación aunque no figure necesariamente en los créditos oficiales.

Las evidencias privadas no se exponen mediante almacenamiento público.

---

## 🔐 Cuenta y sesiones

La autenticación actual incluye:

- registro;
- login;
- JWT Access Token;
- refresh token criptográficamente aleatorio;
- refresh token almacenado como hash SHA-256 en SQL Server;
- cookie HttpOnly para renovación de sesión;
- rotación transaccional del refresh token;
- detección de reutilización de tokens rotados;
- revocación de sesiones;
- logout real contra backend;
- recuperación de contraseña;
- verificación de correo;
- reenvío de verificación;
- renovación automática desde rutas protegidas cuando vence el access token.

Los rate limiters de login, registro, refresh y recuperación mantienen contadores independientes.

---

## 🛡️ Seguridad y observabilidad

Entre las protecciones actuales se encuentran:

- contraseñas hasheadas;
- RBAC en backend y frontend;
- rate limiting por superficie;
- sanitización de respuestas HTTP 5xx;
- `requestId` por solicitud;
- logs HTTP estructurados;
- eliminación de `X-Powered-By`;
- `X-Content-Type-Options`;
- `X-Frame-Options`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- CORS configurable;
- límite JSON;
- validación de tipos y tamaños de upload;
- almacenamiento privado para evidencias;
- health check `/health`;
- readiness check `/ready`;
- auditoría de dependencias de producción en CI.

---

## 🌐 Internacionalización

La interfaz soporta:

- 🇩🇴 Español
- 🇺🇸 English

El contenido cinematográfico conserva su fuente original. Las traducciones de títulos, sinopsis y eslóganes pueden marcar su procedencia como:

- `OFICIAL`
- `DISTRIBUCION`
- `EDITORIAL`

Los nombres reales y artísticos no se traducen.

---

## 💰 AdSense readiness

CineRD tiene preparación técnica para Google AdSense, pero los anuncios están **desactivados por defecto**.

Solo se cargan cuando se configuran:

```env
VITE_ADSENSE_CLIENT=ca-pub-...
VITE_ADSENSE_SLOT=...
```

La integración manual está restringida a rutas públicas elegibles y no debe utilizarse en login, dashboards, administración, verificación, reclamaciones ni evidencia privada.

La activación comercial requiere aprobación real de AdSense, configuración de `ads.txt`, consentimiento/CMP cuando aplique y revisión legal.

Consulta [docs/ADSENSE_READINESS.md](docs/ADSENSE_READINESS.md).

---

## 🚀 Stack tecnológico

### Frontend

- React 18
- Vite 6
- React Router
- Axios
- Bootstrap 5
- Chart.js
- i18next / react-i18next
- Vitest
- Testing Library
- Fraunces Variable
- Inter Variable
- Light / Dark theme
- Code splitting con `React.lazy` y `Suspense`

### Backend

- Node.js
- Express 5
- SQL Server mediante `mssql`
- Multer
- Sharp
- bcryptjs
- JSON Web Tokens
- cookie-parser
- dotenv
- CORS
- Resend API mediante `fetch` para correo transaccional

### Infraestructura y calidad

- SQL Server
- GitHub Actions
- Netlify
- Render blueprint
- almacenamiento persistente configurable
- `npm audit` como quality gate
- health/readiness endpoints
- catálogo portable versionado

---

## 🏗️ Arquitectura

```text
CineRD/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── scripts/
│   │   ├── exportCatalog.js
│   │   ├── importCatalog.js
│   │   ├── migrate.js
│   │   ├── setupLocal.js
│   │   ├── validateCatalog.js
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
├── database/
│   ├── migrations/
│   │   ├── 002_peliculas_metadatos.sql
│   │   ├── ...
│   │   └── 015_account_security.sql
│   └── seeds/
│       └── catalog.snapshot.json
├── docs/
│   ├── ADSENSE_READINESS.md
│   ├── EDITORIAL_POLICY.md
│   ├── OPERATIONS_RUNBOOK.md
│   ├── PRIVACY_POLICY.md
│   ├── PRODUCTION_READINESS.md
│   └── TERMS_OF_USE.md
├── frontend/
│   ├── public/
│   └── src/
│       ├── branding/
│       ├── components/
│       │   └── historia/
│       ├── data/
│       │   └── historiaCine.js
│       ├── i18n/
│       ├── pages/
│       │   └── Historia.jsx
│       ├── services/
│       ├── styles/
│       └── utils/
├── CRUD-Peliculas.sql
├── netlify.toml
├── render.yaml
└── README.md
```

---

## ⚙️ Requisitos locales

Recomendado:

- Node.js 22
- npm
- SQL Server accesible desde la máquina local
- Git

---

## 🧰 Instalación local

### 1. Clonar

```bash
git clone https://github.com/Jairo0811/CineRD.git
cd CineRD
```

### 2. Backend

```bash
cd backend
npm ci
```

Copia `backend/.env.example` como `backend/.env` y configura al menos:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URLS=http://localhost:5173
PUBLIC_APP_URL=http://localhost:5173

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=CRUDPeliculas
DB_ENCRYPT=false
DB_TRUST_CERT=true

UPLOADS_DIR=./uploads
PRIVATE_STORAGE_DIR=./private

TMDB_ACCESS_TOKEN=your_tmdb_read_access_token

JWT_ACCESS_SECRET=change_this_for_a_long_random_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_DAYS=30

RESEND_API_KEY=
EMAIL_FROM=CineRD <noreply@example.com>

SEED_ADMIN_NAME=Administrador CineRD
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change_this_password
```

> Nunca subas `backend/.env`, secretos, credenciales, tokens ni evidencia privada.

### 3. Preparar la base local

Para una instalación nueva:

```bash
npm run setup:local
```

`setup:local`:

1. crea la base configurada si no existe;
2. aplica `CRUD-Peliculas.sql`;
3. aplica las migraciones `002` a `015`;
4. valida el snapshot portable;
5. importa el catálogo cuando la base está vacía.

Para aplicar únicamente las migraciones numeradas sobre una base existente:

```bash
npm run migrate
```

### 4. Crear administrador inicial

```bash
npm run seed:admin
```

### 5. Ejecutar backend

```bash
npm run dev
```

Backend local:

```text
http://localhost:3000
```

### 6. Frontend

En otra terminal:

```bash
cd frontend
npm ci
npm run dev
```

Frontend local:

```text
http://localhost:5173
```

---

## 📦 Catálogo portable

El snapshot de desarrollo se encuentra en:

```text
database/seeds/catalog.snapshot.json
```

Incluye datos de catálogo como:

- talentos;
- películas;
- participaciones;
- créditos profesionales;
- traducciones.

No incluye:

- usuarios;
- contraseñas;
- refresh tokens;
- solicitudes de verificación;
- solicitudes de créditos;
- evidencias privadas;
- secretos;
- registros sensibles de auditoría.

### Comandos

Desde `backend/`:

```bash
npm run catalog:export
npm run catalog:validate
npm run catalog:import
npm run catalog:import:replace
npm run setup:local
```

`catalog:import:replace` genera un backup local antes de reemplazar intencionalmente el catálogo existente.

### Multimedia

La multimedia pública usada por el catálogo puede vivir en:

```text
backend/uploads/actores/
backend/uploads/peliculas/
```

El exportador valida que los archivos referenciados existan.

No agregues indiscriminadamente todos los uploads locales al repositorio. Antes de versionar multimedia nueva, confirma que realmente forma parte del catálogo portable y revisa `git status`.

---

## 🧪 Calidad

### Backend

Desde la raíz:

```bash
npm --prefix backend ci
npm --prefix backend test
npm --prefix backend run catalog:validate
npm --prefix backend audit --omit=dev --audit-level=high
```

### Frontend

```bash
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend audit --omit=dev --audit-level=high
npm --prefix frontend run build
```

GitHub Actions ejecuta esas validaciones automáticamente en pushes y pull requests hacia `main`.

Netlify repite las validaciones funcionales principales antes del deploy del frontend.

---

## 🩺 Health y operación

Endpoints operativos:

```http
GET /health
GET /ready
```

- `/health`: confirma que el proceso HTTP está activo.
- `/ready`: confirma proceso + conectividad básica con SQL Server.

Producción debe usar almacenamiento persistente para:

```text
UPLOADS_DIR
PRIVATE_STORAGE_DIR
```

El blueprint actual de Render monta `/var/data` y utiliza:

```text
/var/data/uploads
/var/data/private
```

Consulta [docs/OPERATIONS_RUNBOOK.md](docs/OPERATIONS_RUNBOOK.md) para backups, restore drills, monitoreo e incidentes.

---

## 🔌 Endpoints de cuenta destacados

```http
POST /api/auth/registro
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/perfil

POST /api/auth/password/solicitar
POST /api/auth/password/restablecer
POST /api/auth/email/reenviar-verificacion
POST /api/auth/email/verificar
```

Además existen módulos REST para películas, talentos, reparto, créditos, verificaciones, reclamaciones, premios, galería, búsqueda e integración TMDb.

---

## 🌍 Despliegue

### Frontend

`netlify.toml`:

- Node.js 22;
- instala backend y frontend;
- ejecuta tests del backend;
- valida catálogo;
- ejecuta lint y tests del frontend;
- genera el build de Vite;
- publica `frontend/dist`.

### Backend

`render.yaml` define:

- servicio Node;
- health check en `/ready`;
- disco persistente;
- variables de almacenamiento;
- variables SQL Server;
- TMDb;
- JWT;
- Resend.

> Las migraciones de producción no se ejecutan automáticamente con el start command. Ejecuta `npm run migrate` como paso operativo controlado antes de utilizar un esquema nuevo.

---

## 🗺️ Roadmap

| Estado | Línea | Objetivo |
|---|---|---|
| ✅ | CineRD 2.5 | Production & commercial hardening |
| ✅ | CineRD 2.5.1 | AdSense readiness |
| ✅ | CineRD 2.5.2 | Security, sessions & frontend hardening |
| ✅ | CineRD Historia | Patrimonio, cronología y descubrimiento histórico |
| 🟡 | CineRD 3.0 | CineRD Pro, perfiles profesionales, productoras, casting y analytics |
| 🔵 | CineRD 3.5 | Streaming readiness: derechos, territorios, video pipeline y modelo comercial |
| 🔵 | CineRD 4.0 | Streaming MVP, únicamente con derechos de exhibición explícitos |

### Próxima fase

La siguiente evolución planificada es **CineRD 3.0.1 — Professional Profile Foundation**.

Su objetivo es ampliar la utilidad profesional del perfil de talento sin introducir todavía pagos, casting completo ni streaming.

---

## ⚖️ Consideraciones comerciales y de derechos

Antes de monetizar o distribuir contenido:

- confirmar términos comerciales y atribución de APIs de terceros;
- revisar legalmente privacidad, términos y política editorial;
- confirmar derechos sobre imágenes, multimedia y metadatos;
- no habilitar streaming sin contratos o autorizaciones de exhibición;
- definir territorios, ventanas y modelo de distribución para cada obra.

CineRD no está afiliado, patrocinado ni respaldado por TMDb.

---

## 👨‍💻 Autor

### Francis Jairo Matías Rosario

**Ingeniero de Software · Desarrollador Full Stack**  
República Dominicana

- [GitHub](https://github.com/Jairo0811)
- [LinkedIn](https://www.linkedin.com/in/jairomatias0811/)

---

## 📄 Licencia

Este proyecto forma parte de mi **portafolio profesional** y fue desarrollado con fines educativos, culturales, técnicos y de investigación.

El uso comercial, distribución de contenido audiovisual y explotación de material de terceros requieren revisar y respetar las licencias, contratos y derechos correspondientes.

© 2026 Francis Jairo Matías Rosario.
