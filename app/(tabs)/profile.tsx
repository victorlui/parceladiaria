import { AnalyticsService } from "@/analytics/analytics.service";
import { ANALYTICS_FLOWS, TAB_SCREENS } from "@/analytics/events";
import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import ContactItem from "@/pages/profile/components/ContactItem";
import { useAuthStore } from "@/store/auth";
import { formatCelular, formatCEP, formatCPF } from "@/utils/formats";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.divider} />
    <View style={{ gap: 12 }}>{children}</View>
  </View>
);

const InfoRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={18} color="#0EA5A4" style={styles.rowIcon} />
    <View style={{ flex: 1 }}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

const ProfileTab: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  useFocusEffect(
    React.useCallback(() => {
      AnalyticsService.screen(TAB_SCREENS.PROFILE, {
        flow: ANALYTICS_FLOWS.APP,
      });
    }, []),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <FontAwesome name="user" size={32} color={Colors.green.primary} />

          <Text style={styles.headerTitle}>Meu Perfil</Text>
        </View>

        <SectionCard title="Dados Pessoais">
          <InfoRow
            icon="person-outline"
            label="Nome"
            value={user?.nome || ""}
          />
          <InfoRow
            icon="card-outline"
            label="CPF"
            value={formatCPF(user?.cpf) || ""}
          />
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={user?.email || "Email não informado"}
          />
          <InfoRow
            icon="call-outline"
            label="Telefone"
            value={formatCelular(user?.phone) || ""}
          />
          <InfoRow
            icon="call-outline"
            label="Chave PIX"
            value={user?.pix || "Não cadastrada"}
          />
        </SectionCard>

        <SectionCard title="Contato e Segurança">
          <ContactItem
            icon="call"
            type="phone"
            value={user?.phone || ""}
            verified={user?.phone_verificado}
          />
          <ContactItem
            icon="mail-outline"
            type="email"
            value={user?.email || ""}
            verified={user?.email_verificado}
          />
          <View style={styles.otpNote}>
            <Text style={styles.otpText}>
              Em qualquer ação você recebe um código (OTP) para confirmar.
            </Text>
          </View>
        </SectionCard>

        <SectionCard title="Endereço">
          <InfoRow
            icon="location-outline"
            label="Bairro"
            value={user?.bairro || ""}
          />
          <InfoRow
            icon="home-outline"
            label="Cidade"
            value={user?.cidade || ""}
          />
          <InfoRow
            icon="flag-outline"
            label="Estado"
            value={user?.estado || ""}
          />
          <InfoRow
            icon="pin-outline"
            label="CEP"
            value={formatCEP(user?.zip_code) || ""}
          />
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 15,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#0F172A",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#F6FBFB",
    borderWidth: 1,
    borderColor: "#E3F2F2",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  divider: {
    height: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  rowIcon: {
    marginTop: 2,
  },
  rowLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },

  otpNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  otpText: {
    flex: 1,
    textAlign: "center",
    color: Colors.gray.text,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
});
