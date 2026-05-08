export const maskCpf = (cpf: string | undefined) => {
  if (!cpf) return "";
  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11) return cpf;
  return `***.***.${cleanCpf.slice(6, 9)}-**`;
};

export const maskPhone = (phone: string | undefined) => {
  if (!phone) return "";
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 4) return phone;
  const last4 = cleanPhone.slice(-4);
  return `(**) *****-${last4}`;
};
