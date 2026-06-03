import { Injectable, InjectionToken, inject } from '@angular/core';

export const API_URL = new InjectionToken<string>('api_url', {
  providedIn: 'root',
  factory: () => {
    const origin = window.location.origin;
    if (origin.includes('localhost:4200')) return 'http://localhost:3000/api';
    return '/api';
  },
});

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = inject(API_URL);

  private getToken(): string | null {
    return localStorage.getItem('bakery_token');
  }

  private headers(extra: Record<string,string> = {}): Record<string,string> {
    const h: Record<string,string> = { 'Content-Type': 'application/json', ...extra };
    const t = this.getToken();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }

  async get<T>(path: string): Promise<T> {
    const r = await fetch(this.api + path, { headers: this.headers() });
    if (!r.ok) { const e = await r.json().catch(() => ({ error: r.statusText })); throw new Error(e.error || 'Error de conexión'); }
    return r.json();
  }

  async post<T>(path: string, body: any): Promise<T> {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(this.api + path, { method: 'POST', headers: this.headers(), body: JSON.stringify(body), signal: ctrl.signal });
    clearTimeout(id);
    if (!r.ok) { const e = await r.json().catch(() => ({ error: r.statusText })); throw new Error(e.error || 'Error de conexión'); }
    return r.json();
  }

  async put<T>(path: string, body: any): Promise<T> {
    const r = await fetch(this.api + path, { method: 'PUT', headers: this.headers(), body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json().catch(() => ({ error: r.statusText })); throw new Error(e.error || 'Error de conexión'); }
    return r.json();
  }

  async patch<T>(path: string, body: any): Promise<T> {
    const r = await fetch(this.api + path, { method: 'PATCH', headers: this.headers(), body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json().catch(() => ({ error: r.statusText })); throw new Error(e.error || 'Error de conexión'); }
    return r.json();
  }

  async delete<T>(path: string): Promise<T> {
    const r = await fetch(this.api + path, { method: 'DELETE', headers: this.headers() });
    if (!r.ok) { const e = await r.json().catch(() => ({ error: r.statusText })); throw new Error(e.error || 'Error de conexión'); }
    return r.json();
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const h: Record<string,string> = {};
    const t = this.getToken();
    if (t) h['Authorization'] = 'Bearer ' + t;
    const r = await fetch(this.api + path, { method: 'POST', headers: h, body: formData });
    if (!r.ok) { const e = await r.json().catch(() => ({ error: r.statusText })); throw new Error(e.error || 'Error de conexión'); }
    return r.json();
  }
}
