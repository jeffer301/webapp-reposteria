const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
  const { nombre, apellido, email, password, telefono, direccion } = req.body;
  try {
    const exists = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, direccion)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, nombre, apellido, email, telefono, direccion, rol`,
      [nombre, apellido, email, hash, telefono, direccion || null]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true', [email]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, telefono: user.telefono, direccion: user.direccion, rol: user.rol }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const listUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, rol, activo, created_at FROM usuarios ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

const updateRol = async (req, res) => {
  const { rol } = req.body;
  if (!['cliente', 'admin'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' });
  try {
    const result = await pool.query(
      'UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, nombre, apellido, email, rol',
      [rol, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

module.exports = { register, login, getProfile, listUsers, updateRol };
