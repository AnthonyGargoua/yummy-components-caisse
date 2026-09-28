import { Component, inject, signal } from '@angular/core';

import { CATEGORIES, Product } from '../models';
import { CatalogService } from '../services/catalog.service';
import { ProductCard } from './product-card';
import { NoteService } from '../services/note.service';
import { NotePanel } from './note-panel';

@Component({
  imports: [ProductCard, NotePanel],
  templateUrl: './caisse-page.html',
  styleUrl: './caisse-page.css',
})
export class CaissePage {
  private readonly catalog = inject(CatalogService);
  protected readonly note = inject(NoteService);

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

  protected availableFor(product: Product): number {
    return product.stock - (this.note.quantityByProduct().get(product.id) ?? 0);
  }
}
