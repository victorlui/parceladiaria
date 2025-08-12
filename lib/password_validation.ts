import { z } from "zod";

export const passwordLoginSchema = z.object({
  password: z.string().optional(),
});

export type PasswordLoginSchema = z.infer<typeof passwordLoginSchema>;
