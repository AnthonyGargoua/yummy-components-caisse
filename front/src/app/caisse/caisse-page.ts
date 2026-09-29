import { Component, computed, inject, signal } from '@angular/core';

import { CATEGORIES, DailyTotal, Formula, Order, Product } from '../models';
import { CatalogService } from '../services/catalog.service';
import { NoteService } from '../services/note.service';
import { FormulaPicker } from './formula-picker';
import { NotePanel } from './note-panel';
import { ProductCard } from './product-card';
import { EurosPipe } from '../shared/euros-pipe';
import { OrderService } from '../services/order.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DailyTotals } from './daily-totals';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { API_URL } from '../api';
import { firstValueFrom } from 'rxjs';

@Component({
  imports: [ProductCard, NotePanel, FormulaPicker, EurosPipe, DailyTotals],
  templateUrl: './caisse-page.html',
  styleUrl: './caisse-page.css',
})
export class CaissePage {
  private readonly catalog = inject(CatalogService);
  protected readonly note = inject(NoteService);

  protected readonly categories = CATEGORIES;
  protected readonly products = signal<Product[]>([]);
  protected readonly formulas = signal<Formula[]>([]);
  protected readonly openFormula = signal<Formula | null>(null);

  private readonly orders = inject(OrderService);

  protected readonly paying = signal(false);
  protected readonly paidOrder = signal<Order | null>(null);
  protected readonly paymentError = signal<string | null>(null);

  protected async pay(): Promise<void> {
    this.paying.set(true);
    this.paymentError.set(null);

    try {
      const order = await this.orders.pay(this.note.toOrderRequest());
      this.paidOrder.set(order);
      this.note.clear();
      void this.loadDailyTotals();
    } catch (error) {
      this.paymentError.set(
        error instanceof HttpErrorResponse && error.error?.message
          ? error.error.message
          : 'Erreur lors du paiement, réessaie.',
      );
    } finally {
      this.paying.set(false);
      void this.loadProducts();
    }
  }

  protected readonly dailyTotals = signal<DailyTotal[]>([]);

  protected readonly todayTotal = computed(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return this.dailyTotals().find((t) => t.day === today)?.total ?? 0;
  });

  protected async loadDailyTotals(): Promise<void> {
    this.dailyTotals.set(await this.orders.getDailyTotals());
  }

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected async logout(): Promise<void> {
    await this.auth.logout();
    this.note.clear();
    await this.router.navigate(['/login']);
  }

  private readonly http = inject(HttpClient);

  protected async resetDatabase(): Promise<void> {
    await firstValueFrom(this.http.post(`${API_URL}/reset`, {}));
    window.location.reload();
  }

  constructor() {
    void this.loadProducts();
    void this.loadFormulas();
    void this.loadDailyTotals();
  }

  protected async loadProducts(): Promise<void> {
    this.products.set(await this.catalog.getProducts());
  }

  protected async loadFormulas(): Promise<void> {
    this.formulas.set(await this.catalog.getFormulas());
  }

  protected productsIn(category: string): Product[] {
    return this.products().filter((p) => p.category === category);
  }

  protected openPicker(formula: Formula): void {
    this.openFormula.set(formula);
  }

  protected onFormulaConfirmed(
    formula: Formula,
    choice: { main: Product; drink: Product; dessert: Product },
  ): void {
    this.note.addFormula(formula, choice.main, choice.drink, choice.dessert);
    this.openFormula.set(null);
  }

  protected formulaDisabled(formula: Formula): boolean {
    const hasAvailable = (category: string) =>
      this.products().some((p) => p.category === category && this.note.availableStock(p) > 0);
    return (
      !hasAvailable(formula.mainCategory) || !hasAvailable('BOISSON') || !hasAvailable('DESSERT')
    );
  }

  protected mainCategoryLabel(formula: Formula): string {
    return CATEGORIES.find((c) => c.code === formula.mainCategory)?.label ?? '';
  }
}
