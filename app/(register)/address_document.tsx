import { Button } from "@/components/Button";
import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useAlerts } from "@/components/useAlert";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import DocumentIcon from "../../assets/icons/document.svg";
import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { Etapas } from "@/utils";

const AddressDocument: React.FC = () => {
  const { showWarning, AlertDisplay } = useAlerts();
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useUpdateUserMutation();
  const { takePhoto, selectPDF } = useDocumentPicker(10);

  const handleTakePhoto = async () => {
    const result = await takePhoto("camera");
    if (result) {
      setFile(result);
    }
  };

  const handleSelectPDF = async () => {
    const selected = await selectPDF();
    if (selected) setFile(selected);
  };

  const onSubmit = async () => {
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
  };

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
          <Text className="text-xl text-center font-bold">
            Envio de Comprovante de Endereço
          </Text>
          <Text className="text-base text-center">
            Para garantir a segurança e autenticidade do seu cadastro, é
            necessário enviar uma foto válida do seu comprovante de endereço no
            máximo 90 dias, contendo nome, endereço e data. Nossa equipe irá
            analisar o documento enviado para confirmar que ele atende aos
            critérios estabelecidos.
          </Text>

          {!file && (
            <View className="border border-dashed mb-4 flex-row rounded-lg items-center justify-center flex-1">
              <Feather name="file" size={50} color="#9CA3AF" />
            </View>
          )}

          {file && (
            <View className="mb-4 rounded-lg flex-1 overflow-hidden">
              <Image
                source={{ uri: file.uri }}
                style={{ width: "100%", height: 200 }}
                resizeMode="contain"
              />
            </View>
          )}

          {file?.type === "pdf" && (
            <View className="border border-dashed mb-4 flex-row rounded-lg items-center justify-center flex-1 p-4">
              <Feather name="file-text" size={30} color="#9CA3AF" />
              <Text className="ml-2 text-gray-500">{file.name}</Text>
            </View>
          )}

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
      </LayoutRegister>
    </>
  );
};

export default AddressDocument;
