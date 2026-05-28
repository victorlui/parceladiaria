import ButtonBack from "@/shared/components/ButtonBack";
import { Colors } from "@/shared/constants/colors";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRegisterStore } from "../store/useRgisterStore";

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
  const { currentStep } = useRegisterStore();
  return (
    <View style={styles.mainContainer}>
      {showBackButton && onBack && <ButtonBack onBack={onBack} />}
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View
          style={[
            styles.content,
            isCenter && styles.centerContent,
            { paddingTop: showBackButton ? 60 : 40 },
          ]}
        >
          {currentStep !== 12 && (
            <View style={styles.logoContainer}>
              <Image
                source={require("../../../../assets/images/logo-verde.png")}
                resizeMode="contain"
                style={styles.logo}
              />
            </View>
          )}
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && (
            <Text style={[styles.subtitle, { width: isCenter ? 250 : "100%" }]}>
              {subtitle}
            </Text>
          )}
          {children}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flexGrow: 1,
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
