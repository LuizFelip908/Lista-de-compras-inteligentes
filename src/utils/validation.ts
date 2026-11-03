import { isSectionId } from '../constants/sections';
import type { ItemFormValues, ItemInput, ItemValidationResult } from '../models/item';
import { parseCurrencyToCents } from './currency';

export function parseQuantity(input: string): number | null {
  const normalized = input.trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const quantity = Number(normalized);
  return Number.isSafeInteger(quantity) && quantity >= 1 ? quantity : null;
}

export function isValidItemInput(input: ItemInput): boolean {
  return (
    input.name.trim().length > 0 &&
    isSectionId(input.sectionId) &&
    Number.isSafeInteger(input.quantity) &&
    input.quantity >= 1 &&
    Number.isSafeInteger(input.unitPriceCents) &&
    input.unitPriceCents >= 0 &&
    Number.isSafeInteger(input.quantity * input.unitPriceCents)
  );
}

export function validateItemForm(values: ItemFormValues): ItemValidationResult {
  const errors: ItemValidationResult['errors'] = {};
  const name = values.name.trim().replace(/\s+/g, ' ');
  const quantity = parseQuantity(values.quantity);
  const unitPriceCents = parseCurrencyToCents(values.unitPrice);

  if (!name) {
    errors.name = 'Informe o nome do item.';
  }
  if (!isSectionId(values.sectionId)) {
    errors.sectionId = 'Escolha uma seção do supermercado.';
  }
  if (quantity === null) {
    errors.quantity = 'Informe uma quantidade inteira maior ou igual a 1.';
  }
  if (unitPriceCents === null) {
    errors.unitPrice = 'Informe um preço válido e não negativo, como 12,34.';
  }
  if (
    quantity !== null &&
    unitPriceCents !== null &&
    !Number.isSafeInteger(quantity * unitPriceCents)
  ) {
    errors.unitPrice = 'O valor total do item excede o limite seguro de cálculo.';
  }

  if (
    !isSectionId(values.sectionId) ||
    quantity === null ||
    unitPriceCents === null ||
    Object.keys(errors).length > 0
  ) {
    return { data: null, errors };
  }

  return { data: { name, sectionId: values.sectionId, quantity, unitPriceCents }, errors };
}
