[OPEN]

# Debug Session: app-stability-audit

## Sintomas reportados
- (Pendente) Descrever crash/tela branca/travamentos e o fluxo de reprodução.

## Ambiente
- OS: macOS
- App: Expo (Managed), React Native, TypeScript, Hermes (assumido pelo contexto)
- Dispositivo: (Pendente) Android/iOS, modelo, versão do SO
- Expo Go vs Dev Client vs Produção: (Pendente)

## Hipóteses (falsificáveis)
1. Exceção JS não capturada durante bootstrap (ex.: erro em `_layout.tsx`/providers) causa tela branca/crash.
2. Problema de navegação/rota inválida (ex.: path inexistente no expo-router) dispara erro silencioso e quebra renderização.
3. Re-renderização/loop em hooks (ex.: `useEffect` com dependências instáveis) trava o app ou causa consumo alto de memória.
4. Race condition em async (ex.: restore de sessão, leitura de storage, inicialização de SDK) gera estado inconsistente e travamento.
5. Incompatibilidade Hermes/JSI (ou configuração Expo/Metro) causa crash apenas em produção ou em um SO específico.

## Evidências necessárias
- Logs do Metro/Expo (dev)
- Stack trace do erro (red screen) ou crash report (produção)
- Navegação atual e rota inicial
- Últimas ações antes do crash/tela branca

## Instrumentação planejada
- Capturar erros globais (ErrorUtils/unhandledrejection) e eventos de navegação
- Registrar rota atual e transições principais
- Registrar tempos de bootstrap (ex.: providers, carregamento de sessão)

## Progresso
- [ ] Subir Debug Server e coletar logs
- [ ] Instrumentar pontos de bootstrap/navegação
- [ ] Reproduzir e coletar evidências
- [ ] Fix mínimo guiado por evidência
- [ ] Verificação pós-fix (Android/iOS) e limpeza

