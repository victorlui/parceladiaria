import React from "react";
import SendFilesButtons from "@/components/register/buttons-file";
import Spinner from "@/components/Spinner";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadRawFile } from "@/hooks/useUploadDocument";
import LayoutRegister from "@/layouts/layout-register";
import { Etapas } from "@/utils";
import { StyleSheet, Text, View } from "react-native";

const CNF: React.FC = () => {
  const { mutate, isPending } = useUpdateUserMutation();
  const [loading, setLoading] = React.useState(false);

  const sendFileFront = async (file: any) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const finalUrl = await uploadRawFile(file);

      if (!finalUrl) return;

      mutate({
        request: {
          etapa: Etapas.MOTORISTA_REGISTRANDO_VIDEO_PERFIL,
          foto_verso_doc: finalUrl,
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
      title="CNH (Verso)"
      subtitle="Agora, uma foto do VERSO do documento"
    >
      {(loading || isPending) && <Spinner text="Enviando arquivo" />}
      <View>
        <View style={style.infoContainer}>
          <Text style={style.infoIcon}>✓</Text>
          <Text style={style.infoText}>
            O QR Code precisa estar nítido e legível
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
    alignItems: "center",
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
  },
});

export default CNF;
