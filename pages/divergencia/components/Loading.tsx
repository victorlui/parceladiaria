import { Colors } from "@/constants/Colors";
import PulsingImageLoader from "@/pages/register/components/PulsingImageLoader";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LoadingProps = {
  uploadProgress: any;
};

export default function Loading(props: LoadingProps) {
  const { uploadProgress } = props;
  const insets = useSafeAreaInsets();

  const fraction = uploadProgress?.fraction ?? 0;
  const percent = Math.round(fraction * 100);
  const hasProgress = uploadProgress !== null;
  return (
    <View
      style={[
        styles.container,
        styles.loadingScreen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text={
          !hasProgress
            ? "Preparando envio..."
            : percent >= 100
              ? "Aguarde, completando…"
              : `Enviando… ${percent}%`
        }
      />
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {hasProgress ? `${percent}% enviado` : "Enviando aquivo..."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingScreen: {
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarWrapper: {
    width: "80%",
    alignSelf: "center",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.green.button,
    borderRadius: 3,
  },
  progressText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
});
