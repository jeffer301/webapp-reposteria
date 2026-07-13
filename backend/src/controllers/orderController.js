const pool = require('../config/database');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { enviarCorreoPedido, enviarCorreoEstado } = require('../services/emailService');
const { createPayment, confirmPayment } = require('../services/pagoService');

const generarCodigo = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'BKR-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const create = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      items, tipo_entrega = 'recoger', metodo_pago,
      cliente_nombre, cliente_email, cliente_telefono,
      notas, direccion_entrega, fecha_recogida, procesar_pago
    } = req.body;

    if (!items?.length) return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });

    let subtotal = 0;
    const itemsConPrecio = [];
    for (const item of items) {
      const prodRes = await client.query(
        'SELECT * FROM productos WHERE id = $1 AND disponible = true', [item.producto_id]
      );
      const prod = prodRes.rows[0];
      if (!prod) throw new Error(`Producto ${item.producto_id} no disponible`);
      if (prod.stock < item.cantidad) throw new Error(`Stock insuficiente para ${prod.nombre}`);

      const precio = prod.precio_descuento || prod.precio;
      subtotal += precio * item.cantidad;
      itemsConPrecio.push({ ...item, precio_unitario: precio, nombre: prod.nombre, prod_stock: prod.stock });
    }

    const impuesto = +(subtotal * 0.16).toFixed(2);
    const total = +(subtotal + impuesto).toFixed(2);
    const codigo = generarCodigo();
    const pedidoId = uuidv4();
    const referenciaPago = `BKR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const qrData = JSON.stringify({
      id: pedidoId, codigo, total,
      cliente: cliente_nombre || req.user?.nombre,
      fecha: new Date().toISOString()
    });
    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300, margin: 2,
      color: { dark: '#2D1B00', light: '#FFFFFF' }
    });

    const clienteNombre = cliente_nombre || `${req.user?.nombre} ${req.user?.apellido}`;
    const clienteEmail = cliente_email || req.user?.email;

    const pedidoRes = await client.query(
      `INSERT INTO pedidos (id, codigo, usuario_id, cliente_nombre, cliente_email, cliente_telefono,
        subtotal, impuesto, total, tipo_entrega, metodo_pago, notas, direccion_entrega, fecha_recogida, qr_code, referencia_pago)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [
        pedidoId, codigo, req.user?.id || null,
        clienteNombre, clienteEmail, cliente_telefono,
        subtotal, impuesto, total,
        tipo_entrega, metodo_pago, notas, direccion_entrega,
        fecha_recogida || null, qrCode, referenciaPago
      ]
    );

    for (const item of itemsConPrecio) {
      await client.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, nombre_producto, precio_unitario, cantidad, subtotal, notas)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [pedidoId, item.producto_id, item.nombre, item.precio_unitario, item.cantidad,
         +(item.precio_unitario * item.cantidad).toFixed(2), item.notas || null]
      );
      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [item.cantidad, item.producto_id]
      );
    }

    await client.query('COMMIT');

    const pedido = pedidoRes.rows[0];
    const itemsResult = await pool.query('SELECT * FROM pedido_items WHERE pedido_id = $1', [pedidoId]);
    const pedidoCompleto = { ...pedido, items: itemsResult.rows };

    // Enviar email de confirmación (asíncrono)
    enviarCorreoPedido(pedidoCompleto);

    // Procesar pago con el provider activo
    let pagoInfo = null;
    const pagoProvider = process.env.PAYMENT_PROVIDER || 'wompi';
    if (metodo_pago === pagoProvider || (metodo_pago === 'tarjeta' && procesar_pago)) {
      const result = await createPayment({
        total,
        customerEmail: clienteEmail,
        customerName: clienteNombre,
        reference: referenciaPago,
      });
      pagoInfo = result.raw || result;
    }

    res.status(201).json({ ...pedidoCompleto, pago: pagoInfo });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Error al crear pedido' });
  } finally {
    client.release();
  }
};

const getMisPedidos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, json_agg(pi.*) as items
       FROM pedidos p
       LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
       WHERE p.usuario_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

const getByCode = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, json_agg(pi.*) as items
       FROM pedidos p
       LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
       WHERE p.codigo = $1
       GROUP BY p.id`,
      [req.params.codigo.toUpperCase()]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
};

const getAll = async (req, res) => {
  const { estado, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const estadosValidos = ['pendiente','confirmado','preparando','listo','entregado','cancelado'];
  const params = [];
  let query = `SELECT p.*, json_agg(pi.*) as items
    FROM pedidos p
    LEFT JOIN pedido_items pi ON pi.pedido_id = p.id`;
  if (estado && estadosValidos.includes(estado)) {
    query += ` WHERE p.estado = $1`;
    params.push(estado);
  }
  query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

const updateStatus = async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['pendiente','confirmado','preparando','listo','entregado','cancelado'];
  if (!estadosValidos.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
  try {
    const result = await pool.query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Pedido no encontrado' });

    const pedidoActualizado = result.rows[0];
    if (pedidoActualizado.cliente_email) {
      enviarCorreoEstado(pedidoActualizado);
    }
    res.json(pedidoActualizado);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

const updatePaymentStatus = async (req, res) => {
  const { estado_pago } = req.body;
  const estadosValidos = ['pendiente', 'pagado', 'reembolsado'];
  if (!estadosValidos.includes(estado_pago)) return res.status(400).json({ error: 'Estado de pago inválido' });
  try {
    const result = await pool.query(
      'UPDATE pedidos SET estado_pago = $1 WHERE id = $2 RETURNING *',
      [estado_pago, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado de pago' });
  }
};

const paymentConfirm = async (req, res) => {
  try {
    const result = await confirmPayment(req.body);
    if (!result.reference) return res.status(400).json({ error: 'Referencia no proporcionada' });

    await pool.query(
      'UPDATE pedidos SET estado_pago = $1 WHERE referencia_pago = $2',
      [result.status, result.reference]
    );
    res.status(200).json({ recibido: true, status: result.status });
  } catch (err) {
    console.error('Error en confirmación de pago:', err);
    res.status(500).json({ error: 'Error procesando confirmación' });
  }
};

module.exports = { create, getMisPedidos, getByCode, getAll, updateStatus, updatePaymentStatus, paymentConfirm };