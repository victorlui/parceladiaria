import api from "@/services/api";
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
  const [confirmAddress, setConfirmAddress] = React.useState(false);

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
    updateField(field, text);

    if (field === "cep") {
      const cleanCep = text.replace(/\D/g, "");
      if (cleanCep.length === 8) {
        await searchCep(text);
      } else {
        const cepError = validateCep(cleanCep);
        if (cepError) {
          setErrors((prev) => ({
            ...prev,
            cep: cepError,
          }));
        }
      }
    }
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
      console.log(data);
      setForm((prev) => ({
        ...prev,
        endereco: data?.data?.logradouro ?? data?.logradouro ?? "",
        bairro: data?.data?.bairro ?? data?.bairro ?? "",
        estado: data?.data?.uf ?? data?.uf ?? "",
        cidade:
          data?.data?.localidade ??
          data?.localidade ??
          data?.cidade ??
          data?.city ??
          "",
      }));

      refs.numero?.current?.focus();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        cep: "CEP não encontrado",
      }));

      console.log(error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleConfirmAddress = () => {
    setConfirmAddress(true);
  };

  return {
    refs,
    form,
    errors,
    loadingCep,
    handleChange,
    searchCep,
    handleConfirmAddress,
    confirmAddress,
  };
}
