import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Item, ItemInput, Totals } from '../models/item';
import { LIST_STORAGE_KEY, listStorage } from '../services/storage';
import { createItemId } from '../utils/id';
import { isPersistedItems } from '../utils/persistence';
import { calculateTotals } from '../utils/totals';
import { isValidItemInput } from '../utils/validation';

export type HydrationStatus = 'loading' | 'ready' | 'error';

interface ListState {
  items: Item[];
  hydrationStatus: HydrationStatus;
  persistenceError: boolean;
  addItem: (input: ItemInput) => void;
  updateItem: (id: string, input: ItemInput) => void;
  deleteItem: (id: string) => void;
  toggleItem: (id: string) => void;
}

type PersistedListState = Pick<ListState, 'items'>;

function assertItemInput(input: ItemInput): void {
  if (!isValidItemInput(input)) {
    throw new Error('Dados do item inválidos.');
  }
}

export const useListStore = create<ListState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrationStatus: 'loading',
      persistenceError: false,

      addItem: (input) => {
        if (get().hydrationStatus !== 'ready') return;
        assertItemInput(input);
        const item: Item = { ...input, id: createItemId(), status: 'pendente' };
        set((state) => ({ items: [...state.items, item] }));
      },

      updateItem: (id, input) => {
        if (get().hydrationStatus !== 'ready') return;
        assertItemInput(input);
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...input } : item)),
        }));
      },

      deleteItem: (id) => {
        if (get().hydrationStatus !== 'ready') return;
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },

      toggleItem: (id) => {
        if (get().hydrationStatus !== 'ready') return;
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, status: item.status === 'pendente' ? 'no_carrinho' : 'pendente' }
              : item,
          ),
        }));
      },
    }),
    {
      name: LIST_STORAGE_KEY,
      version: 1,
      skipHydration: true,
      partialize: (state): PersistedListState => ({ items: state.items }),
      storage: createJSONStorage<PersistedListState>(() => ({
        getItem: (key) => listStorage.getItem(key),
        setItem: async (key, value) => {
          // Não sobrescreve o disco durante a leitura, em erro de leitura ou antes da reidratação.
          if (useListStore.getState().hydrationStatus !== 'ready') return;

          try {
            await listStorage.setItem(key, value);
            if (useListStore.getState().persistenceError) {
              useListStore.setState({ persistenceError: false });
            }
          } catch {
            // Mantém a alteração em memória e informa a UI. O guard evita um ciclo de novas gravacoes.
            if (!useListStore.getState().persistenceError) {
              useListStore.setState({ persistenceError: true });
            }
          }
        },
        removeItem: (key) => listStorage.removeItem(key),
      })),
      merge: (persisted, current) => {
        if (persisted === undefined) {
          return { ...current, hydrationStatus: 'ready' };
        }
        if (!isPersistedItems(persisted)) {
          throw new Error('Os dados salvos não têm um formato válido.');
        }
        return { ...current, items: persisted.items, hydrationStatus: 'ready' };
      },
      migrate: (_persisted, version) => {
        // Sem migração conhecida, preserva os dados e mostra o estado de erro.
        throw new Error(`Versão de dados não suportada: ${version}`);
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          useListStore.setState({ hydrationStatus: 'error' });
        }
      },
    },
  ),
);

/** Selector puro: os totais nunca são gravados nem duplicados na store. */
export function selectTotals(state: Pick<ListState, 'items'>): Totals {
  return calculateTotals(state.items);
}

let hydrationTask: Promise<void> | undefined;

/** Compartilha a leitura entre montagens/re-renderizações e permite tentar novamente após erro. */
export function hydrateListStore(): Promise<void> {
  if (!hydrationTask) {
    hydrationTask = Promise.resolve(useListStore.persist.rehydrate()).finally(() => {
      hydrationTask = undefined;
    });
  }
  return hydrationTask;
}

export function retryListHydration(): Promise<void> {
  useListStore.setState({ hydrationStatus: 'loading' });
  return hydrateListStore();
}
