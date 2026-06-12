import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import { AnalyticsService } from "@/analytics/analytics.service";
import type { PostHogEventProperties } from "@posthog/core";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useScrollToTop } from "../hooks/useScrollToTop";

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  screenName?: string;
  screenProps?: PostHogEventProperties;
  isCenter?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

const LayoutRegister: React.FC<Props> = ({
  children,
  title,
  subtitle,
  screenName,
  screenProps,
  isCenter = true,
  showBackButton = false,
  onBack,
}) => {
  const insets = useSafeAreaInsets();

  const scrollRef = useRef<ScrollView>(null);
  const { onScroll, scrollToTop } = useScrollToTop(scrollRef);

  const backButtonStyle = useMemo(
    () => ({ top: insets.top + 10, left: 16 }),
    [insets.top],
  );

  useEffect(() => {
    if (!screenName) return;

    AnalyticsService.screen(screenName, screenProps);
  }, [screenName, screenProps]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar />

      {showBackButton && onBack && (
        <Pressable
          onPress={onBack}
          style={[styles.backButton, backButtonStyle]}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={12}
        >
          <ArrowLeft size={20} color={Colors.black} />
        </Pressable>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          onScroll={onScroll}
          scrollEventThrottle={16}
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

        <ScrollToTopButton onPress={scrollToTop} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
  backButton: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

export default LayoutRegister;
