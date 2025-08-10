import LayoutRegister from "@/components/ui/LayoutRegister";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/auth";
import { useRegisterAuthStore } from "@/store/register";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";

const pixKeyTypes = [
  { value: "cpf", label: "CPF", icon: "card-outline" },
  { value: "email", label: "E-mail", icon: "mail-outline" },
  { value: "phone", label: "Telefone", icon: "call-outline" },
  // { value: 'random', label: 'Chave Aleatória', icon: 'key-outline' }
];

export default function ChavePixScreen() {
  const { cpf } = useRegisterAuthStore();
  const { user } = useAuthStore();
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [phone, setPhone] = useState<string>(user?.whatsapp ?? "");
  const { mutate, isPending } = useUpdateUserMutation();

  function onSubmit() {
    if (!email && selectedProfile === "email") {
      Alert.alert("Atenção!!", "Por favor, insira um e-mail como pix");
      return;
    }

    if (!phone && selectedProfile === "phone") {
      Alert.alert(
        "Atenção!!",
        "Por favor, insira um número de telefone como pix"
      );
      return;
    }

    if (!selectedProfile) {
      Alert.alert("Atenção!!", "Por favor, selecione uma chave pix");
      return;
    }

    const request = {
      chave: selectedProfile,
      pix:
        selectedProfile === "cpf"
          ? cpf
          : selectedProfile === "email"
            ? email
            : `+55${phone}`,
      etapa: Etapas.REGISTRANDO_PROFISSAO,
    };

    mutate({ request: request });
  }

  return (
    <LayoutRegister isBack onContinue={onSubmit} loading={isPending}>
      <View className="flex-1 justify-center">
        <Text className="text-2xl font-semibold">Chave PIX</Text>
        <Text className="text-base mb-5">
          Configure sua chave PIX para receber pagamentos
        </Text>
        {pixKeyTypes.map((option) => {
          const isSelected = selectedProfile === option.value;

          return (
            <View key={option.value}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedProfile(option.value);
                  if (option.value === "email") {
                    setEmail(user?.email ?? "");
                  } else if (option.value === "phone") {
                    setPhone(user?.whatsapp ?? "");
                  }
                }}
                className="flex-row items-center border my-3 p-3 rounded-md"
                style={{
                  borderColor: isSelected
                    ? Colors.primaryColor // cor quando selecionado
                    : Colors.borderColor,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: isSelected
                      ? Colors.primaryColor
                      : Colors.borderColor,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                    backgroundColor: isSelected
                      ? Colors.primaryColor
                      : "transparent",
                  }}
                >
                  {isSelected && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#fff",
                      }}
                    />
                  )}
                </View>
                <Text
                  className="font-semibold"
                  style={{
                    color: isSelected ? Colors.primaryColor : "#222222",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
              {selectedProfile === "cpf" && isSelected && (
                <Text className="text-md text-[#222222]">
                  Sua Chave PIX: <Text className="font-bold ">{cpf}</Text>
                </Text>
              )}

              {selectedProfile === "email" && isSelected && (
                <View className="mb-4">
                  <Text className="text-md text-[#222222] mb-2 font-medium">
                    Digite um e-mail para o PIX:
                  </Text>
                  <TextInput
                    placeholder="E-mail"
                    className="border p-3 rounded-md h-[58px]"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    style={{ borderColor: Colors.borderColor }}
                  />
                </View>
              )}

              {selectedProfile === "phone" && isSelected && (
                <View className="mb-4">
                  <Text className="text-md text-[#222222] mb-2 font-medium">
                    Digite um telefone para o PIX:
                  </Text>
                  <TextInput
                    placeholder="Celular"
                    className="border p-3 rounded-md h-[58px]"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    style={{ borderColor: Colors.borderColor }}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </LayoutRegister>
  );
}
