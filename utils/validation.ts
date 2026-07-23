import {
  CNPJ_MASKED_REGEX,
  CNPJ_RAW_REGEX,
  formatCNPJ,
  isNumericCNPJ,
  normalizeCNPJForValidation,
  sanitizeCNPJ,
} from "@/utils/cnpj";

export function validateCPF(input: string): boolean {
  const raw = (input ?? "").trim();
  const cpf = raw.replace(/\D/g, "");

  if (!raw) return false;
  if (/[A-Za-z]/.test(raw)) return false;
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
}

export function validateEmail(input: string): boolean {
  const email = (input ?? "").trim();

  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) return false;

  if (email.length < 5 || email.length > 254) return false;

  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) return false;

  if (localPart.length > 64 || domain.length > 255) return false;

  return true;
}

export function validatePhone(input: string): boolean {
  const raw = (input ?? "").trim();
  const digits = raw.replace(/\D/g, "");

  if (!raw) return false;
  if (![10, 11].includes(digits.length)) return false;

  const ddd = parseInt(digits.substring(0, 2));

  if (isNaN(ddd) || ddd < 11 || ddd > 99) return false;

  // Bloqueia sequências repetidas
  if (/^(\d)\1+$/.test(digits)) return false;
  if (/^(\d{2})\1+$/.test(digits)) return false;

  // Celular: obrigatório 9
  if (digits.length === 11 && digits[2] !== "9") {
    return false;
  }

  // Fixo: deve começar entre 2 e 5
  if (digits.length === 10 && !["2", "3", "4", "5"].includes(digits[2])) {
    return false;
  }

  // Bloqueia prefixos inválidos em celular
  if (
    digits.length === 11 &&
    ["10", "20", "30", "40", "50", "60", "70", "80", "90"].includes(
      digits.substring(3, 5),
    )
  ) {
    return false;
  }

  return true;
}

export function validateBirthDate18Plus(input: string): boolean {
  const raw = (input ?? "").trim();
  if (!raw) return false;

  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return false;

  const day = parseInt(digits.slice(0, 2), 10);
  const month = parseInt(digits.slice(2, 4), 10);
  const year = parseInt(digits.slice(4, 8), 10);

  if (
    isNaN(day) ||
    isNaN(month) ||
    isNaN(year) ||
    month < 1 ||
    month > 12 ||
    day < 1
  ) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  const eighteen = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

  if (date > eighteen) return false;
  return true;
}

export function validateCNPJ(cnpj: string): string {
  const raw = (cnpj ?? "").trim();
  const normalizedInput = normalizeCNPJForValidation(raw);
  const sanitized = sanitizeCNPJ(raw);
  const isMaskedInput = /[./-]/.test(normalizedInput);

  if (!raw) return "CNPJ é obrigatório";
  if (sanitized.length !== 14) return "CNPJ deve conter 14 caracteres";

  const allowedPattern = isMaskedInput ? /^[A-Z0-9./-]+$/ : /^[A-Z0-9]+$/;
  if (/\s/.test(normalizedInput) || !allowedPattern.test(normalizedInput)) {
    return "CNPJ inválido";
  }

  if (!CNPJ_RAW_REGEX.test(sanitized)) return "CNPJ inválido";

  const formattedCNPJ = formatCNPJ(normalizedInput);

  if (isMaskedInput && normalizedInput !== formattedCNPJ) {
    return "CNPJ inválido";
  }

  if (isMaskedInput && !CNPJ_MASKED_REGEX.test(formattedCNPJ)) {
    return "CNPJ inválido";
  }

  if (!isNumericCNPJ(sanitized)) {
    return "";
  }

  // Elimina CNPJs com todos os dígitos iguais (ex: 11.111.111/1111-11)
  if (/^(\d)\1{13}$/.test(sanitized)) return "CNPJ inválido";

  const calculateDigit = (slice: string, weights: number[]): number => {
    const sum = slice
      .split("")
      .reduce((acc, digit, idx) => acc + parseInt(digit, 10) * weights[idx], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  // Pesos oficiais do CNPJ
  const weight1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weight2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const digit1 = calculateDigit(sanitized.substring(0, 12), weight1);
  const digit2 = calculateDigit(sanitized.substring(0, 13), weight2);

  if (
    digit1 !== parseInt(sanitized[12], 10) ||
    digit2 !== parseInt(sanitized[13], 10)
  ) {
    return "CNPJ inválido";
  }

  return "";
}

const estadosSgl = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

export function tratarEstado(input: string) {
  // 1. Se já for a sigla correta (ex: "CE"), retorna ela mesma
  const siglasExistentes = Object.values(estadosSgl);

  if (siglasExistentes.includes(input.toUpperCase())) {
    return input.toUpperCase();
  }

  // 2. Se for o nome por extenso (ex: "Ceará"), converte
  if (input in estadosSgl) {
    return estadosSgl[input as keyof typeof estadosSgl];
  }

  // 3. Se for algo como "CECE" ou "CearáCE", não valida
  return "Estado Inválido";
}
