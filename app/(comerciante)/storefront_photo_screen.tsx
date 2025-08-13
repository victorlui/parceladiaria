import { Button } from "@/components/Button";
import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import DocumentIcon from "../../assets/icons/document.svg";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { useState } from "react";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { Etapas } from "@/utils";
import { renderFile } from "@/components/RenderFile";

export default function StorefrontPhotoScreen() {
  useDisableBackHandler();
  const { mutate } = useUpdateUserMutation();
  const { selectPDF, takePhoto } = useDocumentPicker(10);
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // const handleSelectPDF = async () => {
  //   const selected = await selectPDF();
  //   if (selected) setFile(selected);
  // };

  const handleTakePhoto = async () => {
    const selected = await takePhoto("camera");
    if (selected) setFile(selected);
  };

  const onSubmit = async () => {
    if (!file) {
      Alert.alert("Atenção", "Por favor, selecione uma foto ou documento.");
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
          etapa: Etapas.REGISTRANDO_INTERIOR_COMERCIO,
          fachada: finalUrl,
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
          icon={<DocumentIcon />}
          color={Colors.primaryColor}
          size={100}
        />
        <View className="flex flex-col gap-3 my-5">
          <Text className="text-2xl font-bold text-center text-[#33404F]">
            Foto da frente do comércio
          </Text>
          <Text className="text-base text-center">
            Envie uma foto na frente do seu comércio, mostrando seu rosto e a
            frente do estabelecimento.
          </Text>
        </View>

     {renderFile(file)}

        <View className="flex-2  justify-end gap-5 mb-5">
          {/* <TouchableOpacity
            onPress={handleSelectPDF}
            className="bg-gray-200 p-4 rounded-lg items-center justify-center"
          >
            <Text className="text-base">Selecionar documento PDF</Text>
          </TouchableOpacity> */}
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
