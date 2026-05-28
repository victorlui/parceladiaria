import ButtonBack from "@/shared/components/ButtonBack";
import { Colors } from "@/shared/constants/colors";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  isCenter?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

const LayoutRegister: React.FC<Props> = ({
  children,
  title,
  subtitle,
  isCenter = true,
  showBackButton = false,
  onBack,
}) => {
  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      {showBackButton && onBack && <ButtonBack onBack={onBack} />}

      <View style={[styles.content, isCenter && styles.centerContent]}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../assets/images/logo-verde.png")}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && (
          <Text style={[styles.subtitle, { width: isCenter ? 250 : "100%" }]}>
            {subtitle}
          </Text>
        )}
        {children}
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 15,
    width: "100%",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  logo: {
    height: 100,
    width: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },
  subtitle: {
    fontWeight: "400",
    color: Colors.gray.text,
    textAlign: "center",
    lineHeight: 23,
  },
});

export default LayoutRegister;
