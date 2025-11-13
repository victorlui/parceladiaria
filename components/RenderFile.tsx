import { Feather } from "@expo/vector-icons";
import { View, Text, Image } from "react-native";

type File = {
  name: string;
  type: string;
  uri: string;
};

export const renderFile = (file: File) => {
  if (!file) {
    return (
      <View className="border border-dashed mb-4 flex-row rounded-lg items-center justify-center flex-1">
        <Feather name="file" size={50} color="#9CA3AF" />
      </View>
    );
  }

  if (file.type === "pdf") {
    return (
      <View className="border border-dashed mb-4 flex-row rounded-lg items-center justify-center flex-1 p-4">
        <Feather name="file-text" size={30} color="#9CA3AF" />
        <Text className="ml-2 text-gray-500">{file.name}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginVertical: 10 }}>
      <Image
        source={{ uri: file.uri }}
        style={{ width: "100%", flex: 1 }}
        resizeMode="contain"
      />
    </View>
  );
};
