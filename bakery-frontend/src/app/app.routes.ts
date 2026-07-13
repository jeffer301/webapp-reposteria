import { Routes } from '@angular/router';
import { adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin-page/admin-page').then(m => m.AdminPage),
  },
  {
    path: '403',
    loadComponent: () => import('./components/access-denied/access-denied').then(m => m.AccessDenied),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
