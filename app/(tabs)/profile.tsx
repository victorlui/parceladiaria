import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBar from "@/components/ui/StatusBar";
import { formatCelular, formatCEP, formatCPF } from "@/utils/formats";
import { Colors } from "@/constants/Colors";

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
  const { user } = useAuthStore();
  console.log("user profile 2 ", user);
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
            value={user?.email || ""}
          />
          <InfoRow
            icon="call-outline"
            label="Telefone"
            value={formatCelular(user?.phone) || ""}
          />
          <InfoRow
            icon="call-outline"
            label="Chave PIX"
            value={user?.pixKey || ""}
          />
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
});
