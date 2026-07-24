import { Component, inject, output, signal, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';
import { Order } from '../../models';

@Component({
  selector: 'app-purchase-history',
  templateUrl: './purchase-history.html',
  styleUrl: './purchase-history.scss',
})
export class PurchaseHistory implements OnInit {
  readonly close = output();
  private api = inject(ApiService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal('');
  expandedOrder = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const data = await this.api.get<Order[]>('/pedidos/mis-pedidos');
      this.orders.set(data);
    } catch (err: any) {
      this.error.set(err.message || 'Error al cargar pedidos');
    } finally {
      this.loading.set(false);
    }
  }

  toggleExpand(id: string): void {
    this.expandedOrder.set(this.expandedOrder() === id ? null : id);
  }

  estadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      preparando: 'En preparación',
      listo: 'Listo',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };
    return labels[estado] || estado;
  }

  estadoClass(estado: string): string {
    const classes: Record<string, string> = {
      pendiente: 'estado-pendiente',
      confirmado: 'estado-confirmado',
      preparando: 'estado-preparando',
      listo: 'estado-listo',
      entregado: 'estado-entregado',
      cancelado: 'estado-cancelado',
    };
    return classes[estado] || '';
  }

  fecha(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  fmtCOP(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }
}
