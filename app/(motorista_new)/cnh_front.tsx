import SendFilesButtons from "@/components/register/buttons-file";
import Spinner from "@/components/Spinner";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadRawFile } from "@/hooks/useUploadDocument";
import LayoutRegister from "@/layouts/layout-register";
import { useAuthStore } from "@/store/auth";
import { Etapas } from "@/utils";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const CNHFront: React.FC = () => {
  const { userRegister } = useAuthStore();
  const { mutate, isPending } = useUpdateUserMutation();
  const [loading, setLoading] = React.useState(false);

  const sendFileFront = async (file: any) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const finalUrl = await uploadRawFile(file);

      if (!finalUrl) return;

      const isPdf =
        (file.type && file.type.toLowerCase() === "application/pdf") ||
        (file.type && file.type.toLowerCase() === "pdf") ||
        (file.name && file.name.toLowerCase().endsWith(".pdf"));

      const nextEtapa = isPdf
        ? Etapas.MOTORISTA_REGISTRANDO_VIDEO_PERFIL
        : Etapas.MOTORISTA_REGISTRANDO_VERSO_CNH;

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
      title={
        userRegister?.etapa === Etapas.MOTORISTA_REGISTRANDO_VERSO_CNH
          ? "CNH (Verso)"
          : "Sua CNH (Frente)"
      }
      subtitle={
        userRegister?.etapa === Etapas.MOTORISTA_REGISTRANDO_VERSO_CNH
          ? "Agora, uma foto do VERSO do documento"
          : "Envie uma foto ou anexe o PDF do seu documento"
      }
    >
      {(loading || isPending) && <Spinner text="Enviando arquivo" />}
      <View>
        <View style={style.infoContainer}>
          <Text style={style.infoIcon}>✓</Text>
          <Text style={style.infoText}>
            {userRegister?.etapa === Etapas.MOTORISTA_REGISTRANDO_VERSO_CNH
              ? "O QR Code precisa estar nítido e legível"
              : "Se for foto, retire o documento do plástico e garanta boa iluminação."}
          </Text>
        </View>
        <SendFilesButtons sendFile={sendFileFront} />
      </View>
    </LayoutRegister>
  );
};

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

export default CNHFront;
