import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EurosPipe } from '../shared/euros-pipe';
import { DailyTotal } from '../models';

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

@Component({
  imports: [DatePipe, EurosPipe],
  selector: 'app-daily-totals',
  styleUrl: './daily-totals.css',
  templateUrl: './daily-totals.html',
})
export class DailyTotals {
  readonly totals = input.required<DailyTotal[]>();
  protected readonly today = todayIso();
}
