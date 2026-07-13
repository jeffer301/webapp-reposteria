-- ============================================
-- BAKERY DB - Schema completo
-- Ejecutar en PostgreSQL como superusuario
-- ============================================

-- Crear base de datos (ejecutar por separado si es necesario)
-- CREATE DATABASE bakery_db;

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(20) DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA: categorias
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  imagen_url VARCHAR(500),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER REFERENCES categorias(id),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
  precio_descuento DECIMAL(10,2),
  imagen_url VARCHAR(500),
  stock INTEGER DEFAULT 0,
  disponible BOOLEAN DEFAULT true,
  es_destacado BOOLEAN DEFAULT false,
  ingredientes TEXT[],
  alergenos TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA: pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(20) UNIQUE NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  -- Datos del cliente (para pedidos sin cuenta)
  cliente_nombre VARCHAR(200),
  cliente_email VARCHAR(255),
  cliente_telefono VARCHAR(20),
  -- Totales
  subtotal DECIMAL(10,2) NOT NULL,
  impuesto DECIMAL(10,2) DEFAULT 0,
  descuento DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  -- Estado y tipo
  estado VARCHAR(30) DEFAULT 'pendiente' 
    CHECK (estado IN ('pendiente','confirmado','preparando','listo','entregado','cancelado')),
  tipo_entrega VARCHAR(20) DEFAULT 'recoger' CHECK (tipo_entrega IN ('recoger','domicilio')),
  -- Pago
  metodo_pago VARCHAR(50),
  estado_pago VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente','pagado','reembolsado')),
  -- Fechas
  fecha_pedido TIMESTAMP DEFAULT NOW(),
  fecha_recogida TIMESTAMP,
  fecha_entrega TIMESTAMP,
  -- QR y notas
  qr_code TEXT,
  referencia_pago VARCHAR(100),
  notas TEXT,
  direccion_entrega TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA: pedido_items
-- ============================================
CREATE TABLE IF NOT EXISTS pedido_items (
  id SERIAL PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id),
  nombre_producto VARCHAR(200) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  subtotal DECIMAL(10,2) NOT NULL,
  notas VARCHAR(500)
);

-- ============================================
-- TABLA: resenas
-- ============================================
CREATE TABLE IF NOT EXISTS resenas (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER REFERENCES productos(id),
  usuario_id UUID REFERENCES usuarios(id),
  calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_codigo ON pedidos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_disponible ON productos(disponible);

-- ============================================
-- FUNCIÓN: actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_updated
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_productos_updated
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_pedidos_updated
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- ============================================
-- DATOS INICIALES
-- ============================================
INSERT INTO categorias (nombre, descripcion, imagen_url) VALUES
  ('Pasteles', 'Pasteles para toda ocasión', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'),
  ('Cupcakes', 'Cupcakes artesanales', 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400'),
  ('Galletas', 'Galletas horneadas frescas', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400'),
  ('Macarons', 'Macarons franceses', 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400'),
  ('Pan dulce', 'Pan artesanal del día', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400')
ON CONFLICT DO NOTHING;

INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url, stock, es_destacado, alergenos) VALUES
  (1, 'Pastel de Chocolate', 'Tres capas de bizcocho de chocolate con ganache y fresas frescas', 45000.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 10, true, ARRAY['gluten','lacteos','huevo']),
  (1, 'Pastel Red Velvet', 'Clásico red velvet con crema de queso', 48000.00, 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400', 8, true, ARRAY['gluten','lacteos','huevo']),
  (1, 'Pastel de Zanahoria', 'Húmedo pastel de zanahoria con nuez y betún de queso', 42000.00, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', 6, false, ARRAY['gluten','lacteos','huevo','nuez']),
  (2, 'Cupcake Vainilla', 'Esponjoso cupcake de vainilla con betún de mantequilla', 4500.00, 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400', 24, true, ARRAY['gluten','lacteos','huevo']),
  (2, 'Cupcake Chocolate', 'Intenso cupcake de chocolate con ganache', 4800.00, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400', 20, false, ARRAY['gluten','lacteos','huevo']),
  (3, 'Galletas de Chispas', 'Galletas con chispas de chocolate belga', 2500.00, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', 50, true, ARRAY['gluten','lacteos','huevo']),
  (4, 'Macarons Surtidos', 'Caja de 6 macarons en sabores variados', 12000.00, 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400', 15, true, ARRAY['gluten','lacteos','huevo','almendra']),
  (5, 'Concha', 'Pan dulce tradicional mexicano', 1500.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 30, false, ARRAY['gluten','lacteos','huevo'])
ON CONFLICT DO NOTHING;

-- Admin por defecto (password: Admin123)
-- En producción, cambiar inmediatamente
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol) VALUES
  ('Admin', 'Repostería', 'admin@bakery.com', '$2a$10$rdkPt5JlBcBjCkeZhSlZqOjtq2B4eFFvMc2V0jEkUO1SkN47fQ7A2', 'admin')
ON CONFLICT DO NOTHING;

SELECT 'Base de datos inicializada correctamente ✅' AS mensaje;
