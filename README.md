<div align="center">

<img src="frontend/src/assets/logo.png" alt="Logo de CineRD" width="260" />

### La base de datos del cine dominicano

Plataforma Full Stack inspirada en IMDb para preservar, organizar y consultar información sobre películas, talentos y producciones cinematográficas de la República Dominicana.

[![Version](https://img.shields.io/badge/version-2.2.0-success)](https://github.com/Jairo0811/CineRD)
[![Status](https://img.shields.io/badge/status-en%20desarrollo-2563eb)](https://github.com/Jairo0811/CineRD)
[![License](https://img.shields.io/badge/license-portafolio-f59e0b)](#-licencia)
[![Last Commit](https://img.shields.io/github/last-commit/Jairo0811/CineRD)](https://github.com/Jairo0811/CineRD/commits/main)

</div>

---

## 🌟 ¿Qué es CineRD?

**CineRD** es un catálogo digital del cine dominicano orientado a preservar, organizar y conectar información sobre películas, talentos, repartos y producción audiovisual de la República Dominicana.

El proyecto evolucionó desde una prueba técnica de React de 2021 hacia una plataforma Full Stack con identidad visual propia, perfiles cinematográficos, autenticación, control de acceso por roles, verificación de talentos e integración con **TMDb**.

---

## ✨ Funcionalidades principales

### 🎬 Películas

- CRUD completo.
- Póster, backdrop, género, director, productora y fecha de estreno.
- Perfil cinematográfico individual.
- Sinopsis, eslogan, duración, calificación, estado e idioma original.
- Presupuesto, recaudación y tráiler.
- Reparto completo y orden de créditos.
- Ranking de producciones con mayor reparto.

### 🎭 Talentos

- Actores, actrices, directores, productores, guionistas y otros perfiles profesionales.
- Nombre artístico, fotografía, profesión y estado.
- Fecha de nacimiento y fallecimiento en formato `DD/MM/YYYY`.
- Edad calculada automáticamente.
- Perfil artístico individual y filmografía.
- Redes sociales oficiales o profesionales:
  - Instagram
  - Facebook
  - TikTok
  - YouTube
  - X / Twitter
  - Sitio web oficial
- Ranking de talentos con mayor presencia en películas.

### 👥 Roles y autenticación

CineRD utiliza tres experiencias privadas diferenciadas:

- **USUARIO**: explora el catálogo y puede solicitar la verificación de un perfil.
- **TALENTO_VERIFICADO**: accede a su espacio profesional y puede gestionar únicamente su propio perfil según las reglas de autorización.
- **ADMINISTRADOR**: administra películas, talentos, repartos, verificaciones y métricas globales.

Incluye:

- Registro de usuarios.
- Login con contraseña hasheada.
- JWT Access Token.
- Middleware de autenticación y autorización.
- Protección de rutas en backend y frontend.

### ✅ Verificación de talentos

- Búsqueda del perfil correspondiente.
- Acción `Este soy yo`.
- Métodos de verificación profesional.
- Revisión administrativa.
- Aprobación, rechazo y revocación.
- Vinculación única entre cuenta y perfil artístico.
- Auditoría mediante `AuditLogs`.
- Posibilidad de desvincular un talento desde Administración y devolver la cuenta a `USUARIO`.

### 📊 Dashboards por rol

- **Administrador:** Centro de Control con KPIs, rankings, actividad y analítica.
- **Talento verificado:** espacio profesional con identidad, filmografía y estado de verificación.
- **Usuario:** Mi CineRD con exploración y seguimiento de solicitudes.

### 🌐 Integración con TMDb

- Búsqueda de películas y talentos.
- Importación de información e imágenes.
- Importación de repartos.
- Identificación mediante `TMDbId`.
- Detección de coincidencias y duplicados.

---

## 🎨 Experiencia visual

CineRD cuenta con una identidad inspirada en el cine dominicano, combinando una estética cinematográfica moderna con los colores azul, rojo, blanco y navy asociados a la identidad nacional.

La interfaz incluye:

- Home pública cinematográfica.
- Catálogo visual de películas.
- Directorio visual de talentos.
- Perfiles editoriales de películas y talentos.
- Navbar dinámico según sesión y rol.
- Responsive para escritorio, tablet y móvil.

---

## 🚀 Tecnologías

### Frontend

<p>
  <img src="https://skillicons.dev/icons?i=react,vite,html,css,js,bootstrap" alt="React, Vite, JavaScript, HTML, CSS y Bootstrap" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg" alt="React Router" title="React Router" width="48" height="48" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg" alt="Axios" title="Axios" width="48" height="48" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chartjs/chartjs-original.svg" alt="Chart.js" title="Chart.js" width="48" height="48" />
</p>

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

### Integraciones

- TMDb API
- YouTube

---

## 🏗️ Arquitectura

```text
CineRD/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── uploads/
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── utils/
├── database/
│   └── migrations/
└── README.md
```

---

## ⚙️ Instalación

### 1. Clonar

```bash
git clone https://github.com/Jairo0811/CineRD.git
cd CineRD
```

### 2. Base de datos

Ejecuta el script base y luego las migraciones en orden:

```text
CRUD-Peliculas.sql
database/migrations/002_peliculas_metadatos.sql
database/migrations/003_usuarios_roles_verificacion.sql
database/migrations/004_actores_redes_sociales.sql
```

### 3. Variables de entorno

Crea `backend/.env` con base en `.env.example`.

Variables relevantes:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DB_SERVER=localhost
DB_DATABASE=CRUDPeliculas
DB_USER=your_db_user
DB_PASSWORD=your_db_password
TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
JWT_ACCESS_SECRET=change_this_for_a_long_random_secret
JWT_ACCESS_EXPIRES_IN=15m
SEED_ADMIN_NAME=Administrador CineRD
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change_this_password
```

### 4. Crear administrador inicial

```bash
cd backend
npm install
npm run seed:admin
```

### 5. Ejecutar backend

```bash
npm run dev
```

### 6. Ejecutar frontend

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

Backend:

```text
http://localhost:3000
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
| ✅ | CRUD de películas |
| ✅ | CRUD de talentos |
| ✅ | Gestión de repartos |
| ✅ | Perfiles cinematográficos |
| ✅ | Perfiles artísticos |
| ✅ | Autenticación y RBAC |
| ✅ | Verificación de talentos |
| ✅ | Revocación de perfiles verificados |
| ✅ | Dashboards por rol |
| ✅ | Renovación visual integral |
| ✅ | Redes sociales de talentos |
| 🟡 | Galerías multimedia |
| 🟡 | Premios y nominaciones |
| 🟡 | Series dominicanas |
| 🟡 | Buscador global |
| 🟡 | Estadísticas avanzadas |
| 🟡 | Mapa del cine dominicano |
| 🟡 | Despliegue en la nube |

---

## 📌 Estado del proyecto

🟢 **Versión 2.2.0 — En desarrollo activo**

CineRD ya funciona como un portal cinematográfico dominicano con perfiles públicos, autenticación, control de acceso por roles, verificación de talentos, dashboards especializados y una identidad visual propia.

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
