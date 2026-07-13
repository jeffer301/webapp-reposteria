import { Component, input, output } from '@angular/core';
import html2canvas from 'html2canvas';
import { Order } from '../../models';

@Component({
  selector: 'app-ticket-modal',
  templateUrl: './ticket-modal.html',
  styleUrl: './ticket-modal.scss',
})
export class TicketModal {
  readonly order = input<Order | null>(null);
  readonly close = output();

  printTicket(): void {
    const content = document.getElementById('ticketContent')?.innerHTML;
    if (!content) return;
    const w = window.open('', '', 'width=500,height=700');
    if (!w) return;
    w.document.write(`<html><head><title>Ticket ${this.order()?.codigo}</title>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap">
      <style>
        body{font-family:'Jost',sans-serif;margin:20px;color:#3A2510}
        .ticket-wrapper{border:2px dashed #F2D4C2;border-radius:16px;padding:24px;max-width:380px;margin:0 auto;text-align:center}
        .ticket-logo{font-family:'Playfair Display',serif;color:#C97B5A;font-size:1.4rem}
        .ticket-subtitle,.ticket-footer{font-size:.78rem;color:#9A7B60}
        .ticket-code{font-size:1.6rem;font-weight:700;letter-spacing:.15em;background:#FDF6EC;padding:.4rem 1.2rem;border-radius:.5rem;display:inline-block;margin:.7rem 0}
        .status-badge{background:#FFF3CD;color:#856404;padding:.25rem .8rem;border-radius:50px;font-size:.78rem;font-weight:700}
        .ticket-items-table{width:100%;font-size:.82rem;text-align:left}
        .ticket-items-table th{color:#9A7B60;padding:.3rem 0;border-bottom:1px solid #F2D4C2}
        .ticket-items-table td{padding:.25rem 0}
        .ticket-total-row{font-weight:700;border-top:2px solid #F2D4C2}
        canvas{border-radius:8px;border:3px solid #F2D4C2}
        hr{border-color:#F2D4C2}
      </style></head><body><div class="ticket-wrapper">${content}</div></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
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

  async downloadTicket(): Promise<void> {
    const el = document.getElementById('ticketContent');
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#FDF6EC' });
      const link = document.createElement('a');
      link.download = `ticket-${this.order()?.codigo ?? 'pedido'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('No se pudo descargar el ticket. Intenta imprimirlo como alternativa.');
    }
  }
}
