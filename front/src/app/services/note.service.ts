import { computed, Service, signal } from '@angular/core';

import { Formula, OrderRequest, Product } from '../models';

export interface ProductLine {
  kind: 'product';
  product: Product;
  quantity: number;
}

export interface FormulaLine {
  kind: 'formula';
  formula: Formula;
  main: Product;
  drink: Product;
  dessert: Product;
}

export type NoteLine = ProductLine | FormulaLine;

@Service()
export class NoteService {
  readonly lines = signal<NoteLine[]>([]);

  readonly total = computed(() =>
    this.lines().reduce(
      (sum, line) =>
        sum + (line.kind === 'product' ? line.product.price * line.quantity : line.formula.price),
      0,
    ),
  );

  readonly quantityByProduct = computed(() => {
    const map = new Map<number, number>();
    const add = (productId: number, amount: number) =>
      map.set(productId, (map.get(productId) ?? 0) + amount);

    for (const line of this.lines()) {
      if (line.kind === 'product') {
        add(line.product.id, line.quantity);
      } else {
        add(line.main.id, 1);
        add(line.drink.id, 1);
        add(line.dessert.id, 1);
      }
    }
    return map;
  });

  availableStock(product: Product): number {
    return product.stock - (this.quantityByProduct().get(product.id) ?? 0);
  }

  addProduct(product: Product): void {
    this.lines.update((lines) => {
      const existingLine = lines.find(
        (line): line is ProductLine => line.kind === 'product' && line.product.id === product.id,
      );
      if (existingLine) {
        return lines.map((line) =>
          line === existingLine ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...lines, { kind: 'product', product, quantity: 1 }];
    });
  }

  decreaseProduct(productId: number): void {
    this.lines.update((lines) =>
      lines
        .map((line) =>
          line.kind === 'product' && line.product.id === productId
            ? { ...line, quantity: line.quantity - 1 }
            : line,
        )
        .filter((line) => line.kind !== 'product' || line.quantity > 0),
    );
  }

  addFormula(formula: Formula, main: Product, drink: Product, dessert: Product): void {
    this.lines.update((lines) => [...lines, { kind: 'formula', formula, main, drink, dessert }]);
  }

  remove(index: number): void {
    this.lines.update((lines) => lines.filter((_, i) => i !== index));
  }

  clear(): void {
    this.lines.set([]);
  }

  toOrderRequest(): OrderRequest {
    const products: OrderRequest['products'] = [];
    const formulas: OrderRequest['formulas'] = [];

    for (const line of this.lines()) {
      if (line.kind === 'product') {
        products.push({ productId: line.product.id, quantity: line.quantity });
      } else {
        formulas.push({
          formulaId: line.formula.id,
          mainId: line.main.id,
          drinkId: line.drink.id,
          dessertId: line.dessert.id,
        });
      }
    }

    return { products, formulas };
  }
}
