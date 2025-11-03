import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface Props {
  logoWithText?: boolean;
  height?: number;
  width?: number;
}

const LogoComponent: React.FC<Props> = ({
  logoWithText = true,
  height = 140,
  width = 140,
}) => {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={
          logoWithText
            ? require("@/assets/images/logo_novo.png")
            : require("@/assets/images/logo.png")
        }
        style={[{ width: width, height: height }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
  },
});

export default LogoComponent;
