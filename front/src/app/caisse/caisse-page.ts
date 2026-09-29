import { Component, inject, signal } from '@angular/core';

import { CATEGORIES, Formula, Product } from '../models';
import { CatalogService } from '../services/catalog.service';
import { NoteService } from '../services/note.service';
import { FormulaPicker } from './formula-picker';
import { NotePanel } from './note-panel';
import { ProductCard } from './product-card';
import { EurosPipe } from '../shared/euros-pipe';

@Component({
  imports: [ProductCard, NotePanel, FormulaPicker, EurosPipe],
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

  constructor() {
    void this.loadProducts();
    void this.loadFormulas();
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
