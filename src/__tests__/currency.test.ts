import { formatCurrency, parseCurrencyToCents } from '../utils/currency';

describe('parseCurrencyToCents', () => {
  it.each([
    ['12,34', 1234],
    ['12.34', 1234],
    ['12', 1200],
    ['12,3', 1230],
    ['0', 0],
    ['0,00', 0],
    ['0,05', 5],
    ['  12,34  ', 1234],
    ['R$ 12,34', 1234],
    ['1.23', 123],
    ['0012,34', 1234],
  ])('converte %s para %i centavos', (input, expected) => {
    expect(parseCurrencyToCents(input)).toBe(expected);
  });

  it.each(['', ' ', '-1', '-0,01', '12,345', '1,2,3', '1.234,56', 'abc', '1e3', 'NaN', ',5'])(
    'rejeita a entrada inválida %s sem arredondar silenciosamente',
    (input) => {
      expect(parseCurrencyToCents(input)).toBeNull();
    },
  );

  it('rejeita valores que não podem ser representados com segurança', () => {
    expect(parseCurrencyToCents('99999999999999999999')).toBeNull();
  });
});

describe('formatCurrency', () => {
  it.each([
    [0, 'R$ 0,00'],
    [5, 'R$ 0,05'],
    [100, 'R$ 1,00'],
    [1234, 'R$ 12,34'],
    [123456, 'R$ 1.234,56'],
    [123456789, 'R$ 1.234.567,89'],
    [-1234, '-R$ 12,34'],
  ])('formata %i centavos como %s', (cents, expected) => {
    expect(formatCurrency(cents)).toBe(expected);
  });

  it.each([1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejeita centavos inválidos: %s',
    (cents) => {
      expect(() => formatCurrency(cents)).toThrow(RangeError);
    },
  );

  it('faz o ciclo de conversão e formatação sem perder centavos', () => {
    expect(formatCurrency(parseCurrencyToCents('12,34') ?? -1)).toBe('R$ 12,34');
  });
});
