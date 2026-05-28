import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Colors } from "../constants/colors";
import { isValidCPF, isValidEmail, isValidPhone } from "./validate";

export type PixType = "cpf" | "phone" | "email";
export type PixValue = "cpf" | "whatsapp" | "email";
export const PIX_OPTIONS = {
  cpf: {
    label: "CPF",
    subtitle: "Usar meu CPF",
    placeholder: "000.000.000-00",
    keyboardType: "number-pad" as const,
    maskType: "cpf" as const,
    icon: React.createElement(FontAwesome, {
      name: "id-card" as keyof typeof FontAwesome.glyphMap,
      size: 20,
      color: Colors.gray.primary,
    }),
    validator: isValidCPF,
    error: "CPF inválido",
    value: "cpf",
  },

  phone: {
    label: "Telefone",
    subtitle: "Seu telefone",
    placeholder: "(00) 00000-0000",
    keyboardType: "phone-pad" as const,
    maskType: "cellphone" as const,
    icon: React.createElement(Ionicons, {
      name: "call-sharp" as keyof typeof Ionicons.glyphMap,
      size: 20,
      color: Colors.gray.primary,
    }),
    validator: isValidPhone,
    error: "Telefone inválido",
    value: "whatsapp",
  },

  email: {
    label: "E-mail",
    subtitle: "Seu e-mail",
    placeholder: "seuemail@exemplo.com",
    keyboardType: "email-address" as const,
    icon: React.createElement(Ionicons, {
      name: "mail-sharp" as keyof typeof Ionicons.glyphMap,
      size: 20,
      color: Colors.gray.primary,
    }),
    validator: isValidEmail,
    error: "E-mail inválido",
    autoCapitalize: "none" as const,
    value: "email",
    maskType: undefined,
  },
};

export const DEFAULT_VALUES = (
  type: PixType,
  values: {
    cpf?: string;
    whatsapp?: string;
    email?: string;
  },
) => {
  if (type === "phone") return values.whatsapp || "";
  return values[type] || "";
};

export const sanitizeValue = (value: string, type: PixType) => {
  if (type === "cpf" || type === "phone") {
    return value.replace(/\D/g, "");
  }

  return value.trim().toLowerCase();
};
