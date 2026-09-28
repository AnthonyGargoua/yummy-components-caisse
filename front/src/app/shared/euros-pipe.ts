import { formatCurrency } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'euros' })
export class EurosPipe implements PipeTransform {
  transform(cents: number): string {
    return formatCurrency(cents / 100, 'fr', '€');
  }
}
