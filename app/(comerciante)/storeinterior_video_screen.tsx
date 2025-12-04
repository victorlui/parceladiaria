import SendFilesButtons from "@/components/register/buttons-file";
import Spinner from "@/components/Spinner";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import LayoutRegister from "@/layouts/layout-register";
import { Etapas } from "@/utils";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const StoreInteriorVideo: React.FC = () => {
  const { mutate, isPending } = useUpdateUserMutation();

  const [loading, setLoading] = React.useState(false);

  const sendFile = async (file: File) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const finalUrl = await uploadFileToS3({
        file: {
          uri: (file as any).uri || (file as any).path,
          mimeType: file.type,
          name: file.name,
        },
      });
      if (!finalUrl) return;

      mutate({
        request: {
          etapa: Etapas.COMERCIANTE_ENVIANDO_FRONT_DOCUMENTO_PESSOAL,
          video_interior: finalUrl,
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
      title="Vídeo do Interior"
      subtitle="Grave um vídeo curto do interior do seu estabelecimento."
    >
      {(loading || isPending) && <Spinner text="Enviando vídeo	" />}
      <View>
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

export default StoreInteriorVideo;
