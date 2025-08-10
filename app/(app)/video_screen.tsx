import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView, } from "expo-video";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VideoScreen() {
    useDisableBackHandler()
  const videoPlayer = useVideoPlayer(require("../../assets/videos/cadastro-em-analise.mp4") ?? "", (player) => {
    player.loop = true;
    player.play();
    player.showNowPlayingNotification = false
  });
  return (
    <View>
        <StatusBar style="light" />
        <View className="absolute top-0 z-10  w-full my-20 ">
           <View className="flex justify-end items-end mx-10">
             <TouchableOpacity className="bg-white rounded-md p-3">
                <Text>Pular vídeo</Text>
            </TouchableOpacity>
           </View>
        </View>
      <VideoView
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
        }}
        player={videoPlayer}
        allowsFullscreen
   
      />
    </View>
  );
}
