-- Migración 002: Agregar columna referencia_pago
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos' AND column_name = 'referencia_pago'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN referencia_pago VARCHAR(100);
    CREATE INDEX IF NOT EXISTS idx_pedidos_referencia_pago ON pedidos(referencia_pago);
  END IF;
END $$;
