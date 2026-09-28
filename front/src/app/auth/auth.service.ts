import { computed, inject, Service, signal } from '@angular/core';
import { API_URL } from '../api';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoginResponse } from '../models';

@Service()
export class AuthService {
  readonly token = signal<string | null>(sessionStorage.getItem('token'));
  readonly isLoggedIn = computed(() => this.token() !== null);

  private readonly http = inject(HttpClient);

  async login(login: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${API_URL}/auth/login`, { login, password }),
    );
    sessionStorage.setItem('token', response.token);
    this.token.set(response.token);
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post(`${API_URL}/auth/logout`, {}));
    this.clearSession();
  }

  clearSession(): void {
    sessionStorage.removeItem('token');
    this.token.set(null);
  }
}
