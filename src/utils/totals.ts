import type { Item, Totals } from '../models/item';

export function calculateItemTotalCents(item: Pick<Item, 'quantity' | 'unitPriceCents'>): number {
  return item.quantity * item.unitPriceCents;
}

/** Função pura: não altera os itens e trata ambos os status como parte do total geral. */
export function calculateTotals(items: readonly Item[]): Totals {
  const totals: Totals = {
    totalCents: 0,
    cartCents: 0,
    pendingCents: 0,
    itemCount: items.length,
    cartCount: 0,
    pendingCount: 0,
  };

  for (const item of items) {
    const itemTotal = calculateItemTotalCents(item);
    totals.totalCents += itemTotal;

    if (item.status === 'no_carrinho') {
      totals.cartCents += itemTotal;
      totals.cartCount += 1;
    } else {
      totals.pendingCents += itemTotal;
      totals.pendingCount += 1;
    }
  }

  return totals;
}
