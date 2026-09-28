import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [ReactiveFormsModule],
  styleUrl: './login-page.css',
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    login: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.errorMessage.set(null);
    this.submitting.set(true);
    const { login, password } = this.form.getRawValue();

    try {
      await this.auth.login(login, password);
      await this.router.navigate(['/caisse']);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.errorMessage.set('Identifiant ou mot de passe incorrect');
      } else {
        this.errorMessage.set('Le serveur ne répond pas, réessaie plus tard.');
      }
    } finally {
      this.submitting.set(false);
    }
  }
}
