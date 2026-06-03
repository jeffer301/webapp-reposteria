import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(this.loadUser());
  readonly isAdmin = computed(() => this.user()?.rol === 'admin');

  constructor(private api: ApiService) {}

  private loadUser(): User | null {
    try {
      const data = localStorage.getItem('bakery_user');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  private saveUser(user: User | null): void {
    if (user) localStorage.setItem('bakery_user', JSON.stringify(user));
    else localStorage.removeItem('bakery_user');
    this.user.set(user);
  }

  getToken(): string | null {
    return localStorage.getItem('bakery_token');
  }

  async login(email: string, password: string): Promise<User> {
    const r: any = await this.api.post('/auth/login', { email, password });
    localStorage.setItem('bakery_token', r.token);
    this.saveUser(r.user);
    return r.user;
  }

  async register(data: { nombre: string; apellido: string; email: string; password: string; telefono?: string }): Promise<User> {
    const r: any = await this.api.post('/auth/register', data);
    localStorage.setItem('bakery_token', r.token);
    this.saveUser(r.user);
    return r.user;
  }

  logout(): void {
    localStorage.removeItem('bakery_token');
    this.saveUser(null);
  }}
