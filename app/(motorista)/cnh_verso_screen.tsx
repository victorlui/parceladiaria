import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Button } from "@/components/Button";
import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import DocumentIcon from "../../assets/icons/document.svg";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { renderFile } from "@/components/RenderFile";

export default function CnhVersoScreen() {
  const { mutate, isPending } = useUpdateUserMutation();
  const { selectPDF, takePhoto } = useDocumentPicker(10);
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
    setIsLoading(true);
    try {
      const finalUrl = await uploadFileToS3({
        file: file,
      });

      if (!finalUrl) return;

      console.log("finalUrl", finalUrl);
      // Etapas.MOTORISTA_REGISTRANDO_PLACA_VEICULO
      mutate({
        request: {
          etapa: Etapas.MOTORISTA_REGISTRANDO_RECONHECIMENTO_FACIAL,
          foto_verso_doc: finalUrl,
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
        <CircleIcon
          icon={<DocumentIcon />}
          color={Colors.primaryColor}
          size={100}
        />
        <View className="flex flex-col gap-3 my-5">
          <Text className="text-2xl font-bold text-center text-[#33404F]">
            Foto do verso da CNH
          </Text>
          <Text className="text-base text-center">
            Por favor, envie uma foto nítida do verso da sua CNH. Somente CNH
            será aceita como documento válido.
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
      </View>
    </LayoutRegister>
  );
}
