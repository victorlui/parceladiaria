import { FormInput } from "@/components/FormInput";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useAddressForm } from "@/hooks/useRegisterForm";
import { AddressSchema } from "@/lib/address_validation";
import { useEffect, useState } from "react";
import { Keyboard, Text, View } from "react-native";
import { useRegisterAuthStore } from "@/store/register";
import { router } from "expo-router";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";

export default function AddressScreen() {
  const { setAddress } = useRegisterAuthStore();
  const { control, handleSubmit, setValue, watch } = useAddressForm();
  const { mutate, isPending } = useUpdateUserMutation();
  const [loading, setLoading] = useState(false);
  const cep = watch("cep");

  useEffect(() => {
    const cleanCep = cep?.replace(/\D/g, "");
    if (cleanCep && cleanCep.length === 8) {
      setLoading(true);
      Keyboard.dismiss();
      fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          console.log("cep", data);
          if (!data.erro) {
            setValue("rua", data.logradouro || "");
            setValue("bairro", data.bairro || "");
            setValue("cidade", data.localidade || "");
            setValue("estado", data.uf || "");
          } else {
            alert("CEP não encontrado. Tente novamente");
          }
        })
        .catch(() => {
          // lidar com erro se quiser
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [cep, setValue]);

  const onSubmit = (data: AddressSchema) => {
    setAddress(data);
    const request = {
      cep: data.cep,
      endereco: data.rua,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      complemento: data.complemento,
      etapa: Etapas.REGISTRANDO_COMPROVANTE_ENDERECO,
    };

    mutate({ request: request });
    //router.push('/(register)/address_document')
  };

  return (
    <LayoutRegister
      isBack
      onContinue={handleSubmit(onSubmit)}
      isLogo={false}
      loading={loading || isPending}
    >
      <View className="flex-1  ">
        <Text className="text-2xl font-semibold">Informe seu endereço</Text>
        <Text className="text-base text-gray-600">
          Prencha todos os campos obrigatórios
        </Text>

        <View className="mt-5">
          <FormInput
            control={control}
            label="CEP"
            placeholder="Informe seu CEP"
            name="cep"
            maskType="custom"
            maskOptions={{ mask: "99999-999" }}
          />
          <FormInput
            control={control}
            label="Rua"
            placeholder="Informe sua Rua"
            name="rua"
          />
          <FormInput
            control={control}
            label="Número"
            placeholder="Informe seu Número"
            name="numero"
          />
          <FormInput
            control={control}
            label="Bairro"
            placeholder="Informe seu Bairro"
            name="bairro"
          />
          <FormInput
            control={control}
            label="Estado"
            placeholder="Informe seu Estado"
            name="estado"
          />
          <FormInput
            control={control}
            label="Cidade"
            placeholder="Informe sua Cidade"
            name="cidade"
          />
        </View>
      </View>
    </LayoutRegister>
  );
}
