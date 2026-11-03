import { isItem, isPersistedItems } from '../utils/persistence';
import { createItem } from './helpers';

describe('validação dos dados persistidos', () => {
  it('aceita um item válido e uma coleção válida', () => {
    expect(isItem(createItem())).toBe(true);
    expect(isPersistedItems({ items: [createItem()] })).toBe(true);
    expect(isPersistedItems({ items: [] })).toBe(true);
  });

  it.each([
    null,
    [],
    'item',
    { ...createItem(), id: '' },
    { ...createItem(), name: 123 },
    { ...createItem(), status: 'desconhecido' },
    { ...createItem(), sectionId: 'desconhecida' },
    { ...createItem(), quantity: 0 },
    { ...createItem(), unitPriceCents: -1 },
    { ...createItem(), quantity: Number.MAX_SAFE_INTEGER, unitPriceCents: 100 },
  ])('rejeita item inválido: %s', (value) => {
    expect(isItem(value)).toBe(false);
  });

  it('rejeita coleção cujo total agregado ultrapassa o limite seguro', () => {
    const large = Math.floor(Number.MAX_SAFE_INTEGER / 2) + 1;
    const items = [
      createItem({ id: 'a', quantity: large, unitPriceCents: 1 }),
      createItem({ id: 'b', quantity: large, unitPriceCents: 1 }),
    ];
    expect(isPersistedItems({ items })).toBe(false);
  });

  it.each([null, {}, { items: null }, { items: [null] }, { items: [createItem(), createItem()] }])(
    'rejeita coleção inválida: %s',
    (value) => {
      expect(isPersistedItems(value)).toBe(false);
    },
  );
});
