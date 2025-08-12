import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { Button } from "@/components/Button";
import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { useRegisterAuthStore } from "@/store/register";
import { Etapas } from "@/utils";
import DocumentIcon from "../../assets/icons/document.svg";

export default function CnhFrontScreen() {
  const { etapa } = useRegisterAuthStore();
  const { mutate } = useUpdateUserMutation();
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
          etapa:  file.type === "pdf" ? Etapas.MOTORISTA_REGISTRANDO_PLACA_VEICULO : Etapas.MOTORISTA_REGISTRANDO_VERSO_CNH,
          foto_frente_doc: finalUrl,
        },
      });
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };
  console.log("etapa tela", etapa);

  return (
    <LayoutRegister
      loading={isLoading}
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
          Foto da frente da CNH
          </Text>
          <Text className="text-base text-center">
            Por favor, envie uma foto nítida da frente da sua CNH. Somente CNH
            será aceita como documento válido.
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
