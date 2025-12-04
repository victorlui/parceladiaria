import SendFilesButtons from "@/components/register/buttons-file";
import Spinner from "@/components/Spinner";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import LayoutRegister from "@/layouts/layout-register";
import { Etapas } from "@/utils";
import React from "react";
import { View } from "react-native";

const StoreFrontVideo: React.FC = () => {
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
          etapa: Etapas.COMERCIANTE_ENVIANDO_VIDEO_INTERIOR,
          video_fachada: finalUrl,
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
      title="Vídeo da Fachada"
      subtitle="Grave um vídeo curto da frente do seu estabelecimento."
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

export default StoreFrontVideo;
