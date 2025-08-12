import { z } from "zod";

export const phoneSchema = z.object({
  phone: z
    .string({ error: "Telefone é obrigatório" })
    .min(1, { message: "Telefone é obrigatório" })
    .regex(/^(\d{10,11})$/, { 
      message: "Telefone deve conter 10 ou 11 dígitos (incluindo DDD)" 
    })
    .refine(
      (phone) => {
        if (!phone) return false;
      
        const digits = phone.replace(/\D/g, '');

        // Check if length is valid
        if (![10, 11].includes(digits.length)) return false;
        
        const ddd = parseInt(digits.substring(0, 2));
        if (ddd < 11 || ddd > 99) return false;
        
        // Check for repeated digits
        if (/^(\d)\1+$/.test(digits)) return false;
        
        // For 11 digits, must start with 9 after DDD
        if (digits.length === 11 && digits[2] !== '9') return false;
        
        // For 10 digits, must start with 6-9 after DDD
        if (digits.length === 10 && !['6','7','8','9'].includes(digits[2])) return false;

        return true;
      },
      { message: "Telefone inválido" }
    ),
});

export type PhoneSchema = z.infer<typeof phoneSchema>;
