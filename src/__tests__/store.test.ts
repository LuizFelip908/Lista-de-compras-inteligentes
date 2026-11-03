import AsyncStorage from '@react-native-async-storage/async-storage';

import { LIST_STORAGE_KEY } from '../services/storage';
import {
  hydrateListStore,
  retryListHydration,
  selectTotals,
  useListStore,
} from '../store/useListStore';
import { createItem, createItemInput } from './helpers';

const initialState = useListStore.getInitialState();

async function flushPromises(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
}

function resetInMemoryState(): void {
  useListStore.setState(
    { ...initialState, items: [], hydrationStatus: 'loading', persistenceError: false },
    true,
  );
}

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
  resetInMemoryState();
});

describe('useListStore — CRUD e status', () => {
  beforeEach(async () => {
    await hydrateListStore();
  });

  it('adiciona item pendente com identificador único e dados normalizados', () => {
    useListStore.getState().addItem(createItemInput({ name: 'Banana', sectionId: 'hortifruti' }));
    useListStore.getState().addItem(createItemInput({ name: 'Leite', sectionId: 'laticinios' }));

    const { items } = useListStore.getState();
    expect(items).toHaveLength(2);
    expect(items[0]?.id).not.toBe(items[1]?.id);
    expect(items[0]).toMatchObject({ name: 'Banana', sectionId: 'hortifruti', status: 'pendente' });
  });

  it('edita nome, seção, quantidade e preço sem alterar id ou status', async () => {
    useListStore.getState().addItem(createItemInput());
    const original = useListStore.getState().items[0];
    expect(original).toBeDefined();
    if (!original) return;

    useListStore.getState().toggleItem(original.id);
    useListStore.getState().updateItem(
      original.id,
      createItemInput({
        name: 'Feijão preto',
        sectionId: 'bebidas',
        quantity: 4,
        unitPriceCents: 999,
      }),
    );

    expect(useListStore.getState().items[0]).toEqual({
      id: original.id,
      status: 'no_carrinho',
      name: 'Feijão preto',
      sectionId: 'bebidas',
      quantity: 4,
      unitPriceCents: 999,
    });
  });

  it('exclui somente o item solicitado e aceita exclusão de id inexistente sem efeito', () => {
    useListStore.getState().addItem(createItemInput());
    useListStore.getState().addItem(createItemInput({ name: 'Leite' }));
    const [first, second] = useListStore.getState().items;
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) return;

    useListStore.getState().deleteItem(first.id);
    useListStore.getState().deleteItem('inexistente');
    expect(useListStore.getState().items).toEqual([second]);
  });

  it('alterna o status nos dois sentidos e recalcula os subtotais sem mudar o total geral', () => {
    useListStore.getState().addItem(createItemInput({ quantity: 2, unitPriceCents: 1234 }));
    const item = useListStore.getState().items[0];
    expect(item).toBeDefined();
    if (!item) return;

    const totalBefore = selectTotals(useListStore.getState()).totalCents;
    useListStore.getState().toggleItem(item.id);
    expect(useListStore.getState().items[0]?.status).toBe('no_carrinho');
    expect(selectTotals(useListStore.getState())).toMatchObject({
      totalCents: totalBefore,
      cartCents: 2468,
      pendingCents: 0,
    });

    useListStore.getState().toggleItem(item.id);
    expect(useListStore.getState().items[0]?.status).toBe('pendente');
    expect(selectTotals(useListStore.getState())).toMatchObject({
      cartCents: 0,
      pendingCents: 2468,
    });
  });

  it('rejeita dados inválidos na camada de domínio sem modificar a lista', () => {
    expect(() => useListStore.getState().addItem(createItemInput({ quantity: 0 }))).toThrow(
      'Dados do item inválidos.',
    );
    expect(useListStore.getState().items).toEqual([]);
  });

  it('persiste apenas itens, sem flags de interface ou totais duplicados', async () => {
    useListStore.getState().addItem(createItemInput());
    await flushPromises();
    const raw = await AsyncStorage.getItem(LIST_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const saved = JSON.parse(raw ?? '{}') as { version: number; state: Record<string, unknown> };

    expect(saved.version).toBe(1);
    expect(Object.keys(saved.state)).toEqual(['items']);
    expect(useListStore.getState().persistenceError).toBe(false);
  });
});

describe('useListStore — reidratação e falhas de armazenamento', () => {
  it('mantém loading até terminar a leitura e não mostra uma lista vazia intermediária', async () => {
    let resolveRead: (value: string | null) => void = () => undefined;
    const pendingRead = new Promise<string | null>((resolve) => {
      resolveRead = resolve;
    });
    jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(() => pendingRead);

    const hydration = hydrateListStore();
    expect(useListStore.getState().hydrationStatus).toBe('loading');
    resolveRead(null);
    await hydration;

    expect(useListStore.getState().hydrationStatus).toBe('ready');
    expect(useListStore.getState().items).toEqual([]);
  });

  it('restaura os itens salvos após simular um novo carregamento da store', async () => {
    await hydrateListStore();
    useListStore.getState().addItem(createItemInput({ name: 'Café', unitPriceCents: 1599 }));
    await flushPromises();
    const savedItems = useListStore.getState().items;

    resetInMemoryState();
    await hydrateListStore();

    expect(useListStore.getState().hydrationStatus).toBe('ready');
    expect(useListStore.getState().items).toEqual(savedItems);
    expect(selectTotals(useListStore.getState()).totalCents).toBe(3198);
  });

  it('compartilha uma única leitura quando a hidratação é solicitada duas vezes', async () => {
    const readSpy = jest.spyOn(AsyncStorage, 'getItem');
    await Promise.all([hydrateListStore(), hydrateListStore()]);
    expect(readSpy).toHaveBeenCalledTimes(1);
  });

  it('não permite mutações antes da reidratação', async () => {
    const writeSpy = jest.spyOn(AsyncStorage, 'setItem');
    useListStore.getState().addItem(createItemInput());
    useListStore.getState().toggleItem('qualquer');
    await flushPromises();

    expect(useListStore.getState().items).toEqual([]);
    expect(writeSpy).not.toHaveBeenCalled();
  });

  it.each(['{json inválido', JSON.stringify({ state: { items: [{ id: 'x' }] }, version: 1 })])(
    'preserva dados corrompidos e entra em erro, sem sobrescrever o disco: %s',
    async (raw) => {
      await AsyncStorage.setItem(LIST_STORAGE_KEY, raw);
      const writeSpy = jest.spyOn(AsyncStorage, 'setItem');
      writeSpy.mockClear();
      await hydrateListStore();

      expect(useListStore.getState().hydrationStatus).toBe('error');
      expect(useListStore.getState().items).toEqual([]);
      expect(writeSpy).not.toHaveBeenCalled();
      expect(await AsyncStorage.getItem(LIST_STORAGE_KEY)).toBe(raw);
    },
  );

  it('rejeita itens duplicados e versão desconhecida sem apagá-los', async () => {
    const duplicated = { state: { items: [createItem(), createItem()] }, version: 1 };
    await AsyncStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(duplicated));
    await hydrateListStore();
    expect(useListStore.getState().hydrationStatus).toBe('error');

    const futureVersion = { state: { items: [] }, version: 999 };
    await AsyncStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(futureVersion));
    await retryListHydration();
    expect(useListStore.getState().hydrationStatus).toBe('error');
    expect(JSON.parse((await AsyncStorage.getItem(LIST_STORAGE_KEY)) ?? '{}')).toEqual(
      futureVersion,
    );
  });

  it('permite tentar novamente após uma falha transitória de leitura', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Falha temporária'));
    await hydrateListStore();
    expect(useListStore.getState().hydrationStatus).toBe('error');

    await retryListHydration();
    expect(useListStore.getState().hydrationStatus).toBe('ready');
  });

  it('mantém alterações em memória quando a gravação falha e sinaliza recuperação', async () => {
    await hydrateListStore();
    // A primeira gravação e a tentativa de atualizar a flag de erro também falham.
    jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValueOnce(new Error('Disco cheio'))
      .mockRejectedValueOnce(new Error('Disco cheio'));
    useListStore.getState().addItem(createItemInput());
    await flushPromises();

    expect(useListStore.getState().items).toHaveLength(1);
    expect(useListStore.getState().persistenceError).toBe(true);

    const item = useListStore.getState().items[0];
    expect(item).toBeDefined();
    if (!item) return;
    useListStore.getState().toggleItem(item.id);
    await flushPromises();

    expect(useListStore.getState().persistenceError).toBe(false);
    const raw = await AsyncStorage.getItem(LIST_STORAGE_KEY);
    expect(JSON.parse(raw ?? '{}').state.items[0].status).toBe('no_carrinho');
  });
});
