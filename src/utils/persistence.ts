import { isSectionId } from '../constants/sections';
import type { Item } from '../models/item';
import { calculateItemTotalCents } from './totals';
import { isValidItemInput } from './validation';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isItem(value: unknown): value is Item {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.name === 'string' &&
    isSectionId(value.sectionId) &&
    typeof value.quantity === 'number' &&
    typeof value.unitPriceCents === 'number' &&
    (value.status === 'pendente' || value.status === 'no_carrinho') &&
    isValidItemInput({
      name: value.name,
      sectionId: value.sectionId,
      quantity: value.quantity,
      unitPriceCents: value.unitPriceCents,
    }) &&
    Number.isSafeInteger(
      calculateItemTotalCents({
        quantity: value.quantity,
        unitPriceCents: value.unitPriceCents,
      }),
    )
  );
}

/** Nunca transforma JSON corrompido ou esquema desconhecido em uma lista vazia. */
export function isPersistedItems(value: unknown): value is { items: Item[] } {
  if (!isRecord(value) || !Array.isArray(value.items) || !value.items.every(isItem)) {
    return false;
  }

  const items: Item[] = value.items;
  return new Set(items.map((item) => item.id)).size === items.length;
}
