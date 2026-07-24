-- Migración: Agregar columna direccion a la tabla usuarios
-- Ejecutar en la VPS si la columna no existe

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS direccion TEXT;

-- Dirección por defecto para el usuario de prueba
UPDATE usuarios
SET direccion = 'Calle 5 # 38-25, Éxito San Fernando, Cali'
WHERE email = 'cliente@bakery.com' AND (direccion IS NULL OR direccion = '');
