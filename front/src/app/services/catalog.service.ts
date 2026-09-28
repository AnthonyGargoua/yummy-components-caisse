import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api';
import { Formula, Product } from '../models';
import { firstValueFrom } from 'rxjs';

@Service()
export class CatalogService {
  private readonly http = inject(HttpClient);

  getProducts(): Promise<Product[]> {
    return firstValueFrom(this.http.get<Product[]>(`${API_URL}/products`));
  }

  getFormulas(): Promise<Formula[]> {
    return firstValueFrom(this.http.get<Formula[]>(`${API_URL}/formulas`));
  }
}
