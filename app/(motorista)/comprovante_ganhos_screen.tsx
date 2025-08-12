import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { Etapas } from "@/utils";
import CarIcon from "../../assets/icons/user-circle-add.svg";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";

export default function ComprovanteGanhosScreen() {
  useDisableBackHandler();
  const { mutate, isPending } = useUpdateUserMutation();
  const { takePhoto } = useDocumentPicker(10);
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectGallery = async () => {
    const selected = await takePhoto("library");
    if (selected) setFile(selected);
  };

  const onSubmit = async () => {
    if (!file) {
      Alert.alert("Erro", "Por favor, selecione um comprovante de ganhos.");
      return;
    }
    try {
      setIsLoading(true);
      const finalUrl = await uploadFileToS3({
        file: file,
      });

      if (!finalUrl) return;

      mutate({
        request: {
          etapa: Etapas.MOTORISTA_REGISTRANDO_PRINT_ADICIONAL,
          ganhos_app:finalUrl
        },
      });
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutRegister
      loading={isLoading || isPending}
      isBack
      onContinue={onSubmit}
      isLogo={false}
    >
      <View className="flex-1">
        <CircleIcon icon={<CarIcon />} color={Colors.primaryColor} size={100} />
        <View className="flex flex-col gap-3 my-5">
          <Text className="text-2xl font-bold text-center text-[#33404F]">
            Relatório de Ganhos no
          </Text>
          <Text className="text-2xl font-bold text-center text-[#33404F]">
            Aplicativo de Corridas
          </Text>
          <Text className="text-base text-center">
            Envie uma foto ou vídeo do seu perfil completo no aplicativo de
            corridas. É necessário mostrar sua foto de perfil, número total de
            corridas e seus ganhos dos últimos 30 dias. Não corte nenhuma
            informação.
          </Text>
        </View>

        <View className="flex-1">
          {file && (
            <>
              {file.type === "image" ? (
                <View className="w-full flex-1   mb-3">
                  <Image
                    source={{ uri: file.uri }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View>
                  <Text className="text-base mt-10">Documento: </Text>
                  <Text className="text-xl font-semibold mb-10">
                    {file.name}{" "}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

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
