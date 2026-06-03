import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-verifier',
  templateUrl: './verifier.html',
  styleUrl: './verifier.scss',
  imports: [FormsModule],
})
export class Verifier {
  private api = inject(ApiService);
  code = signal('');
  result = signal<{ ok: boolean; data?: any } | null>(null);
  loading = signal(false);

  async verify(): Promise<void> {
    const c = this.code().trim().toUpperCase();
    if (!c) { this.result.set(null); return; }

    if (!c.startsWith('BKR-') || c.length < 10) {
      this.result.set({ ok: false, data: { message: 'Formato debe ser BKR-XXXXXXXX' } });
      return;
    }

    this.loading.set(true);
    try {
      const order: any = await this.api.get(`/pedidos/verificar/${c}`);
      this.result.set({ ok: true, data: order });
    } catch (err: any) {
      if (err.message?.includes('no encontrado')) {
        this.result.set({ ok: false, data: { message: 'Pedido no encontrado', code: c } });
      } else {
        this.result.set({ ok: false, data: { message: 'Error de conexión con el servidor' } });
      }
    } finally {
      this.loading.set(false);
    }
  }

  fmtCOP(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }

  pagoLabel(pago: string | undefined): string {
    const labels: Record<string, string> = {
      efectivo: '💵 Efectivo contra entrega',
      tarjeta: '💳 Tarjeta de Crédito / Débito (En línea)',
      transferencia: '🏦 Transferencia',
    };
    return pago ? (labels[pago] || pago) : '';
  }
}
