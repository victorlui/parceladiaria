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
import { renderFile } from "@/components/RenderFile";
import { Button } from "@/components/Button";

export default function DocumentBackScreen() {
  useDisableBackHandler();
  const { mutate, isPending } = useUpdateUserMutation();
  const { takePhoto, selectPDF } = useDocumentPicker(10);
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPDF = async () => {
    const selected = await selectPDF();
    if (selected) setFile(selected);
  };

  const handleTakePhoto = async () => {
    const selected = await takePhoto("camera");
    if (selected) setFile(selected);
  };

  const onSubmit = async () => {
    if (!file) {
      Alert.alert(
        "Atenção",
        "Por favor, tire uma foto do verso da CNH ou selecione."
      );
      return;
    }

    try {
      setIsLoading(true);
      const finalUrl = await uploadFileToS3({
        file: file,
      });

      if (!finalUrl) return;
    // Etapas.REGISTRANDO_TIPO_COMERCIO
      const request = {
        etapa: Etapas.COMERCIANTE_REGISTRANDO_RECONHECIMENTO_FACIAL,
        foto_verso_doc: finalUrl,
      };
      mutate({ request: request });
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
      <View className="flex-1 px-6">
        <CircleIcon icon={<CarIcon />} color={Colors.primaryColor} size={100} />
        <View className="flex flex-col gap-3 my-5">
          <Text className="font-semibold text-center text-2xl mb-2">
            Envio de Documento
          </Text>
          <Text className="mb-4 text-base text-center">
            Envie uma foto da parte do verso do documento (RG ou CNH) emitido
            em no máximo 10 anos.
          </Text>
        </View>

        {renderFile(file)}

        <View className="flex-2  justify-end gap-5 mb-5">
          <TouchableOpacity
            onPress={handleSelectPDF}
            className="bg-gray-200 p-4 rounded-lg items-center justify-center"
          >
            <Text className="text-base">Selecionar documento PDF</Text>
          </TouchableOpacity>
          <Button
            title="Tirar foto"
            variant="secondary"
            onPress={handleTakePhoto}
          />
        </View>

        <Text className="text-base mb-3">
          OBS: Documentos emitidos à mais de 10 anos serão rejeitados.
        </Text>
      </View>
    </LayoutRegister>
  );
}
