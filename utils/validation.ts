export function validateCPF(input: string): string {
  const raw = (input ?? '').trim();
  const cpf = raw.replace(/\D/g, '');

  if (!raw) return 'CPF é obrigatório';
  if (/[A-Za-z]/.test(raw)) return 'CPF deve conter somente números';
  if (cpf.length !== 11) return 'CPF deve conter 11 dígitos';
  if (/^(\d)\1{10}$/.test(cpf)) return 'CPF inválido';

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return 'CPF inválido';

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return 'CPF inválido';

  return '';
}

export function validateEmail(input: string): string {
  const email = (input ?? '').trim();
  if (!email) return 'Email é obrigatório';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isBasicValid = emailRegex.test(email);
  if (!isBasicValid) return 'Formato de email inválido';

  if (email.length < 5 || email.length > 254) return 'Formato de email inválido';

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return 'Formato de email inválido';
  if (localPart.length > 64 || domain.length > 255) return 'Formato de email inválido';

  return '';
}

export function validatePhone(input: string): string {
  const raw = (input ?? '').trim();
  const digits = raw.replace(/\D/g, '');

  if (!raw) return 'Telefone é obrigatório';
  if (!(digits.length === 10 || digits.length === 11)) {
    return 'Telefone deve conter 10 ou 11 dígitos (incluindo DDD)';
  }

  const ddd = parseInt(digits.substring(0, 2));
  if (isNaN(ddd) || ddd < 11 || ddd > 99) return 'Telefone inválido';

  if (/^(\d)\1+$/.test(digits)) return 'Telefone inválido';

  if (digits.length === 11 && digits[2] !== '9') return 'Telefone inválido';
  if (digits.length === 10 && !['6', '7', '8', '9'].includes(digits[2])) return 'Telefone inválido';

  return '';
}