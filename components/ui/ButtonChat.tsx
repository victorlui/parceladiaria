import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

interface Prop {
  botton?: number;
}

const ButtonChat: React.FC<Prop> = ({ botton = 10 }) => {
  return (
    <View style={{ position: "absolute", bottom: botton, right: 20 }}>
      <Pressable
        style={{
          backgroundColor: Colors.green.primary,
          width: 50,
          height: 50,
          borderRadius: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={() => {
          router.push("/chat");
        }}
      >
        <Ionicons name="chatbox-ellipses-outline" size={28} color="#fff" />
      </Pressable>
    </View>
  );
};

export default ButtonChat;
