import { Camera } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

interface Props {
  visible: boolean;
  onSuccess: (payload: any) => void;
  onClose: () => void;
}

const FaceCaptureWebView: React.FC<Props> = ({
  visible,
  onSuccess,
  onClose,
}) => {
  const webviewRef = useRef<WebView>(null);
  const isMountedRef = useRef(true);
  const [cameraStatus, setCameraStatus] = useState<
    "loading" | "granted" | "denied"
  >("loading");
  const successSentRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    if (visible) {
      successSentRef.current = false;
      setCameraStatus("loading");
      requestPermissions();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [visible]);

  const requestPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (!isMountedRef.current) return;
      setCameraStatus(status === "granted" ? "granted" : "denied");
    } catch {
      if (!isMountedRef.current) return;
      setCameraStatus("denied");
    }
  };

  const handleMessage = (event: any) => {
    try {
      const raw = event?.nativeEvent?.data;
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;

      if (data?.type === "FACE_CAPTURE_SUCCESS") {
        if (successSentRef.current) {
          return;
        }
        successSentRef.current = true;

        onSuccess(data);
      }
    } catch (err) {
      return err;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {cameraStatus !== "granted" ? (
          <View style={styles.loading}>
            {cameraStatus === "loading" ? (
              <>
                <ActivityIndicator size="large" color="#00ff99" />
                <Text style={styles.loadingText}>
                  Solicitando acesso à câmera...
                </Text>
              </>
            ) : (
              <Text style={styles.loadingText}>
                Permissão de câmera negada. Verifique as permissões do app e
                tente novamente.
              </Text>
            )}
          </View>
        ) : (
          <WebView
            ref={webviewRef}
            source={{
              uri: "https://face-capture-sdk.victorluizgonzalez.workers.dev",
            }}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            useSharedProcessPool={true}
            cacheEnabled={false}
            mixedContentMode="always"
            originWhitelist={["*"]}
            androidLayerType="hardware"
            mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            thirdPartyCookiesEnabled={true}
            saveFormDataDisabled={true}
            onMessage={handleMessage}
            style={styles.webview}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "flex-end",
    zIndex: 10,
    elevation: 10,
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  closeIcon: {
    color: "#111",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 28,
  },
  webview: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 14,
    color: "#111",
    fontSize: 16,
  },
});

export default FaceCaptureWebView;
