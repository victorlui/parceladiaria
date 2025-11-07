import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StatusBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  return <View style={[styles.container, { height: insets.top }]} />;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.green.primary,
  },
});

export default StatusBar;
