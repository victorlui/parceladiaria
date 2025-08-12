import Spinner from "@/components/Spinner";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { useRegisterAuthStore } from "@/store/register";
import { Etapas } from "@/utils";
import { useEvent } from "expo";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VideoScreen() {
  const insets = useSafeAreaInsets();
  const { isPending } = useLoginMutation();
  const { mutate: registerMutate } = useUpdateUserMutation();

  useDisableBackHandler();
  const [progress, setProgress] = useState(0); // 0 a 1
  const videoPlayer = useVideoPlayer(
    require("../../assets/videos/cadastro-em-analise.mp4") ?? "",
    (player) => {
      player.loop = false; // Disable loop to detect when video ends
      player.play();
      player.currentTime = player.duration - 10;
    }
  );

  const videoRef = useRef<VideoView>(null);

  useEffect(() => {
    const subscription = videoPlayer.addListener("playToEnd", () => {
      console.log("video acabou");
      onContinue();
    });
    return () => {
      subscription.remove();
    };
  }, [videoPlayer]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const checkTime = setInterval(() => {
      const duration = videoPlayer.duration;
      const current = videoPlayer.currentTime;
      if (duration != null && current != null) {
        const prog = current / duration;
        setProgress(prog > 1 ? 1 : prog);
      }
    }, 500);

    const subscription = videoPlayer.addListener("playToEnd", () => {
      clearInterval(checkTime); // para o loop
    });

    return () => {
      clearInterval(checkTime);
      subscription.remove();
    };
  }, [videoPlayer]);

  const onContinue = useCallback(() => {
    registerMutate({
      request: {
        etapa: Etapas.FINALIZADO,
      },
    });
    // mutate({
    //   cpf: cpf!,
    //   password: password!,
    // });
  }, [registerMutate]);

  return (
    <View>
      {isPending && <Spinner />}
      <StatusBar style="light" />

      <VideoView
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
        }}
        player={videoPlayer}
        allowsFullscreen
        ref={videoRef}
        nativeControls={false}
      />
      {/* <TouchableOpacity
        className="bg-white p-3"
        onPress={() => {
          videoPlayer.pause();
          onContinue();
        }}
        style={{ position: "absolute", top: insets.top * 20 }}
      >
        <Text>PUlar video</Text>
      </TouchableOpacity> */}
      {/* Barra de progresso */}
      <View style={[styles.progressContainer, { top: insets.top }]}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  video: { flex: 1 },
  progressContainer: {
    height: 6,
    backgroundColor: "#fff",
    width: "100%",
    position: "absolute",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#00ff88",
  },
  timer: {
    color: "#fff",
    textAlign: "center",
    padding: 5,
  },
});
