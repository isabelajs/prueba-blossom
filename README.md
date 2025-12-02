# Rick & Morty Character Explorer

Aplicación web desarrollada con React y TypeScript para explorar personajes de la serie Rick & Morty utilizando su API GraphQL.

## 🚀 Características

- **Exploración de Personajes**: Lista paginada de personajes.
- **Búsqueda**: Filtrado de personajes por nombre.
- **Detalle de Personaje**: Vista detallada con información específica.
- **Favoritos**: Funcionalidad para marcar personajes como favoritos.
- **Optimización**:
  - **Caching**: Implementación de caché en memoria (TTL 30 min) para minimizar peticiones a la API.
  - **Debounce**: Búsqueda optimizada para evitar saturación de peticiones.
- **Estilos**: Diseño responsivo utilizando TailwindCSS.
- **GraphQL**: Cliente personalizado ligero para comunicar con la API.

## 🛠️ Tecnologías

- **Core**: React 18, TypeScript, Vite
- **Estilos**: TailwindCSS 4
- **Routing**: React Router DOM 7
- **Iconos**: React Icons
- **Gestión de Paquetes**: Bun (recomendado) / NPM

## 📋 Prerrequisitos

Necesitas tener instalado:
- [Node.js](https://nodejs.org/) (v18 o superior)
- [Bun](https://bun.sh/) (Opcional, pero recomendado ya que el proyecto incluye `bun.lock`)

## 🔧 Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd rick-morty-prueba
   ```

2. Instala las dependencias:

   **Usando Bun (Recomendado):**
   ```bash
   bun install
   ```

   **Usando NPM:**
   ```bash
   npm install
   ```

## ▶️ Ejecución

Para iniciar el servidor de desarrollo:

**Bun:**
```bash
bun dev
```

**NPM:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## 📦 Construcción (Build)

Para generar la versión de producción:

```bash
bun run build
# o
npm run build
```

Para previsualizar la build:

```bash
bun run preview
# o
npm run preview
```

## 📂 Estructura del Proyecto

```
src/
├── components/   # Componentes UI reutilizables
├── helpers/      # Utilidades (debounce, etc.)
├── hooks/        # Custom hooks (lógica de negocio y UI)
├── interfaces/   # Definiciones de tipos TypeScript
├── Layouts/      # Estructuras de página
├── pages/        # Vistas principales (Rutas)
├── services/     # Capa de servicios
│   ├── cache/    # Lógica de caché en memoria
│   ├── character/# Servicios específicos de personajes
│   └── graphql/  # Cliente GraphQL genérico
└── App.tsx       # Componente raíz y configuración de rutas
```
