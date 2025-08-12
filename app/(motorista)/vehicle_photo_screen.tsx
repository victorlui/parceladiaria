import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { Button } from "@/components/Button";
import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { Etapas } from "@/utils";
import CarIcon from "../../assets/icons/car.svg";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { renderFile } from "@/components/RenderFile";

export default function VehiclePhotoScreen() {
  useDisableBackHandler()
  const { mutate } = useUpdateUserMutation();
  const { takePhoto } = useDocumentPicker(10);
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectGallery = async () => {
    const selected = await takePhoto('library');
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
        "Por favor, tire uma selfie com o veículo ou selecione da galeria."
      );
      return;
    }

    try {
      setIsLoading(true);
      const finalUrl = await uploadFileToS3({
        file: file,
      });

      if (!finalUrl) return;

      console.log("finalUrl", finalUrl);

      mutate({
        request: {
          etapa: Etapas.MOTORISTA_REGISTRANDO_DOCUMENTO_PROPRIETARIO,
          foto_veiculo: finalUrl,
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
      loading={isLoading}
      isBack
      onContinue={onSubmit}
      isLogo={false}
    >
      <View className="flex-1 px-6">
        <CircleIcon
          icon={<CarIcon />}
          color={Colors.primaryColor}
          size={100}
        />
        <View className="flex flex-col gap-3 my-5">
          <Text className="text-2xl font-bold text-center text-[#33404F]">
            Selfie com o veículo
          </Text>
          <Text className="text-base text-center">
            Tire uma selfie comprovando que você é o proprietário do veículo
          </Text>
          <Text className="text-base text-center">
            Dicas: mostre o veículo ao fundo, esteja bem iluminado e use roupas
            claras
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
