import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'caisse', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'caisse',
    canActivate: [authGuard],
    loadComponent: () => import('./caisse/caisse-page').then((m) => m.CaissePage),
  },
  { path: '**', redirectTo: 'caisse' },
];
