export interface Product {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  precio_original?: number;
  imagen: string;
  destacado: boolean;
  alergenos: string[];
  stock: number;
}

export interface CartItem {
  product: Product;
  cantidad: number;
}

export interface OrderItem {
  producto_id: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Order {
  id: string;
  codigo: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  subtotal: number;
  impuesto: number;
  total: number;
  tipo_entrega: string;
  metodo_pago: string;
  estado: string;
  estado_pago?: string;
  referencia_pago?: string;
  notas: string;
  direccion_entrega: string;
  fecha_recogida: string;
  items: OrderItem[];
  qr_code: string;
  created_at: string;
}

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  rol: string;
}
