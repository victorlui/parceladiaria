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

       
        if (![10, 11].includes(digits.length)) return false;
        
        const ddd = parseInt(digits.substring(0, 2));
        if (ddd < 11 || ddd > 99) return false;
        
        if (/^(\d)\1+$/.test(digits)) return false;
        
        if (digits.length === 11 && digits[2] !== '9') return false;
        
        return true;
      },
      { message: "Telefone inválido" }
    ),
});

export type PhoneSchema = z.infer<typeof phoneSchema>;
