import { inject, Service } from '@angular/core';
import { API_URL } from '../api';
import { DailyTotal, Order, OrderRequest } from '../models';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Service()
export class OrderService {
  private readonly http = inject(HttpClient);

  pay(request: OrderRequest): Promise<Order> {
    return firstValueFrom(this.http.post<Order>(`${API_URL}/orders`, request));
  }

  getDailyTotals(): Promise<DailyTotal[]> {
    return firstValueFrom(this.http.get<DailyTotal[]>(`${API_URL}/orders/daily-totals`));
  }
}
