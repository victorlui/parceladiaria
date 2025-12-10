import SendFilesButtons from "@/components/register/buttons-file";
import Spinner from "@/components/Spinner";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import LayoutRegister from "@/layouts/layout-register";
import { Etapas } from "@/utils";
import React from "react";
import { View } from "react-native";

const ExtratoBancario: React.FC = () => {
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
          extrato_bancario: finalUrl,
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
      title="Extrato Bancário"
      subtitle="Precisamos do seu extrato bancário dos últimos 60 dias."
    >
      {(loading || isPending) && <Spinner text="Enviando extrato bancário	" />}
      <View style={{ width: "90%" }}>
        <SendFilesButtons
          sendFile={sendFile}
          video={false}
          pdf={false}
          photo={false}
          library={true}
        />
      </View>
    </LayoutRegister>
  );
};

export default ExtratoBancario;
