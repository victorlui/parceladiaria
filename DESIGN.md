# Design do Projeto

## Objetivo

Este documento registra o sistema visual atual do app `Parcela Diaria` com base no codigo existente. O foco e descrever o design real do produto hoje, para orientar manutencao, novas telas e convergencia visual.

Ele cobre:

- identidade visual;
- tokens principais;
- componentes-base;
- padroes de layout;
- estados de interface;
- inconsistencias que valem padronizacao futura.

## Visao Geral

O projeto e um app mobile em `Expo` + `React Native`, com `expo-router`, `StyleSheet` e uso parcial de `NativeWind`. A linguagem visual e funcional, clara e institucional, com prioridade para:

- confianca;
- legibilidade;
- rapidez de acao;
- baixa friccao em fluxos financeiros e de validacao.

O app opera predominantemente em tema claro.

## Identidade Visual

### Caracter do produto

O app comunica:

- seguranca, pelo uso de verde escuro institucional;
- objetividade, com textos diretos e CTAs evidentes;
- simplicidade, com fundos claros e poucos ornamentos;
- apoio ao usuario, com feedbacks visuais claros em status, formularios e estados vazios.

### Assinatura visual

Os elementos mais caracteristicos hoje sao:

- verde escuro como cor principal;
- botoes grandes e contrastantes;
- inputs claros com borda suave;
- cards com cantos arredondados;
- uso moderado de sombra;
- destaque forte para a acao de pagamento;
- blocos de home com visual mais expressivo que o restante do app.

## Tokens de Cor

Baseado em `constants/Colors.ts`.

### Cores principais

| Token                    | Valor     | Uso principal                              |
| ------------------------ | --------- | ------------------------------------------ |
| `Colors.primaryColor`    | `#053D39` | base institucional                         |
| `Colors.green.primary`   | `#053D39` | headers, tabs ativas, destaques de marca   |
| `Colors.green.button`    | `#14524A` | CTA principal                              |
| `Colors.green.secondary` | `#10B981` | sucesso, badges e reforcos positivos       |
| `Colors.green.text`      | `#2C8780` | destaque secundario                        |
| `Colors.white`           | `#fff`    | superficies claras e texto em fundo escuro |
| `Colors.black`           | `#000`    | texto forte                                |
| `Colors.borderColor`     | `#d1d5db` | bordas neutras                             |
| `Colors.gray.primary`    | `#9CA3AF` | placeholder, estados desabilitados         |
| `Colors.gray.text`       | `#64748B` | texto secundario                           |

### Cores semanticas

| Token                   | Valor     | Uso principal           |
| ----------------------- | --------- | ----------------------- |
| `Colors.info.bg`        | `#E0F2FE` | fundo informativo       |
| `Colors.info.text`      | `#0284C7` | texto informativo       |
| `Colors.success.light`  | `#D1FAE5` | fundo de sucesso        |
| `Colors.success.medium` | `#A7F3D0` | reforco visual positivo |
| `Colors.error.light`    | `#FEE2E2` | fundo de erro           |
| `Colors.error.medium`   | `#F87171` | borda ou texto de erro  |
| `Colors.yellow.light`   | `#FEF3C7` | aviso suave             |
| `Colors.yellow.medium`  | `#FDE68A` | aviso destacado         |
| `Colors.orange.primary` | `#F59E0B` | estado de atencao       |
| `Colors.blue.primary`   | `#3B82F6` | informacao secundaria   |

### Gradientes e variacoes locais

Algumas telas, especialmente a home, usam gradientes e tons hardcoded fora de `Colors`, com predominancia de verde/teal. A direcao visual continua coerente, mas o ideal e centralizar isso em tokens futuros.

## Tipografia

Nao existe hoje uma familia tipografica customizada aplicada globalmente. O projeto usa a fonte padrao do sistema com variacoes de peso e tamanho por contexto.

### Escala recorrente

| Papel             | Tamanho comum |
| ----------------- | ------------- |
| titulo principal  | `24-28`       |
| titulo de secao   | `18-22`       |
| corpo             | `14-16`       |
| texto auxiliar    | `12-14`       |
| badge e microcopy | `10-12`       |

### Pesos mais usados

- `700` para titulos e CTAs;
- `600` para labels fortes e subtitulos;
- `400-500` para corpo e apoio.

### Diretrizes

- Priorizar titulos curtos e objetivos.
- Usar `Colors.gray.text` para texto secundario.
- Reservar branco para botoes preenchidos, barras e superficies escuras.
- Evitar criar muitos tamanhos novos para papeis visuais equivalentes.

## Espacamento, Forma e Elevacao

### Espacamento

Os valores mais recorrentes observados nas telas sao:

- `8` para respiros pequenos;
- `12` para agrupamentos compactos;
- `16` para cards e secoes;
- `20` para padding principal de tela;
- `24+` para cabecalhos, estados e fluxos guiados.

### Raios de borda

Padroes mais usados:

- `8` em botoes e elementos compactos;
- `12` em inputs e cards;
- `16` em containers de destaque;
- `999` em pills, badges e botoes circulares.

### Sombra

O projeto usa sombra de forma contida:

- cards com elevacao leve;
- CTA flutuante com maior presenca;
- cabecalhos hero com sombra mais notavel;
- containers de status com profundidade discreta.

Diretriz: manter a elevacao como suporte de hierarquia, nao como efeito decorativo principal.

## Componentes Base

### Botoes

Hoje existem dois padroes-base.

#### `components/ui/Button.tsx`

Padrao mais visual e classico do app:

- fundo `Colors.green.button`;
- `paddingVertical` alto;
- largura total;
- texto branco;
- suporte a loading;
- suporte a outline;
- suporte a icones laterais.

Uso ideal:

- CTAs principais;
- confirmacao de fluxo;
- telas transacionais;
- acoes de alta prioridade.

#### `components/Button.tsx`

Padrao com `NativeWind`:

- variantes `primary`, `secondary`, `danger` e `outline`;
- altura fixa;
- texto maior;
- mais usado em fluxos recentes e layout de cadastro.

Uso ideal:

- formularios guiados;
- layouts que ja usam classes utilitarias;
- acoes simples dentro de telas novas.

### Recomendacao

Existe sobreposicao entre os dois componentes. Novas telas devem evitar criar um terceiro padrao. O caminho mais saudavel e convergir gradualmente para uma unica familia de botoes com variantes semanticas.

### Inputs

O componente `components/ui/Input.tsx` define um bom padrao compartilhavel:

- label opcional acima do campo;
- fundo claro `#F9FAFB`;
- borda neutra;
- foco em `Colors.green.primary`;
- erro em `Colors.error.medium`;
- suporte a mascaras para CPF, CNPJ, celular, CEP, data e OTP.

Diretrizes:

- usar esse componente como base para formularios;
- manter a sequencia `label -> campo -> erro`;
- nao introduzir novos estilos de input sem motivo funcional.

### Cards

Os cards do projeto costumam seguir este comportamento visual:

- fundo branco ou verde muito claro;
- padding interno entre `12` e `20`;
- bordas suaves;
- cantos arredondados;
- sombra leve;
- bloco de titulo, conteudo e acao.

A composicao ideal do card e:

- titulo curto e forte;
- informacao secundaria em cinza;
- pill de status quando necessario;
- CTA interno apenas se houver uma acao clara.

### Badges e pills

Sao usados para:

- status do usuario;
- indicadores como `Novo`;
- estado `Atual` em configuracoes;
- marcacao de sucesso ou disponibilidade.

Boas praticas:

- texto curto;
- alto contraste;
- formato arredondado;
- cor coerente com a semantica do estado.

## Padroes de Layout

### Estrutura-base de tela

Muitas telas seguem esta ordem:

1. `SafeAreaView`
2. cabecalho simples ou bloco hero
3. `ScrollView` ou container vertical
4. cards, listas ou formulario
5. CTA principal no final ou fixo no rodape

### Cadastro e recuperacao

O fluxo usa layout guiado com:

- logo no topo;
- fundo branco;
- formulario vertical;
- tratamento de teclado;
- botoes `Voltar` e `Continuar` no final.

Isso comunica continuidade, orientacao e simplicidade.

### Home

A home e a tela mais expressiva do produto. Ela combina:

- bloco principal com destaque visual;
- espaco para saudacao;
- area de saldo e status;
- grade de atalhos;
- modais contextuais;
- CTA flutuante em situacoes especificas.

O tom visual e mais promocional, mas continua dentro da familia verde/teal.

### Pagamentos

A tela de pagamentos mostra bem a hierarquia do produto:

- cabecalho simples;
- lista de parcelas;
- estados de loading e vazio bem evidentes;
- acao secundaria para selecionar tudo;
- barra fixa inferior com total e CTA principal.

Esse padrao e forte e deve servir como referencia para outras telas transacionais.

### Tabs e navegacao

O app usa navegacao por tabs com tema claro e acao central de pagamento. O botao de pagar tem destaque especial e comportamento de ponto focal da barra inferior.

Tambem ha recorrencia de `ButtonChat` flutuando sobre a interface, o que impacta espacos inferiores em varias telas.

## Estados de Interface

### Loading

Padroes encontrados:

- spinner global;
- dots de carregamento em botoes;
- skeleton em listas;
- telas de loading dedicadas em alguns fluxos.

Diretriz:

- usar loading inline para acoes curtas;
- usar skeleton em listas e cards;
- usar loading de tela inteira quando a jornada estiver bloqueada.

### Erro

O tratamento visual mais consistente aparece em formularios:

- borda vermelha no campo;
- texto pequeno abaixo do input;
- cores suaves para nao poluir a tela.

Para erros de fluxo, o projeto tende a usar modais, alertas ou telas de status.

### Vazio

O estado vazio em pagamentos da o tom esperado:

- icone grande;
- titulo tranquilizador;
- texto simples e positivo.

Diretriz: manter estados vazios acolhedores e objetivos, principalmente em jornadas financeiras.

### Desabilitado

Normalmente usa:

- cinza;
- opacidade reduzida;
- bloqueio da interacao.

Quando a acao estiver bloqueada por regra de negocio, vale combinar desabilitado com explicacao contextual.

## Iconografia e Assets

As bibliotecas de icones mais usadas incluem:

- `FontAwesome`
- `FontAwesome5`
- `FontAwesome6`
- `Ionicons`
- `MaterialIcons`
- `Octicons`

Diretrizes:

- preferir icones simples e reconheciveis;
- manter tamanhos entre `18` e `28` na maioria dos casos;
- usar branco sobre verde escuro;
- usar verde institucional em fundo claro.

O projeto tambem usa logos, imagens de apoio, lotties e assets para fluxos de status e onboarding.

## Acessibilidade

Boas praticas recomendadas para o projeto:

- garantir contraste suficiente em texto e CTA;
- nao depender apenas de cor para comunicar erro ou sucesso;
- manter alvos de toque confortaveis;
- preservar labels visiveis em formularios importantes;
- evitar excesso de informacao visual por tela.

Como o app lida com autenticacao, pagamentos e validacoes, legibilidade deve prevalecer sobre efeitos decorativos.

## Inconsistencias Atuais

O sistema visual ja tem identidade clara, mas ainda ha divergencias:

- coexistem dois componentes-base de botao;
- parte das cores esta tokenizada, parte segue hardcoded nas telas;
- ha mistura de `StyleSheet`, `NativeWind` e estilos inline;
- gradientes e sombras ainda nao foram formalizados em tokens;
- tamanhos de titulo e estilos de card variam entre telas equivalentes.

Esses pontos nao impedem evolucao, mas aumentam o custo de manutencao visual.

## Diretrizes para Novas Telas

- Reutilizar `Colors` antes de criar novas cores.
- Preferir um dos botoes existentes em vez de duplicar padrao.
- Usar fundo branco ou neutro claro como base.
- Adotar espacamento `16-20` como escolha segura.
- Usar raio `12` para inputs e cards, salvo excecao clara.
- Definir estados de loading, vazio e erro desde a primeira versao.
- Considerar o espaco ocupado por rodape fixo e `ButtonChat`.

## Resumo

O design atual do `Parcela Diaria` e um sistema mobile claro, institucional e orientado a conversao. Seus pilares sao:

- verde escuro como ancora de confianca;
- superficies claras;
- CTAs fortes;
- formularios simples;
- feedback visual objetivo;
- navegacao centrada em tarefas de pagamento, cadastro e validacao.

O melhor proximo passo nao e redesenhar tudo, e consolidar melhor o que ja funciona em tokens e componentes mais centralizados.
