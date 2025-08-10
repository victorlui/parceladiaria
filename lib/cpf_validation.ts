import { z } from "zod";

export const cpfSchema = z.object({
  cpf: z
    .string({ error: "CPF é obrigatório" })
    .min(1, { message: "CPF é obrigatório" })
    .length(11, { message: "CPF deve conter 11 dígitos" })
    .regex(/^\d+$/, { message: "CPF deve conter somente números" })
    .refine(
      (cpf) => {
        // CPF validation algorithm
        if (!cpf) return false;
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
      },
      { message: "CPF inválido" }
    ),
});

export type CPFSchema = z.infer<typeof cpfSchema>;
