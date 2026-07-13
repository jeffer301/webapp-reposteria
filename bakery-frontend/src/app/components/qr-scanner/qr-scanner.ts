import { Component, inject, output, signal } from '@angular/core';
import { ApiService } from '../../services/api';
import jsQR from 'jsqr';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.html',
  styleUrl: './qr-scanner.scss',
})
export class QrScanner {
  private api = inject(ApiService);
  readonly close = output();
  readonly orderFound = output<any>();

  scanning = signal(false);
  result = signal<string | null>(null);
  error = signal<string | null>(null);

  private stream: MediaStream | null = null;
  private animationId = 0;

  async start(): Promise<void> {
    this.error.set(null);
    this.result.set(null);
    this.scanning.set(true);

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.getElementById('qr-video') as HTMLVideoElement;
      video.srcObject = this.stream;
      video.play();
      this.tick();
    } catch {
      this.error.set('No se pudo acceder a la cámara');
      this.scanning.set(false);
    }
  }

  private tick(): void {
    const video = document.getElementById('qr-video') as HTMLVideoElement;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      this.animationId = requestAnimationFrame(() => this.tick());
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      try {
        const data = JSON.parse(code.data);
        if (data.codigo) {
          this.verifyOrder(data.codigo);
          return;
        }
      } catch {
        this.result.set(code.data);
        this.stop();
      }
    }

    this.animationId = requestAnimationFrame(() => this.tick());
  }

  private async verifyOrder(codigo: string): Promise<void> {
    this.stop();
    try {
      const order: any = await this.api.get(`/pedidos/verificar/${codigo}`);
      this.orderFound.emit(order);
    } catch {
      this.error.set(`Pedido ${codigo} no encontrado`);
      this.scanning.set(false);
    }
  }

  stop(): void {
    cancelAnimationFrame(this.animationId);
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.scanning.set(false);
  }
}
