import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import DrawerMenu from "@/components/DrawerMenu";
import Header from "@/components/Header";

export default function ViewTermsScreen() {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#FAFBFC", "#F8FAFC", "#FFFFFF"]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <Header
          title="Termos e Condições"
          iconName="settings"
          iconLibrary="MaterialIcons"
          onMenuPress={() => setIsDrawerVisible(true)}
          showMenuButton={true}
          subtitle="Informações importantes sobre seu empréstimo"
        />

        {/* Terms Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Payments Section */}
          <View style={styles.termsCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="payment" size={20} color="#9BD13D" />
              <Text style={styles.sectionTitle}>PAGAMENTOS</Text>
            </View>

            <Text style={styles.termsText}>
              Lembrando, os pagamentos são diários de segunda à sábado
              (incluindo feriados), exceto aos domingos, no horário de Brasília.
            </Text>

            <Text style={styles.termsText}>
              O pagamento das suas parcelas deverá ser realizado apenas pelo
              nosso site na área de clientes.
            </Text>
          </View>

          {/* Fines and Interest Section */}
          <View style={styles.termsCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>MULTAS E JUROS POR ATRASO</Text>
            </View>

            <Text style={styles.termsText}>
              Em casos de atrasos no pagamento, ocorrerá uma renegociação
              automática de sua dívida conforme acordado em contrato.
            </Text>

            <View style={styles.bulletPoint}>
              <MaterialIcons
                name="fiber-manual-record"
                size={8}
                color="#6B7280"
              />
              <Text style={styles.bulletText}>
                Esta penalidade acontece a cada 2 (dois) atrasos.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <MaterialIcons
                name="fiber-manual-record"
                size={8}
                color="#6B7280"
              />
              <Text style={styles.bulletText}>
                O valor acrescentado será de 5% sobre o valor total financiado.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <MaterialIcons
                name="fiber-manual-record"
                size={8}
                color="#6B7280"
              />
              <Text style={styles.bulletText}>
                O valor da penalidade será lançado em forma de uma parcela extra
                em seu contrato, tendo a data de pagamento para um dia após a
                sua última parcela lançada.
              </Text>
            </View>
          </View>

          {/* Renewals Section */}
          <View style={styles.termsCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="autorenew" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>RENOVAÇÕES</Text>
            </View>

            <Text style={styles.termsText}>
              O aumento de limite é progressivo de R$300,00 em R$300,00 a cada
              renovação, podendo chegar até o valor máximo de R$1.500,00.
            </Text>

            <Text style={styles.termsText}>
              Para renovar o seu empréstimo você deve atender as condições, que
              estão disponíveis na sua área do cliente, em nosso site.
            </Text>
          </View>

          {/* Important Notice */}
          <View style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <MaterialIcons name="info" size={20} color="#3B82F6" />
              <Text style={styles.noticeTitle}>Importante</Text>
            </View>

            <Text style={styles.noticeText}>
              Estes termos fazem parte do seu contrato de empréstimo. É
              importante que você os leia e compreenda completamente.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <DrawerMenu
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(155, 209, 61, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "rgba(155, 209, 61, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 56,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  termsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  termsText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 12,
    textAlign: "justify",
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
    textAlign: "justify",
  },
  noticeCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#1E40AF",
    textAlign: "justify",
  },
});
