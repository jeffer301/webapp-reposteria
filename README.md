# La Flor de Azúcar — Repostería Online

> Aplicación web full-stack para pedidos en línea de repostería artesanal, con carrito de compras, pasarela de pagos Wompi, generación de tickets QR y verificación presencial en tienda.

---

## Tabla de Contenidos

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Funcionalidades](#4-funcionalidades)
5. [Estructura del Proyecto](#5-estructura-del-proyecto)
6. [URLs de Producción](#6-urls-de-producción)
7. [Instalación y Ejecución Local](#7-instalación-y-ejecución-local)
8. [Variables de Entorno](#8-variables-de-entorno)
9. [Deploy en Servidor Universitario con Docker](#9-deploy-en-servidor-universitario-con-docker)
10. [API Endpoints](#10-api-endpoints)
11. [Capturas de Pantalla](#11-capturas-de-pantalla)
12. [Equipo](#12-equipo)

---

## 1. Descripción del Proyecto

### El problema que resuelve

Las reposterías artesanales pequeñas dependen casi exclusivamente de ventas presenciales o pedidos informales por WhatsApp, lo que genera:

- **Pérdida de ventas** por falta de disponibilidad fuera del horario de atención.
- **Errores en pedidos** al no tener un sistema formal de captura y seguimiento.
- **Dificultad para escalar** porque la gestión manual de inventario, pedidos y pagos consume tiempo del propietario.
- **Sin trazabilidad**: el cliente no sabe si su pedido fue recibido, está en preparación o listo.

### La solución

**La Flor de Azúcar** es una plataforma web que digitaliza el negocio completo:

- Catálogo de productos con imágenes, precios y filtros.
- Carrito de compras persistente (sin necesidad de cuenta).
- Proceso de checkout con confirmación por email y código QR único por pedido.
- Panel administrativo para gestionar productos, categorías, pedidos y usuarios.
- Verificación presencial mediante escaneo QR desde el móvil del administrador.
- Integración con Wompi (pasarela de pagos colombiana) para cobros en línea.
- Funciona como PWA: instalable en dispositivos móviles.

---

## 2. Stack Tecnológico

### Frontend

| Tecnología | Versión | Justificación |
|---|---|---|
| **Angular** | 21 | Framework SPA empresarial con Standalone Components, Signals y Router para navegación con lazy loading y route guards. |
| **TypeScript** | 5.9 | Tipado estático que reduce errores en tiempo de desarrollo y mejora la mantenibilidad. Angular lo requiere nativamente. |
| **Bootstrap** | 5.3 | Sistema de diseño responsivo maduro. Permite construir interfaces consistentes sin escribir CSS desde cero, con soporte cross-browser garantizado. |
| **SCSS** | — | Superset de CSS con variables, anidamiento y mixins. Permite mantener estilos organizados en componentes. |
| **RxJS** | 7.8 | Biblioteca reactiva estándar en Angular para manejo de flujos asíncronos (HTTP, eventos de usuario). |
| **jsQR** | 1.4 | Decodificador QR client-side que funciona directamente con el stream de la cámara, sin servicios externos. |

### Backend

| Tecnología | Versión | Justificación |
|---|---|---|
| **Node.js** | 20 LTS | Runtime JavaScript de alta concurrencia (event loop no bloqueante). Permite usar el mismo lenguaje en frontend y backend. |
| **Express** | 4.18 | Framework HTTP minimalista para Node.js. Sin opiniones rígidas, lo que facilita estructurar el proyecto según las necesidades del dominio. |
| **PostgreSQL** | 16 | Base de datos relacional con ACID completo. Ideal para datos transaccionales (pedidos, pagos) donde la integridad es crítica. Sin ORM para máximo control sobre las consultas. |
| **JWT + bcrypt** | — | Autenticación stateless: el servidor no almacena sesiones, escalando horizontalmente. bcrypt con 10 rondas resiste ataques de fuerza bruta. |
| **Helmet** | 8.2 | Configura cabeceras HTTP de seguridad (CSP, HSTS, X-Frame-Options) en un solo paquete. |
| **express-rate-limit** | 8.5 | Protección contra abusos y ataques DDoS a nivel de aplicación. |
| **Multer** | 2.1 | Middleware para carga de archivos multipart/form-data (imágenes de productos). |
| **Nodemailer** | 8.0 | Envío de emails transaccionales (confirmaciones, cambios de estado) vía SMTP. |
| **qrcode** | 1.5 | Generación server-side de códigos QR en formato DataURL/PNG por pedido. |
| **Wompi SDK** | — | Pasarela de pagos colombiana con sandbox incluido para desarrollo, sin costo de integración inicial. |

### Infraestructura

| Tecnología | Justificación |
|---|---|
| **Docker** | Garantiza que el entorno de desarrollo y producción sean idénticos. Elimina el problema de "funciona en mi máquina". |
| **Docker Compose** | Orquesta los 3 contenedores (PostgreSQL, Backend, Frontend) con healthchecks y volúmenes persistentes. |
| **Nginx (host)** | Proxy inverso a nivel de servidor: termina TLS, sirve archivos estáticos del frontend y redirige `/api/` al backend. |
| **Nginx (Alpine)** | Contenedor del frontend: sirve el build estático de Angular 21. |
| **PostgreSQL Alpine** | Imagen Docker oficial con mínimo footprint. Datos en volumen `pgdata` persistente. |

---

## 3. Arquitectura del Sistema

### Despliegue en VPS

```mermaid
graph TB
    subgraph Cliente["Cliente (Navegador / PWA)"]
        Browser[Navegador Web]
    end

    subgraph VPS["VPS — bakery.seminario1.eleueleo.com"]
        NginxHost["🌐 Nginx (host)<br/>/etc/nginx/sites-available/bakery<br/>TLS 1.2/1.3 · HSTS · gzip"]

        subgraph Docker["Docker Compose"]
            direction TB
            Frontend["⚡ bakery-web<br/>nginx:alpine — Puerto 9000<br/>Build estático Angular 21"]
            Backend["🟢 bakery-api<br/>node:20-alpine — Puerto 9001<br/>Express · JWT · Rate Limit · Helmet"]
            DB[("🐘 bakery-db<br/>postgres:16 — Puerto 5432<br/>Solo red interna Docker")]
        end

        Volumes[("📁 Volúmenes persistentes<br/>pgdata · uploads")]
    end

    subgraph Externos["Servicios Externos"]
        Wompi["💳 Wompi<br/>Pasarela de pagos"]
        SMTP["📧 SMTP<br/>Correo transaccional"]
        GitHub["🔀 GitHub Actions<br/>Deploy automático al push a main"]
    end

    Browser -->|"HTTPS :443"| NginxHost
    NginxHost -->|"location / → :9000"| Frontend
    NginxHost -->|"location /api/ → :9001"| Backend
    Frontend -->|"Archivos estáticos"| Frontend
    Backend -->|"SQL / Pool"| DB
    Backend -->|"Multer"| Volumes
    Backend -->|"Webhook POST"| Wompi
    Backend -->|"Nodemailer"| SMTP
    GitHub -->|"SSH + docker compose"| NginxHost
    DB -->|"Data persistente"| Volumes
```

### Puertos

| Servicio | Puerto (host) | Puerto (contenedor) | Exposición |
|---|---|---|---|
| Nginx (host) | 80 / 443 | — | Público (HTTPS) |
| bakery-web | 9000 | 80 | Solo localhost → Nginx |
| bakery-api | 9001 | 3000 | Solo localhost → Nginx |
| bakery-db | 5433 (debug) | 5432 | Solo localhost (red Docker interna) |

### Flujo de un pedido

```mermaid
sequenceDiagram
    actor Cliente
    participant Angular
    participant Express
    participant PostgreSQL
    participant QRLib as qrcode (lib)
    participant Email as Nodemailer

    Cliente->>Angular: Agrega productos al carrito
    Cliente->>Angular: Completa checkout
    Angular->>Express: POST /api/pedidos
    Express->>PostgreSQL: INSERT pedido + items
    Express->>QRLib: Genera QR con código único
    QRLib-->>Express: DataURL QR
    Express->>PostgreSQL: UPDATE pedido con QR
    Express->>Email: Envía ticket de confirmación
    Express-->>Angular: { pedido, qr_code, ticket }
    Angular-->>Cliente: Modal con ticket + QR imprimible
```

---

## 4. Funcionalidades

### Para clientes

- **Catálogo de productos**: grid con imágenes, precios, descuentos, filtros por categoría y búsqueda por nombre.
- **Detalle de producto**: modal con descripción, ingredientes, alérgenos y reseñas.
- **Carrito de compras**: sidebar deslizable, ajuste de cantidades, cálculo automático de subtotal + impuesto + descuento.
- **Carrito persistente**: se guarda en `localStorage`; no requiere cuenta.
- **Checkout completo**: datos de contacto, tipo de entrega (recoger / domicilio), dirección, método de pago, notas.
- **Ticket de pedido**: modal imprimible con resumen + código QR único por pedido.
- **Verificación pública**: sección en la página principal donde cualquier usuario puede verificar el estado de un pedido ingresando su código, sin requerir login.
- **Historial de pedidos**: para usuarios autenticados, vista de todos sus pedidos con estados.
- **Notificaciones por email**: confirmación al crear pedido y al cambiar de estado.
- **Angular Router**: navegación con lazy loading, route guards (authGuard, adminGuard), y pantalla de acceso denegado (403).
- **PWA**: instalable como app en dispositivos móviles y desktop.

### Para administradores

- **Panel admin** con 4 pestañas:
  - **Pedidos**: lista completa, filtros por estado, cambio de estado (pendiente → confirmado → preparando → listo → entregado / cancelado).
  - **Productos**: CRUD completo con imágenes, ingredientes, alérgenos, precio de descuento, stock.
  - **Categorías**: CRUD de categorías con imagen.
  - **Usuarios**: lista de usuarios, cambio de rol (cliente ↔ admin).
- **Escáner QR**: usa la cámara del dispositivo para escanear tickets QR en tienda y verificar pedidos al instante.
- **Subida de imágenes**: drag-and-drop con Multer.

### Técnicas / Seguridad

- Autenticación JWT con expiración de 7 días.
- Rate limiting: 200 req/15min global, 20/15min en rutas de auth, 10/hora en uploads.
- Cabeceras de seguridad HTTP con Helmet (CSP, HSTS, X-Frame-Options).
- Validación de inputs en servidor con `express-validator`.
- Contraseñas hasheadas con bcrypt (10 rondas).
- Contenedores Docker con usuario no-root.
- Health checks en todos los servicios.
- Graceful shutdown al recibir SIGTERM.
- Base de datos solo accesible desde `localhost` (no expuesta públicamente).

---

## 5. Estructura del Proyecto

```
bakery-app/
├── docker-compose.yml          # Orquestación: PostgreSQL + Backend + Frontend
├── deploy.ps1                  # Script de deploy automático (PowerShell)
├── start.bat                   # Script dev local para Windows
│
├── backend/                    # API REST — Node.js / Express
│   ├── Dockerfile              # Build multi-stage
│   ├── .env.example            # Plantilla de variables de entorno
│   └── src/
│       ├── index.js            # Entry point + configuración Express
│       ├── config/
│       │   └── database.js     # Pool de conexiones PostgreSQL
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── orderController.js
│       │   ├── productController.js
│       │   └── uploadController.js
│       ├── middleware/
│       │   ├── auth.js         # Middleware JWT + verificación de rol admin
│       │   └── validators.js   # Reglas de validación (express-validator)
│       ├── migrations/
│       │   ├── schema.sql      # Esquema inicial: 6 tablas + índices + seed
│       │   ├── migrate-002.sql # Migración: columna referencia_pago
│       │   └── run.js          # Runner de migraciones
│       ├── routes/
│       │   └── index.js        # Centralizador de rutas
│       └── services/
│           ├── emailService.js # Nodemailer (confirmaciones de pedido y cambio de estado)
│           ├── pagoService.js  # Orquestador de pagos (selecciona proveedor activo)
│           └── providers/
│               ├── PaymentProvider.js     # Interfaz base (contrato común)
│               ├── PaymentFactory.js      # Factory: selecciona proveedor según .env
│               ├── WompiProvider.js       # Integración Wompi (activo)
│               ├── StripeProvider.js      # Integración Stripe (stub)
│               └── MercadoPagoProvider.js # Integración MercadoPago (stub)
│
└── bakery-frontend/            # SPA Angular 21
    ├── Dockerfile              # Multi-stage: ng build → nginx
    ├── nginx.conf              # Proxy inverso + SSL + compresión
    ├── angular.json            # Configuración del proyecto Angular
    ├── proxy.conf.json         # Proxy de desarrollo (→ localhost:3000)
    └── src/app/
        ├── app.ts / .html / .config.ts / .routes.ts
        ├── models.ts           # Interfaces: Product, CartItem, Order, User
        ├── styles-vars.scss    # Variables SCSS globales (colores, tipografías)
        ├── guards/
        │   └── auth.guard.ts   # authGuard + adminGuard para rutas protegidas
        ├── services/
        │   ├── api.ts          # HTTP wrapper con interceptor JWT
        │   ├── auth.ts         # Estado de autenticación (Signals)
        │   ├── cart.ts         # Carrito (Signals + localStorage)
        │   └── product.ts      # Productos (Signals + paginación)
        ├── pages/
        │   ├── home/           # Página principal (hero + catálogo + verificador)
        │   └── admin-page/     # Wrapper del admin con navbar y router
        └── components/
            ├── navbar/         # Navbar sticky con carrito y menú de usuario
            ├── hero/           # Hero section con llamado a la acción
            ├── product-grid/   # Grid con filtros por categoría y búsqueda
            ├── product-detail/ # Modal detalle: descripción, ingredientes, alérgenos
            ├── cart-sidebar/   # Carrito lateral deslizable
            ├── checkout-modal/ # Formulario de checkout completo
            ├── ticket-modal/   # Ticket imprimible con código QR
            ├── auth-modal/     # Login / Registro con tabs
            ├── admin/          # Panel admin (4 pestañas)
            ├── qr-scanner/     # Escáner QR en tiempo real con cámara
            ├── verifier/       # Verificador público de pedidos por código
            ├── access-denied/  # Página 403 "Acceso Denegado"
            ├── toast/          # Notificaciones tipo toast
            └── footer/         # Footer con información de contacto
```

---

## 6. URLs de Producción

| Servicio | URL | Descripción |
|---|---|---|
| **Frontend (Inicio)** | [https://bakery.seminario1.eleueleo.com](https://bakery.seminario1.eleueleo.com) | Página principal: catálogo, carrito, verificador de pedidos |
| **Panel Admin** | [https://bakery.seminario1.eleueleo.com/admin](https://bakery.seminario1.eleueleo.com/admin) | Panel administrativo (requiere rol admin) |
| **Acceso Denegado** | [https://bakery.seminario1.eleueleo.com/403](https://bakery.seminario1.eleueleo.com/403) | Página de error 403 para usuarios sin permisos |
| **Backend API** | [https://bakery.seminario1.eleueleo.com/api](https://bakery.seminario1.eleueleo.com/api) | API REST (Express + PostgreSQL) |
| **Health Check** | [https://bakery.seminario1.eleueleo.com/health](https://bakery.seminario1.eleueleo.com/health) | Estado del backend |

### Rutas del Frontend (Angular Router)

| Ruta | Protegida | Descripción |
|---|---|---|
| `/` | No | Página principal con hero, catálogo, verificador y footer |
| `/admin` | Sí (adminGuard) | Panel de administración con gestión de pedidos, productos, categorías y usuarios |
| `/403` | No | Pantalla de "Acceso Denegado" |

> **Nota:** El panel admin (`/admin`) está protegido con autenticación JWT y rol de administrador. Un usuario no autenticado será redirigido al inicio. Un usuario sin rol de admin verá una pantalla de "Acceso Denegado" (403).

---

## 7. Instalación y Ejecución Local

### Prerrequisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20 LTS |
| npm | 10+ (incluido con Node 20) |
| PostgreSQL | 16 (o usar Docker) |
| Angular CLI | `npm install -g @angular/cli` |

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con los datos de tu PostgreSQL local
npm run migrate      # Crea tablas y datos de ejemplo
npm run dev          # Servidor con nodemon en http://localhost:3000
```

### Frontend

```bash
cd bakery-frontend
npm install
ng serve             # http://localhost:4200
```

> El archivo `proxy.conf.json` redirige `/api/*` automáticamente a `http://localhost:3000`, por lo que no es necesario configurar CORS manualmente en desarrollo.

### Alternativa: Todo con Docker (recomendado)

```bash
# En la raíz del proyecto (bakery-app/)
cp backend/.env.example backend/.env
# Editar .env con DB_PASSWORD y JWT_SECRET seguros

docker compose up --build
# Frontend: http://localhost
# API:      http://localhost:3000
# Health:   http://localhost/health
```

---

## 8. Variables de Entorno

Copiar `backend/.env.example` a `backend/.env` y completar los valores:

### Obligatorias

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_PASSWORD` | Contraseña de PostgreSQL | `MiPassword2024!` |
| `JWT_SECRET` | Clave para firmar tokens JWT (mínimo 32 caracteres) | *(generada con crypto)* |
| `DOMAIN` | Dominio del sitio (solo en producción) | `laflordeazucar.com` |

Generar `JWT_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Opcionales

| Variable | Descripción | Default |
|---|---|---|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto PostgreSQL | `5432` |
| `DB_NAME` | Nombre de la base de datos | `reposteria` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `PORT` | Puerto del servidor Express | `3000` |
| `NODE_ENV` | Entorno (`development` / `production`) | `development` |
| `SMTP_HOST` | Servidor SMTP para emails | — |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_USER` | Usuario SMTP | — |
| `SMTP_PASS` | Contraseña SMTP | — |
| `PAYMENT_PROVIDER` | Proveedor de pago (`wompi` / `stripe` / `mercadopago`) | `wompi` |
| `WOMPI_API_URL` | URL API Wompi | `https://sandbox.wompi.co/v1` |
| `WOMPI_PUBLIC_KEY` | Llave pública Wompi | — |
| `WOMPI_PRIVATE_KEY` | Llave privada Wompi | — |

> Para pruebas de email sin SMTP real, usar [Ethereal Email](https://ethereal.email) (genera credenciales temporales gratuitas).

---

## 9. Deploy en VPS con Docker

### Arquitectura de despliegue

El despliegue es **automático** via GitHub Actions. Al hacer push a la rama `main`, se ejecutan dos workflows en paralelo:

1. **deploy-frontend.yml** — Copia `bakery-frontend/` al VPS, reconstruye `bakery-web` y recarga Nginx.
2. **deploy-backend.yml** — Copia `backend/` al VPS, reconstruye `bakery-api`, reinicia PostgreSQL + backend, y **ejecuta las migraciones SQL** (`schema.sql` + archivos `migrate-*.sql`).

### Estructura en el VPS

```
/var/www/seminario1/bakery/
├── docker-compose.vps.yml     # Orquesta los 3 contenedores
├── .env                       # Variables de entorno (generado por el workflow)
├── backend/                   # Código del API (copiado por GitHub Actions)
├── bakery-frontend/           # Build de Angular (copiado por GitHub Actions)
└── uploads/                   # Volumen: imágenes de productos
```

Nginx (host) maneja TLS y redirige:
- `location /` → `127.0.0.1:9000` (bakery-web)
- `location /api/` → `127.0.0.1:9001` (bakery-api)

### Despliegue manual (si es necesario)

```bash
# Conectarse al VPS (credenciales privadas del equipo)
ssh <usuario>@<IP_DEL_VPS>
cd /var/www/seminario1/bakery

# Ver estado
docker compose -f docker-compose.vps.yml ps

# Ver logs
docker compose -f docker-compose.vps.yml logs -f backend
docker compose -f docker-compose.vps.yml logs -f postgres

# Reiniciar un servicio
docker compose -f docker-compose.vps.yml restart backend

# Rebuild completo
docker compose -f docker-compose.vps.yml up -d --build backend postgres

# Health check
curl http://localhost:9001/health
```

### Secrets de GitHub Actions

| Secret | Uso |
|---|---|
| `SSH_HOST` | IP del VPS |
| `SSH_USER` | Usuario SSH |
| `SSH_KEY` | Llave privada SSH |
| `DB_PASSWORD` | Contraseña de PostgreSQL |
| `JWT_SECRET` | Clave para firmar tokens JWT |

### Migraciones de Base de Datos

Las migraciones se ejecutan **automáticamente** en el pipeline de deploy (`deploy-backend.yml`). El runner (`backend/src/migrations/run.js`) ejecuta en orden:

1. `schema.sql` — Schema base (tablas, índices, triggers, datos iniciales). Usa `CREATE TABLE IF NOT EXISTS` e `INSERT ... ON CONFLICT DO NOTHING` para ser idempotente.
2. `migrate-*.sql` — Migraciones incrementales numeradas (e.g., `migrate-002.sql`).

**Para crear una nueva migración:**

```bash
# Crear archivo de migración
touch backend/src/migrations/migrate-003.sql

# Escribir la migración usando IF NOT EXISTS para seguridad
cat > backend/src/migrations/migrate-003.sql << 'EOF'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos' AND column_name = 'nueva_columna'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN nueva_columna VARCHAR(100);
  END IF;
END $$;
EOF
```

Al hacer push a `main`, el workflow ejecutará la migración automáticamente.

### Credenciales de demo

| Rol | Email | Contraseña | Permisos |
|---|---|---|---|
| Administrador | `admin@bakery.com` | `Admin123` | Acceso total: gestión de pedidos, productos, categorías, usuarios y pagos |
| Cliente (Estándar) | `cliente@bakery.com` | `Cliente123` | Solo compras: catálogo, carrito, pedidos propios. Sin acceso al panel admin |

> **IMPORTANTE:** En producción, cambiar inmediatamente las contraseñas de ambos usuarios desde el panel administrativo.

### Comandos útiles de mantenimiento

```bash
# Ver logs en tiempo real
docker compose logs -f

# Reiniciar un servicio
docker compose restart backend

# Detener todo
docker compose down

# Detener y eliminar datos (¡borra la base de datos!)
docker compose down -v

# Actualizar tras un git pull
git pull
docker compose up -d --build
```

---

## 10. API Endpoints

**Base URL:** `http://localhost:3000` (desarrollo) | `https://bakery.seminario1.eleueleo.com/api` (producción)

### Salud
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | No | Health check con uptime |

### Autenticación
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registro de usuario |
| POST | `/api/auth/login` | No | Login → retorna JWT |
| GET | `/api/auth/profile` | JWT | Perfil del usuario |
| GET | `/api/usuarios` | Admin | Listar todos los usuarios |
| PATCH | `/api/usuarios/:id/rol` | Admin | Cambiar rol del usuario |

### Productos
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/productos` | No | Listar (filtros: categoria, destacado, buscar, page, limit) |
| GET | `/api/productos/categorias` | No | Listar categorías activas |
| GET | `/api/productos/:id` | No | Detalle de un producto |
| POST | `/api/productos` | Admin | Crear producto |
| PUT | `/api/productos/:id` | Admin | Actualizar producto |
| DELETE | `/api/productos/:id` | Admin | Eliminar producto |
| POST | `/api/categorias` | Admin | Crear categoría |
| PUT | `/api/categorias/:id` | Admin | Actualizar categoría |
| DELETE | `/api/categorias/:id` | Admin | Eliminar categoría |

### Pedidos
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/pedidos` | No | Crear pedido (genera QR + email) |
| GET | `/api/pedidos/mis-pedidos` | JWT | Pedidos del usuario autenticado |
| GET | `/api/pedidos/verificar/:codigo` | No | Verificar pedido por código |
| GET | `/api/pedidos` | Admin | Listar todos los pedidos |
| PATCH | `/api/pedidos/:id/estado` | Admin | Cambiar estado del pedido |
| PATCH | `/api/pedidos/:id/estado-pago` | Admin | Cambiar estado de pago (pendiente/pagado/reembolsado) |

### Pagos y Archivos
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/pagos/wompi-confirm` | No | Webhook de confirmación Wompi |
| POST | `/api/upload` | Admin | Subir imagen de producto |

---

## 11. Capturas de Pantalla

> A continuación se sugieren las capturas que mejor ilustran el proyecto para la presentación:

| # | Vista | Descripción |
|---|---|---|
| 1 | **Página principal** | Hero section + navbar con contador de carrito |
| 2 | **Catálogo con filtros** | Grid de productos, filtro por categoría activo |
| 3 | **Detalle de producto** | Modal con imagen, ingredientes, alérgenos |
| 4 | **Carrito de compras** | Sidebar abierto con items y total calculado |
| 5 | **Checkout** | Formulario completo con tipo de entrega seleccionado |
| 6 | **Ticket + QR** | Modal de confirmación con código QR imprimible |
| 7 | **Panel admin — Pedidos** | Lista de pedidos con cambio de estado |
| 8 | **Panel admin — Escáner QR** | Cámara activa escaneando un ticket |
| 9 | **Vista móvil** | Cualquiera de las anteriores en resolución 390px |
| 10 | **docker compose ps** | Terminal mostrando los 3 contenedores `Up (healthy)` |

---

## 12. Equipo

| Nombre | Rol | 
|---|---|
| Jefferson Manuel Valencia Riascos | Desarrollo Full-Stack | 
| Yensy Daniel Montaño Sánchez | Desarrollo Full-Stack | 
| Jose Manuel Salas Valencia | Desarrollo Full-Stack | 

**Institución:** Universidad del Pacífico  
**Programa:** Ingeniería en Sistemas  
**Materia:** Seminario I  
**Docente:** Gonzalo Andrés Lucio López  
**Período:** 2026-I  


---

## Seguridad implementada

| Mecanismo | Detalle |
|---|---|
| **Helmet** | Cabeceras HTTP seguras (CSP, HSTS, X-Content-Type-Options) |
| **Rate Limiting** | 200 req/15min global · 20/15min auth · 10/hora uploads |
| **CORS** | Restringido al origen del frontend en producción |
| **bcrypt** | 10 rondas de hashing para contraseñas |
| **JWT** | Tokens con expiración de 7 días |
| **express-validator** | Validación de todos los inputs de mutación |
| **Non-root containers** | Todos los contenedores Docker ejecutan como usuario sin privilegios |
| **Graceful Shutdown** | SIGTERM/SIGINT cierran el pool de BD correctamente |
| **DB isolation** | PostgreSQL solo accesible desde la red interna de Docker |
| **Nginx** | TLSv1.2/1.3, HSTS, gzip, headers de seguridad |

## 13. Gestión del Proyecto - Trello

La planificación y seguimiento del desarrollo fue realizada mediante Trello utilizando metodología Scrum.

El tablero contiene:

- Bitácora de Sprints.
- Registro de reuniones semanales.
- Organización de tareas.
- Seguimiento del avance del proyecto.

Tablero:
https://trello.com/b/6qoihYs0/seminario-i




