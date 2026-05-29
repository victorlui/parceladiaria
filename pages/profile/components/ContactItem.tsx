import ModalOTP from "@/components/ui/ModalOTP";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { formatCelular } from "@/utils/formats";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  value?: string;
  type?: "phone" | "email";
  verified?: boolean;
}

export default function ContactItem(props: Props) {
  const { icon = "call", value, type = "phone", verified } = props;
  const { user, setUser } = useAuthStore();
  const { showSuccess } = useAlerts();
  const router = useRouter();
  const badgeBgColor = verified ? Colors.success.light : Colors.yellow.light;
  const badgeIconColor = verified
    ? Colors.success.medium
    : Colors.orange.primary;
  const badgeTextColor = verified ? Colors.green.text : Colors.orange.primary;
  const [otpVisible, setOtpVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    try {
      await api.post(`v1/client/${type}/validar-atual/otp`);
      setOtpVisible(true);
    } catch (error) {
      return;
    } finally {
      setLoading(false);
    }
  };

  const confirmarOTP = async (otp: string) => {
    try {
      const { data } = await api.put(
        `/v1/client/${type}/validar-atual/confirm`,
        {
          otp,
        },
      );

      showSuccess(
        "Successo",
        `${type === "email" ? "Email" : "Telefone"} validado com sucesso`,
        () => {
          setUser({
            ...user,
            ...(type === "email"
              ? { email: value || user?.email, email_verificado: true }
              : { phone: value || user?.phone, phone_verificado: true }),
          });
          setOtpVisible(false);
        },
      );
    } catch {
      return;
    }
  };

  return (
    <View style={styles.contactItem}>
      <ModalOTP
        visible={otpVisible}
        onClose={() => setOtpVisible(false)}
        onSubmit={confirmarOTP}
        onResendCode={() => sendOTP()}
      />

      <View style={[styles.verifiedBadge, { backgroundColor: badgeBgColor }]}>
        <Ionicons name="checkmark-circle" size={18} color={badgeIconColor} />
        <Text style={[styles.verifiedText, { color: badgeTextColor }]}>
          {type === "phone"
            ? user?.phone_verificado
              ? "Verificado"
              : "Não verificado"
            : user?.email_verificado
              ? "Verificado"
              : "Não verificado"}
        </Text>
      </View>
      <View style={styles.contactItemHeader}>
        <View style={styles.contactIconBox}>
          <Ionicons name={icon} size={18} color={Colors.white} />
        </View>
        <View style={styles.contactText}>
          <Text style={styles.contactLabel}>{type.toUpperCase()}</Text>
          <Text
            style={styles.contactValue}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {type === "phone"
              ? formatCelular(value || user?.phone)
              : value || "Email não informado"}
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.actionButton}
        onPress={() => {
          router.push({
            pathname: "/(validations)/phone_email",
            params: {
              type,
              title: type === `phone` ? `Alterar telefone` : `Alterar email`,
              icon,
            },
          });
        }}
      >
        <Ionicons
          name="pencil"
          size={18}
          color={Colors.white}
          style={styles.actionButtonIcon}
        />
        <Text style={styles.actionButtonText}>Alterar</Text>
      </Pressable>
      {type === "phone" && !user?.phone_verificado && (
        <Pressable
          style={[
            styles.actionButton,
            {
              marginVertical: 5,
              backgroundColor: loading ? "#BDBDBD" : Colors.white,
              borderWidth: 1,
              borderColor: loading ? "#BDBDBD" : Colors.green.button,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={sendOTP}
          disabled={loading}
        >
          <Ionicons
            name="shield-checkmark-sharp"
            size={18}
            color={loading ? "#FFFFFF" : Colors.green.button}
            style={styles.actionButtonIcon}
          />

          <Text
            style={[
              styles.actionButtonText,
              {
                color: loading ? "#FFFFFF" : Colors.green.button,
              },
            ]}
          >
            {loading ? "Enviando..." : "Validar"}
          </Text>
        </Pressable>
      )}

      {type === "email" && !user?.email_verificado && (
        <Pressable
          style={[
            styles.actionButton,
            {
              marginVertical: 5,
              backgroundColor: loading ? "#BDBDBD" : Colors.white,
              borderWidth: 1,
              borderColor: loading ? "#BDBDBD" : Colors.green.button,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={sendOTP}
          disabled={loading}
        >
          <Ionicons
            name="shield-checkmark-sharp"
            size={18}
            color={loading ? "#FFFFFF" : Colors.green.button}
            style={styles.actionButtonIcon}
          />

          <Text
            style={[
              styles.actionButtonText,
              {
                color: loading ? "#FFFFFF" : Colors.green.button,
              },
            ]}
          >
            {loading ? "Enviando..." : "Validar"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contactItem: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#EAF3F2",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: "700",
  },
  contactItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  contactIconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: Colors.green.button,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    color: Colors.gray.text,
    fontWeight: "700",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "700",
  },
  actionButton: {
    backgroundColor: Colors.green.button,
    borderRadius: 12,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  actionButtonIcon: {
    marginTop: 1,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.white,
  },
  actionButtonDisabled: {
    backgroundColor: Colors.borderColor,
  },
});
