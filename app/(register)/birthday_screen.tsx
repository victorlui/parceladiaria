import { DateInput } from "@/components/DateInput";
import Spinner from "@/components/Spinner";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas, formatDateToISO } from "@/utils";
import { Fontisto } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { Image, Text, View } from "react-native";

interface FormData {
  birthDate: Date;
}

export default function BirthdatScreen() {
  useDisableBackHandler();
  const { control, handleSubmit } = useForm<FormData>();
  const { mutate, isPending } = useUpdateUserMutation();

  const onSubmit = (data: FormData) => {
    const request = {
      nascimento: formatDateToISO(data.birthDate),
      etapa: Etapas.REGISTRANDO_EMAIL,
    };
    mutate({ request: request });
  };

  return (
    <LayoutRegister
      isLogo={false}
      isBack={true}
      loading={isPending}
      onContinue={handleSubmit(onSubmit)}
    >
      <View className="flex-1 justify-between px-6">
        <View className="items-center mb-8 ">
          <Image
            source={require("@/assets/images/apenas-logo.png")}
            className="w-full h-48"
            resizeMode="contain"
          />
        </View>

        <View className="items-center ">
          <View className="bg-[#9BD13D] p-4 rounded-2xl shadow-md">
            <Fontisto name="date" size={40} color="white" />
          </View>
        </View>
        <View className="flex-1  justify-center ">
          <Text className="text-2xl text-center  font-bold">
            Informe sua data de{" "}
          </Text>
          <Text className="text-2xl text-center  font-bold">nascimento </Text>

          <View className="my-10">
            <DateInput<FormData>
              name="birthDate"
              control={control}
              rules={{
                required: "A data de nascimento é obrigatória",
                validate: (value: Date) => {
                  const today = new Date();
                  const minDate = new Date(
                    today.getFullYear() - 18,
                    today.getMonth(),
                    today.getDate()
                  );
                  return value <= minDate || "Você deve ter pelo menos 18 anos";
                },
              }}
            />
          </View>
        </View>
      </View>
    </LayoutRegister>
  );
}
