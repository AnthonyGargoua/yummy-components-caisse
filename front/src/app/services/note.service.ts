import { computed, Service, signal } from '@angular/core';

import { Product } from '../models';

export interface NoteLine {
  product: Product;
  quantity: number;
}

@Service()
export class NoteService {
  readonly lines = signal<NoteLine[]>([]);

  readonly total = computed(() =>
    this.lines().reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  );

  readonly quantityByProduct = computed(() => {
    const map = new Map<number, number>();
    for (const line of this.lines()) {
      map.set(line.product.id, line.quantity);
    }
    return map;
  });

  add(product: Product): void {
    this.lines.update((lines) => {
      const existing = lines.find((l) => l.product.id === product.id);
      if (existing) {
        return lines.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...lines, { product, quantity: 1 }];
    });
  }

  decrease(productId: number): void {
    this.lines.update((lines) =>
      lines
        .map((l) => (l.product.id === productId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  remove(productId: number): void {
    this.lines.update((lines) => lines.filter((l) => l.product.id !== productId));
  }

  clear(): void {
    this.lines.set([]);
  }
}
