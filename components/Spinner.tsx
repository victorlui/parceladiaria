import { Colors } from "@/constants/Colors";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface Props {
  text?: string;
}

export default function Spinner({ text = "Carregando..." }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.white} size={40} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  text: {
    color: Colors.white,
    fontSize: 18,
    marginTop: 16,
  },
});
