require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://sandbox.wompi.co", "https://production.wompi.co"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
}));

const frontendUrls = [
  process.env.FRONTEND_URL || 'http://localhost:4200',
  'http://localhost:4000',
];
if (process.env.FRONTEND_URLS) {
  frontendUrls.push(...process.env.FRONTEND_URLS.split(','));
}

app.use(cors({
  origin: isDev ? true : frontendUrls,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo en 15 minutos' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos de autenticacion' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiadas subidas de archivos, intenta en 1 hora' },
});

app.use('/api/auth', authLimiter);
app.use('/api', globalLimiter);
app.use('/api/upload', uploadLimiter);

app.use(express.json({ limit: '10mb' }));

if (isDev) {
  app.use(morgan('dev'));
} else {
  morgan.token('timestamp', () => new Date().toISOString());
  app.use(morgan(':timestamp :method :url :status :res[content-length] - :response-time ms', {
    skip: (req) => req.url === '/health',
  }));
}

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date(), uptime: process.uptime() }));

app.use('/api', routes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: isDev ? err.message : 'Error interno del servidor',
    ...(isDev && { stack: err.stack }),
  });
});

const server = app.listen(PORT, () => {
  console.log(`\nBackend iniciado en http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

const shutdown = async (signal) => {
  console.log(`\nRecibida senal ${signal}. Cerrando servidor...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('Conexiones cerradas correctamente');
      process.exit(0);
    } catch (err) {
      console.error('Error al cerrar conexiones:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Forzando cierre por timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
