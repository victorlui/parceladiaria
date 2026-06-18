import { api } from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import React from "react";
import { TextInput } from "react-native";
import { Address } from "../types/address";

type AddressRefs = {
  [K in keyof Address]: React.RefObject<TextInput | null>;
};

type AddressErrors = Partial<Record<keyof Address, string>>;

export function useRegisterAddress() {
  const { data } = useRegisterStore();
  const hasInitialValidatedCep = Boolean(
    data?.cep?.replace(/\D/g, "").length === 8 &&
    data?.endereco &&
    data?.bairro &&
    data?.cidade &&
    data?.estado,
  );
  const refs: AddressRefs = {
    cep: React.useRef<TextInput>(null),
    endereco: React.useRef<TextInput>(null),
    numero: React.useRef<TextInput>(null),
    bairro: React.useRef<TextInput>(null),
    cidade: React.useRef<TextInput>(null),
    estado: React.useRef<TextInput>(null),
    complemento: React.useRef<TextInput>(null),
  };
  const [form, setForm] = React.useState<Address>({
    cep: data?.cep || "",
    endereco: data?.endereco || "",
    numero: data?.numero || "",
    bairro: data?.bairro || "",
    cidade: data?.cidade || "",
    estado: data?.estado || "",
    complemento: data?.complemento || "",
  });
  const [errors, setErrors] = React.useState<AddressErrors>({});
  const [loadingCep, setLoadingCep] = React.useState(false);
  const [isCepValidated, setIsCepValidated] = React.useState(
    hasInitialValidatedCep,
  );

  const updateField = (field: keyof Address, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleChange = (field: keyof Address) => async (text: string) => {
    if (field === "cep") {
      const cleanCep = text.replace(/\D/g, "");

      setIsCepValidated(false);
      setForm((prev) => ({
        ...prev,
        cep: text,
        endereco: "",
        bairro: "",
        cidade: "",
        estado: "",
      }));
      setErrors((prev) => ({
        ...prev,
        cep: cleanCep ? "" : "CEP é obrigatório",
      }));

      if (cleanCep.length === 8) {
        await searchCep(cleanCep);
      } else if (cleanCep.length > 0) {
        const cepError = validateCep(cleanCep);
        if (cepError) {
          setErrors((prev) => ({
            ...prev,
            cep: cepError,
          }));
        }
      }

      return;
    }

    updateField(field, text);
  };

  const validateCep = (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");

    if (!cleanCep) {
      return "CEP é obrigatório";
    }

    if (cleanCep.length !== 8) {
      return "CEP inválido";
    }

    return "";
  };

  const searchCep = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");

    const cepError = validateCep(cleanCep);

    if (cepError) {
      setErrors((prev) => ({
        ...prev,
        cep: cepError,
      }));

      return;
    }

    setLoadingCep(true);

    try {
      const { data } = await api.get(`cep/${cleanCep}`);
      const endereco = data?.data?.logradouro ?? data?.logradouro ?? "";
      const bairro = data?.data?.bairro ?? data?.bairro ?? "";
      const estado = data?.data?.uf ?? data?.uf ?? "";
      const cidade =
        data?.data?.localidade ??
        data?.localidade ??
        data?.cidade ??
        data?.city ??
        "";

      if (!endereco || !bairro || !estado || !cidade) {
        throw new Error("CEP sem retorno valido");
      }

      setForm((prev) => ({
        ...prev,
        cep: cleanCep,
        endereco,
        bairro,
        estado,
        cidade,
      }));
      setErrors((prev) => ({
        ...prev,
        cep: "",
      }));
      setIsCepValidated(true);
    } catch {
      setIsCepValidated(false);
      setErrors((prev) => ({
        ...prev,
        cep: "CEP não encontrado",
      }));
      setForm((prev) => ({
        ...prev,
        endereco: "",
        bairro: "",
        estado: "",
        cidade: "",
        numero: "",
      }));
    } finally {
      setLoadingCep(false);
    }
  };

  return {
    refs,
    form,
    errors,
    loadingCep,
    isCepValidated,
    handleChange,
    searchCep,
  };
}
