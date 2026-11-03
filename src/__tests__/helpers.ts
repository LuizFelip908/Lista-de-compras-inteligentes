import type { Item, ItemInput } from '../models/item';

export function createItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    name: 'Arroz',
    sectionId: 'mercearia',
    quantity: 1,
    unitPriceCents: 1000,
    status: 'pendente',
    ...overrides,
  };
}

export function createItemInput(overrides: Partial<ItemInput> = {}): ItemInput {
  return {
    name: 'Feijão',
    sectionId: 'mercearia',
    quantity: 2,
    unitPriceCents: 850,
    ...overrides,
  };
}
