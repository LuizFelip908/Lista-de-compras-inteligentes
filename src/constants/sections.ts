import type { ComponentProps } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import type { SectionId } from '../models/item';

export interface SectionDefinition {
  id: SectionId;
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  backgroundColor: string;
}

/** A ordem desta coleção é a ordem dos grupos na lista. */
export const SECTIONS: readonly SectionDefinition[] = [
  {
    id: 'hortifruti',
    label: 'Hortifrúti',
    icon: 'leaf',
    color: '#287347',
    backgroundColor: '#EAF4E8',
  },
  {
    id: 'acougue',
    label: 'Açougue',
    icon: 'food-steak',
    color: '#A13E3E',
    backgroundColor: '#FAECEC',
  },
  {
    id: 'padaria',
    label: 'Padaria',
    icon: 'bread-slice',
    color: '#94621C',
    backgroundColor: '#FBF1DF',
  },
  {
    id: 'laticinios',
    label: 'Laticínios',
    icon: 'cheese',
    color: '#94621C',
    backgroundColor: '#FFF6D9',
  },
  {
    id: 'mercearia',
    label: 'Mercearia',
    icon: 'basket-outline',
    color: '#805431',
    backgroundColor: '#F3EDE6',
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    icon: 'bottle-wine-outline',
    color: '#356B91',
    backgroundColor: '#EAF2F9',
  },
  {
    id: 'limpeza',
    label: 'Limpeza',
    icon: 'broom',
    color: '#397777',
    backgroundColor: '#E8F3F2',
  },
  {
    id: 'higiene',
    label: 'Higiene',
    icon: 'hand-wash-outline',
    color: '#765493',
    backgroundColor: '#F1ECF7',
  },
];

export function isSectionId(value: unknown): value is SectionId {
  return typeof value === 'string' && SECTIONS.some((section) => section.id === value);
}

export function getSection(id: SectionId): SectionDefinition {
  const section = SECTIONS.find((candidate) => candidate.id === id);
  if (!section) {
    throw new Error(`Seção desconhecida: ${id}`);
  }
  return section;
}
