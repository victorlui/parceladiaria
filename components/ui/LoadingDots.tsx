import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";

const LoadingDots: React.FC<{
  text?: string;
  interval?: number;
  color?: string;
}> = ({ text = "Enviando", interval = 400, color = "#FFF" }) => {
  const [dots, setDots] = useState("");
  React.useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, interval);
    return () => clearInterval(id);
  }, [interval]);
  return (
    <Text style={[styles.textButton, { color }]}>
      {text}
      {dots}
    </Text>
  );
};

const styles = StyleSheet.create({
  textButton: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoadingDots;
