import { Colors } from "@/constants/Colors";
import React, { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ButtonComponent from "./Button";
import InputComponent from "./Input";

export type ModalOTPProps = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onSubmit: (otp: string) => void | Promise<void>;
  onResendCode: () => void | Promise<void>;
};

export default function ModalOTP({
  visible,
  title = "Confirmar código",
  subtitle = "Digite o código de 6 dígitos.",
  confirmLabel = "Enviar",
  cancelLabel = "Cancelar",
  onClose,
  onSubmit,
  onResendCode,
}: ModalOTPProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);

  const otpDigits = useMemo(() => otp.replace(/\D/g, ""), [otp]);
  const canSubmit = otpDigits.length === 6 && !loading;
  const canResend = timer === 0 && !resending;

  useEffect(() => {
    if (!visible) {
      setOtp("");
      setError("");
      setLoading(false);
      setTimer(60);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  const handleClose = () => {
    if (loading) return;

    Keyboard.dismiss();
    onClose();
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (loading) return;

    if (otpDigits.length !== 6) {
      setError("Informe o código de 6 dígitos.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit(otpDigits);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !onResendCode) return;

    try {
      setResending(true);

      await onResendCode();

      setTimer(60);
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.center}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Text style={styles.title}>{title}</Text>

            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            <View style={styles.inputWrap}>
              <InputComponent
                placeholder="000000"
                value={otpDigits}
                onChangeText={(v) => {
                  setOtp(v);

                  if (error) setError("");
                }}
                maskType="otp"
                keyboardType="number-pad"
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                autoFocus
              />

              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>
                    Reenviar código em {formatTimer(timer)}
                  </Text>
                ) : (
                  <Pressable onPress={handleResendCode} disabled={!canResend}>
                    <Text
                      style={[
                        styles.resendText,
                        !canResend && styles.resendDisabled,
                      ]}
                    >
                      {resending ? "Reenviando..." : "Reenviar código"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            <View style={styles.actions}>
              <View style={styles.action}>
                <ButtonComponent
                  title={cancelLabel}
                  onPress={handleClose}
                  outline
                  disabled={loading}
                  iconLeft={null}
                  iconRight={null}
                />
              </View>

              <View style={styles.action}>
                <ButtonComponent
                  title={confirmLabel}
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!canSubmit}
                  iconLeft={null}
                  iconRight={null}
                />
              </View>
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  center: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.gray.primary,
    textAlign: "center",
    lineHeight: 20,
  },

  inputWrap: {
    marginTop: 20,
  },

  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.error.medium,
  },

  resendContainer: {
    marginTop: 18,
    alignItems: "center",
  },

  timerText: {
    fontSize: 13,
    color: Colors.gray.primary,
  },

  resendText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.green.button,
  },

  resendDisabled: {
    opacity: 0.5,
  },

  actions: {
    marginTop: 24,
    flexDirection: "row",
    gap: 10,
  },

  action: {
    flex: 1,
  },
});
