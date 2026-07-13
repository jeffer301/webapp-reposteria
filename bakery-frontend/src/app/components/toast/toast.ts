import { Component } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent {
  messages: { html: string; bg: string; id: number }[] = [];
  private idCounter = 0;

  show(html: string, duration: number = 3000, bg: string = 'var(--chocolate)'): void {
    const id = ++this.idCounter;
    this.messages.push({ html, bg, id });
    setTimeout(() => this.remove(id), duration);
  }

  private remove(id: number): void {
    this.messages = this.messages.filter(m => m.id !== id);
  }
}
