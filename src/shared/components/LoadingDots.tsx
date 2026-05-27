import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";

const LoadingDots: React.FC<{ text?: string; interval?: number }> = ({
  text = "Enviando",
  interval = 400,
}) => {
  const [dots, setDots] = useState("");
  React.useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, interval);
    return () => clearInterval(id);
  }, [interval]);
  return (
    <Text style={styles.textButton}>
      {text}
      {dots}
    </Text>
  );
};

const styles = StyleSheet.create({
  textButton: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoadingDots;
