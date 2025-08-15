import Spinner from "@/components/Spinner";
import { useAlerts } from "@/components/useAlert";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { useRegisterAuthStore } from "@/store/register";
import { Etapas } from "@/utils";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, AppState, AppStateStatus } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from 'expo-secure-store';

const VIDEO_PROGRESS_KEY = 'video_progress';
const VIDEO_COMPLETED_KEY = 'video_completed';

export default function VideoScreen() {
  useDisableBackHandler();
  const insets = useSafeAreaInsets();
  const { showSuccess, AlertDisplay } = useAlerts();
  const { password, cpf } = useRegisterAuthStore();
  const { isPending, mutate } = useLoginMutation();

  const { mutate: registerMutate, isSuccess } = useUpdateUserMutation();
  const [progress, setProgress] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const videoPlayer = useVideoPlayer(
    require("../../assets/videos/cadastro-em-analise.mp4") ?? "",
    (player) => {
      player.loop = false;
      // Não inicia automaticamente - será controlado pelo useEffect
    }
  );

  const videoRef = useRef<VideoView>(null);

  // Função para salvar o progresso do vídeo
  const saveVideoProgress = async (currentTime: number) => {
    try {
      await SecureStore.setItemAsync(VIDEO_PROGRESS_KEY, currentTime.toString());
    } catch (error) {
      console.log('Erro ao salvar progresso do vídeo:', error);
    }
  };

  // Função para carregar o progresso salvo
  const loadVideoProgress = async () => {
    try {
      const savedProgress = await SecureStore.getItemAsync(VIDEO_PROGRESS_KEY);
      const isCompleted = await SecureStore.getItemAsync(VIDEO_COMPLETED_KEY);
      
      // ✅ CORREÇÃO: Se já foi completado, limpa os dados e permite assistir novamente
      if (isCompleted === 'true') {
        // Limpa o status de completado para permitir assistir novamente
        await SecureStore.deleteItemAsync(VIDEO_COMPLETED_KEY);
        await SecureStore.deleteItemAsync(VIDEO_PROGRESS_KEY);
      }
      
      // ✅ CORREÇÃO: Sempre verifica o progresso salvo, mesmo se estava completado
      if (savedProgress && videoPlayer.duration) {
        const progressTime = parseFloat(savedProgress);
        if (progressTime > 0 && progressTime < videoPlayer.duration) {
          videoPlayer.currentTime = progressTime;
        }
      }
      
      videoPlayer.play();
      setIsVideoLoaded(true);
    } catch (error) {
      console.log('Erro ao carregar progresso do vídeo:', error);
      videoPlayer.play();
      setIsVideoLoaded(true);
    }
  };

  // Função para marcar vídeo como completado
  const markVideoCompleted = async () => {
    try {
      await SecureStore.setItemAsync(VIDEO_COMPLETED_KEY, 'true');
      await SecureStore.deleteItemAsync(VIDEO_PROGRESS_KEY);
    } catch (error) {
      console.log('Erro ao marcar vídeo como completado:', error);
    }
  };

  // Carrega o progresso do vídeo quando o componente monta
  useEffect(() => {
    const initializeVideo = async () => {
      // Aguarda um pouco para garantir que o vídeo está carregado
      setTimeout(() => {
        loadVideoProgress();
      }, 1000);
    };
    
    initializeVideo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Controla o estado do app (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App voltou ao foreground - retoma o vídeo se estava carregado
        if (isVideoLoaded && !videoPlayer.playing) {
          videoPlayer.play();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App foi para background - salva o progresso
        if (videoPlayer.currentTime) {
          saveVideoProgress(videoPlayer.currentTime);
        }
      }
      setAppState(nextAppState as AppStateStatus);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState, isVideoLoaded, videoPlayer]);

  useEffect(() => {
    if (isSuccess) {
      videoPlayer.pause();
      markVideoCompleted();
      showSuccess("", "Cadastro realizado com sucesso!", () => {
        mutate({
          cpf: cpf || "",
          password: password || "",
        });
      });
    }
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const subscription = videoPlayer.addListener("playToEnd", () => {
      markVideoCompleted();
      onContinue();
    });
    return () => {
      subscription.remove();
    };
  }, [videoPlayer]); //eslint-disable-line react-hooks/exhaustive-deps

  // Monitora o progresso do vídeo e salva periodicamente
  useEffect(() => {
    const checkTime = setInterval(() => {
      const duration = videoPlayer.duration;
      const current = videoPlayer.currentTime;
      if (duration != null && current != null) {
        const prog = current / duration;
        setProgress(prog > 1 ? 1 : prog);
        
        // Salva o progresso a cada 5 segundos
        if (current > 0 && Math.floor(current) % 5 === 0) {
          saveVideoProgress(current);
        }
      }
    }, 500);

    const subscription = videoPlayer.addListener("playToEnd", () => {
      clearInterval(checkTime);
    });

    return () => {
      clearInterval(checkTime);
      subscription.remove();
    };
  }, [videoPlayer]);

  const onContinue = useCallback(async () => {
    await markVideoCompleted();
    registerMutate({
      request: {
        etapa: Etapas.FINALIZADO,
      },
    });
  }, [registerMutate]);

  if (isPending) {
    return <Spinner />;
  }

  return (
    <View>
      <AlertDisplay />
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
