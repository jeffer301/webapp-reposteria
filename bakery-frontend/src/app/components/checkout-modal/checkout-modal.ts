import { Component, inject, output, signal } from '@angular/core';
import { CartService } from '../../services/cart';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout-modal',
  templateUrl: './checkout-modal.html',
  styleUrl: './checkout-modal.scss',
  imports: [FormsModule],
})
export class CheckoutModal {
  cart = inject(CartService);
  readonly close = output();
  readonly done = output<any>();

  form = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipo: 'recoger',
    direccion: '',
    fecha: '',
    pago: 'efectivo',
    notas: '',
    tarjeta: { numero: '', vencimiento: '', cvv: '', nombre: '' },
    comprobante: null as File | null,
  };

  readonly OPEN = 8;
  readonly CLOSE = 19;

  error = signal('');
  submitting = signal(false);

  constructor() {
    this.form.fecha = this.mananaApertura();
  }

  private mananaApertura(): string {
    return this.fmtDate(this.sumarDias(new Date(), 1)) + 'T' + this.pad(this.OPEN) + ':00';
  }

  minFecha(): string {
    return this.mananaApertura();
  }

  private sumarDias(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  private fmtDate(d: Date): string {
    return `${d.getFullYear()}-${this.pad(d.getMonth()+1)}-${this.pad(d.getDate())}`;
  }

  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  private validarFecha(): string | null {
    if (!this.form.fecha) return 'Selecciona una fecha y hora';
    const sel = new Date(this.form.fecha);
    if (isNaN(sel.getTime())) return 'Fecha inválida';
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    if (sel < hoy) return 'No se puede agendar para el día de hoy ni días pasados';
    const h = sel.getHours();
    if (h < this.OPEN || h >= this.CLOSE) return `Horario permitido: ${this.pad(this.OPEN)}:00 – ${this.pad(this.CLOSE)}:00`;
    return null;
  }

  toggleDireccion(): void {
    const el = document.getElementById('direccionRow');
    if (el) el.classList.toggle('d-none', this.form.tipo !== 'domicilio');
  }

  togglePago(): void {
    const tarjetaEl = document.getElementById('pagoTarjeta');
    const transferenciaEl = document.getElementById('pagoTransferencia');
    const wompiEl = document.getElementById('pagoWompi');
    if (tarjetaEl) tarjetaEl.classList.toggle('d-none', this.form.pago !== 'tarjeta');
    if (transferenciaEl) transferenciaEl.classList.toggle('d-none', this.form.pago !== 'transferencia');
    if (wompiEl) wompiEl.classList.toggle('d-none', this.form.pago !== 'wompi');
  }

  onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.form.comprobante = input.files?.item(0) ?? null;
  }

  async submit(): Promise<void> {
    this.error.set('');
    if (!this.form.nombre || !this.form.apellido || !this.form.email) {
      this.error.set('Completa nombre, apellido y email');
      return;
    }
    const errFecha = this.validarFecha();
    if (errFecha) { this.error.set(errFecha); return; }

    this.submitting.set(true);
    try {
      const order = await this.cart.submitOrder(this.form);
      this.cart.clearCart();
      this.done.emit(order);
    } catch (err: any) {
      this.error.set(err.message || 'Error al crear pedido');
      this.submitting.set(false);
    }
  }

  formatExpiry(e: Event): void {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
    input.value = val;
    this.form.tarjeta.vencimiento = val;
  }

  fmtCOP(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  }

  pagoLabel(): string {
    const labels: Record<string, string> = {
      efectivo: '💵 Efectivo contra entrega',
      tarjeta: '💳 Tarjeta de Crédito / Débito (En línea)',
      transferencia: '🏦 Transferencia',
      wompi: '🔵 Wompi (Tarjeta/PSE/Nequi)',
    };
    return labels[this.form.pago] || this.form.pago;
  }
}