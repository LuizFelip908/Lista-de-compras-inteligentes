import AsyncStorage from '@react-native-async-storage/async-storage';

import { LIST_STORAGE_KEY, listStorage } from '../services/storage';
import { createItemId } from '../utils/id';

describe('listStorage', () => {
  it('delega leitura, gravação e exclusão ao AsyncStorage nativo', async () => {
    await listStorage.setItem(LIST_STORAGE_KEY, 'valor');
    expect(await listStorage.getItem(LIST_STORAGE_KEY)).toBe('valor');
    await listStorage.removeItem(LIST_STORAGE_KEY);
    expect(await listStorage.getItem(LIST_STORAGE_KEY)).toBeNull();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(LIST_STORAGE_KEY, 'valor');
  });
});

describe('createItemId', () => {
  it('gera identificadores não vazios e únicos no mesmo milissegundo', () => {
    jest.spyOn(Date, 'now').mockReturnValue(123456789);
    const ids = Array.from({ length: 1000 }, () => createItemId());
    expect(new Set(ids).size).toBe(1000);
    expect(ids.every((id) => id.startsWith('item-'))).toBe(true);
  });
});
