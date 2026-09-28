import { Component, computed, input, output } from '@angular/core';

import { CATEGORIES, Product } from '../models';
import { EurosPipe } from '../shared/euros-pipe';

@Component({
  selector: 'app-product-card',
  imports: [EurosPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly available = input.required<number>();
  readonly picked = output<Product>();

  protected readonly soldOut = computed(() => this.available() <= 0);
  protected readonly icon = computed(
    () => CATEGORIES.find((c) => c.code === this.product().category)?.icon ?? '',
  );

  protected onClick(): void {
    if (!this.soldOut()) {
      this.picked.emit(this.product());
    }
  }
}
