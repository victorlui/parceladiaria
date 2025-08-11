import { z } from "zod";

export const plateSchema = z.object({
  plate: z
    .string({ message: "Placa é obrigatória" })
    .transform((val) => val.replace(/[^A-Z0-9]/gi, "").toUpperCase()) // remove espaços e hífen
    .refine(
      (plate) => {
        if (!plate) return false;

        // Formato Mercosul: AAA0A00
        const mercosulRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

        // Formato Tradicional: AAA0000
        const tradicionalRegex = /^[A-Z]{3}[0-9]{4}$/;

        return mercosulRegex.test(plate) || tradicionalRegex.test(plate);
      },
      { message: "Formato de placa inválido" }
    ),
});

export type PlateSchema = z.infer<typeof plateSchema>;
