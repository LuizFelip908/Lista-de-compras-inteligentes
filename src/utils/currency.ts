/**
 * Converte uma entrada não negativa para centavos, sem passar por parseFloat.
 * Aceita vírgula ou ponto decimal, com até duas casas; não aceita separador de milhar.
 */
export function parseCurrencyToCents(input: string): number | null {
  const normalized = input.trim().replace(/^R\$\s*/, '');
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [whole = '0', fraction = ''] = normalized.split(/[,.]/);
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** Formatação determinística em pt-BR, sem depender de Intl ou de uma biblioteca extra. */
export function formatCurrency(cents: number): string {
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError('O valor em centavos precisa ser um inteiro seguro.');
  }

  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const fraction = (absolute % 100).toString().padStart(2, '0');
  const sign = cents < 0 ? '-' : '';

  return `${sign}R$ ${whole},${fraction}`;
}
