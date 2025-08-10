import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { Alert, Text, TextInput, View } from "react-native";
import HouseIcon from "../../assets/icons/home.svg";
import { useState } from "react";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import CircleIcon from "@/components/ui/CircleIcon";
import { Etapas } from "@/utils";

export default function BussinesDescriptionScreen() {
  useDisableBackHandler();
  const [description, setDescription] = useState<string>("");
  const { mutate, isPending } = useUpdateUserMutation();

  const onSubmit = () => {
    if (!description) {
      Alert.alert("Atenção", "Por favor, descreva seu tipo de comercio!");
      return;
    }

    const request = {
      etapa: Etapas.REGISTRANDO_TEM_COMERCIO,
      descricao_comercio: description,
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
          Descreva seu tipo de comércio
        </Text>

        <View className="flex-1">
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline={true}
            placeholder="Digite aqui..."
            textAlignVertical="top"
            className="bg-[#F5F5F5] rounded-md px-4 py-3 border h-full"
            style={{ borderColor: Colors.borderColor }}
          />
        </View>
      </View>
    </LayoutRegister>
  );
}
