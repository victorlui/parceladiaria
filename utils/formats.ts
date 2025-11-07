/**
 * * Arquivo: maskFunctions.ts
 * Descrição: Funções tipadas para formatação de CPF, Celular e CEP.
 * */

// A função auxiliar é tipada para receber uma string (ou null/undefined) e sempre retornar uma string.
const cleanNumber = (value: string | null | undefined): string => {
  if (!value) return "";
  // Substitui qualquer caractere que NÃO seja dígito (\D) por vazio
  return value.replace(/\D/g, "");
};

/**
 * Formata um número como CPF (000.000.000-00)
 * @param {string | null | undefined} value - O valor do input.
 * @returns {string} O valor formatado.
 */
export const formatCPF = (value: string | null | undefined): string => {
  const cleanedValue = cleanNumber(value);

  // Limita o tamanho a 11 dígitos
  const limitedValue = cleanedValue.substring(0, 11);

  // Aplica a máscara: 000.000.000-00
  return limitedValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

/**
 * Formata um número como Celular (Ex: (00) 90000-0000)
 * @param {string | null | undefined} value - O valor do input.
 * @returns {string} O valor formatado.
 */
export const formatCelular = (value: string | null | undefined): string => {
  const cleanedValue = cleanNumber(value);

  // Limita o tamanho a 11 dígitos
  const limitedValue = cleanedValue.substring(0, 11);

  // Aplica a máscara: (00) 90000-0000 ou (00) 0000-0000
  return limitedValue
    .replace(/(\d{2})(\d)/, "($1) $2") // (00) 0
    .replace(/(\d{5})(\d{4})$/, "$1-$2") // (00) 90000-0000 (para 11 dígitos)
    .replace(/(\d{4})(\d{4})$/, "$1-$2"); // (00) 0000-0000 (para 10 dígitos)
};

/**
 * Formata um número como CEP (00000-000)
 * @param {string | null | undefined} value - O valor do input.
 * @returns {string} O valor formatado.
 */
export const formatCEP = (value: string | null | undefined): string => {
  const cleanedValue = cleanNumber(value);

  // Limita o tamanho a 8 dígitos
  const limitedValue = cleanedValue.substring(0, 8);

  // Aplica a máscara: 00000-000
  return limitedValue.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
};

export const formatCurrency = (value: number) => {
  return Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
};
