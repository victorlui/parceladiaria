import { z } from "zod";

export const emailSchema = z.object({
  email: z
    .string({ error: "Email é obrigatório" })
    .refine(
      (email) => {
        if (!email) return false;
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return false;

        // Check for minimum and maximum lengths
        if (email.length < 5 || email.length > 254) return false;

        // Check for valid domain structure
        const [localPart, domain] = email.split('@');
        if (!localPart || !domain) return false;
        if (localPart.length > 64 || domain.length > 255) return false;

        return true;
      },
      { message: "Formato de email inválido" }
    ),
});

export type EmailSchema = z.infer<typeof emailSchema>;
