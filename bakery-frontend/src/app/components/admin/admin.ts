import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { QrScanner } from '../qr-scanner/qr-scanner';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  imports: [FormsModule, QrScanner],
})
export class Admin {
  private api = inject(ApiService);
  readonly close = output();

  tab = signal<'products' | 'orders' | 'categories' | 'users'>('orders');
  qrScanOpen = false;
  qrOrder: any = null;
  products = signal<any[]>([]);
  orders = signal<any[]>([]);
  categories = signal<any[]>([]);
  users = signal<any[]>([]);
  loading = signal(false);

  // Edit product
  editingProduct: any = null;
  editForm: any = {};

  // New product
  showNewProduct = false;
  newProduct: any = {
    nombre: '', descripcion: '', precio: 0, stock: 0,
    categoria_id: 1, es_destacado: false, disponible: true,
    alergenos: '', imagen_url: '',
  };
  newProductImage: File | null = null;
  editProductImage: File | null = null;
  uploadingImage = false;

  // New category
  showNewCategory = false;
  newCategory = { nombre: '', descripcion: '' };

  // New admin user
  showNewAdmin = false;
  newAdmin = { nombre: '', apellido: '', email: '', password: '', telefono: '' };
  creatingAdmin = false;
  adminFormError = '';

  constructor() {
    this.loadOrders();
    this.loadProducts();
    this.loadCategories();
    this.loadUsers();
  }

  async loadProducts() {
    this.loading.set(true);
    try {
      const r: any = await this.api.get('/productos?limit=100');
      this.products.set(r.productos || []);
      if (r.productos?.length && this.categories().length === 0) {
        this.loadCategories();
      }
    } catch { this.products.set([]); }
    finally { this.loading.set(false); }
  }

  async loadOrders() {
    try {
      const r: any = await this.api.get('/pedidos');
      this.orders.set(Array.isArray(r) ? r : []);
    } catch { this.orders.set([]); }
  }

  async loadCategories() {
    try {
      const r: any = await this.api.get('/productos/categorias');
      this.categories.set(Array.isArray(r) ? r : []);
    } catch { this.categories.set([]); }
  }

  async loadUsers() {
    try {
      const r: any = await this.api.get('/usuarios');
      this.users.set(Array.isArray(r) ? r : []);
    } catch { this.users.set([]); }
  }

  setTab(t: 'products' | 'orders' | 'categories' | 'users') {
    this.tab.set(t);
    this.editingProduct = null;
    this.showNewProduct = false;
    this.showNewCategory = false;
    this.showNewAdmin = false;
    this.adminFormError = '';
    if (t === 'categories') this.loadCategories();
    if (t === 'users') this.loadUsers();
  }

  // ── Product CRUD ──

  onEditProductImage(e: Event) {
    const input = e.target as HTMLInputElement;
    this.editProductImage = input.files?.item(0) ?? null;
  }

  editProduct(p: any) {
    this.editingProduct = p;
    this.showNewProduct = false;
    this.editProductImage = null;
    this.editForm = {
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stock: p.stock,
      disponible: p.disponible,
      es_destacado: p.es_destacado,
      categoria_id: p.categoria_id,
      alergenos: p.alergenos?.join(', ') || '',
      imagen_url: p.imagen_url || '',
    };
  }

  cancelEdit() { this.editingProduct = null; this.editProductImage = null; }

  async saveProduct() {
    try {
      if (this.editProductImage) {
        const url = await this.uploadImage(this.editProductImage);
        if (url) this.editForm.imagen_url = url;
        this.editProductImage = null;
      }
      const body = { ...this.editForm };
      if (typeof body.alergenos === 'string') {
        body.alergenos = body.alergenos ? body.alergenos.split(',').map((s: string) => s.trim()) : [];
      }
      await this.api.put(`/productos/${this.editingProduct.id}`, body);
      await this.loadProducts();
      this.editingProduct = null;
    } catch (e: any) { alert(e.message); }
  }

  async deleteProduct(id: number, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await this.api.delete(`/productos/${id}`);
      await this.loadProducts();
    } catch (e: any) { alert(e.message); }
  }

  async uploadImage(file: File): Promise<string> {
    this.uploadingImage = true;
    try {
      const fd = new FormData();
      fd.append('imagen', file);
      const r: any = await this.api.upload('/upload', fd);
      return r.url;
    } catch {
      alert('Error al subir imagen');
      return '';
    } finally {
      this.uploadingImage = false;
    }
  }

  onNewProductImage(e: Event) {
    const input = e.target as HTMLInputElement;
    this.newProductImage = input.files?.item(0) ?? null;
  }

  async createProduct() {
    if (!this.newProduct.nombre || !this.newProduct.precio) {
      alert('Nombre y precio son requeridos');
      return;
    }
    try {
      if (this.newProductImage) {
        const url = await this.uploadImage(this.newProductImage);
        if (url) this.newProduct.imagen_url = url;
      }
      const body = { ...this.newProduct };
      body.alergenos = body.alergenos ? body.alergenos.split(',').map((s: string) => s.trim()) : [];
      body.precio = parseFloat(body.precio);
      body.stock = parseInt(body.stock) || 0;
      body.categoria_id = parseInt(body.categoria_id);
      await this.api.post('/productos', body);
      this.showNewProduct = false;
      this.newProduct = { nombre: '', descripcion: '', precio: 0, stock: 0, categoria_id: 1, es_destacado: false, disponible: true, alergenos: '', imagen_url: '' };
      this.newProductImage = null;
      await this.loadProducts();
    } catch (e: any) { alert(e.message); }
  }

  // ── Category CRUD ──

  async createCategory() {
    if (!this.newCategory.nombre) { alert('Nombre requerido'); return; }
    try {
      await this.api.post('/categorias', this.newCategory);
      this.showNewCategory = false;
      this.newCategory = { nombre: '', descripcion: '' };
      await this.loadCategories();
    } catch (e: any) { alert(e.message); }
  }

  async deleteCategory(id: number, nombre: string) {
    if (!confirm(`¿Eliminar categoría "${nombre}"?`)) return;
    try {
      await this.api.delete(`/categorias/${id}`);
      await this.loadCategories();
    } catch (e: any) { alert(e.message); }
  }

  // ── Orders ──

  async updateStatus(orderId: string, estado: string) {
    try {
      await this.api.patch(`/pedidos/${orderId}/estado`, { estado });
      await this.loadOrders();
    } catch (e: any) { alert(e.message); }
  }

  async updatePaymentStatus(orderId: string, estadoPago: string) {
    try {
      await this.api.patch(`/pedidos/${orderId}/estado-pago`, { estado_pago: estadoPago });
      await this.loadOrders();
    } catch (e: any) { alert(e.message); }
  }

  // ── Users ──

  async toggleUserRol(user: any) {
    const newRol = user.rol === 'admin' ? 'cliente' : 'admin';
    try {
      await this.api.patch(`/usuarios/${user.id}/rol`, { rol: newRol });
      await this.loadUsers();
    } catch (e: any) { alert(e.message); }
  }

  async createAdminUser() {
    const { nombre, apellido, email, password } = this.newAdmin;
    if (!nombre || !apellido || !email || !password) {
      this.adminFormError = 'Nombre, apellido, email y contraseña son obligatorios.';
      return;
    }
    this.adminFormError = '';
    this.creatingAdmin = true;
    try {
      const r: any = await this.api.post('/auth/register', {
        nombre, apellido, email, password,
        telefono: this.newAdmin.telefono || undefined,
      });
      await this.api.patch(`/usuarios/${r.user.id}/rol`, { rol: 'admin' });
      this.showNewAdmin = false;
      this.newAdmin = { nombre: '', apellido: '', email: '', password: '', telefono: '' };
      await this.loadUsers();
    } catch (e: any) {
      this.adminFormError = e.message || 'Error al crear el administrador.';
    } finally {
      this.creatingAdmin = false;
    }
  }

  // ── QR Scanner ──

  onQrOrder(order: any): void {
    this.qrOrder = order;
    this.qrScanOpen = false;
  }

  // ── Helpers ──

  fmtCOP(n: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }

  estadoBadge(e: string) {
    const m: Record<string,string> = { pendiente:'warning', confirmado:'info', preparando:'primary', listo:'success', entregado:'success', cancelado:'danger' };
    return m[e] || 'secondary';
  }
}