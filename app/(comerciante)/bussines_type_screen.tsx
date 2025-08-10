import LayoutRegister from "@/components/ui/LayoutRegister";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import HouseIcon from "../../assets/icons/home.svg";
import { Colors } from "@/constants/Colors";
import CircleIcon from "@/components/ui/CircleIcon";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { useState } from "react";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";

const businessTypes = [
  { id: "barbershop", name: "Barbearia" },
  { id: "restaurant", name: "Restaurante" },
  { id: "market", name: "Mercado" },
  { id: "bakery", name: "Padaria" },
  { id: "pharmacy", name: "Farmácia" },
  { id: "clothing", name: "Loja de Roupas" },
  { id: "other", name: "Outro" },
];

export default function BussinesTypeScreen() {
  useDisableBackHandler();
  const [selectedType, setSelectedType] = useState<string>("");
  const { mutate, isPending } = useUpdateUserMutation();

  const onSubmit = () => {
    if (!selectedType) {
      Alert.alert("Atenção", "Por favor, selecione um tipo de comércio!");
      return;
    }
    const selectedTypeName =
      businessTypes.find((type) => type.id === selectedType)?.name ||
      selectedType;
    const request = {
      etapa: Etapas.REGISTRANDO_EMPRESA_ABERTA,
      tipo_comercio: selectedTypeName,
    };
    mutate({ request: request });
  };

  return (
    <LayoutRegister
      isLogo={false}
      isBack
      onContinue={onSubmit}
      loading={isPending}
    >
      <View className="flex-1">
        <CircleIcon
          icon={<HouseIcon />}
          color={Colors.primaryColor}
          size={100}
        />
        <Text className="text-2xl font-bold text-center tet-[#33404F] my-5">
          Qual o seu tipo de comércio?
        </Text>
        {businessTypes.map((type) => (
          <TouchableOpacity
            onPress={() => setSelectedType(type.id)}
            key={type.id}
            className={
              selectedType === type.id
                ? "bg-[#8BC34A] border border-[#689F38] p-4 rounded-lg items-center justify-center my-2"
                : "bg-gray-200 p-4 rounded-lg items-center justify-center my-2"
            }
          >
            <Text className="text-[18px] font-semibold text-[#3A3A3A]">
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LayoutRegister>
  );
}
