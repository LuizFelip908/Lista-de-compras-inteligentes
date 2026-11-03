import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

export const LIST_STORAGE_KEY = 'lista-compras-inteligente:list:v1';

/** Wrapper fino: a serialização e o envelope de versão ficam a cargo do persist. */
export const listStorage: StateStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
