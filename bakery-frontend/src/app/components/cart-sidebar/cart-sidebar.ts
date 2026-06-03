import { Component, inject, output } from '@angular/core';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-cart-sidebar',
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.scss',
})
export class CartSidebar {
  cart = inject(CartService);
  readonly close = output();
  readonly checkout = output();

  fmtCOP(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }
}
