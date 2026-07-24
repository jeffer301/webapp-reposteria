import { Component, input, output, inject, signal } from '@angular/core';
import { Product } from '../../models';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  readonly product = input<Product | null>(null);
  readonly close = output();
  private cart = inject(CartService);

  readonly cantidad = signal(1);

  increment(): void {
    const p = this.product();
    if (p && this.cantidad() < p.stock) this.cantidad.update(v => v + 1);
  }

  decrement(): void {
    if (this.cantidad() > 1) this.cantidad.update(v => v - 1);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cart.addToCart(p, this.cantidad());
    this.cantidad.set(1);
    this.close.emit();
  }

  fmtCOP(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }
}
