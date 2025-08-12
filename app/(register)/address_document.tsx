import { Button } from "@/components/Button";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useState, useCallback } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import CircleIcon from "@/components/ui/CircleIcon";
import DocumentIcon from "../../assets/icons/document.svg";

import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { Etapas } from "@/utils";
import { Colors } from "@/constants/Colors";
import { useAlerts } from "@/components/useAlert";
import { Feather } from "@expo/vector-icons";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";

export default function AddressDocument() {
  // Hook no topo (como o React exige)
  useDisableBackHandler();

  const { showWarning, AlertDisplay } = useAlerts();
  const { mutate } = useUpdateUserMutation();
  const { selectPDF, takePhoto } = useDocumentPicker(10);

  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPDF = useCallback(async () => {
    const selected = await selectPDF();
    if (selected) setFile(selected);
  }, [selectPDF]);

  const handleTakePhoto = useCallback(async () => {
    const selected = await takePhoto("camera");
    if (selected) setFile(selected);
  }, [takePhoto]);

  const onSubmit = useCallback(async () => {
    if (!file) {
      showWarning("Atenção", "Por favor, selecione uma foto ou documento.");
      return;
    }

    try {
      setIsLoading(true);
      const finalUrl = await uploadFileToS3({ file });

      if (!finalUrl) return;

      mutate({
        request: {
          etapa: Etapas.REGISTRANDO_PIX,
          comprovante_endereco: finalUrl,
        },
      });
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  }, [file, mutate, showWarning]);

  const renderFile = useCallback(() => {
    if (!file) {
      return (
        <View className="border border-dashed mb-4 flex-row rounded-lg items-center justify-center flex-1">
          <Feather name="file" size={50} color="#9CA3AF" />
        </View>
      );
    }

    if (file.type === "pdf") {
      return (
        <View className="border border-dashed mb-4 flex-row rounded-lg items-center justify-center flex-1 p-4">
          <Feather name="file-text" size={30} color="#9CA3AF" />
          <Text className="ml-2 text-gray-500">{file.name}</Text>
        </View>
      );
    }

    return (
      <View className="mb-4 rounded-lg overflow-hidden">
        <Image
          source={{ uri: file.uri }}
          className="w-full h-40"
          resizeMode="contain"
        />
      </View>
    );
  }, [file]);

  return (
    <>
      <AlertDisplay />
      <LayoutRegister
        loading={isLoading}
        isBack
        onContinue={onSubmit}
        isLogo={false}
      >
        <View className="flex-1 pb-5 px-6 ">
          <CircleIcon
            icon={<DocumentIcon />}
            color={Colors.primaryColor}
            size={100}
          />
          <View className="flex flex-col gap-3 my-5">
            <Text className="text-xl text-center font-bold">
              Envio de Comprovante de Endereço
            </Text>
            <Text className="text-base text-center">
              Para garantir a segurança e autenticidade do seu cadastro, é
              necessário enviar uma foto válida do seu comprovante de endereço
              no máximo 90 dias, contendo nome, endereço e data. Nossa equipe
              irá analisar o documento enviado para confirmar que ele atende aos
              critérios estabelecidos.
            </Text>
          </View>

          {renderFile()}

          <View className="justify-end gap-5">
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
    </>
  );
}
