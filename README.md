<div align="center">

# 🎬 CineRD

### La base de datos del cine dominicano

Plataforma Full Stack inspirada en IMDb para preservar, organizar y consultar información sobre películas, talentos y producciones cinematográficas de la República Dominicana.

[![Version](https://img.shields.io/badge/version-2.1.0-success)](https://github.com/Jairo0811/CineRD)
[![Status](https://img.shields.io/badge/status-en%20desarrollo-2563eb)](https://github.com/Jairo0811/CineRD)
[![License](https://img.shields.io/badge/license-portafolio-f59e0b)](#-licencia)
[![Last Commit](https://img.shields.io/github/last-commit/Jairo0811/CineRD)](https://github.com/Jairo0811/CineRD/commits/main)

<img src="https://skillicons.dev/icons?i=react,vite,nodejs,express,html,css,js,bootstrap,git,github,vscode&perline=11" alt="Tecnologías de CineRD" />

</div>

---

## 🌟 ¿Qué es CineRD?

**CineRD** es una plataforma especializada en documentar el cine dominicano mediante una base de datos moderna, centralizada y extensible.

Permite administrar películas, actores, actrices, directores, productores, guionistas y sus relaciones profesionales. También integra información de **TMDb** para acelerar el registro de producciones, talentos, fotografías, pósteres y repartos.

El proyecto nació a partir de una prueba técnica de React recibida en 2021. Años después fue retomado y transformado en una aplicación Full Stack orientada a portafolio profesional, preservación cultural y crecimiento futuro.

---

## ✨ Funcionalidades

### 🎬 Películas

- CRUD completo de películas.
- Póster, género, director, productora y fecha de estreno.
- Perfil cinematográfico individual.
- Hero visual con backdrop cuando está disponible.
- Soporte para sinopsis, eslogan, duración, calificación, estado e idioma original.
- Soporte para presupuesto, recaudación y tráiler de YouTube.
- Navegación directa hacia edición y administración del reparto.

### 👤 Talentos

- Gestión de actores, actrices, directores, productores y guionistas.
- Profesiones múltiples.
- Fotografía y nombre artístico.
- Fecha de nacimiento y fallecimiento.
- Estado vivo/fallecido y edad calculada automáticamente.
- Perfil artístico individual.
- Filmografía como actor y director.
- Estadísticas y mini carteles.

### 🎭 Repartos

- Relación muchos a muchos entre talentos y películas.
- Registro de personajes.
- Participaciones principales, secundarias, cameos, voz y flashbacks.
- Orden de créditos.
- Prevención de duplicados.
- Edición de participaciones.
- Navegación entre películas y perfiles artísticos.

### 🌐 Integración con TMDb

- Búsqueda de películas y talentos.
- Importación automática de información.
- Consulta e importación de reparto.
- Descarga de pósteres y fotografías.
- Identificación mediante `TMDbId`.
- Detección de coincidencias por nombre completo y nombre artístico.
- Creación automática de talentos cuando no existen localmente.

### 📊 Dashboard

- Total de películas, talentos y participaciones.
- Actores vivos y fallecidos.
- Películas con reparto.
- Distribución por género y profesión.
- Estrenos por año.
- Últimos registros.
- Gráficos interactivos con Chart.js.

---

## 🚀 Tecnologías

| Área | Tecnologías |
|---|---|
| Frontend | React, Vite, React Router DOM, Axios, Bootstrap 5, Chart.js |
| Backend | Node.js, Express, MSSQL, Multer, Sharp, dotenv, CORS |
| Base de datos | Microsoft SQL Server |
| API externa | TMDb |
| Herramientas | Git, GitHub, npm, Visual Studio Code |

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
├── CRUD-Peliculas.sql
└── README.md
```

La solución mantiene separadas las responsabilidades del frontend, backend, acceso a datos, procesamiento de imágenes, integración externa y migraciones de base de datos.

---

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jairo0811/CineRD.git
cd CineRD
```

### 2. Preparar la base de datos

Ejecuta en SQL Server:

```text
CRUD-Peliculas.sql
```

Luego aplica la migración de metadatos cinematográficos:

```text
database/migrations/002_peliculas_metadatos.sql
```

La migración es idempotente y agrega soporte para:

- `Sinopsis`
- `DuracionMinutos`
- `Calificacion`
- `IdiomaOriginal`
- `Presupuesto`
- `Recaudacion`
- `Backdrop`
- `TrailerUrl`
- `Estado`
- `Eslogan`

### 3. Iniciar el backend

```bash
cd backend
npm install
npm run dev
```

Servidor local:

```text
http://localhost:3000
```

### 4. Iniciar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Aplicación local:

```text
http://localhost:5173
```

---

## 🔌 Endpoints destacados

```http
GET /api/peliculas
GET /api/peliculas/:id
GET /api/peliculas/:id/perfil
GET /api/actores-peliculas/pelicula/:id
```

El endpoint de perfil devuelve la información general y los metadatos cinematográficos disponibles. Mantiene compatibilidad temporal con instalaciones que todavía no hayan ejecutado la migración.

---

## 🗺️ Roadmap

| Estado | Funcionalidad |
|---|---|
| ✅ | CRUD de películas |
| ✅ | CRUD de talentos |
| ✅ | Gestión de repartos |
| ✅ | Dashboard estadístico |
| ✅ | Perfil artístico |
| ✅ | Perfil cinematográfico de películas |
| 🟡 | Edición completa de metadatos desde el formulario |
| 🟡 | Importación avanzada de metadatos desde TMDb |
| 🟡 | Galerías multimedia |
| 🟡 | Premios y nominaciones |
| 🟡 | Series dominicanas |
| 🟡 | Buscador global |
| 🟡 | Estadísticas avanzadas |
| 🟡 | Mapa del cine dominicano |
| 🟡 | Despliegue en la nube |

---

## 📌 Estado del proyecto

🟢 **Versión 2.1.0 — En desarrollo activo**

La versión actual incorpora el perfil cinematográfico de películas, una migración extensible de metadatos y una base técnica preparada para enriquecer automáticamente cada ficha desde TMDb.

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
