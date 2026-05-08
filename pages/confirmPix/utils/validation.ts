const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const isValidCpf = (value: string) => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;

  return d2 === Number(cpf[10]);
};

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const normalizeBrPhone = (value: string) => {
  let digits = onlyDigits(value);
  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    digits = digits.slice(2);
  }
  return digits;
};

export const isValidPhone = (value: string) => {
  const digits = normalizeBrPhone(value);
  if (digits.length !== 10 && digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
};

export const isValidRandomKey = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );

export const getPixKeyValidationError = (type: any, value: string) => {
  const v = value.trim();
  if (!v) return "Informe a chave";

  if (type === "cpf") return isValidCpf(v) ? null : "CPF inválido";
  if (type === "email") return isValidEmail(v) ? null : "E-mail inválido";
  if (type === "phone") return isValidPhone(v) ? null : "Telefone inválido";
  return isValidRandomKey(v) ? null : "Chave aleatória inválida";
};
