import Spinner from "@/components/Spinner";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { useState } from "react";
import { Text, TouchableOpacity, View, Alert } from "react-native";

const profileOptions = [
  {
    id: "motorista_carro",
    label: "Motorista De App - Carro",
    profissaoValue: "MOTORISTA DE APP (CARRO)",
  },
  {
    id: "motorista_moto",
    label: "Motorista De App - Moto",
    profissaoValue: "MOTORISTA DE APP (MOTO)",
  },
  { id: "comerciante", label: "Comerciante", profissaoValue: "COMERCIANTE" },
];

export default function ProfileSelection() {
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const { mutate, isPending } = useUpdateUserMutation();

  const onContinue = () => {
    if (!selectedProfile) {
      Alert.alert("Seleção obrigatória", "Por favor, selecione um perfil.");
      return;
    }

    let etapa

    if(selectedProfile === 'comerciante') {
     etapa = Etapas.REGISTRANDO_FRENTE_DOCUMENTO_COMERCIO
    } else if(selectedProfile === 'motorista_carro' || selectedProfile === 'motorista_moto') {
      etapa = Etapas.MOTORISTA_REGISTRANDO_FRENTE_CNH
    }

    const request = {
      etapa: etapa,
      profissao: profileOptions.find((option) => option.id === selectedProfile)
        ?.profissaoValue,
    };

    mutate({ request: request });
  };

  return (
    <LayoutRegister isBack onContinue={onContinue}>
        {isPending && <Spinner />}
      <View className="flex-1">
        <Text className="text-center text-2xl font-semibold my-5">
          Selecione seu perfil
        </Text>

        {profileOptions.map((option) => {
          const isSelected = selectedProfile === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => setSelectedProfile(option.id)}
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
          );
        })}
      </View>
    </LayoutRegister>
  );
}
