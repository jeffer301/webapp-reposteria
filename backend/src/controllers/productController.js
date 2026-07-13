const pool = require('../config/database');

const getAll = async (req, res) => {
  const { categoria, destacado, buscar, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  let where = ['p.disponible = true'];
  const params = [];

  if (categoria) { params.push(categoria); where.push(`c.nombre = $${params.length}`); }
  if (destacado === 'true') where.push('p.es_destacado = true');
  if (buscar) { params.push(`%${buscar}%`); where.push(`p.nombre ILIKE $${params.length}`); }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  try {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id ${whereClause}`,
      params
    );
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre,
        COALESCE(AVG(r.calificacion),0) as calificacion_promedio,
        COUNT(r.id) as total_resenas
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       LEFT JOIN resenas r ON r.producto_id = p.id
       ${whereClause}
       GROUP BY p.id, c.nombre
       ORDER BY p.es_destacado DESC, p.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({
      productos: result.rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countRes.rows[0].count / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const getById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

const create = async (req, res) => {
  const { categoria_id, nombre, descripcion, precio, precio_descuento, imagen_url, stock, es_destacado, alergenos } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO productos (categoria_id,nombre,descripcion,precio,precio_descuento,imagen_url,stock,es_destacado,alergenos)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [categoria_id, nombre, descripcion, precio, precio_descuento, imagen_url, stock || 0, es_destacado || false, alergenos || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const update = async (req, res) => {
  const { nombre, descripcion, precio, precio_descuento, imagen_url, stock, disponible, es_destacado, alergenos, categoria_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE productos SET nombre=$1,descripcion=$2,precio=$3,precio_descuento=$4,
       imagen_url=$5,stock=$6,disponible=$7,es_destacado=$8,alergenos=$9,categoria_id=$10
       WHERE id=$11 RETURNING *`,
      [nombre, descripcion, precio, precio_descuento, imagen_url, stock, disponible, es_destacado, alergenos, categoria_id, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

const getCategorias = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias WHERE activo = true ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

const createCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    const result = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1,$2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

const updateCategoria = async (req, res) => {
  const { nombre, descripcion, activo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categorias SET nombre=$1, descripcion=$2, activo=$3 WHERE id=$4 RETURNING *',
      [nombre, descripcion, activo, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

const deleteCategoria = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};

module.exports = { getAll, getById, create, update, getCategorias, remove, createCategoria, updateCategoria, deleteCategoria };
