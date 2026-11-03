# Lista de Compras Inteligente

Aplicativo mobile em **React Native + Expo + TypeScript** para organizar itens de supermercado por seções, marcar o que já está no carrinho e acompanhar o valor acumulado em tempo real.

Projeto avaliativo da atividade **Aplicativos Multiplataforma (React Native / Flutter)** do curso de Análise e Desenvolvimento de Sistemas. O foco é demonstrar uma aplicação simples, completa, persistida localmente e executável no **Expo Go**.

> **Sem backend, sem login e sem dados falsos.** A lista começa vazia e todos os itens são criados pela pessoa usuária.

## Print da tela principal

> **Placeholder:** executar no Expo Go, capturar a tela principal com alguns itens e salvar a imagem em `docs/screenshot.png`. Depois, substituir este aviso por:
>
> `![Tela principal do aplicativo](docs/screenshot.png)`

## Funcionalidades

| Código | Funcionalidade               | Implementação                                                                                                                                                                   |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1     | Itens organizados por seções | Agrupamento na ordem fixa: Hortifrúti, Açougue, Padaria, Laticínios, Mercearia, Bebidas, Limpeza e Higiene. Cada grupo exibe cabeçalho, ícone e contagem de itens.              |
| F2     | Marcadores de status         | Toque alterna entre `pendente` e `no_carrinho`, com cor, ícone, texto e feedback tátil via `expo-haptics`.                                                                      |
| F3     | Totais em tempo real         | Total geral, subtotal no carrinho e subtotal pendentes são recalculados a cada criação, edição, exclusão ou alternância de status. Valor do item = quantidade × preço unitário. |
| F4     | CRUD básico                  | Criar, editar e excluir com confirmação. Nome obrigatório, quantidade inteira ≥ 1, preço ≥ 0, aceite de vírgula decimal e exibição em R$ (`R$ 12,34`).                          |
| F5     | Persistência local           | Itens salvos com AsyncStorage. Estado de carregamento durante a reidratação, sem piscar lista vazia; falhas de leitura não apagam os dados.                                     |

### Fora de escopo

Não há login, backend/nuvem, múltiplas listas, categorias editáveis, código de barras, notificações, compartilhamento, gráficos, tema escuro, i18n ou versão web.

## Tecnologias

| Camada              | Tecnologia                                             | Uso no projeto                                                                  |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Framework base      | Expo SDK 58, React Native 0.88, React 19.3             | Aplicação managed, compatível com Expo Go, sem eject/prebuild.                  |
| Linguagem           | TypeScript 6 com `strict`                              | Modelos de domínio, validação e componentes tipados.                            |
| Estado              | Zustand 5 + middleware `persist`                       | Fonte única de verdade para os itens; selectors derivam os totais.              |
| Persistência nativa | `@react-native-async-storage/async-storage` 2.2.0      | Armazenamento local no dispositivo, na versão indicada pelo Expo SDK 58.        |
| Recurso nativo      | `expo-haptics` 58                                      | Feedback tátil ao alternar status.                                              |
| UI/Acessibilidade   | `react-native-safe-area-context`, `@expo/vector-icons` | Safe Area, ícones e controles com rótulos de acessibilidade.                    |
| Testes              | Jest 30, `jest-expo`, Testing Library React Native 14  | Testes de cálculos, moeda, validação, store, persistência e interações da tela. |
| Qualidade           | ESLint 9 + Prettier 3                                  | Padronização sem warnings no comando de lint.                                   |

## Estrutura de pastas

```text
.
├── App.tsx                         # SafeAreaProvider + StatusBar + HomeScreen
├── index.ts                        # Registro do componente raiz no Expo
├── app.json                        # Nome, slug, orientação portrait e assets padrão
├── package.json                    # Scripts e dependências
├── tsconfig.json                   # TypeScript strict
├── eslint.config.mjs               # ESLint flat config (equivalente moderno ao .eslintrc)
├── .prettierrc                     # Formatação
├── jest.config.js / jest.setup.ts  # Preset Expo e mocks nativos
├── assets/                         # Assets padrão do template Expo
├── docs/
│   └── apresentacao.md             # Roteiro técnico dos 4 tópicos obrigatórios
└── src/
    ├── components/                 # UI pura e reutilizável
    │   ├── AddEditItemModal.tsx    # Formulário validado de criação/edição
    │   ├── EmptyList.tsx           # Estado vazio amigável
    │   ├── HydrationErrorState.tsx # Erro de leitura com nova tentativa
    │   ├── ItemRow.tsx             # Item, status, edição e exclusão
    │   ├── LoadingState.tsx        # Carregamento durante reidratação
    │   ├── SectionGroup.tsx        # Cabeçalho e itens de uma seção
    │   ├── StatusBadge.tsx         # Cor + ícone + texto do status
    │   └── TotalSummary.tsx        # Total geral e subtotais
    ├── screens/
    │   └── HomeScreen.tsx          # Composição da tela e orquestração de eventos
    ├── store/
    │   └── useListStore.ts         # Zustand + persist + selectors
    ├── services/
    │   └── storage.ts              # Wrapper fino do AsyncStorage
    ├── models/
    │   └── item.ts                 # Item, SectionId, ItemStatus, Totals e formulários
    ├── utils/
    │   ├── currency.ts             # Parse/formatação de moeda pt-BR
    │   ├── grouping.ts             # Agrupamento puro por seção
    │   ├── id.ts                   # Identificadores locais
    │   ├── persistence.ts          # Validação do esquema persistido
    │   ├── totals.ts               # Cálculo puro dos totais
    │   └── validation.ts           # Regras de validação do item
    ├── constants/
    │   ├── sections.ts             # Seções fixas e metadados visuais
    │   └── theme.ts                # Cores, espaçamentos, tipografia e toque mínimo
    └── __tests__/                  # Testes unitários e de interação
```

A estrutura segue a proposta do enunciado. Foram adicionados apenas arquivos de suporte justificados: estados de carregamento/erro, agrupamento, validação de esquema persistido, identificador local e configuração moderna do ESLint/Prettier/Jest.

## Como executar

### Pré-requisitos

- **Node.js 22 LTS (22.13 ou superior)**. O enunciado sugere Node ≥ 20, mas o **Expo SDK 58 estável exige Node ≥ 22.13**; por isso o projeto usa Node 22 LTS e inclui `.nvmrc`.
- npm (acompanha o Node).
- Celular Android ou iPhone com a versão do **Expo Go compatível com o SDK 58** instalada/atualizada pela loja de aplicativos.
- Computador e celular na mesma rede Wi-Fi para o modo LAN.

### Passo a passo

```bash
# 1. Instalar dependências exatamente como travadas no lockfile
npm ci
# Alternativa: npm install (npm ci é recomendado por respeitar o lockfile)

# 2. Iniciar o Metro/Expo em modo LAN
npm start
# equivalente: npx expo start --host lan
```

Depois:

1. Leia o QR code exibido no terminal com o Expo Go (Android) ou com a câmera/Expo Go (iOS).
2. Aguarde o bundle carregar no celular.
3. A lista deve abrir vazia, com totais zerados e o botão **Adicionar item**.

Se a rede bloquear LAN, tente:

```bash
npx expo start --tunnel
```

O modo túnel pode exigir conectividade externa e é mais lento; prefira LAN na apresentação.

### Scripts npm

| Comando                 | Descrição                                             |
| ----------------------- | ----------------------------------------------------- |
| `npm start`             | Inicia o Expo em modo LAN para Expo Go.               |
| `npm run android`       | Inicia o Expo e tenta abrir no Android/emulador.      |
| `npm run ios`           | Inicia o Expo e tenta abrir no iOS/simulador (macOS). |
| `npm test`              | Executa todos os testes uma vez.                      |
| `npm run test:watch`    | Executa testes em modo watch.                         |
| `npm run test:coverage` | Executa testes com cobertura da lógica/store/serviço. |
| `npm run typecheck`     | Checagem TypeScript sem emitir arquivos.              |
| `npm run lint`          | ESLint sem warnings + verificação Prettier.           |
| `npm run lint:fix`      | Corrige problemas automáticos de ESLint/Prettier.     |
| `npm run format`        | Formata os arquivos com Prettier.                     |
| `npm run format:check`  | Verifica a formatação sem alterar arquivos.           |
| `npm run check`         | Typecheck + lint + testes.                            |

## Testes

```bash
npm test
npm run test:coverage
```

Cobertura mínima implementada:

- `totals.test.ts`: lista vazia, total geral, subtotal no carrinho, subtotal pendentes, quantidade/preço variados, preço zero e imutabilidade.
- `store.test.ts`: adicionar, editar, excluir, alternar status, selector de totais, reidratação, loading, dados corrompidos, versão desconhecida, falha de leitura e falha/recuperação de gravação.
- Testes adicionais: moeda pt-BR, validação, agrupamento, esquema persistido, wrapper de storage e interações reais da `HomeScreen` com Testing Library.

Na validação desta entrega: **8 suítes e 112 testes passaram**. A cobertura da lógica/store/serviço ficou acima de 99% de linhas. Os mocks existem apenas no ambiente de teste; o app usa AsyncStorage e Haptics nativos.

## Decisões técnicas

1. **Totais derivados, nunca duplicados.** A store persiste apenas `items`. `selectTotals` chama a função pura `calculateTotals`; a tela usa `useShallow` para evitar re-renderizações por identidade de objeto. Alterar status não muda o total geral, apenas transfere o valor entre subtotais.
2. **Dinheiro em centavos inteiros.** `unitPriceCents` evita erros clássicos de ponto flutuante. O parse aceita `12,34`, `12.34`, `12` e `R$ 12,34`, com até duas casas decimais e sem separador de milhar na entrada. A formatação é determinística em pt-BR: `R$ 1.234,56`.
3. **Reidratação sem flicker e sem perda silenciosa.** O `persist` usa `skipHydration: true`; a tela mostra carregamento até a leitura terminar. JSON/esquema inválido ou versão desconhecida entram em estado de erro com nova tentativa, sem sobrescrever o disco. Falha de gravação mantém a alteração em memória e exibe um aviso.
4. **Separação de camadas.** Componentes apenas apresentam dados e disparam callbacks. Regras de negócio ficam em `utils/` e `store/`; o acesso nativo fica em `services/`.
5. **Compatibilidade com Expo Go.** AsyncStorage foi fixado em 2.2.0, versão indicada pelo manifesto de módulos nativos do SDK 58, em vez de usar a versão mais nova do npm que poderia não corresponder ao binário do Expo Go.
6. **Escopo controlado.** Uma única lista, seções fixas, sem autenticação, sem sincronização e sem versão web. Os assets padrão do template Expo foram mantidos.
7. **Acessibilidade básica.** Safe Area, `KeyboardAvoidingView` no formulário, alvos de toque de pelo menos 44 px, `accessibilityLabel` nos controles principais, papéis de checkbox/radio/button e feedback de status não dependente apenas de cor.

## Validação realizada

- `npm run check`: aprovado (TypeScript, ESLint/Prettier e testes).
- `npm run test:coverage`: aprovado.
- `npx expo export --platform android`: bundle gerado com sucesso.
- `npx expo export --platform ios`: bundle gerado com sucesso.
- Servidor Expo iniciou e respondeu ao status/manifesto HTTP.
- **Pendente na entrega:** ensaio em dispositivo físico com Expo Go, print real e revisão dos textos pela dupla. O ambiente de geração não possui celular físico; portanto, a demonstração ao vivo deve ser ensaiada antes da apresentação.

## Roteiro da apresentação

O roteiro completo dos quatro tópicos obrigatórios está em [`docs/apresentacao.md`](docs/apresentacao.md).

## Checklist da dupla antes da entrega

- [ ] Substituir os nomes placeholder abaixo pelos nomes completos da dupla.
- [ ] Instalar/atualizar o Expo Go compatível com SDK 58 no celular da demonstração.
- [ ] Rodar `npm ci && npm run check` no computador da apresentação.
- [ ] Ensaiar no celular: criar, editar, alternar status, excluir, fechar e reabrir o app.
- [ ] Capturar o print real e salvar em `docs/screenshot.png`.
- [ ] Revisar e personalizar `docs/apresentacao.md`, especialmente desafios e lições da equipe.
- [ ] Confirmar que o repositório GitHub está público e sem segredos.
- [ ] Se algum dia gerar build standalone (fora do escopo atual), trocar os identificadores `com.example.*` em `app.json`.

## Equipe

- **Aluno(a) 1:** `[Nome completo]`
- **Aluno(a) 2:** `[Nome completo]`

## Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](LICENSE).
