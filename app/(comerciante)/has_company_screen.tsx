import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import DocumentIcon from "../../assets/icons/document.svg";
import { Etapas } from "@/utils";
import { useState } from "react";

export default function HasCompanyScreen() {
  useDisableBackHandler();
  const { mutate, isPending } = useUpdateUserMutation();
  const [hasCompany, setHasCompany] = useState("");

  const onSubmit = () => {
    if (hasCompany === "") {
      Alert.alert("Atenção", "Por favor, selecione uma opção");
      return;
    }

    mutate({
      request: {
        etapa:  hasCompany === "sim" ?  Etapas.REGISTRANDO_CONTRATO_SOCIAL : Etapas.REGISTRANDO_FRENTE_COMERCIO,
        mei: hasCompany === "sim" ? "1" : "0",
      },
    });
  };

  return (
    <LayoutRegister
      isLogo={false}
      isBack
      onContinue={onSubmit}
      loading={isPending}
    >
      <View className="flex-1 px-6">
        <CircleIcon
          icon={<DocumentIcon />}
          color={Colors.primaryColor}
          size={100}
        />

        <Text className="text-2xl font-bold text-center tet-[#33404F] my-5">
          Você possui empresa aberta?
        </Text>

        <View className="flex-1 flex-row  justify-center items-center gap-5">
          <TouchableOpacity
            onPress={() => setHasCompany("sim")}
            className={
              hasCompany === "sim"
                ? "bg-[#8BC34A] h-32 w-32 border border-[#689F38] p-4 rounded-lg items-center justify-center my-2"
                : "bg-gray-200 h-32 w-32 p-4 rounded-lg items-center justify-center my-2"
            }
          >
            <Text className="text-xl font-bold text-[#33404F]">Sim</Text>

          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setHasCompany("não")}
            className={
              hasCompany === "não"
                ? "bg-[#8BC34A] h-32 w-32 border border-[#689F38] p-4 rounded-lg items-center justify-center my-2"
                : "bg-gray-200 h-32 w-32 p-4 rounded-lg items-center justify-center my-2"
            }
          >
            <Text className="text-xl font-bold text-[#33404F]">Não</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LayoutRegister>
  );
}
