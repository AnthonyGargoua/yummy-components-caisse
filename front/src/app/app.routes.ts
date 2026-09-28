import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'caisse', pathMatch: 'full'},
    {
        path: 'login',
        loadComponent: () => import('./login/login-page').then((m) => m.LoginPage),
    },
    {
        path: 'caisse',
        loadComponent: () => import('./caisse/caisse-page').then((m) => m.CaissePage),
    },
    { path: '**', redirectTo: 'caisse'},
];
