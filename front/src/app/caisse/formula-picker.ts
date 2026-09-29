import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Formula, Product } from '../models';
import { NoteService } from '../services/note.service';
import { EurosPipe } from '../shared/euros-pipe';

@Component({
  imports: [EurosPipe],
  selector: 'app-formula-picker',
  styleUrl: './formula-picker.css',
  templateUrl: './formula-picker.html',
})
export class FormulaPicker {
  private readonly note = inject(NoteService);

  readonly formula = input.required<Formula>();
  readonly products = input.required<Product[]>();

  readonly confirmed = output<{ main: Product; drink: Product; dessert: Product }>();
  readonly cancelled = output<void>();

  protected readonly mains = computed(() =>
  this.products().filter((p) => p.category === this.formula().mainCategory),
    );
  protected readonly drinks = computed(() => this.products().filter((p) => p.category === 'BOISSON'));
  protected readonly desserts = computed(() => this.products().filter((p) => p.category === 'DESSERT'));

  protected readonly selectedMain = signal<Product | null>(null);
  protected readonly selectedDrink = signal<Product | null>(null);
  protected readonly selectedDessert = signal<Product | null>(null);

  protected readonly canConfirm = computed(
    () => this.selectedMain() !== null && this.selectedDrink() !== null && this.selectedDessert() !== null,
  );

  protected available(product: Product): number {
    return this.note.availableStock(product);
  }

  protected confirm(): void {
    const main = this.selectedMain();
    const drink = this.selectedDrink();
    const dessert = this.selectedDessert();
    if (main && drink && dessert) {
      this.confirmed.emit({ main, drink, dessert });
    }
  }
}
