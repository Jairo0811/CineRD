# 🎬 CineRD

> **Base de datos del cine dominicano**, desarrollada con **React**, **Node.js**, **Express** y **SQL Server**. Permite administrar películas, talentos, repartos y consultar la filmografía de cada persona mediante una interfaz moderna inspirada en IMDb.

![Status](https://img.shields.io/badge/Version-v1.6.0-success)
![License](https://img.shields.io/badge/License-Academic-blue)
![GitHub last commit](https://img.shields.io/github/last-commit/Jairo0811/CineRD)

---

# 🚀 Tecnologías Utilizadas

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,nodejs,express,git,github,vscode,npm&perline=8" />
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,javascript,bootstrap&perline=4" />
</p>

## 🗄️ Base de Datos

- Microsoft SQL Server

## 📦 Librerías

- React Router DOM
- Axios
- Bootstrap 5
- Chart.js
- React Chart.js 2
- Express
- MSSQL
- Multer
- Sharp
- dotenv
- cors
- nodemon

---

# ✨ Funcionalidades

## 👤 Gestión de Talentos

- ✅ Registrar talentos.
- ✅ Editar información.
- ✅ Eliminar registros.
- ✅ Fotografía.
- ✅ Nombre artístico.
- ✅ Profesiones múltiples.
- ✅ Fecha de nacimiento.
- ✅ Fecha de fallecimiento.
- ✅ Estado (Vivo / Fallecido).
- ✅ Edad calculada automáticamente.

---

## 🎬 Gestión de Películas

- ✅ Registrar películas.
- ✅ Editar películas.
- ✅ Eliminar películas.
- ✅ Portada.
- ✅ Director.
- ✅ Productora.
- ✅ Fecha de estreno.
- ✅ Género.

---

## 🎭 Gestión de Repartos

- ✅ Relación Actor ↔ Película.
- ✅ Personaje interpretado.
- ✅ Participación principal o secundaria.
- ✅ Cameo.
- ✅ Voz.
- ✅ Aparición especial.
- ✅ Prevención de relaciones duplicadas.
- ✅ Edición de participaciones.

---

## 👤 Perfil Artístico

Cada talento dispone de una ficha individual con:

- ✅ Fotografía.
- ✅ Nombre artístico.
- ✅ Profesiones.
- ✅ Fecha de nacimiento.
- ✅ Edad.
- ✅ Estado.
- ✅ Filmografía como actor.
- ✅ Filmografía como director.
- ✅ Mini carteles de películas.

---

## 📊 Dashboard

- ✅ Total de películas.
- ✅ Total de talentos.
- ✅ Total de repartos.
- ✅ Actores vivos.
- ✅ Actores fallecidos.
- ✅ Películas con reparto.
- ✅ Distribución por género.
- ✅ Distribución por profesiones.
- ✅ Estrenos por año.
- ✅ Últimas películas.
- ✅ Últimos talentos.
- ✅ Gráficos interactivos con Chart.js.

---

# ⚙️ Instalación

## 1️⃣ Clonar el proyecto

```bash
git clone https://github.com/Jairo0811/CineRD.git
cd CineRD
```

---

## 🖥️ Backend

```bash
cd backend
npm install
npm run dev
```

Servidor:

```
http://localhost:3000
```

---

## 🌐 Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicación:

```
http://localhost:5173
```

---

# 🗄️ Base de Datos

Ejecutar el script:

```
CRUD-Peliculas.sql
```

El script crea automáticamente:

- Base de datos **CRUDPeliculas**
- Tabla **Actores**
- Tabla **Peliculas**
- Tabla **ActoresPeliculas**

---

# 📂 Arquitectura

```
CineRD
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── routes
│   │   └── uploads
│   │
│   ├── package.json
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── styles
│   │
│   ├── package.json
│   └── vite.config.js
│
├── CRUD-Peliculas.sql
└── README.md
```

---

# 🎨 Características

- 🎬 Arquitectura Cliente / Servidor.
- ⚛️ React + Vite.
- ⚡ Express.
- 🗄️ SQL Server.
- 📸 Gestión de imágenes.
- 🎭 Relación Actor ↔ Película.
- 👤 Perfil artístico.
- 🎬 Filmografía.
- 📊 Dashboard estadístico.
- 📈 Gráficos dinámicos.
- 🎨 Bootstrap 5.
- 📱 Responsive.
- 🌐 Axios.
- 🔀 React Router.
- 📝 Código organizado por capas.

---

# 📌 Estado del Proyecto

🟢 **Versión 1.6.0**

Actualmente CineRD incluye:

- ✅ CRUD de Talentos.
- ✅ CRUD de Películas.
- ✅ Gestión de Repartos.
- ✅ Profesiones múltiples.
- ✅ Dashboard.
- ✅ Estadísticas.
- ✅ Gráficos interactivos.
- ✅ Perfil artístico.
- ✅ Filmografía.
- ✅ Portadas de películas.
- ✅ Cálculo automático de edad.
- ✅ Integración React + Node.js + SQL Server.

---



# 👨‍💻 Autor

**Francis Jairo Matías Rosario**

- 💼 LinkedIn: https://www.linkedin.com/in/jairomatias0811/
- 💻 GitHub: https://github.com/Jairo0811

---

# 📄 Licencia

Este proyecto fue desarrollado con fines educativos y como parte del portafolio profesional del autor.

© 2026 Francis Jairo Matías Rosario
