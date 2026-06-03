const { body, param, query, validationResult } = require('express-validator');

const validar = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: errors.array().map(e => ({ campo: e.path, mensaje: e.msg }))
    });
  }
  next();
};

// ── AUTH ──
const registerRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validar,
];

const loginRules = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validar,
];

// ── PRODUCTOS ──
const productRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('descripcion').optional().trim(),
  body('precio').isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0'),
  body('categoria_id').optional().isInt({ min: 1 }).withMessage('Categoría inválida'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock inválido'),
  body('disponible').optional().isBoolean(),
  body('es_destacado').optional().isBoolean(),
  body('imagen_url').optional().isURL().withMessage('URL de imagen inválida'),
  body('alergenos').optional().isArray(),
  validar,
];

const productUpdateRules = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('descripcion').optional().trim(),
  body('precio').optional().isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0'),
  body('categoria_id').optional().isInt({ min: 1 }).withMessage('Categoría inválida'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock inválido'),
  body('disponible').optional().isBoolean(),
  body('es_destacado').optional().isBoolean(),
  body('imagen_url').optional().isURL().withMessage('URL de imagen inválida'),
  validar,
];

// ── PEDIDOS ──
const orderRules = [
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('items.*.producto_id').isInt({ min: 1 }).withMessage('ID de producto inválido'),
  body('items.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser al menos 1'),
  body('cliente_nombre').optional().trim().notEmpty().withMessage('Nombre del cliente requerido'),
  body('cliente_email').optional().isEmail().withMessage('Email del cliente inválido'),
  body('cliente_telefono').optional().trim(),
  body('tipo_entrega').optional().isIn(['recoger', 'domicilio']).withMessage('Tipo de entrega inválido'),
  body('metodo_pago').optional().isIn(['efectivo', 'tarjeta', 'transferencia', 'wompi']).withMessage('Método de pago inválido'),
  body('procesar_pago').optional().isBoolean(),
  body('direccion_entrega').optional().trim(),
  body('fecha_recogida').optional().isISO8601().withMessage('Fecha inválida'),
  validar,
];

const estadoRules = [
  body('estado').isIn(['pendiente','confirmado','preparando','listo','entregado','cancelado'])
    .withMessage('Estado inválido'),
  validar,
];

const verificarRules = [
  param('codigo').trim().isLength({ min: 10 }).withMessage('Código inválido'),
  validar,
];

module.exports = {
  registerRules, loginRules,
  productRules, productUpdateRules,
  orderRules, estadoRules, verificarRules,
};
