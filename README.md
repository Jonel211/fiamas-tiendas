# SaaS de Fiados Digitales

![Portada](./frontend/public/portada.png)

![Versión](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-18.x%2B-339933.svg?logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000.svg?logo=express)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000.svg?logo=jsonwebtokens)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1.svg?logo=postgresql)
![Status](https://img.shields.io/badge/status-development-yellow)
![License](https://img.shields.io/badge/license-MIT-green)
![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)
![Git](https://img.shields.io/badge/Git-Version%20Control-F05032.svg?logo=git)

> **"Digitalizando la confianza"** — Una plataforma diseñada para transformar el crédito informal, reemplazando los cuadernos de papel por un sistema centralizado, automatizado y transparente.

---

## Descripción del Proyecto
Este proyecto es una solución tecnológica integral enfocada en optimizar el control financiero, abarrotes y comercios minoristas. El sistema automatiza el registro de deudas, controla los límites de crédito por cliente y envía recordatorios de pago para reducir drásticamente las pérdidas económicas del sector.

---

## Arquitectura

El sistema utiliza una arquitectura cliente-servidor:

- **Frontend:** React + Vite.
- **Backend:** Node.js + Express.js.
- **API:** REST.
- **Autenticación:** JWT.
- **Seguridad:** bcrypt.
- **Base de datos:** PostgreSQL.
---

## Estructura del Repositorio
Este repositorio utiliza un enfoque de **Monorepo** para centralizar el ecosistema del proyecto:

```text
fiamas-tiendas/
├── backend/     # API RESTful con Node.js + Express
│   ├── src/
│   │   ├── config/          # Conexión a BD (PostgreSQL)
│   │   ├── controllers/     # Controladores (Tenderos, Clientes)
│   │   ├── middleware/      # Middleware (Autenticación, Validación)
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Rutas de la API
│   │   ├── services/        # Servicios externos (Emails, Pagos, JWT)
│   │   ├── utils/           # Funciones auxiliares
│   │   └── app.js           # Inicialización de Express
├── frontend/    # Aplicación Web con React (Administración web)
│   ├── public/
│   ├── src/
│   │   ├── assets/      # Recursos estáticos (imágenes, iconos)
│   │   ├── components/      # UI Reutilizable
│   │   ├── context/      # Contexto de la aplicación
│   │   ├── hooks/      # Hooks personalizados
│   │   ├── pages/           # Vistas (Dashboard, Login, Clientes)
│   │   ├── services/        # Consumo de la API de Node.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js       
└── README.md    # Documentación principal del proyecto
```

---


## Requisitos Previos e Instalación

Para ejecutar este proyecto de forma local, asegúrate de tener instalado:

* [Node.js](https://nodejs.org) (versión 18 o superior)
* [NPM](https://npmjs.com) o [Yarn](https://yarnpkg.com)
* [Git](https://git-scm.com/)
* PostgreSQL

### Pasos para iniciar el entorno de desarrollo

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/Jonel211/fiamas-tiendas.git
   cd fiamas-tiendas
   ```

2. **Configurar las variables de entorno del Backend:**

   Ingresa a la carpeta `backend`:

   ```bash
   cd backend
   ```

3. **Instalar las dependencias del Backend:**

   ```bash
   npm install
   ```

4. **Iniciar el Backend:**

   ```bash
   npm run dev
   ```

   El servidor Backend quedará disponible en:

   ```text
   http://localhost:3000
   ```

5. **Levantar el Frontend:**

   Abre una **nueva terminal** y regresa a la raíz del proyecto:

   ```bash
   cd frontend
   ```

   Instala las dependencias:

   ```bash
   npm install
   ```

   Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

6. **Acceder a la aplicación:**

   Una vez iniciado el Frontend, Vite mostrará en la terminal la dirección local de la aplicación. Generalmente será:

   ```text
   http://localhost:5173
   ```

   Abre esta dirección en tu navegador para acceder a la aplicación.

### Estructura de ejecución

El proyecto requiere ejecutar **dos servidores simultáneamente**:

```text
┌─────────────────────┐
│      Frontend       │
│   React + Vite      │
│ localhost:5173      │
└──────────┬──────────┘
           │
           │ API
           ▼
┌─────────────────────┐
│      Backend        │
│  Node.js + Express  │
│ localhost:3000      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     PostgreSQL      │
│      Database       │
└─────────────────────┘
```

### Comandos rápidos

**Backend:**

```bash
cd backend
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Estado del Proyecto

**En desarrollo:**

![Progreso](https://img.shields.io/badge/Progreso-20%25-yellowgreen)

Versión actual: `1.0.0`

El proyecto se encuentra en desarrollo y se están implementando nuevas funcionalidades y mejoras.
