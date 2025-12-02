import { Button } from "@/components/Button";
import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useAlerts } from "@/components/useAlert";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DocumentIcon from "../../assets/icons/document.svg";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { Etapas } from "@/utils";
import { renderFile } from "@/components/RenderFile";

const AddressDocument: React.FC = () => {
  const { showWarning, AlertDisplay } = useAlerts();
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [loadingValidation, setLoadingValidation] = useState(false);
  const { mutate } = useUpdateUserMutation();
  const { takePhoto, selectPDF } = useDocumentPicker(10);

  //   const validateDocument = async (nextFile: any) => {
  //     if (!nextFile) return;
  //     const formData = new FormData();
  //     const fileToUpload = {
  //       uri: nextFile.uri,
  //       name: nextFile.name,
  //       type: nextFile.mimeType || "application/octet-stream",
  //     };
  //     console.log("fileToUpload", fileToUpload);
  //     formData.append("file", fileToUpload as any);

  //     try {
  //       const endpoint = process.env.EXPO_PUBLIC_API_VALIDATION || "";
  //       const apiKey = process.env.EXPO_PUBLIC_KEY_VALIDATION || "";
  //       const response = await fetch(endpoint, {
  //         method: "POST",
  //         body: formData,
  //         headers: {
  //           Authorization: `ApiKey ${apiKey}`,
  //         },
  //       });
  //       const data = await response.json();
  //       const item = Array.isArray(data) ? data[0] : undefined;
  //       const type = item?.classification?.type;
  //       const rawConfidence = item?.classification?.sides?.[0]?.confidence;
  //       const confidence =
  //         typeof rawConfidence === "number"
  //           ? rawConfidence
  //           : Number(rawConfidence);
  //       if (type !== "ProofOfResidence") {
  //         showWarning(
  //           "Documento inválido",
  //           "O arquivo não corresponde a um comprovante de endereço."
  //         );
  //       } else if (!Number.isNaN(confidence) && confidence < 0.9) {
  //         showWarning(
  //           "Documento inválido",
  //           "Por favor envie um documento válido"
  //         );
  //       }
  //       console.log("data validation", data);
  //     } catch (error) {
  //       console.log("error", error);
  //     } finally {
  //       setLoadingValidation(false);
  //     }
  //   };

  const handleTakePhoto = async () => {
    const result = await takePhoto("camera");
    if (result) {
      setFile(result);
      //   setLoadingValidation(true);
      //   await validateDocument(result);
    }
  };

  const handleSelectPDF = async () => {
    const selected = await selectPDF();
    if (selected) {
      setFile(selected);
      //   setLoadingValidation(true);
      //   await validateDocument(selected);
    }
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

          {renderFile(file)}

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
