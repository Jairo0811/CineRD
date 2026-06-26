# 🎬 CineRD

> Sistema Full Stack para la gestión de películas y actores, desarrollado con **React**, **Node.js**, **Express** y **SQL Server**.

![Status](https://img.shields.io/badge/Version-v1.0-success)
![License](https://img.shields.io/badge/License-Academic-blue)
![GitHub last commit](https://img.shields.io/github/last-commit/Jairo0811/CineRD)

---

# 🚀 Tecnologías Utilizadas

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,nodejs,express,git,github,vscode&perline=7" />
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,javascript,npm&perline=4" />
</p>

### 🗄️ Base de Datos

- Microsoft SQL Server

### 📦 Librerías

- React Router DOM
- Axios
- Bootstrap 5
- Express
- mssql
- dotenv
- cors
- nodemon

---

# 📋 Funcionalidades

## 🎭 Gestión de Actores

- ✅ Consultar actores registrados.
- ✅ Registrar nuevos actores.
- ✅ Editar información.
- ✅ Eliminar actores.
- ✅ Nombre artístico.
- ✅ Estado (Vivo / Fallecido).
- ✅ Fecha de fallecimiento condicional.

---

## 🎬 Gestión de Películas

- ✅ Consultar películas.
- ✅ Registrar películas.
- ✅ Editar películas.
- ✅ Eliminar películas.
- ✅ Director.
- ✅ Productora.
- ✅ Fecha de estreno.

---

## 🤝 Relaciones

- ✅ Asociación Actor ↔ Película.
- ✅ Personaje interpretado.
- ✅ Papel principal o secundario.
- ✅ Prevención de relaciones duplicadas.

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

```text
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

```text
http://localhost:5173
```

---

# 🗄️ Base de Datos

Ejecutar el script:

```text
CRUD-Peliculas.sql
```

El script crea automáticamente:

- Base de datos **CRUDPeliculas**
- Tabla **Actores**
- Tabla **Peliculas**
- Tabla **ActoresPeliculas**

---

# 📂 Estructura del Proyecto

```
CineRD
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   └── routes
│   ├── package.json
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── services
│   │   └── assets
│   ├── package.json
│   └── vite.config.js
│
├── CRUD-Peliculas.sql
└── README.md
```

---

# ✨ Características

- 🎬 Arquitectura Cliente / Servidor.
- ⚡ API REST con Express.
- 🗄️ SQL Server.
- ⚛️ React + Vite.
- 🔄 CRUD completo.
- 📱 Diseño Responsive.
- 🎨 Bootstrap 5.
- 🔀 React Router.
- 🌐 Axios.
- 📝 Código organizado por capas.

---

# 📌 Estado del Proyecto

🟢 **Versión 1.0**

Proyecto funcional con:

- CRUD de Actores.
- CRUD de Películas.
- Relaciones Actor ↔ Película.
- Formularios reutilizables.
- Diseño responsive.
- Integración completa React + Node.js + SQL Server.

---

# 👨‍💻 Autor

**Francis Jairo Matías Rosario**

- 💼 LinkedIn: https://www.linkedin.com/in/jairomatias0811/
- 💻 GitHub: https://github.com/Jairo0811

---

# 📄 Licencia

Este proyecto fue desarrollado con fines educativos y de aprendizaje.

© 2026 Francis Jairo Matías Rosario
