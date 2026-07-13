import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Admin } from '../../components/admin/admin';

@Component({
  selector: 'app-admin-page',
  imports: [Admin, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg" style="background:var(--chocolate);">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/" style="color:var(--gold);font-family:'Playfair Display',serif;">
          🎂 La Flor de Azúcar
        </a>
      </div>
    </nav>
    <app-admin />
  `,
})
export class AdminPage {}
