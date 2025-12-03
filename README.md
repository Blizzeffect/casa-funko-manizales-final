# CasaPop

Tu tienda de Funko Pops favorita. Encuentra las mejores figuras coleccionables, ediciones limitadas y más.
**Vaporwave/Retro-Futurista** para la venta de figuras Funko Pop.

![Casa Funko Banner](/public/logo.png)

## 🚀 Características

### 🛒 Tienda Pública
- **Catálogo Visual**: Diseño inmersivo con colores neón (Magenta/Cyan) y modo oscuro.
- **Filtros Avanzados**: Búsqueda por precio, categoría y rareza.
- **Wishlist (Favoritos)**: Guarda productos para después (Local Storage).
- **Pre-ordenes**: Sistema curado para reservar lanzamientos futuros.
- **Carrito Inteligente**:
  - Cálculo de envío (Local vs Nacional).
  - Recolección de datos de envío (Nombre, Dirección, Ciudad).
  - Validación de stock y pre-ordenes.
- **Blog**: Sección de artículos para la comunidad.
- **Soporte**: Sistema de tickets para atención al cliente.

### 🔐 Panel de Administración (`/admin`)
- **Dashboard Unificado**: Acceso centralizado a productos, pedidos, tickets y blog.
- **Gestión de Productos**:
  - Crear, editar y eliminar productos.
  - Gestión de **Pre-ordenes** y fechas de lanzamiento.
  - Borrado masivo seguro.
- **Gestión de Pedidos**:
  - Ver detalles completos (incluyendo datos del cliente).
  - Actualizar estados (Pendiente, Enviado, Entregado).
  - Guardar números de guía.
- **Soporte (Tickets)**:
  - Ver y resolver dudas de clientes.
- **Gestión de Blog**: Crear y editar artículos.
- **Seguridad**: Protección total con autenticación Supabase.

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) + CSS Modules
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Almacenamiento**: Supabase Storage (para imágenes de productos)
- **Lenguaje**: TypeScript

## ⚙️ Configuración Local

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/casa-funko-manizales.git
    cd casa-funko-manizales
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Variables de Entorno**:
    Crea un archivo `.env.local` en la raíz del proyecto con las siguientes claves de tu proyecto Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
    SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
    ```

4.  **Correr el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

5.  **Abrir en el navegador**:
    - Tienda: [http://localhost:3000](http://localhost:3000)
    - Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📦 Base de Datos (Supabase)

El proyecto requiere dos tablas principales: `products` y `posts`. Asegúrate de aplicar las políticas RLS (Row Level Security) incluidas en la carpeta `supabase/` para garantizar la seguridad.

- `supabase/products.sql`: Definición y políticas para productos y pedidos.
- `supabase/posts.sql`: Definición y políticas para el blog.
- `supabase/tickets.sql`: Sistema de soporte.
- `supabase/migrations/`: Migraciones para nuevas funcionalidades (Pre-ordenes, Datos de Cliente).

## 🎨 Estética

El diseño sigue una línea **Vaporwave/Cyberpunk**:
- **Fondo**: Dark (`#0a0a0a`)
- **Acentos**: Magenta (`#ff006e`) y Cyan (`#00f3ff`)
- **Tipografía**: Fuentes modernas y legibles.

---
Hecho con 💜 en Manizales, Colombia.
