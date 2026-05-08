import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

export const Indicator: React.FC<{ ok: boolean; text: string }> = ({
  ok,
  text,
}) => (
  <View style={styles.indicatorRow}>
    <View
      style={[
        styles.indicatorDot,
        { backgroundColor: ok ? Colors.green.secondary : Colors.gray.text },
      ]}
    />
    <Text
      style={[
        styles.indicatorText,
        { color: ok ? Colors.green.secondary : Colors.gray.text },
      ]}
    >
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorText: {
    fontSize: 14,
  },
});
