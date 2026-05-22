import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Prop {
  botton?: number;
}

const ButtonChat: React.FC<Prop> = ({
  botton = Platform.OS === "ios" ? 50 : 10,
}) => {
  const insets = useSafeAreaInsets();
  const inset = Platform.OS === "ios" ? botton : insets.bottom + botton;
  return (
    <View
      style={{ position: "absolute", bottom: inset, right: 40, zIndex: 999 }}
    >
      <Pressable
        style={{
          backgroundColor: Colors.green.primary,
          width: Platform.OS === "ios" ? 70 : 50,
          height: Platform.OS === "ios" ? 70 : 50,
          borderRadius: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={() => {
          router.push("/chat");
        }}
      >
        <Ionicons
          name="chatbox-ellipses-outline"
          size={Platform.OS === "ios" ? 32 : 28}
          color="#fff"
        />
      </Pressable>
    </View>
  );
};

export default ButtonChat;
