import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  imports: [RouterLink],
  template: `
    <section class="denied-wrapper">
      <div class="denied-card">
        <i class="bi bi-shield-lock-fill denied-icon"></i>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos de administrador para acceder a esta sección.</p>
        <p class="denied-hint">Si crees que esto es un error, contacta al administrador del sistema.</p>
        <a routerLink="/" class="btn btn-back">Volver al inicio</a>
      </div>
    </section>
  `,
  styles: `
    @use '../../styles-vars' as *;
    .denied-wrapper {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $cream;
      padding: 2rem;
    }
    .denied-card {
      text-align: center;
      background: #fff;
      border-radius: 1.2rem;
      padding: 3rem 2.5rem;
      max-width: 420px;
      box-shadow: 0 8px 32px rgba(45,27,0,.08);
    }
    .denied-icon {
      font-size: 3.5rem;
      color: #dc3545;
      margin-bottom: 1rem;
      display: block;
    }
    h2 {
      font-family: 'Playfair Display', serif;
      color: $chocolate;
      margin-bottom: .5rem;
    }
    p { color: $muted; font-size: .95rem; }
    .denied-hint { font-size: .82rem; margin-top: .5rem; }
    .btn-back {
      margin-top: 1.5rem;
      background: $rose;
      color: #fff;
      border: none;
      border-radius: 50px;
      padding: .6rem 2rem;
      font-weight: 600;
      text-decoration: none;
      transition: background .2s;
    }
    .btn-back:hover { background: $rose-dark; color: #fff; }
  `,
})
export class AccessDenied {}
