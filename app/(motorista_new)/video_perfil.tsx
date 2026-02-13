import SendFilesButtons from "@/components/register/buttons-file";
import Spinner from "@/components/Spinner";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadRawFile } from "@/hooks/useUploadDocument";
import LayoutRegister from "@/layouts/layout-register";
import { Etapas } from "@/utils";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const VideoPerfil: React.FC = () => {
  const { mutate, isPending } = useUpdateUserMutation();

  const [loading, setLoading] = React.useState(false);

  const sendFile = async (file: any) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const finalUrl = await uploadRawFile(file);
      if (!finalUrl) return;

      mutate({
        request: {
          etapa: Etapas.MOTORISTA_REGISTRANDO_TIMELESS_FACE,
          video_perfil_app: finalUrl,
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
      title="Vídeo do seu perfil"
      subtitle="Grave a tela mostrando o perfil e ganhos no seu app de motorista"
    >
      {(loading || isPending) && <Spinner text="Enviando vídeo	" />}
      <View>
        <View style={style.infoContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={style.infoIcon}>✓</Text>
            <Text style={style.infoText}>
              Mostre seu perfil com nome e foto
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={style.infoIcon}>✓</Text>
            <Text style={style.infoText}>
              Mostre seus ganhos dos ultimos 30 dias
            </Text>
          </View>
        </View>
        <SendFilesButtons
          sendFile={sendFile}
          video={true}
          pdf={false}
          photo={false}
        />
      </View>
    </LayoutRegister>
  );
};

const style = StyleSheet.create({
  infoContainer: {
    backgroundColor: "#EBFAF2",
    borderColor: "#C9EBD9",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    width: "100%",
    gap: 8,
    marginVertical: 12,
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

export default VideoPerfil;
