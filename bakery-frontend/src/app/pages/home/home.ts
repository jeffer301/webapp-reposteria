import { Component, viewChild, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';
import { Product } from '../../models';
import { Navbar } from '../../components/navbar/navbar';
import { Hero } from '../../components/hero/hero';
import { ProductGrid } from '../../components/product-grid/product-grid';
import { ProductDetail } from '../../components/product-detail/product-detail';
import { CartSidebar } from '../../components/cart-sidebar/cart-sidebar';
import { CheckoutModal } from '../../components/checkout-modal/checkout-modal';
import { TicketModal } from '../../components/ticket-modal/ticket-modal';
import { Verifier } from '../../components/verifier/verifier';
import { AuthModal } from '../../components/auth-modal/auth-modal';
import { PurchaseHistory } from '../../components/purchase-history/purchase-history';
import { FooterComponent } from '../../components/footer/footer';
import { ToastComponent } from '../../components/toast/toast';

const STORAGE_KEY = 'bakery_last_order';

@Component({
  selector: 'app-home',
  imports: [
    Navbar, Hero, ProductGrid, ProductDetail, CartSidebar,
    CheckoutModal, TicketModal, Verifier, AuthModal, PurchaseHistory,
    FooterComponent, ToastComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  cartOpen = false;
  modal: 'checkout' | 'ticket' | null = null;
  order: any = null;
  selectedProduct: Product | null = null;
  authOpen = false;
  purchaseHistoryOpen = false;
  readonly toast = viewChild(ToastComponent);
  private productService = inject(ProductService);
  private api = inject(ApiService);
  auth = inject(AuthService);

  savedOrderCode = signal<string | null>(null);
  savedOrder = signal<any>(null);
  loadingSavedOrder = signal(false);

  ngOnInit(): void {
    this.productService.loadAll(1);
    this.checkSavedOrder();
  }

  private checkSavedOrder(): void {
    const code = localStorage.getItem(STORAGE_KEY);
    if (code) this.savedOrderCode.set(code);
  }

  async openSavedTicket(): Promise<void> {
    const code = this.savedOrderCode();
    if (!code) return;
    this.loadingSavedOrder.set(true);
    try {
      const order: any = await this.api.get(`/pedidos/verificar/${code}`);
      this.savedOrder.set(order);
      this.order = order;
      this.modal = 'ticket';
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      this.savedOrderCode.set(null);
    } finally {
      this.loadingSavedOrder.set(false);
    }
  }

  dismissBanner(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.savedOrderCode.set(null);
  }

  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
  }

  openCheckout(): void {
    this.cartOpen = false;
    this.modal = 'checkout';
  }

  closeModal(): void {
    if (this.modal === 'ticket' && this.savedOrderCode()) {
      localStorage.removeItem(STORAGE_KEY);
      this.savedOrderCode.set(null);
    }
    this.modal = null;
    this.order = null;
  }

  openAuth(): void {
    this.authOpen = true;
  }

  closeAuth(): void {
    this.authOpen = false;
  }

  openPurchaseHistory(): void {
    this.purchaseHistoryOpen = true;
  }

  closePurchaseHistory(): void {
    this.purchaseHistoryOpen = false;
  }

  onDone(order: any): void {
    this.order = order;
    this.modal = 'ticket';
    localStorage.setItem(STORAGE_KEY, order.codigo);
    this.savedOrderCode.set(order.codigo);
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
