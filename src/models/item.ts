export type SectionId =
  | 'hortifruti'
  | 'acougue'
  | 'padaria'
  | 'laticinios'
  | 'mercearia'
  | 'bebidas'
  | 'limpeza'
  | 'higiene';

export type ItemStatus = 'pendente' | 'no_carrinho';

/** Valores validados. O preço é armazenado em centavos, nunca como ponto flutuante. */
export interface ItemInput {
  name: string;
  sectionId: SectionId;
  quantity: number;
  unitPriceCents: number;
}

export interface Item extends ItemInput {
  id: string;
  status: ItemStatus;
}

/** Strings mantêm a digitação original até o envio do formulário. */
export interface ItemFormValues {
  name: string;
  sectionId: SectionId;
  quantity: string;
  unitPrice: string;
}

export type ItemFormErrors = Partial<Record<keyof ItemFormValues, string>>;

export interface ItemValidationResult {
  data: ItemInput | null;
  errors: ItemFormErrors;
}

/** Totais derivados; valores monetários em centavos e contagens em linhas de itens. */
export interface Totals {
  totalCents: number;
  cartCents: number;
  pendingCents: number;
  itemCount: number;
  cartCount: number;
  pendingCount: number;
}
