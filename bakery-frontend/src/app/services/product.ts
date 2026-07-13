import { Injectable, signal } from '@angular/core';
import { ApiService } from './api';
import { Product } from '../models';

export interface PageInfo {
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  readonly productos = signal<Product[]>([]);
  readonly categorias = signal<string[]>(['Todos']);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pageInfo = signal<PageInfo>({ total: 0, page: 1, totalPages: 1 });
  readonly searchQuery = signal('');

  currentPage = 1;
  currentCat = '';

  constructor(private api: ApiService) {}

  async loadAll(page = 1): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.currentPage = page;
    try {
      const catParam = this.currentCat ? `&categoria=${encodeURIComponent(this.currentCat)}` : '';
      const searchParam = this.searchQuery() ? `&buscar=${encodeURIComponent(this.searchQuery())}` : '';
      const r: any = await this.api.get(`/productos?limit=12&page=${page}${catParam}${searchParam}`);
      this.productos.set((r.productos || []).map((p: any) => this.mapProduct(p)));
      this.pageInfo.set({ total: r.total, page: r.page, totalPages: r.totalPages });

      if (page === 1) {
        const cats: any[] = await this.api.get('/productos/categorias');
        this.categorias.set(['Todos', ...cats.map(c => c.nombre)]);
      }
    } catch (e) {
      this.error.set('Error al cargar productos');
      console.error('Error cargando productos:', e);
    } finally {
      this.loading.set(false);
    }
  }

  filterByCategory(cat: string): void {
    this.currentCat = cat === 'Todos' ? '' : cat;
    this.loadAll(1);
  }

  search(query: string): void {
    this.searchQuery.set(query);
    this.loadAll(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pageInfo().totalPages) return;
    this.loadAll(page);
  }

  async getById(id: number): Promise<Product | null> {
    try {
      const p: any = await this.api.get(`/productos/${id}`);
      return this.mapProduct(p);
    } catch { return null; }
  }

  private mapProduct(p: any): Product {
    return {
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria_nombre || '',
      descripcion: p.descripcion || '',
      precio: Number(p.precio_descuento || p.precio),
      precio_original: p.precio_descuento ? Number(p.precio) : undefined,
      imagen: p.imagen_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
      destacado: p.es_destacado || false,
      alergenos: p.alergenos || [],
      stock: p.stock || 0,
    };
  }
}
