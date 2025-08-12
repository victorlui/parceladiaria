import { Button } from "@/components/Button";
import CircleIcon from "@/components/ui/CircleIcon";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import DocumentIcon from "../../assets/icons/document.svg";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { useMemo, useState } from "react";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { Etapas } from "@/utils";
import { useVideoPlayer, VideoPlayer, VideoView } from "expo-video";

export default function StoreVideoScreen() {
  useDisableBackHandler();
  const { mutate } = useUpdateUserMutation();
  const { takeVideo } = useDocumentPicker(10);

  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoPlayer = useVideoPlayer(file?.uri ?? "", (player) => {
  player.loop = false;
  player.play();
});

// Usa o resultado baseado no tipo do arquivo
const player = useMemo(() => {
  if (file?.type === "video") {
    return videoPlayer;
  }
  return null;
}, [file, videoPlayer]);

  const handleTakePhoto = async () => {
    const selected = await takeVideo("camera");
    if (selected) setFile(selected);
  };

  const handleGallery = async () => {
    const selected = await takeVideo("library");
    console.log('library', selected)

    if (selected) setFile(selected);
  };

  const onSubmit = async () => {
    if (!file) {
      Alert.alert("Atenção", "Por favor, selecione um vídeo.");
      return;
    }

    try {
      setIsLoading(true);
      const finalUrl = await uploadFileToS3({
        file: file,
      });

      if (!finalUrl) return;

      console.log("finalUrl", finalUrl);

      mutate({
        request: {
          etapa: Etapas.ASSISTINDO_VIDEO,
          video_comercio: finalUrl,
        },
      });
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutRegister
      loading={isLoading}
      isBack
      onContinue={onSubmit}
      isLogo={false}
    >
      <View className="flex-1">
        <CircleIcon
          icon={<DocumentIcon />}
          color={Colors.primaryColor}
          size={100}
        />
        <View className="flex flex-col gap-3 my-5">
          <Text className="text-2xl font-bold text-center text-[#33404F]">
            Gravação do Estabelecimento
          </Text>
          <Text className="text-base text-center">
            Para validação do seu estabelecimento, solicitamos um vídeo que
            demonstre a fachada externa e o ambiente interno do seu comércio.
          </Text>
          <Text className="text-base text-center">
            Durante a gravação, por favor identifique-se verbalmente e mencione
            a data atual para fins de autenticação.
          </Text>
        </View>

        <View className="flex-1 mb-3">
          {file && file.type === "video" && (
            <VideoView
              style={{
                width: 350,
                height: 200,
                borderRadius: 12,
                backgroundColor: "#000",
              }}
              player={player as VideoPlayer}
              allowsFullscreen
              allowsPictureInPicture
            />
          )}
        </View>

        <View className="flex-2  justify-end gap-3 mb-5">
          <TouchableOpacity
            onPress={handleGallery}
            className="bg-gray-200 p-4 rounded-lg items-center justify-center"
          >
            <Text className="text-base">Selecionar da galeria</Text>
          </TouchableOpacity>
          <Button
            title="Gravar vídeo"
            variant="secondary"
            onPress={handleTakePhoto}
          />
        </View>
      </View>
    </LayoutRegister>
  );
}
