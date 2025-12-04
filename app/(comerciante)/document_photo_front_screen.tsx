import React from "react";
import SendFilesButtons from "@/components/register/buttons-file";
import Spinner from "@/components/Spinner";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import LayoutRegister from "@/layouts/layout-register";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { StyleSheet, Text, View } from "react-native";

export default function DocumentFrontScreen() {
  const { mutate, isPending } = useUpdateUserMutation();
  const [loading, setLoading] = React.useState(false);

  const sendFileFront = async (file: File) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const finalUrl = await uploadFileToS3({
        file: {
          uri: (file as any).uri || (file as any).path,
          name: file.name,
          mimeType: file.type,
        },
      });

      if (!finalUrl) return;

      const isPdf =
        (file.type && file.type.toLowerCase() === "application/pdf") ||
        (file.type && file.type.toLowerCase() === "pdf") ||
        (file.name && file.name.toLowerCase().endsWith(".pdf"));

      const nextEtapa = isPdf
        ? Etapas.REGISTRANDO_TIMELESS_FACE
        : Etapas.COMERCIANTE_ENVIANDO_VERSO_DOCUMENTO_PESSOAL;

      mutate({
        request: {
          etapa: nextEtapa,
          foto_frente_doc: finalUrl,
        },
      });
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutRegister
      title="Seu Documento Pessoal (Frente)"
      subtitle="Envie uma foto ou anexe o PDF do seu documento."
    >
      {(loading || isPending) && <Spinner text="Enviando arquivo" />}
      <View>
        <View style={style.infoContainer}>
          <Text style={style.infoIcon}>✓</Text>
          <Text style={style.infoText}>
            Se for foto, retire o documento do plástico e garanta boa
            iluminação.
          </Text>
        </View>
        <SendFilesButtons sendFile={sendFileFront} />
      </View>
    </LayoutRegister>
  );
}

const style = StyleSheet.create({
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EBFAF2",
    borderColor: "#C9EBD9",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 20,
    width: "100%",
  },
  infoIcon: {
    color: "#2E7D32",
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    color: "#1F3D2B",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
