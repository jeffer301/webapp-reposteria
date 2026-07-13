import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.scss',
  imports: [FormsModule],
})
export class AuthModal {
  auth = inject(AuthService);
  readonly close = output();

  mode = signal<'login' | 'register'>('login');
  form = { nombre: '', apellido: '', email: '', password: '', telefono: '' };
  error = signal('');
  loading = signal(false);

  async submit(): Promise<void> {
    this.error.set('');
    if (!this.form.email || !this.form.password) { this.error.set('Email y contraseña requeridos'); return; }
    if (this.mode() === 'register' && (!this.form.nombre || !this.form.apellido)) { this.error.set('Nombre y apellido requeridos'); return; }

    this.loading.set(true);
    try {
      if (this.mode() === 'login') {
        await this.auth.login(this.form.email, this.form.password);
      } else {
        await this.auth.register({
          nombre: this.form.nombre,
          apellido: this.form.apellido,
          email: this.form.email,
          password: this.form.password,
          telefono: this.form.telefono,
        });
      }
      this.close.emit();
    } catch (err: any) {
      this.error.set(err.message || 'Error');
    } finally {
      this.loading.set(false);
    }
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set('');
  }

  logout(): void {
    this.auth.logout();
    this.close.emit();
  }
}
