import StatusBar from "@/components/ui/StatusBar";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  isCenter?: boolean;
}

const LayoutRegister: React.FC<Props> = ({
  children,
  title,
  subtitle,
  isCenter = true,
}) => {
  const { AlertDisplay } = useAlerts();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar />
      <AlertDisplay />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, isCenter && styles.centerContent]}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/logo-verde.png")}
                resizeMode="contain"
                style={styles.logo}
              />
            </View>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && (
              <Text
                style={[styles.subtitle, { width: isCenter ? 250 : "100%" }]}
              >
                {subtitle}
              </Text>
            )}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
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
