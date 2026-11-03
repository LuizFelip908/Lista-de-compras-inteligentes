import { groupItemsBySection } from '../utils/grouping';
import { createItem } from './helpers';

describe('groupItemsBySection', () => {
  it('não cria grupos para uma lista vazia', () => {
    expect(groupItemsBySection([])).toEqual([]);
  });

  it('agrupa na ordem fixa das seções e omite seções vazias', () => {
    const groups = groupItemsBySection([
      createItem({ id: 'a', sectionId: 'higiene' }),
      createItem({ id: 'b', sectionId: 'hortifruti' }),
      createItem({ id: 'c', sectionId: 'hortifruti' }),
    ]);

    expect(groups.map((group) => group.section.id)).toEqual(['hortifruti', 'higiene']);
    expect(groups[0]?.items.map((item) => item.id)).toEqual(['b', 'c']);
    expect(groups[1]?.items).toHaveLength(1);
  });
});
