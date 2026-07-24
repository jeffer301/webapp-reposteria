const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const prodCtrl = require('../controllers/productController');
const orderCtrl = require('../controllers/orderController');
const uploadCtrl = require('../controllers/uploadController');
const { authMiddleware, optionalAuthMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  registerRules, loginRules,
  productRules, productUpdateRules,
  orderRules, estadoRules, verificarRules, estadoPagoRules,
} = require('../middleware/validators');

// ── AUTH ──────────────────────────────────────
router.post('/auth/register', registerRules, authCtrl.register);
router.post('/auth/login', loginRules, authCtrl.login);
router.get('/auth/profile', authMiddleware, authCtrl.getProfile);
router.get('/usuarios', authMiddleware, adminMiddleware, authCtrl.listUsers);
router.patch('/usuarios/:id/rol', authMiddleware, adminMiddleware, authCtrl.updateRol);

// ── PRODUCTOS ─────────────────────────────────
router.get('/productos', prodCtrl.getAll);
router.get('/productos/categorias', prodCtrl.getCategorias);
router.get('/productos/:id', prodCtrl.getById);
router.post('/productos', authMiddleware, adminMiddleware, productRules, prodCtrl.create);
router.put('/productos/:id', authMiddleware, adminMiddleware, productUpdateRules, prodCtrl.update);
router.delete('/productos/:id', authMiddleware, adminMiddleware, prodCtrl.remove);

// ── CATEGORÍAS (admin) ────────────────────────
router.post('/categorias', authMiddleware, adminMiddleware, prodCtrl.createCategoria);
router.put('/categorias/:id', authMiddleware, adminMiddleware, prodCtrl.updateCategoria);
router.delete('/categorias/:id', authMiddleware, adminMiddleware, prodCtrl.deleteCategoria);

// ── PEDIDOS ───────────────────────────────────
router.post('/pedidos', optionalAuthMiddleware, orderRules, orderCtrl.create);
router.get('/pedidos/mis-pedidos', authMiddleware, orderCtrl.getMisPedidos);
router.get('/pedidos/verificar/:codigo', verificarRules, orderCtrl.getByCode);
router.get('/pedidos', authMiddleware, adminMiddleware, orderCtrl.getAll);
router.patch('/pedidos/:id/estado', authMiddleware, adminMiddleware, estadoRules, orderCtrl.updateStatus);
router.patch('/pedidos/:id/estado-pago', authMiddleware, adminMiddleware, estadoPagoRules, orderCtrl.updatePaymentStatus);

// ── SUBIDA DE IMÁGENES ────────────────────────
router.post('/upload', authMiddleware, adminMiddleware, uploadCtrl.upload.single('imagen'), uploadCtrl.uploadImage);

// ── PAGOS ─────────────────────────────────────
router.post('/pagos/confirm', orderCtrl.paymentConfirm);
router.post('/pagos/wompi-confirm', orderCtrl.paymentConfirm);

module.exports = router;
