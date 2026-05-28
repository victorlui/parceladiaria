export const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

export const isValidCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, "");
  if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length += 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidDateOfBirth = (date: string): boolean => {
  // Remove qualquer caractere não numérico para aceitar tanto DD/MM/YYYY quanto DDMMYYYY
  const cleanDate = date.replace(/\D/g, "");

  if (cleanDate.length !== 8) return false;

  const dayStr = cleanDate.substring(0, 2);
  const monthStr = cleanDate.substring(2, 4);
  const yearStr = cleanDate.substring(4, 8);

  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  // Validação básica dos limites de mês e ano
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;

  // Validação de dias de acordo com o mês e ano (anos bissextos)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  // Não permite que a data de nascimento seja no futuro
  if (birthDate > today) return false;

  return true;
};

export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, "");

  // Verifica se tem 10 (fixo) ou 11 (celular) dígitos
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // Verifica se é uma sequência de números repetidos
  if (/^(\d)\1+$/.test(cleanPhone)) return false;

  // Verifica se o DDD é válido (entre 11 e 99)
  const ddd = parseInt(cleanPhone.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;

  // Se for celular (11 dígitos), verifica se começa com 9
  if (cleanPhone.length === 11 && cleanPhone[2] !== "9") return false;

  // Se for telefone fixo (10 dígitos), não pode começar com 9
  // (evita que um celular incompleto seja validado como fixo)
  if (cleanPhone.length === 10 && cleanPhone[2] === "9") return false;

  return true;
};
