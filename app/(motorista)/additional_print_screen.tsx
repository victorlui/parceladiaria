import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { Etapas } from "@/utils";
import CarIcon from "../../assets/icons/user-circle-add.svg";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { renderFile } from "@/components/RenderFile";
import { useAlerts } from "@/components/useAlert";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { router } from "expo-router";

export default function AdditionalPrintScreen() {
  useDisableBackHandler();
  const { showSuccess, AlertDisplay } = useAlerts();

  const { mutate, isPending, isSuccess } = useUpdateUserMutation();
  const { isPending: isLoadingLogin } = useLoginMutation();

  const { takePhoto } = useDocumentPicker(10);
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectGallery = async () => {
    const selected = await takePhoto("library");
    if (selected) setFile(selected);
  };

  useEffect(() => {
    if (isSuccess) {
      showSuccess(
        "Sucesso",
        "Cadastro realizado com sucesso!. Faça login para continuar.",
        () => {
          router.replace("/analise_screen");
        }
      );
    }
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async () => {
    if (file) {
      setIsLoading(true);
      try {
        const finalUrl = await uploadFileToS3({
          file: file,
        });

        if (!finalUrl) return;

        mutate({
          request: {
            etapa: Etapas.FINALIZADO,
            foto_perfil_app2: finalUrl,
          },
        });
      } catch (error) {
        console.log("error", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      mutate({
        request: {
          etapa: Etapas.FINALIZADO,
        },
      });
    }
  };

  return (
    <LayoutRegister
      loading={isLoading || isPending || isLoadingLogin}
      isBack
      onContinue={onSubmit}
      isLogo={false}
    >
      <AlertDisplay />
      <View className="flex-1 px-6">
        <CircleIcon icon={<CarIcon />} color={Colors.primaryColor} size={100} />
        <View className="flex flex-col gap-3 my-5">
          <Text className="text-2xl font-bold text-center text-[#33404F]">
            Gostaria de adicionar mais um comprovante?
          </Text>
          <Text className="text-base text-center">
            Quanto mais informações sobre seu relacionamento com a plataforma,
            maior a chance de aprovação.
          </Text>
        </View>

        {renderFile(file)}

        <View className="flex-2  justify-end gap-5 mb-5">
          <TouchableOpacity
            onPress={handleSelectGallery}
            className="bg-gray-200 p-4 rounded-lg items-center justify-center"
          >
            <Text className="text-base">Abrir galeria</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LayoutRegister>
  );
}
