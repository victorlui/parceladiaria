import { z } from "zod";

export const passwordsSchema = z.object({
  password: z
    .string({ error: "Senha é obrigatória" })
    .min(1, { message: "Senha é obrigatória" })
    .optional()
    .superRefine((password, ctx) => {
      if (!password) return;

      if (password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Senha deve ter no mínimo 6 caracteres",
        });
        return;
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Senha deve conter pelo menos um caractere especial",
        });
        return;
      }

      if (/\s/.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Senha não pode conter espaços",
        });
        return;
      }

      if (!/[A-Z]/.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Senha deve conter pelo menos uma letra maiúscula",
        });
        return;
      }

      if (!/[a-z]/.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Senha deve conter pelo menos uma letra minúscula",
        });
        return;
      }

      if (!/\d/.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Senha deve conter pelo menos um número",
        });
        return;
      }
    }),
  confirmPassword: z
    .string()
    .optional()
    .superRefine((confirmPassword, ctx) => {
      if (!confirmPassword) return;
      
      if (confirmPassword.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Confirmação de senha é obrigatória",
        });
      }
    }),
}).superRefine((data, ctx) => {
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    });
  }
});

export type PasswordsSchema = z.infer<typeof passwordsSchema>;
