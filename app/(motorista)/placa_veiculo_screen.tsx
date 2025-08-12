import { Text, View } from "react-native";
import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";

import CarIcon from "../../assets/icons/car.svg";
import { usePlateForm } from "@/hooks/useRegisterForm";
import { PlateSchema } from "@/lib/plate_veiicle";
import { FormInput } from "@/components/FormInput";
import { Etapas } from "@/utils";

export default function PLacaVeiculoScreen() {
  const { mutate, isPending } = useUpdateUserMutation();
  const { control, handleSubmit } = usePlateForm();

  const onSubmit = async (data: PlateSchema) => {
    mutate({
      request: {
        etapa: Etapas.MOTORISTA_REGISTRANDO_DOCUMENTO_VEICULO,
        placa: data.plate,
      },
    });
  };

  return (
    <LayoutRegister
      loading={isPending}
      isBack
      onContinue={handleSubmit(onSubmit)}
      isLogo={false}
    >
      <CircleIcon icon={<CarIcon />} color={Colors.primaryColor} size={100} />
      <View className="h-[250px] px-6">
        <View className="flex flex-col gap-3 my-5">
          <Text className="text-2xl font-bold text-center text-[#33404F]">
            Placa do veículo
          </Text>
          <Text className="text-base text-center">
            Digite a placa do seu veículo conforme consta no documento.
            Certifique-se de que os caracteres estejam corretos.
          </Text>
        </View>
      </View>

      <View className="flex-1 px-6">
        <FormInput
          name="plate"
          control={control}
          label=""
          placeholder="ABC-1D23"
          maskType="vehiclePlate"
           returnKeyType="done"
          onSubmitEditing={handleSubmit(onSubmit)}
        />
      </View>
    </LayoutRegister>
  );
}
