# Debug Session: divergencia-upload-face-crash

- **Status**: [OPEN]
- **Issue**: Em produção, ao anexar documentos e/ou fazer reconhecimento facial no fluxo de divergência, o app fecha inesperadamente.
- **Debug Server**: (pending start)
- **Log File**: .dbg/trae-debug-log-divergencia-upload-face-crash.ndjson

## Reproduction Steps

1. Abrir o app em build de produção (ou build que reproduz).
2. Ir para Divergências.
3. Anexar um documento (frente/verso/etc).
4. Tentar reconhecimento facial (item "face").
5. Observar fechamento inesperado do app.

## Hypotheses & Verification

| ID  | Hypothesis                                                                                                                                                                              | Likelihood | Effort | Evidence |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| A   | O payload recebido do WebView no reconhecimento facial chega inválido/inesperado (JSON malformado, tipo errado, ausência de `file`) e causa exceção em JS que não está sendo capturada. | Med        | Low    | Pending  |
| B   | O upload do arquivo (documento ou face) estoura memória/recursos no device (tamanho/codec/base64), levando a crash nativo durante leitura/transferência.                                | High       | Med    | Pending  |
| C   | O fluxo chama upload/update em paralelo ou em sequência inesperada (duplo submit / múltiplos onSuccess), causando estado inconsistente e crash (ex.: `selected` nulo, item vazio).      | Med        | Low    | Pending  |
| D   | Configuração do WebView (ex.: `androidLayerType="hardware"`, mixed content, media) provoca crash nativo em alguns aparelhos/versões durante a captura.                                  | Med        | Med    | Pending  |
| E   | O serviço de upload retorna URL/response inesperado e a camada de preview/estado recebe um valor inválido (ex.: `uri` não-string), causando crash ao renderizar.                        | Low        | Low    | Pending  |

## Log Evidence

- (pending instrumentation)

## Verification Conclusion

- (pending pre-fix vs post-fix comparison)
