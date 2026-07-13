import { Component, input, output, inject } from '@angular/core';
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

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cart.addToCart(p);
    this.close.emit();
  }

  fmtCOP(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }
}
