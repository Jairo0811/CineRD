<div align="center">

<img src="frontend/src/assets/logo.png" alt="Logo de CineRD" width="720" />

### La base de datos del cine dominicano

Plataforma Full Stack inspirada en IMDb para preservar, organizar y consultar información sobre películas, talentos y producciones cinematográficas de la República Dominicana.

[![Version](https://img.shields.io/badge/version-2.3.0-success)](https://github.com/Jairo0811/CineRD)
[![Status](https://img.shields.io/badge/status-en%20desarrollo-2563eb)](https://github.com/Jairo0811/CineRD)
[![License](https://img.shields.io/badge/license-portafolio-f59e0b)](#-licencia)
[![Last Commit](https://img.shields.io/github/last-commit/Jairo0811/CineRD)](https://github.com/Jairo0811/CineRD/commits/main)

</div>

---

## 🌟 ¿Qué es CineRD?

**CineRD** es un catálogo digital del cine dominicano orientado a preservar, organizar y conectar información sobre películas, talentos, repartos y producción audiovisual de la República Dominicana.

El proyecto evolucionó desde una prueba técnica de React de 2021 hacia una plataforma Full Stack con identidad visual propia, perfiles cinematográficos, autenticación, control de acceso por roles, verificación de talentos, internacionalización e integración con **TMDb**.

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
- Ranking de producciones con mayor reparto.
- Efemérides con todas las películas del catálogo estrenadas durante el mes actual.
- Integración con TMDb para acelerar el registro y enriquecer metadatos.

### 🎭 Talentos

- Actores, actrices, directores, productores, guionistas, artistas urbanos y otros perfiles profesionales.
- Nombre real y nombre artístico preservados como identidad propia, sin traducciones artificiales.
- Fotografía, profesión y estado.
- Fecha de nacimiento y fallecimiento.
- Edad calculada automáticamente.
- Perfil artístico individual.
- Filmografía como intérprete y películas dirigidas diferenciadas.
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

### 👥 Roles y autenticación

CineRD utiliza tres experiencias privadas diferenciadas:

- **USUARIO:** explora el catálogo y puede solicitar la verificación de un perfil.
- **TALENTO_VERIFICADO:** accede a su espacio profesional y puede gestionar únicamente su propio perfil según las reglas de autorización.
- **ADMINISTRADOR:** administra películas, talentos, repartos, verificaciones y métricas globales.

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

### 📊 Dashboards por rol

- **Administrador:** Centro de Control con KPIs, Top 10 de talentos, películas con mayor reparto, distribución por género, estrenos documentados por año y actividad reciente.
- **Talento verificado:** espacio profesional conectado con su identidad, filmografía y estado de verificación.
- **Usuario:** Mi CineRD con exploración y seguimiento de solicitudes.

### 🌐 Internacionalización

CineRD incorpora interfaz bilingüe **Español / Inglés** mediante i18n.

Se traducen los elementos de interfaz, etiquetas, navegación, estados y textos editoriales. Se preservan sin traducción automática los **nombres reales**, **nombres artísticos** y **títulos oficiales de las películas**, respetando la identidad de personas y obras.

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
- `PeliculaTraducciones`

La multimedia continúa almacenándose en:

```text
backend/uploads/actores/
backend/uploads/peliculas/
```

El exportador valida que las fotografías, pósteres y backdrops referenciados por la base existan realmente en `backend/uploads`. Git se encarga de transportar esos archivos junto con el repositorio.

### Qué NO se exporta

Por seguridad, el snapshot no incluye:

- `Usuarios`
- contraseñas
- `RefreshTokens`
- `SolicitudesVerificacion`
- `TalentosUsuarios`
- `AuditLogs`
- secretos del archivo `.env`
- JWT o claves privadas

### Comandos disponibles

Desde `backend/`:

```bash
npm run catalog:export
npm run catalog:import
npm run catalog:import:replace
npm run setup:local
```

#### `npm run catalog:export`

Genera o actualiza:

```text
database/seeds/catalog.snapshot.json
```

Debe ejecutarse en la computadora que contiene el catálogo completo y actualizado.

#### `npm run catalog:import`

Restaura el snapshot en una base vacía. Si detecta películas o talentos existentes, se detiene para evitar sobrescribir información accidentalmente.

#### `npm run catalog:import:replace`

Reemplaza intencionalmente el catálogo local existente por el snapshot versionado. Debe utilizarse únicamente cuando se desea descartar el catálogo local actual.

#### `npm run setup:local`

Automatiza una instalación nueva:

1. crea `CRUDPeliculas` si no existe;
2. ejecuta `CRUD-Peliculas.sql`;
3. aplica las migraciones `002` a `006`;
4. importa `database/seeds/catalog.snapshot.json` si existe;
5. deja la base preparada para iniciar el backend.

---

## 🎨 Experiencia visual

CineRD utiliza una identidad inspirada en el cine dominicano, combinando azul, rojo, blanco y navy con una estética cinematográfica moderna.

La interfaz incluye:

- Home pública cinematográfica.
- Catálogo visual de películas.
- Directorio visual de talentos.
- Perfiles editoriales de películas y talentos.
- Navbar dinámico según sesión y rol.
- Centro de Control administrativo.
- **Light mode y Dark mode** con sistema de tema persistente.
- Contraste específico para componentes claros dentro del modo oscuro.
- Diseño responsive para escritorio, tablet y móvil.

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

### Integraciones

- TMDb API
- YouTube
- Redes y perfiles profesionales externos

---

## 🏗️ Arquitectura

```text
CineRD/
├── backend/
│   ├── scripts/
│   │   ├── exportCatalog.js
│   │   ├── importCatalog.js
│   │   ├── setupLocal.js
│   │   └── seedAdmin.js
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
│       ├── components/
│       ├── i18n/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── utils/
├── database/
│   ├── migrations/
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

Crea:

```text
backend/.env
```

usando como referencia:

```text
backend/.env.example
```

Ejemplo:

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

Con SQL Server disponible y `.env` correctamente configurado:

```bash
npm run setup:local
```

Este es el comando recomendado para una computadora nueva.

Internamente ejecuta:

```text
CRUD-Peliculas.sql
database/migrations/002_peliculas_metadatos.sql
database/migrations/003_usuarios_roles_verificacion.sql
database/migrations/004_actores_redes_sociales.sql
database/migrations/005_verificacion_indices_activos.sql
database/migrations/006_peliculas_traducciones.sql
```

y posteriormente restaura el snapshot del catálogo si está disponible.

### 5. Crear administrador inicial

```bash
npm run seed:admin
```

### 6. Ejecutar backend

```bash
npm run dev
```

Backend:

```text
http://localhost:3000
```

### 7. Instalar y ejecutar frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔄 Sincronizar el catálogo entre PCs

### PC principal: exportar el catálogo actual

Cuando agregues o modifiques películas, talentos, repartos o traducciones y quieras llevar esos datos a otra computadora:

```powershell
cd backend
npm run catalog:export
```

El comando genera o actualiza:

```text
database/seeds/catalog.snapshot.json
```

Después vuelve a la raíz del repositorio:

```powershell
cd ..
git status
```

Versiona el snapshot y cualquier multimedia nueva:

```powershell
git add database/seeds/catalog.snapshot.json backend/uploads
git commit -m "data: update CineRD development catalog"
git push origin main
```

### Segunda PC: recibir el catálogo

Actualiza el proyecto:

```powershell
git switch main
git pull origin main
```

Luego:

```powershell
cd backend
npm install
npm run setup:local
```

Con esto la segunda computadora obtiene:

- estructura actualizada de SQL Server;
- talentos;
- películas;
- repartos;
- traducciones cinematográficas;
- fotografías y pósteres versionados en `backend/uploads`.

### Si la segunda PC ya tiene datos

`catalog:import` no sobrescribe una base que ya contenga películas o talentos.

Si deseas reemplazar expresamente el catálogo local:

```powershell
npm run catalog:import:replace
```

Este comando elimina el catálogo local de desarrollo y restaura el snapshot versionado, por lo que debe utilizarse con cuidado.

### Mantener actualizado el snapshot

Cada vez que el catálogo principal cambie significativamente:

```powershell
cd backend
npm run catalog:export
cd ..
git add database/seeds/catalog.snapshot.json backend/uploads
git commit -m "data: refresh CineRD catalog snapshot"
git push origin main
```

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
backend/node_modules/
frontend/node_modules/
frontend/dist/
```

Tampoco se incluyen en el snapshot cuentas de usuario, contraseñas, tokens, solicitudes de verificación ni registros de auditoría.

---

## 🧪 Comandos de desarrollo

Desde `backend/`:

```bash
npm run dev
npm run seed:admin
npm run catalog:export
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
GET    /api/peliculas
GET    /api/peliculas/:id/perfil
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
| ✅ | Light mode / Dark mode |
| ✅ | Catálogo portable para desarrollo y demos |
| 🟡 | Galerías multimedia |
| 🟡 | Premios y nominaciones |
| 🟡 | Series dominicanas |
| 🟡 | Buscador global |
| 🟡 | Estadísticas avanzadas |
| 🟡 | Mapa del cine dominicano |
| 🟡 | Despliegue en la nube |
| 🔵 | Evolución futura hacia streaming |
| 🔵 | Migración futura del backend a .NET para la etapa streaming |

---

## 📌 Estado del proyecto

🟢 **Versión 2.3.0 — En desarrollo activo**

CineRD funciona actualmente como un portal cinematográfico dominicano con catálogo público, perfiles profesionales, autenticación, RBAC, verificación de talentos, Centro de Control, efemérides, internacionalización, soporte Light/Dark y un mecanismo reproducible para transportar el catálogo de desarrollo entre equipos.

La prioridad actual es consolidar CineRD como **archivo y plataforma de descubrimiento del cine dominicano** antes de abordar una futura etapa de distribución/streaming.

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
