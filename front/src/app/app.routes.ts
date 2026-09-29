import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { guestGuard } from './auth/guest-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'caisse', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'caisse',
    canActivate: [authGuard],
    loadComponent: () => import('./caisse/caisse-page').then((m) => m.CaissePage),
  },
  { path: '**', redirectTo: 'caisse' },
];
