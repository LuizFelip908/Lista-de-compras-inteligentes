# Roteiro de apresentação técnica — Lista de Compras Inteligente

**Dupla:** `[Nome completo 1]` e `[Nome completo 2]`  
**Duração sugerida:** 8 a 12 minutos, incluindo demonstração ao vivo.  
**Objetivo:** mostrar um app React Native/Expo completo, com CRUD, agrupamento, status, totais em tempo real e persistência local.

> A dupla deve revisar este roteiro e transformar os pontos abaixo em fala própria. Os trechos entre colchetes são placeholders.

## Abertura (30–60 s)

“Nosso app resolve um problema simples: organizar a compra de supermercado por seções e saber, a qualquer momento, quanto já foi colocado no carrinho e quanto ainda falta. Ele funciona localmente no celular, sem login e sem backend.”

Mostrar rapidamente:

1. Lista vazia e totais zerados.
2. Botão **Adicionar item**.
3. Resumo com total geral, no carrinho e pendentes.

## Tópico 1 — Tecnologias utilizadas

### Framework base

- **Expo SDK 58 (managed workflow)**: permite executar no Expo Go sem eject, sem prebuild e sem módulos nativos customizados.
- **React Native 0.88 + React 19.3**: componentes nativos de lista, texto, modal, formulário e toque.
- **TypeScript 6 strict**: tipos explícitos para `Item`, `SectionId`, `ItemStatus`, `Totals` e formulários; checagem com `npm run typecheck`.

### Bibliotecas de terceiros

- **Zustand 5 + persist**: estado global pequeno, sem boilerplate de Redux; middleware de persistência.
- **AsyncStorage 2.2.0**: armazenamento local nativo. A versão foi alinhada ao manifesto de módulos nativos do Expo SDK 58, não apenas à versão mais nova do npm.
- **expo-haptics 58**: feedback tátil ao alternar status.
- **react-native-safe-area-context**: respeito a notch, barra de status e gestos.
- **@expo/vector-icons**: ícones de seções, status e ações.
- **Jest + jest-expo + Testing Library React Native**: testes de lógica e de interação.
- **ESLint + Prettier**: padronização e prevenção de erros comuns.

### Gerenciamento de estado e recursos nativos aplicados

- A store guarda apenas a lista de itens e flags de hidratação/erro de persistência.
- Os totais são **selectors derivados** da lista, não campos persistidos.
- Recurso nativo 1: **AsyncStorage**, para sobreviver ao fechamento do app.
- Recurso nativo 2: **Haptics**, para resposta tátil no toque de status.

**Arquivos para mostrar:** `src/store/useListStore.ts`, `src/services/storage.ts`, `src/utils/totals.ts`, `src/screens/HomeScreen.tsx`.

## Tópico 2 — Três principais desafios técnicos e soluções

### Desafio 1: totais em tempo real sem estado duplicado

**Problema:** guardar `total`, `subtotalCarrinho` e `subtotalPendente` na store poderia deixá-los inconsistentes após editar, excluir ou alternar status.

**Solução implementada:**

- `calculateTotals(items)` é uma função pura em `src/utils/totals.ts`.
- `selectTotals` deriva os valores a partir da lista atual.
- A tela usa `useShallow(selectTotals)` para comparar o resultado por valor.
- Alternar status mantém o total geral e transfere o valor entre os subtotais.
- Testes cobrem lista vazia, quantidades/preços variados, preço zero e mudança de status.

**Fala sugerida:** “A lista é a fonte única de verdade. Se o item muda, o total é recalculado; não existe um segundo total para esquecer de atualizar.”

### Desafio 2: moeda pt-BR com vírgula decimal e precisão

**Problema:** receber `12,34`, validar preço não negativo e evitar erros de ponto flutuante em somas repetidas.

**Solução implementada:**

- O domínio armazena `unitPriceCents` como inteiro.
- `parseCurrencyToCents` aceita vírgula ou ponto decimal, até duas casas, e rejeita entradas inválidas sem arredondar silenciosamente.
- `formatCurrency` exibe em pt-BR: `R$ 1.234,56`.
- O formulário mantém strings durante a digitação e só converte no envio.
- Testes cobrem `12,34`, `12.34`, `0`, `0,05`, entradas negativas, mais de duas casas e ciclo parse/formatação.

**Fala sugerida:** “Nós não somamos reais em ponto flutuante. Somamos centavos inteiros e formatamos apenas na exibição.”

### Desafio 3: persistência e reidratação sem flicker e sem perda silenciosa

**Problema:** ao abrir o app, mostrar uma lista vazia antes de restaurar os dados seria confuso; tratar dado corrompido como lista vazia poderia apagá-lo.

**Solução implementada:**

- `persist` com `skipHydration: true` e hidratação controlada.
- Estado `loading` mostra “Restaurando sua lista…” até a leitura terminar.
- O esquema persistido é validado antes de entrar na store.
- JSON inválido, item inválido, ids duplicados ou versão desconhecida entram em estado de erro com botão de nova tentativa.
- Durante erro/leitura, a store não sobrescreve o disco.
- Falha de gravação mantém a alteração em memória e mostra aviso na tela.
- Testes simulam reidratação, leitura pendente, dados corrompidos, falha transitória e recuperação de gravação.

**Fala sugerida:** “Persistência não é só salvar. É carregar sem piscar, validar o que foi salvo e falhar sem destruir a lista.”

## Tópico 3 — O que funcionou e o que melhoraria

### O que funcionou

- F1–F5 implementadas ponta a ponta, sem mocks no app e sem dados falsos embutidos.
- Agrupamento por seções fixas com contagem.
- Status com cor, ícone, texto e haptics.
- Totais atualizados imediatamente após qualquer mutação.
- CRUD com validação e confirmação de exclusão.
- Persistência local com carregamento, erro e nova tentativa.
- Separação entre UI, domínio, store e serviço nativo.
- Testes automatizados de lógica, store e tela; bundles Android/iOS gerados pelo Metro.

### O que melhoraria (sem aumentar o escopo agora)

- **Migrações de esquema:** hoje versão desconhecida é preservada e sinalizada; uma evolução futura adicionaria migrações explícitas entre versões.
- **Listas muito grandes:** trocar a renderização por grupos para `SectionList`/virtualização por item se o volume crescer muito.
- **Acessibilidade em dispositivo:** validar com TalkBack/VoiceOver, tamanho de fonte ampliado e contraste em telas reais.
- **Testes de dispositivo:** acrescentar testes E2E no celular/emulador para fechar/reabrir o app e conferir persistência real.
- **Observabilidade local de erros:** registrar falhas de storage de forma estruturada, sem enviar dados a servidores.
- **Recuperação assistida:** oferecer exportação/manual de recuperação antes de qualquer limpeza de dados corrompidos.

**Autoavaliação sugerida:** “O escopo básico ficou completo e testável. As melhorias principais são de robustez operacional e validação em dispositivos, não de novas funcionalidades.”

## Tópico 4 — Lições aprendidas e experiência da equipe

> Personalizar com a experiência real da dupla. Sugestões baseadas no que foi implementado:

- **Estado derivado simplifica o domínio:** manter totais fora da store evitou inconsistências.
- **Dinheiro exige representação inteira:** centavos tornaram os cálculos previsíveis e fáceis de testar.
- **Persistência tem estados de falha:** loading, erro, nova tentativa e proteção contra sobrescrita são parte da funcionalidade, não detalhes opcionais.
- **Compatibilidade nativa importa:** a versão mais nova de uma biblioteca nem sempre é a versão correta para o Expo Go instalado.
- **Separação de camadas facilitou testes:** funções puras e store puderam ser testadas sem depender da UI; a UI foi testada com interações.
- **Escopo controlado ajudou a terminar:** não implementar login, nuvem ou múltiplas listas permitiu entregar o básico com qualidade.

**Divisão de trabalho sugerida para revisar:**

- `[Nome 1]`: `[ex.: domínio, moeda, totais e testes de lógica]`
- `[Nome 2]`: `[ex.: store, persistência, UI e testes de interação]`
- Ambos: revisão do README, ensaio no Expo Go e apresentação.

## Demonstração ao vivo (3–5 min)

1. **Abrir o app** pelo Expo Go e mostrar a lista vazia, sem dados falsos.
2. **Criar item 1:** Banana, Hortifrúti, quantidade 2, preço `7,50`. Mostrar subtotal pendente `R$ 15,00`.
3. **Criar item 2:** Leite, Laticínios, quantidade 1, preço `5,99`. Mostrar dois grupos e total `R$ 20,99`.
4. **Alternar Banana para no carrinho:** mostrar ícone/cor/texto, sentir o haptic e verificar que o total geral continua `R$ 20,99`, mas o subtotal no carrinho vira `R$ 15,00`.
5. **Editar Leite:** mudar preço para `6,49` e mostrar recálculo imediato.
6. **Excluir um item:** cancelar uma vez e confirmar na segunda para mostrar a proteção.
7. **Fechar e reabrir o app:** mostrar que os itens restantes foram restaurados.
8. **Validação rápida:** tentar salvar sem nome ou com preço inválido e mostrar as mensagens.

### Plano de contingência

- Levar celular carregado e cabo; deixar Expo Go atualizado e app já aberto antes da apresentação.
- Usar a mesma rede Wi-Fi do computador; se necessário, testar `npx expo start --tunnel` antes.
- Ter o print real e um vídeo curto de reserva no celular, caso a rede do local falhe.
- Não depender de som; haptics pode ser silencioso ou indisponível em alguns dispositivos, mas o status visual continua funcionando.

## Checklist final da dupla

- [ ] Nomes completos preenchidos neste arquivo e no README.
- [ ] Print real em `docs/screenshot.png`.
- [ ] Falas dos desafios e lições revisadas com experiências próprias.
- [ ] `npm ci && npm run check` executado no computador da apresentação.
- [ ] Ensaio completo no Expo Go, incluindo fechar/reabrir.
- [ ] Repositório público, sem credenciais e com histórico de conventional commits.
