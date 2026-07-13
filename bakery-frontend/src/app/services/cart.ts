import { Injectable, signal, computed } from '@angular/core';
import { Product, CartItem } from '../models';
import { ApiService } from './api';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'bakery_cart';

  readonly items = signal<CartItem[]>(this.loadCart());

  readonly totalItems = computed(() => this.items().reduce((s, i) => s + i.cantidad, 0));
  readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.product.precio * i.cantidad, 0));
  readonly iva = computed(() => +(this.subtotal() * 0.16).toFixed(2));
  readonly total = computed(() => +(this.subtotal() + this.iva()).toFixed(2));

  constructor(private api: ApiService) {}

  private loadCart(): CartItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  private save(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));
  }

  addToCart(product: Product): void {
    this.items.update(items => {
      const idx = items.findIndex(i => i.product.id === product.id);
      if (idx >= 0) {
        items[idx] = { ...items[idx], cantidad: items[idx].cantidad + 1 };
      } else {
        items = [...items, { product, cantidad: 1 }];
      }
      return items;
    });
    this.save();
  }

  removeFromCart(id: number): void {
    this.items.update(items => items.filter(i => i.product.id !== id));
    this.save();
  }

  updateQty(id: number, delta: number): void {
    this.items.update(items => {
      const idx = items.findIndex(i => i.product.id === id);
      if (idx < 0) return items;
      const nueva = items[idx].cantidad + delta;
      if (nueva <= 0) return items.filter(i => i.product.id !== id);
      items[idx] = { ...items[idx], cantidad: nueva };
      return [...items];
    });
    this.save();
  }

  clearCart(): void {
    this.items.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  async submitOrder(form: any): Promise<any> {
    const body = {
      items: this.items().map(i => ({ producto_id: i.product.id, cantidad: i.cantidad })),
      tipo_entrega: form.tipo,
      metodo_pago: form.pago,
      cliente_nombre: `${form.nombre} ${form.apellido}`,
      cliente_email: form.email,
      cliente_telefono: form.telefono,
      notas: form.notas,
      direccion_entrega: form.direccion,
      fecha_recogida: form.fecha,
    };
    return this.api.post('/pedidos', body);
  }
}
