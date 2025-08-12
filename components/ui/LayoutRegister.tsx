import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReactNode } from "react";
import { Button } from "../Button";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Spinner from "../Spinner";
import { Octicons } from "@expo/vector-icons";

interface LayoutRegisterProps {
  children: ReactNode;
  isBack?: boolean;
  onContinue?: () => void;
  loading?: boolean;
  isLogo?: boolean;
  disabledButton?: boolean;
}

export default function LayoutRegister({
  children,
  onContinue,
  isBack,
  loading = false,
  isLogo = true,
  disabledButton = false,
}: LayoutRegisterProps) {
  return (
    <>
      {loading && <Spinner />}
      <SafeAreaView
        edges={["top", "bottom"]}
        className="flex-1 bg-white justify-between"
      >
        <StatusBar style="dark" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            {isLogo && (
              <Image
                source={require("@/assets/images/parcela-logo.png")}
                className="w-full h-40 mb-8"
                resizeMode="contain"
              />
            )}
            {children}
            <View className="flex-row items-end   gap-5 px-6  justify-between w-full">
              <View className="flex-1">
                {isBack && (
                  <Button
                    title="Voltar"
                    onPress={() => router.back()}
                    variant="outline"
                     icon={<Octicons name="chevron-left" size={20} color="#9BD13D" />}
                     isBack
                  />
                )}
              </View>
              <View className="flex-1" >
                <Button
                  title="Continuar"
                  onPress={() => onContinue?.()}
                  disabled={disabledButton}
                  icon={<Octicons name="chevron-right" size={20} color="white" />}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // fundo preto inclusive no bottom
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#fff", // fundo preto no scroll
    padding: 20,
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
});
