import { FormInput } from "@/components/FormInput";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useAddressForm } from "@/hooks/useRegisterForm";
import { AddressSchema } from "@/lib/address_validation";
import { useEffect, useRef, useState } from "react";
import { Image, Keyboard, Text, TextInput, View } from "react-native";
import { useRegisterAuthStore } from "@/store/register";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { useAlerts } from "@/components/useAlert";

export default function AddressScreen() {
  const {showWarning,AlertDisplay} = useAlerts()
  const { setAddress } = useRegisterAuthStore();
  const { control, handleSubmit, setValue, watch } = useAddressForm();
  const { mutate, isPending } = useUpdateUserMutation();
  const [loading, setLoading] = useState(false);
  const cep = watch("cep");

  // Ajuste aqui: agora temos um useRef para cada campo
  const formRefs = [
    useRef<TextInput>(null), // Para o CEP (index 0)
    useRef<TextInput>(null), // Para a Rua (index 1)
    useRef<TextInput>(null), // Para o Número (index 2)
    useRef<TextInput>(null), // Para o Bairro (index 3)
    useRef<TextInput>(null), // Para o Estado (index 4)
    useRef<TextInput>(null), // Para a Cidade (index 5)
  ];

  useEffect(() => {
    const cleanCep = cep?.replace(/\D/g, "");
    if (cleanCep && cleanCep.length === 8) {
      setLoading(true);
      Keyboard.dismiss();
      fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            setValue("rua", data.logradouro || "");
            setValue("bairro", data.bairro || "");
            setValue("cidade", data.localidade || "");
            setValue("estado", data.uf || "");
          } else {
            showWarning("Atenção","CEP não encontrado. Tente novamente");
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
    <>
      <AlertDisplay />
        <LayoutRegister
      isBack
      onContinue={handleSubmit(onSubmit)}
      isLogo={false}
      loading={loading || isPending}
    >
      <View className="flex-1 px-6">
        <View className="items-center">
          <Image
            source={require("@/assets/images/apenas-logo.png")}
            className="w-full h-48"
            resizeMode="contain"
          />
        </View>

        <View className="items-center gap-4">
          <View>
            <Text className="text-2xl text-center font-semibold">Informe seu endereço</Text>
            <Text className="text-base text-center text-gray-600">
              Prencha todos os campos obrigatórios
            </Text>
          </View>
        </View>
        <View className="my-5">
          <FormInput
            control={control}
            label="CEP"
            placeholder="Informe seu CEP"
            name="cep"
            maskType="custom"
            maskOptions={{ mask: "99999-999" }}
            onSubmitEditing={() => formRefs[1].current?.focus()} // Foca na Rua
            ref={formRefs[0]}
          />
          <FormInput
            control={control}
            label="Rua"
            placeholder="Informe sua Rua"
            name="rua"
            onSubmitEditing={() => formRefs[2].current?.focus()} // Foca no Número
            ref={formRefs[1]}
          />
          <FormInput
            control={control}
            label="Número"
            placeholder="Informe seu Número"
            name="numero"
            onSubmitEditing={() => formRefs[3].current?.focus()} // Foca no Bairro
            ref={formRefs[2]}
          />
          <FormInput
            control={control}
            label="Bairro"
            placeholder="Informe seu Bairro"
            name="bairro"
            onSubmitEditing={() => formRefs[4].current?.focus()} // Foca no Estado
            ref={formRefs[3]}
          />
          <FormInput
            control={control}
            label="Estado"
            placeholder="Informe seu Estado"
            name="estado"
            onSubmitEditing={() => formRefs[5].current?.focus()} // Foca na Cidade
            ref={formRefs[4]}
          />
          <FormInput
            control={control}
            label="Cidade"
            placeholder="Informe sua Cidade"
            name="cidade"
            onSubmitEditing={() => Keyboard.dismiss()} // No último campo, esconde o teclado
            ref={formRefs[5]}
          />
        </View>
      </View>
    </LayoutRegister>
    </>
  
  );
}