const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, rol FROM usuarios WHERE id = $1 AND activo = true',
      [decoded.id]
    );
    if (!result.rows[0]) return res.status(401).json({ error: 'Usuario no encontrado' });
    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, rol FROM usuarios WHERE id = $1 AND activo = true',
      [decoded.id]
    );
    if (result.rows[0]) req.user = result.rows[0];
  } catch {}
  next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
};

module.exports = { authMiddleware, optionalAuthMiddleware, adminMiddleware };
