# RESUMEN TÉCNICO COMPLETO — La Flor de Azúcar

> Aplicación web full-stack para repostería online con pasarela de pagos Wompi, generación de tickets QR y verificación en tienda.

---

## 1. STACK TECNOLÓGICO COMPLETO

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| Angular | ^21.2.0 | Framework SPA (standalone components, signals) |
| TypeScript | ~5.9.2 | Lenguaje |
| Bootstrap | ^5.3.8 | UI framework responsive |
| SCSS | - | Estilos |
| jsQR | ^1.4.0 | Escáner QR desde cámara |
| RxJS | ~7.8.0 | Programación reactiva |
| Vitest | ^4.0.8 | Tests unitarios |
| Prettier | ^3.8.1 | Formateo de código |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 20 (Alpine en Docker) | Runtime |
| Express | ^4.18.2 | Framework HTTP REST |
| PostgreSQL | 16 (Alpine) | Base de datos relacional |
| pg | ^8.11.3 | Driver PostgreSQL nativo (sin ORM) |
| bcryptjs | ^2.4.3 | Hashing de contraseñas (10 rondas) |
| jsonwebtoken | ^9.0.2 | Autenticación JWT (7 días expiración) |
| helmet | ^8.2.0 | Headers de seguridad |
| cors | ^2.8.5 | CORS configurable |
| express-rate-limit | ^8.5.2 | Rate limiting (200/15min global, 20/15min auth) |
| express-validator | ^7.0.1 | Validación de inputs |
| morgan | ^1.10.0 | Logging HTTP |
| multer | ^2.1.1 | Subida de archivos/imágenes |
| nodemailer | ^8.0.9 | Envío de emails (SMTP) |
| qrcode | ^1.5.3 | Generación de códigos QR |
| uuid | ^9.0.0 | Generación de UUIDs |
| dotenv | ^16.3.1 | Variables de entorno |

### Infraestructura / DevOps
| Tecnología | Uso |
|---|---|
| Docker Compose | Orquestación (3 servicios) |
| Docker (multi-stage) | Build optimizado, non-root users |
| Nginx (Alpine) | Servir frontend en producción, SSL, proxy inverso |
| PowerShell script | Despliegue automatizado (deploy.ps1) |

---

## 2. FUNCIONALIDADES IMPLEMENTADAS

### Catálogo de Productos
- Grid de productos con imágenes, precios, descuentos
- Búsqueda por nombre
- Filtros por categoría, productos destacados
- Paginación
- Vista detalle en modal con ingredientes, alérgenos, reseñas
- Categorías desde base de datos

### Carrito de Compras
- Sidebar deslizable desde cualquier página
- Agregar/quitar items, ajustar cantidades
- Persistencia en localStorage (no requiere login)
- Cálculo automático: subtotal → impuesto → descuento → total

### Checkout (Flujo Completo)
- Formulario de datos de contacto (nombre, email, teléfono)
- Tipo de entrega: recoger en tienda / domicilio
- Dirección de envío (para domicilio)
- Método de pago
- Notas del pedido
- Validación completa con express-validator

### Autenticación
- Registro de nuevos usuarios
- Inicio de sesión con JWT
- Modal de autenticación con tabs login/registro
- Roles: `cliente` (default) y `admin`
- Protección de rutas vía middleware
- Perfil de usuario

### Panel Administrativo
- 4 pestañas: Pedidos, Productos, Categorías, Usuarios
- CRUD completo de productos (nombre, descripción, precio, stock, imágenes, ingredientes, alérgenos)
- CRUD de categorías
- Gestión de pedidos: cambio de estado (pendiente → confirmado → preparando → listo → entregado / cancelado)
- Administración de usuarios: cambio de rol (cliente ↔ admin)
- Subida de imágenes con multer
- Escáner QR en tiempo real con cámara para verificar pedidos

### Pedidos (Flujo Transaccional Completo)
- Creación de pedido sin necesidad de autenticación
- Código único por pedido (legible + UUID)
- Generación de QR code por pedido
- Ticket de confirmación imprimible (modal con diseño propio)
- Verificación de pedido por código (URL pública)
- Historial "Mis Pedidos" para usuarios autenticados
- Notificaciones por email al crear pedido y al cambiar estado

### Pagos (Wompi)
- Integración con Wompi (Colombia)
- Sandbox configurable
- Webhook de confirmación (`/api/pagos/wompi-confirm`)
- Referencia de pago persistida en el pedido

### PWA
- Service Worker: cache-first para assets, network-first para HTML
- Web Manifest: standalone display, theme color #C97B5A
- Instalable como aplicación en dispositivos móviles/desktop

### UX/UI
- Hero section con llamado a la acción
- Navbar sticky con logo, enlaces, carrito y menú de usuario
- Toast notifications para feedback
- Footer con información de contacto
- Diseño responsivo (Bootstrap 5)
- Tipografías: Playfair Display + Jost (Google Fonts)

---

## 3. INTEGRACIONES EXTERNAS

| Integración | Estado | Detalle |
|---|---|---|
| **Wompi Payments** | ✅ Implementado (Sandbox) | Pasarela de pagos colombiana. Webhook POST. Configurable vía `WOMPI_API_URL`, `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY` |
| **SMTP Email** | ✅ Implementado (Ethereal dev) | Nodemailer. Configurable vía `SMTP_HOST/PORT/USER/PASS`. Plantillas HTML básicas para confirmación de pedido y cambio de estado |
| **QR Code** | ✅ Server-side | Librería `qrcode` genera QR en DataURL/PNG por pedido |
| **QR Scanner** | ✅ Client-side | `jsqr` + cámara del dispositivo en panel admin |
| **Google Fonts** | ✅ CDN | Playfair Display (títulos) + Jost (cuerpo) |
| **Bootstrap Icons** | ✅ CDN | Iconografía de interfaz |

> Nota: Todas las integraciones apuntan a entornos sandbox/dev. Para producción solo requiere cambiar variables de entorno.

---

## 4. ESTRUCTURA DE LA BASE DE DATOS

### Esquema (PostgreSQL, SQL puro, migraciones secuenciales)

```
reposteria/
├── usuarios
│   ├── id UUID PK (gen_random_uuid())
│   ├── email VARCHAR(255) UNIQUE NOT NULL
│   ├── password_hash VARCHAR(255) NOT NULL
│   ├── nombre VARCHAR(100), apellido VARCHAR(100)
│   ├── telefono VARCHAR(20)
│   ├── rol VARCHAR(20) DEFAULT 'cliente' CHECK (rol IN ('cliente','admin'))
│   ├── activo BOOLEAN DEFAULT true
│   └── created_at, updated_at (trigger auto-update)
│
├── categorias
│   ├── id SERIAL PK
│   ├── nombre VARCHAR(100) NOT NULL
│   ├── descripcion TEXT, imagen_url VARCHAR(500)
│   ├── activo BOOLEAN DEFAULT true
│   └── created_at
│
├── productos
│   ├── id SERIAL PK
│   ├── categoria_id INTEGER FK → categorias(id)
│   ├── nombre VARCHAR(200) NOT NULL
│   ├── descripcion TEXT
│   ├── precio DECIMAL(10,2) NOT NULL
│   ├── precio_descuento DECIMAL(10,2)
│   ├── imagen_url VARCHAR(500)
│   ├── stock INTEGER DEFAULT 0
│   ├── disponible BOOLEAN DEFAULT true
│   ├── es_destacado BOOLEAN DEFAULT false
│   ├── ingredientes TEXT[]
│   ├── alergenos TEXT[]
│   └── created_at, updated_at (trigger auto-update)
│
├── pedidos
│   ├── id UUID PK
│   ├── codigo VARCHAR(20) UNIQUE NOT NULL
│   ├── usuario_id UUID FK → usuarios(id)
│   ├── cliente_nombre, cliente_email, cliente_telefono VARCHAR
│   ├── subtotal, impuesto, descuento, total DECIMAL(10,2)
│   ├── estado VARCHAR(20) DEFAULT 'pendiente'
│   │   CHECK IN ('pendiente','confirmado','preparando','listo','entregado','cancelado')
│   ├── tipo_entrega VARCHAR(20) CHECK IN ('recoger','domicilio')
│   ├── metodo_pago VARCHAR(50)
│   ├── estado_pago VARCHAR(20) DEFAULT 'pendiente'
│   ├── fecha_recogida TIMESTAMP
│   ├── qr_code TEXT
│   ├── referencia_pago VARCHAR(255)
│   ├── notas TEXT, direccion_entrega TEXT
│   └── created_at, updated_at (trigger auto-update)
│
├── pedido_items
│   ├── id SERIAL PK
│   ├── pedido_id UUID FK → pedidos(id) ON DELETE CASCADE
│   ├── producto_id INTEGER FK → productos(id)
│   ├── nombre_producto VARCHAR(200)
│   ├── precio_unitario DECIMAL(10,2)
│   ├── cantidad INTEGER NOT NULL
│   ├── subtotal DECIMAL(10,2)
│   └── notas TEXT
│
└── resenas
    ├── id SERIAL PK
    ├── producto_id INTEGER FK → productos(id)
    ├── usuario_id UUID FK → usuarios(id)
    ├── calificacion INTEGER CHECK (1-5)
    └── comentario TEXT
```

### Índices
- `idx_usuarios_email` ON usuarios(email)
- `idx_pedidos_usuario` ON pedidos(usuario_id)
- `idx_pedidos_codigo` ON pedidos(codigo)
- `idx_pedidos_estado` ON pedidos(estado)
- `idx_productos_categoria` ON productos(categoria_id)

### Seed Data
- **Admin:** admin@bakery.com / Admin123 (cambiar en producción)
- **5 categorías:** Tortas, Postres, Galletas, Panes, Especiales
- **8 productos** de ejemplo con precios, ingredientes y alérgenos

---

## 5. API REST (ENDOPOINTS)

### Salud
| GET | `/health` | Health check público |

### Autenticación
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login (retorna JWT) |
| GET | `/api/auth/profile` | Perfil del usuario autenticado |
| GET | `/api/usuarios` | Listar usuarios (admin) |
| PATCH | `/api/usuarios/:id/rol` | Cambiar rol (admin) |

### Productos
| GET | `/api/productos` | Listar (filtros: categoria, destacado, buscar, page, limit) |
| GET | `/api/productos/categorias` | Listar categorías activas |
| GET | `/api/productos/:id` | Detalle de producto |
| POST | `/api/productos` | Crear producto (admin) |
| PUT | `/api/productos/:id` | Actualizar producto (admin) |
| DELETE | `/api/productos/:id` | Eliminar producto (admin) |

### Categorías
| POST | `/api/categorias` | Crear categoría (admin) |
| PUT | `/api/categorias/:id` | Actualizar categoría (admin) |
| DELETE | `/api/categorias/:id` | Eliminar categoría (admin) |

### Pedidos
| POST | `/api/pedidos` | Crear pedido (público) |
| GET | `/api/pedidos/mis-pedidos` | Pedidos del usuario autenticado |
| GET | `/api/pedidos/verificar/:codigo` | Verificar pedido por código (público) |
| GET | `/api/pedidos` | Listar todos (admin) |
| PATCH | `/api/pedidos/:id/estado` | Actualizar estado (admin) |

### Pagos
| POST | `/api/pagos/wompi-confirm` | Webhook Wompi |

### Archivos
| POST | `/api/upload` | Subir imagen (admin, multer) |

---

## 6. DIFICULTAD DE DESPLIEGUE EN PRODUCCIÓN

### Puntaje: 4/10 (Relativamente Fácil)

**Razones por las que es fácil:**
- ✅ Docker Compose listo con 3 servicios (PostgreSQL + Backend + Nginx)
- ✅ Script de deploy PowerShell (`deploy.ps1`) que genera passwords y ejecuta `docker compose up -d --build`
- ✅ Health checks en todos los containers
- ✅ Nginx preconfigurado con SSL, HSTS, redirect HTTP→HTTPS, gzip, security headers
- ✅ Migraciones SQL automáticas al iniciar
- ✅ Non-root users en containers
- ✅ Variables de entorno documentadas en `.env.example`

**Lo que requiere configuración manual:**
- Dominio y certificados SSL (Let's Encrypt)
- Cambiar Wompi de sandbox a producción (URL + API keys)
- Configurar SMTP real (no Ethereal)
- Ajustar CORS para el dominio de producción
- Cambiar contraseña admin del seed

**Plataformas recomendadas:**
- **Railway / Render:** Ideal por soporte nativo a Docker + PostgreSQL
- **VPS (DigitalOcean, Linode):** Con Docker Compose, muy viable
- **Vercel:** Solo para frontend (el backend necesita Node+Postgres persistente)

---

## 7. DEUDA TÉCNICA Y LO QUE FALTA PARA PRODUCTION-READY

### 🔴 Alta Prioridad
| Issue | Impacto |
|---|---|
| **Sin tests** (1 spec solamente) | No hay cobertura de backend ni frontend. Riesgo alto de regresiones |
| **Sin handler global de errores** | Errores 500 no capturados pueden exponer información interna |
| **Sin validación de stock** al crear pedido | Pueden aceptarse pedidos sin stock suficiente |
| **Contraseña admin hardcodeada** en schema.sql | Admin123 debe cambiarse antes de producción |

### 🟡 Prioridad Media
| Issue | Impacto |
|---|---|
| **Sin ORM** (SQL manual) | Migraciones no tienen rollback, propenso a errores humanos |
| **Sin CSRF protection** | JWT mitiga pero no hay tokens CSRF |
| **Sin logs estructurados** | Solo morgan, difícil debugging en producción |
| **Sin CI/CD pipeline** | No hay automatización de tests + deploy |
| **Rate limit genérico** | Podría reforzarse por ruta específica |
| **Angular sin lazy loading** | Todo en un solo bundle (sin router nativo) |

### 🟢 Baja Prioridad
| Issue | Impacto |
|---|---|
| **Sin caché (Redis/CDN)** | No crítico para volumen pequeño/mediano |
| **Sin HTTPS en backend directo** | Delegado en Nginx, aceptable |
| **Sin JSDoc/comentarios** | Código autoexplicativo pero sin documentación inline |

### Tiempo estimado para production-ready: ~2-3 semanas

---

## 8. TAMAÑO DEL PROYECTO

### Líneas de Código Fuente

| Componente | Archivos | Líneas |
|---|---|---|
| Backend (JavaScript + SQL) | 13 | ~1,080 |
| Frontend (TypeScript + HTML + SCSS) | 33 | ~2,180 |
| Configuración (Docker, Nginx, JSON, scripts) | 17 | ~730 |
| **Total código fuente** | **~60** | **~4,000** |

### Distribución por tipo
| Tipo | Líneas |
|---|---|
| JavaScript (backend) | ~860 |
| TypeScript (frontend) | ~1,080 |
| HTML templates | ~880 |
| SCSS estilos | ~220 |
| SQL esquemas | ~180 |
| Config/JSON/Scripts | ~730 |
| Documentación (README) | ~50 |

### Archivos fuente: ~60 (excluyendo node_modules, dist, .angular, lockfiles)

---

## 9. SEGURIDAD IMPLEMENTADA

- **Helmet:** Headers de seguridad (CSP configurable)
- **Rate Limiting:** 200 req/15min global, 20/15min auth, 10/hora uploads
- **CORS:** Restringido a frontend URLs en producción
- **bcrypt:** 10 rondas de hashing para contraseñas
- **JWT:** 7 días de expiración, firmado con secret key
- **express-validator:** Validación en todos los endpoints de mutación
- **Non-root users:** Todos los containers Docker ejecutan como usuario no privilegiado
- **Graceful shutdown:** SIGTERM/SIGINT cierran DB pool correctamente
- **DB retry logic:** 3 reintentos con 2s de delay
- **Nginx:** HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **TLS:** TLSv1.2/TLSv1.3, cifrados seguros

---

## 10. ARQUITECTURA DE DIRECTORIOS

```
bakery-app/
├── docker-compose.yml          # Orquestación 3 servicios
├── deploy.ps1                  # Script de deploy automatizado
├── start.bat                   # Script dev local (Windows)
│
├── backend/                    # API REST Node.js/Express
│   ├── Dockerfile              # Multi-stage build
│   ├── .env.example            # Template variables de entorno
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
│       │   ├── auth.js         # JWT + admin middleware
│       │   └── validators.js   # Reglas de validación
│       ├── migrations/
│       │   ├── run.js          # Runner de migraciones
│       │   ├── schema.sql      # Esquema inicial
│       │   └── migrate-002.sql # Migración: referencia_pago
│       ├── routes/
│       │   └── index.js        # Centralizador de rutas
│       └── services/
│           ├── emailService.js # Nodemailer
│           └── pagoService.js  # Integración Wompi
│
└── bakery-frontend/            # SPA Angular 21
    ├── Dockerfile              # Multi-stage: build → nginx
    ├── nginx.conf              # Configuración servidor producción
    ├── angular.json            # Configuración Angular
    ├── proxy.conf.json         # Proxy dev (API → localhost:3000)
    └── src/
        ├── index.html
        ├── main.ts
        ├── styles.scss
        └── app/
            ├── app.ts / .html / .scss / .config.ts / .routes.ts
            ├── models.ts       # Interfaces: Product, CartItem, Order, User
            ├── styles-vars.scss
            ├── services/
            │   ├── api.ts      # HTTP wrapper con JWT
            │   ├── auth.ts     # Auth state (signals)
            │   ├── cart.ts     # Carrito (signals + localStorage)
            │   └── product.ts  # Productos (signals + paginación)
            └── components/
                ├── navbar/     # Navbar sticky
                ├── hero/       # Hero section
                ├── product-grid/  # Grid con filtros
                ├── product-detail/ # Modal detalle
                ├── cart-sidebar/  # Carrito lateral
                ├── checkout-modal/ # Formulario checkout
                ├── ticket-modal/  # Ticket con QR
                ├── verifier/   # Verificador de pedidos
                ├── auth-modal/ # Login/Register
                ├── admin/      # Panel admin (4 tabs)
                ├── qr-scanner/ # Escáner QR cámara
                ├── toast/      # Notificaciones
                └── footer/     # Footer
```

---

## 11. VARIABLES DE ENTORNO REQUERIDAS

```env
# Obligatorias
DB_PASSWORD=            # Contraseña PostgreSQL
JWT_SECRET=             # Clave secreta JWT (256-bit recomendado)
DOMAIN=                 # Dominio de producción

# Base de datos (valores por defecto funcionales)
DB_HOST=localhost       # PostgreSQL host
DB_PORT=5432            # PostgreSQL port
DB_NAME=reposteria      # Nombre BD
DB_USER=postgres        # Usuario BD

# Servidor
PORT=3000
NODE_ENV=development    # development | production
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4200

# Email (SMTP)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# Wompi (Pagos)
WOMPI_API_URL=https://sandbox.wompi.co/v1
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
```

---

## 12. CONCLUSIÓN COMERCIAL

**"La Flor de Azúcar"** es una aplicación web full-stack lista para desplegar, construida con Angular 21 + Node.js/Express + PostgreSQL, dockerizada y con integración de pagos Wompi para el mercado colombiano.

### Fortalezas clave para venta:
1. **Stack moderno y mantenible:** Angular 21 standalone + signals, Bootstrap 5, Node.js 20
2. **Completamente dockerizada:** Deploy en 1 comando con `docker compose up`
3. **Flujo transaccional completo:** Catálogo → Carrito → Checkout → Pago Wompi → QR → Verificación
4. **Panel administrativo completo:** Gestión de productos, pedidos, usuarios sin escribir código
5. **Escáner QR + PWA:** Verificación en tienda desde el móvil del administrador
6. **Código limpio y organizado:** Buena separación de capas (controllers/services/middleware)
7. **Base de datos relacional normalizada:** 6 tablas con relaciones, índices y triggers
8. **Seguridad básica implementada:** Helmet, rate limiting, JWT, validación, CORS

### Próximos pasos recomendados para producción:
- Agregar suite de tests (Vitest backend + frontend)
- Configurar CI/CD (GitHub Actions)
- Mejorar logging (Winston/Pino)
- Agregar Redis para caché de sesiones/catálogo
- Implementar lazy loading en Angular
- End-to-end testing con Playwright/Cypress

---

*Documento generado el 30 de mayo de 2026 — 130 archivos fuente, ~4,000 líneas de código.*
