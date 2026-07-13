================================================================================
  LA FLOR DE AZUCAR -- Bakery Web App
  CodeCanyon Item Information
================================================================================

ITEM NAME       : La Flor de Azucar -- Full-Stack Bakery Web App
VERSION         : 1.0.0
RELEASE DATE    : 2026-06-08
ITEM TYPE       : Full Application (Node.js / Angular / PostgreSQL)

--------------------------------------------------------------------------------
COMPATIBILITY
--------------------------------------------------------------------------------
  Node.js        : 20 LTS or higher
  PostgreSQL     : 16 or higher
  Angular CLI    : Latest  (npm install -g @angular/cli)
  Docker         : 24+ with Compose v2  (optional but recommended)
  Browsers       : Chrome 100+, Firefox 100+, Safari 15+, Edge 100+

--------------------------------------------------------------------------------
INCLUDED FILES
--------------------------------------------------------------------------------
  backend/           Node.js / Express REST API
  bakery-frontend/   Angular 21 SPA
  docker-compose.yml Docker orchestration (3 services)
  documentation/     Full HTML documentation -- open index.html in a browser
  README.md          Technical documentation (Markdown)

--------------------------------------------------------------------------------
FEATURES
--------------------------------------------------------------------------------
  - Product catalog with categories, filters, and keyword search
  - Persistent shopping cart (no login required)
  - Full checkout: pickup in store or home delivery
  - Unique QR code per order + printable ticket modal
  - Email notifications (order confirmation + status updates)
  - Wompi payment gateway integration (sandbox + production ready)
  - Admin panel: orders, products, categories, users management
  - Live QR scanner via device camera for in-store pickup verification
  - Public order status verification page  (/verify/:code)
  - JWT authentication with role-based access (cliente / admin)
  - PWA support -- installable on mobile and desktop
  - One-command Docker deployment (docker compose up --build)
  - Rate limiting, Helmet headers, bcrypt passwords, CORS protection

--------------------------------------------------------------------------------
QUICK START
--------------------------------------------------------------------------------
  1. cp backend/.env.example backend/.env
  2. Edit backend/.env  (set DB_PASSWORD and JWT_SECRET)
  3. docker compose up --build
  4. Open http://localhost

  Full step-by-step guide: documentation/index.html

  Default admin credentials:
    Email    : admin@bakery.com
    Password : Admin123    <-- CHANGE IMMEDIATELY in production

  Generate a secure JWT_SECRET:
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

--------------------------------------------------------------------------------
SUPPORT
--------------------------------------------------------------------------------
  Email  : je.301@hotmail.com
  Envato : Use the "Support" tab on your CodeCanyon purchase page

  Response time : 1-2 business days (Monday-Friday)

  Support covers:
    - Installation and configuration issues
    - Bug reports for included functionality
    - Questions about environment variables and deployment

  NOT covered:
    - Custom modifications or new feature development
    - Hosting or server setup/management
    - Third-party service configuration (Wompi keys, SMTP setup)

--------------------------------------------------------------------------------
CHANGELOG
--------------------------------------------------------------------------------
  v1.0.0  2026-06-08
    - Initial CodeCanyon release
    - Angular 21 SPA + Node.js/Express REST API + PostgreSQL 16
    - Docker Compose deployment (3 services)
    - Wompi payment integration (sandbox + production)
    - QR code generation and scanner
    - PWA support
    - Admin panel with 4 management tabs

--------------------------------------------------------------------------------
LICENSE
--------------------------------------------------------------------------------
  Regular License  - use in a single end product (free or commercial)
  Extended License - use in a product sold to multiple end clients

  Full license terms: https://codecanyon.net/licenses/standard_terms

================================================================================
