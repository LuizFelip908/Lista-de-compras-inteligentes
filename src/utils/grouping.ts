import { SECTIONS, type SectionDefinition } from '../constants/sections';
import type { Item } from '../models/item';

export interface SectionGroupData {
  section: SectionDefinition;
  items: Item[];
}

/** Preserva a ordem fixa das seções e a ordem de inserção dos itens dentro de cada grupo. */
export function groupItemsBySection(items: readonly Item[]): SectionGroupData[] {
  return SECTIONS.map((section) => ({
    section,
    items: items.filter((item) => item.sectionId === section.id),
  })).filter((group) => group.items.length > 0);
}
