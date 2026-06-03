import { Component, viewChild, inject, OnInit } from '@angular/core';
import { ProductService } from './services/product';
import { AuthService } from './services/auth';
import { Product } from './models';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { ProductGrid } from './components/product-grid/product-grid';
import { ProductDetail } from './components/product-detail/product-detail';
import { CartSidebar } from './components/cart-sidebar/cart-sidebar';
import { CheckoutModal } from './components/checkout-modal/checkout-modal';
import { TicketModal } from './components/ticket-modal/ticket-modal';
import { Verifier } from './components/verifier/verifier';
import { AuthModal } from './components/auth-modal/auth-modal';
import { Admin } from './components/admin/admin';
import { FooterComponent } from './components/footer/footer';
import { ToastComponent } from './components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [
    Navbar, Hero, ProductGrid, ProductDetail, CartSidebar,
    CheckoutModal, TicketModal, Verifier, AuthModal, Admin,
    FooterComponent, ToastComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  cartOpen = false;
  modal: 'checkout' | 'ticket' | null = null;
  order: any = null;
  selectedProduct: Product | null = null;
  authOpen = false;
  adminOpen = false;
  readonly toast = viewChild(ToastComponent);
  private productService = inject(ProductService);
  auth = inject(AuthService);

  ngOnInit(): void {
    this.productService.loadAll(1);
  }

  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
  }

  openCheckout(): void {
    this.cartOpen = false;
    this.modal = 'checkout';
  }

  closeModal(): void {
    this.modal = null;
    this.order = null;
  }

  openAuth(): void {
    this.authOpen = true;
  }

  closeAuth(): void {
    this.authOpen = false;
  }

  toggleAdmin(): void {
    this.adminOpen = !this.adminOpen;
    if (this.adminOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.getElementById('admin-panel');
          if (el) {
            const navbar = document.querySelector('.navbar') as HTMLElement;
            const offset = navbar ? navbar.offsetHeight : 60;
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
          }
        });
      });
    }
  }

  onDone(order: any): void {
    this.order = order;
    this.modal = 'ticket';
    const pagoMsg = order.pago?.url_pago
      ? `. <a href="${order.pago.url_pago}" target="_blank" style="color:#fff;text-decoration:underline">Ir a pagar</a>`
      : '';
    this.toast()?.show(`<i class="bi bi-check-circle-fill"></i> <span>Pedido confirmado: ${order.codigo}${pagoMsg}</span>`, 6000);
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
  }

  closeDetail(): void {
    this.selectedProduct = null;
  }
}