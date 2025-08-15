import { useRegisterAuthStore } from "@/store/register";

import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";

import { Etapas } from "@/utils";
import { Alert, Text,View } from "react-native";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { useState } from "react";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import LayoutRegister from "@/components/ui/LayoutRegister";
import CircleIcon from "@/components/ui/CircleIcon";
import { renderFile } from "@/components/RenderFile";
import { Button } from "@/components/Button";
import UserCircleAddIcon from "../../assets/icons/user-circle-add.svg";
import { Colors } from "@/constants/Colors";

export default function RecognitionFace() {
  const { mutate } = useUpdateUserMutation();
  const {  takePhoto } = useDocumentPicker(10);
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);


  const handleTakePhoto = async () => {
    const selected = await takePhoto("camera");
    if (selected) setFile(selected);
  };

  const onSubmit = async () => {
    if (!file) {
      Alert.alert("Atenção", "Por favor, faça um reconhecimento facial para continuar.");
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
          etapa: Etapas.REGISTRANDO_TIPO_COMERCIO,
          face: finalUrl,
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
          icon={<UserCircleAddIcon />}
          color={Colors.primaryColor}
          size={100}
        />
        <View className="flex flex-col gap-3 my-5">
          <Text className="text-2xl font-bold text-center text-[#33404F]">
             Reconhecimento facial
          </Text>
          <Text className="text-base text-center">
             Por favor, faça um reconhecimento facial para continuar.
          </Text>
        </View>

      {renderFile(file)}


        <View className="flex-2  justify-end gap-5 mb-5">
          
          <Button
            title="Tirar foto"
            variant="secondary"
            onPress={handleTakePhoto}
          />
        </View>
      </View>
    </LayoutRegister>
  )
}