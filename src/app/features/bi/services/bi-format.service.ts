import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BiFormatService {
  formatCurrency(value: number | null | undefined, currency = ''): string {
    const amount = value ?? 0;
    const cur = currency ? ` ${currency}` : '';

    if (amount >= 1_000_000_000) {
      return (amount / 1_000_000_000).toFixed(2).replace('.', ',') + ` B${cur}`;
    }

    if (amount >= 1_000_000) {
      return (amount / 1_000_000).toFixed(2).replace('.', ',') + ` M${cur}`;
    }

    if (amount >= 1_000) {
      return (amount / 1_000).toFixed(2).replace('.', ',') + ` K${cur}`;
    }

    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + cur;
  }

  formatNumber(value: number | null | undefined): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }
}
