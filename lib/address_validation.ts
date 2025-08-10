import { z } from "zod";

const ufList = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export const addressSchema = z.object({
  cep: z
    .string({ message: "CEP é obrigatório" })
    .regex(
      /^\d{5}-?\d{3}$/,
      "CEP inválido. Formato esperado: 12345-678 ou 12345678"
    ),
  rua: z
    .string({ message: "Rua/Avenida é obrigatório" })
    .min(1, "Rua/Avenida não pode ser vazia"),
  numero: z.string().min(1,"Número é obrigatório"),

  bairro: z
    .string({ message: "Bairro é obrigatório" })
    .min(1, "Bairro não pode ser vazio"),
  estado: z
    .string({ message: "Estado é obrigatório" })
    .length(2, "Estado deve ter 2 caracteres (UF)")
    .refine((val) => ufList.includes(val.toUpperCase()), "Estado inválido"),
  cidade: z
    .string({ message: "Cidade é obrigatório" })
    .min(1, "Cidade não pode ser vazia"),
  complemento: z.string().optional().nullable(),
});

// Tipo inferido para usar na tipagem Typescript
export type AddressSchema = z.infer<typeof addressSchema>;
