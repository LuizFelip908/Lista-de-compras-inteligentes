import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import HomeScreen from '../screens/HomeScreen';
import { hydrateListStore, selectTotals, useListStore } from '../store/useListStore';
import { createItemInput } from './helpers';

const initialState = useListStore.getInitialState();

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
  useListStore.setState(
    { ...initialState, items: [], hydrationStatus: 'loading', persistenceError: false },
    true,
  );
  await hydrateListStore();
});

describe('HomeScreen', () => {
  it('mostra carregamento sem piscar a lista vazia durante a reidratação', async () => {
    let resolveRead: (value: string | null) => void = () => undefined;
    const pendingRead = new Promise<string | null>((resolve) => {
      resolveRead = resolve;
    });
    jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(() => pendingRead);
    useListStore.setState({ hydrationStatus: 'loading' });
    await render(<HomeScreen />);

    expect(screen.getByText('Restaurando sua lista…')).toBeOnTheScreen();
    expect(screen.queryByText('Sua lista está vazia')).toBeNull();
    await act(async () => {
      resolveRead(null);
    });
    await waitFor(() => expect(screen.getByText('Sua lista está vazia')).toBeOnTheScreen());
  });

  it('mostra estado vazio amigável e totais zerados quando não há itens', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText('Sua lista está vazia')).toBeOnTheScreen();
    expect(
      screen.getByText('Toque em + para adicionar seu primeiro item de supermercado.'),
    ).toBeOnTheScreen();
    expect(screen.getAllByText('R$ 0,00').length).toBeGreaterThan(0);
  });

  it('cria item pelo formulário, agrupa por seção e atualiza os totais', async () => {
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByLabelText('Adicionar item'));
    await fireEvent.changeText(screen.getByLabelText('Nome do item'), 'Banana');
    await fireEvent.press(screen.getByLabelText('Seção Hortifrúti'));
    await fireEvent.changeText(screen.getByLabelText('Quantidade'), '2');
    await fireEvent.changeText(screen.getByLabelText('Preço unitário em reais'), '7,50');
    await fireEvent.press(screen.getByLabelText('Salvar item'));

    expect(screen.getByText('Banana')).toBeOnTheScreen();
    expect(screen.getByText('Hortifrúti')).toBeOnTheScreen();
    expect(screen.getAllByText('1 item').length).toBeGreaterThan(0);
    expect(selectTotals(useListStore.getState())).toMatchObject({
      totalCents: 1500,
      pendingCents: 1500,
      cartCents: 0,
    });
  });

  it('exibe validações do formulário e não salva dados inválidos', async () => {
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByLabelText('Adicionar item'));
    await fireEvent.press(screen.getByLabelText('Salvar item'));

    expect(screen.getByText('Informe o nome do item.')).toBeOnTheScreen();
    expect(
      screen.getByText('Informe um preço válido e não negativo, como 12,34.'),
    ).toBeOnTheScreen();
    expect(useListStore.getState().items).toHaveLength(0);
  });

  it('alterna status com feedback tátil e mantém o total geral', async () => {
    useListStore
      .getState()
      .addItem(createItemInput({ name: 'Leite', quantity: 2, unitPriceCents: 500 }));
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByRole('checkbox', { name: /Leite/ }));

    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(useListStore.getState().items[0]?.status).toBe('no_carrinho');
    expect(selectTotals(useListStore.getState())).toMatchObject({
      totalCents: 1000,
      cartCents: 1000,
      pendingCents: 0,
    });
  });

  it('edita o preço de um item existente e recalcula o total', async () => {
    useListStore
      .getState()
      .addItem(createItemInput({ name: 'Café', quantity: 2, unitPriceCents: 1500 }));
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByLabelText('Editar Café'));
    await fireEvent.changeText(screen.getByLabelText('Preço unitário em reais'), '10,00');
    await fireEvent.press(screen.getByLabelText('Salvar alterações'));

    expect(useListStore.getState().items[0]?.unitPriceCents).toBe(1000);
    expect(selectTotals(useListStore.getState()).totalCents).toBe(2000);
  });

  it('pede confirmação antes de excluir e remove o item ao confirmar', async () => {
    useListStore.getState().addItem(createItemInput({ name: 'Sabão' }));
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.style === 'destructive')?.onPress?.();
    });
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByLabelText('Excluir Sabão'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Excluir item?',
      expect.stringContaining('Sabão'),
      expect.any(Array),
    );
    expect(useListStore.getState().items).toHaveLength(0);
    expect(screen.getByText('Sua lista está vazia')).toBeOnTheScreen();
  });

  it('exibe contagem por seção e cabeçalhos apenas das seções utilizadas', async () => {
    useListStore.getState().addItem(createItemInput({ name: 'Maçã', sectionId: 'hortifruti' }));
    useListStore.getState().addItem(createItemInput({ name: 'Banana', sectionId: 'hortifruti' }));
    useListStore.getState().addItem(createItemInput({ name: 'Pão', sectionId: 'padaria' }));
    await render(<HomeScreen />);

    expect(screen.getByText('Hortifrúti')).toBeOnTheScreen();
    expect(screen.getByText('Padaria')).toBeOnTheScreen();
    expect(screen.queryByText('Açougue')).toBeNull();
    expect(screen.getByText('2 itens')).toBeOnTheScreen();
    expect(screen.getByText('2 seções')).toBeOnTheScreen();
  });

  it('permite tentar novamente após erro de reidratação', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Falha de leitura'));
    useListStore.setState({ hydrationStatus: 'loading' });
    await render(<HomeScreen />);
    expect(screen.getByText('Não foi possível carregar')).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText('Tentar carregar a lista novamente'));

    await waitFor(() => expect(screen.getByText('Sua lista está vazia')).toBeOnTheScreen());
    expect(useListStore.getState().hydrationStatus).toBe('ready');
  });
});
