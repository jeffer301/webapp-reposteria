import { Component, signal, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';
import { Product } from '../../models';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.scss',
  imports: [FormsModule],
})
export class ProductGrid {
  cart = inject(CartService);
  prodSvc = inject(ProductService);
  searchText = signal('');

  readonly selectProduct = output<Product>();

  filterCat(cat: string): void {
    this.prodSvc.filterByCategory(cat);
  }

  onSearch(): void {
    this.prodSvc.search(this.searchText());
  }

  addToCart(product: Product, event: MouseEvent): void {
    event.stopPropagation();
    this.cart.addToCart(product);
  }

  prevPage(): void {
    this.prodSvc.goToPage(this.prodSvc.currentPage - 1);
  }

  nextPage(): void {
    this.prodSvc.goToPage(this.prodSvc.currentPage + 1);
  }

  descPercent(original: number, actual: number): number {
    return Math.round((1 - actual / original) * 100);
  }

  fmtCOP(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }

  pages(): number[] {
    const info = this.prodSvc.pageInfo();
    const n = info.totalPages;
    const current = info.page;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(n, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}