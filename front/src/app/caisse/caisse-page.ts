import { Component, inject, signal } from '@angular/core';

import { CATEGORIES, Product } from '../models';
import { CatalogService } from '../services/catalog.service';
import { ProductCard } from './product-card';

@Component({
  imports: [ProductCard],
  templateUrl: './caisse-page.html',
  styleUrl: './caisse-page.css',
})
export class CaissePage {
  private readonly catalog = inject(CatalogService);

  protected readonly categories = CATEGORIES;
  protected readonly products = signal<Product[]>([]);

  constructor() {
    this.loadProducts();
  }

  protected async loadProducts(): Promise<void> {
    this.products.set(await this.catalog.getProducts());
  }

  protected productsIn(category: string): Product[] {
    return this.products().filter((p) => p.category === category);
  }
}
