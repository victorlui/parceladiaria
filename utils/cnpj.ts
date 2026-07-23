export const CNPJ_RAW_LENGTH = 14;
export const CNPJ_MASKED_LENGTH = 18;

export const CNPJ_RAW_REGEX = /^[A-Z0-9]{12}[0-9]{2}$/;
export const CNPJ_MASKED_REGEX =
  /^[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}-[0-9]{2}$/;

function normalizeCNPJBase(value: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export function sanitizeCNPJ(value: string): string {
  return normalizeCNPJBase(value)
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CNPJ_RAW_LENGTH);
}

export function formatCNPJ(value: string): string {
  const sanitized = sanitizeCNPJ(value);
  const part1 = sanitized.slice(0, 2);
  const part2 = sanitized.slice(2, 5);
  const part3 = sanitized.slice(5, 8);
  const part4 = sanitized.slice(8, 12);
  const part5 = sanitized.slice(12, 14);

  let formatted = part1;

  if (part2) formatted += `.${part2}`;
  if (part3) formatted += `.${part3}`;
  if (part4) formatted += `/${part4}`;
  if (part5) formatted += `-${part5}`;

  return formatted;
}

export function normalizeCNPJForValidation(value: string): string {
  return normalizeCNPJBase(value).trim();
}

export function isNumericCNPJ(value: string): boolean {
  return /^\d{14}$/.test(value);
}
