import type { ItemFormValues, ItemInput } from '../models/item';
import { isValidItemInput, parseQuantity, validateItemForm } from '../utils/validation';
import { createItemInput } from './helpers';

const validForm: ItemFormValues = {
  name: '  Maçã   nacional ',
  sectionId: 'hortifruti',
  quantity: '3',
  unitPrice: '12,34',
};

describe('validateItemForm', () => {
  it('normaliza nome, quantidade e preço em centavos', () => {
    expect(validateItemForm(validForm)).toEqual({
      data: { name: 'Maçã nacional', sectionId: 'hortifruti', quantity: 3, unitPriceCents: 1234 },
      errors: {},
    });
  });

  it('exige nome, quantidade inteira positiva e preço válido', () => {
    const result = validateItemForm({
      ...validForm,
      name: '   ',
      quantity: '1,5',
      unitPrice: '-2',
    });
    expect(result.data).toBeNull();
    expect(Object.keys(result.errors)).toEqual(['name', 'quantity', 'unitPrice']);
  });

  it('aceita item gratuito, mas não preço negativo ou com mais de duas casas', () => {
    expect(validateItemForm({ ...validForm, unitPrice: '0' }).data?.unitPriceCents).toBe(0);
    expect(validateItemForm({ ...validForm, unitPrice: '1,234' }).errors.unitPrice).toBeDefined();
  });

  it('rejeita seção desconhecida mesmo se o tipo for contornado em tempo de execução', () => {
    const result = validateItemForm({
      ...validForm,
      sectionId: 'invalida' as ItemFormValues['sectionId'],
    });
    expect(result.data).toBeNull();
    expect(result.errors.sectionId).toBeDefined();
  });
});

describe('parseQuantity', () => {
  it.each(['1', '01', ' 2 ', '999'])('aceita %s', (input) => {
    expect(parseQuantity(input)).toBe(Number(input));
  });

  it.each(['', '0', '-1', '1.5', '1,5', 'abc', '1e2', '99999999999999999999'])(
    'rejeita %s',
    (input) => {
      expect(parseQuantity(input)).toBeNull();
    },
  );
});

describe('isValidItemInput', () => {
  it('aceita dados normalizados', () => {
    expect(isValidItemInput(createItemInput())).toBe(true);
  });

  it.each([
    { name: ' ' },
    { quantity: 0 },
    { quantity: 1.5 },
    { quantity: NaN },
    { unitPriceCents: -1 },
    { unitPriceCents: 1.5 },
    { unitPriceCents: Infinity },
    { sectionId: 'invalida' as ItemInput['sectionId'] },
  ])('rejeita entrada inválida: %s', (overrides) => {
    expect(isValidItemInput(createItemInput(overrides))).toBe(false);
  });
});
