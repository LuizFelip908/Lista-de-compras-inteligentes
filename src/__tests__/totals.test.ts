import type { Item } from '../models/item';
import { calculateItemTotalCents, calculateTotals } from '../utils/totals';
import { createItem } from './helpers';

describe('calculateTotals', () => {
  it('retorna todos os totais e contagens zerados para uma lista vazia', () => {
    expect(calculateTotals([])).toEqual({
      totalCents: 0,
      cartCents: 0,
      pendingCents: 0,
      itemCount: 0,
      cartCount: 0,
      pendingCount: 0,
    });
  });

  it('calcula o subtotal dos itens no carrinho', () => {
    const items = [
      createItem({ id: 'a', status: 'no_carrinho', quantity: 2, unitPriceCents: 750 }),
      createItem({ id: 'b', status: 'no_carrinho', quantity: 1, unitPriceCents: 1299 }),
    ];

    expect(calculateTotals(items)).toEqual({
      totalCents: 2799,
      cartCents: 2799,
      pendingCents: 0,
      itemCount: 2,
      cartCount: 2,
      pendingCount: 0,
    });
  });

  it('calcula o subtotal dos itens pendentes', () => {
    const items = [createItem({ quantity: 3, unitPriceCents: 425 })];

    expect(calculateTotals(items)).toMatchObject({
      totalCents: 1275,
      cartCents: 0,
      pendingCents: 1275,
      pendingCount: 1,
    });
  });

  it('separa os subtotais e mantém o total geral ao alternar o status', () => {
    const pending = createItem({ quantity: 2, unitPriceCents: 1234 });
    const cart = createItem({ id: 'item-2', status: 'no_carrinho', unitPriceCents: 599 });
    const before = calculateTotals([pending, cart]);
    const after = calculateTotals([{ ...pending, status: 'no_carrinho' }, cart]);

    expect(before).toEqual({
      totalCents: 3067,
      cartCents: 599,
      pendingCents: 2468,
      itemCount: 2,
      cartCount: 1,
      pendingCount: 1,
    });
    expect(after.totalCents).toBe(before.totalCents);
    expect(after.cartCents).toBe(3067);
    expect(after.pendingCents).toBe(0);
  });

  it('aceita preço zero e conta linhas, não unidades', () => {
    const items = [
      createItem({ quantity: 5, unitPriceCents: 0 }),
      createItem({ id: 'item-2', quantity: 3, unitPriceCents: 10 }),
    ];

    expect(calculateTotals(items)).toMatchObject({
      totalCents: 30,
      itemCount: 2,
      pendingCount: 2,
    });
  });

  it('soma quantidades e preços variados sem erro de ponto flutuante', () => {
    const items = [
      createItem({ quantity: 3, unitPriceCents: 10 }),
      createItem({ id: 'item-2', quantity: 1, unitPriceCents: 1999 }),
    ];

    expect(calculateTotals(items).totalCents).toBe(2029);
  });

  it('não modifica a lista recebida', () => {
    const items: readonly Item[] = Object.freeze([createItem()]);
    const original = JSON.stringify(items);
    calculateTotals(items);
    expect(JSON.stringify(items)).toBe(original);
  });
});

describe('calculateItemTotalCents', () => {
  it('multiplica quantidade pelo preço unitário em centavos', () => {
    expect(calculateItemTotalCents({ quantity: 3, unitPriceCents: 1234 })).toBe(3702);
  });
});
