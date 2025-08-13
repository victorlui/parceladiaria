import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { changePassword } from "@/services/loans";
import { AxiosError } from "axios";

export default function SettingsScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert("Erro", "Por favor, digite uma nova senha.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await changePassword(newPassword);
      setNewPassword("");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível alterar a senha. Tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#FAFBFC", "#F8FAFC", "#FFFFFF"]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <MaterialIcons name="settings" size={24} color="#9BD13D" />
              <Text style={styles.headerTitle}>Configurações</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Altere sua senha de acesso</Text>
        </View>

        {/* Settings Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Change Password Card */}
          <View style={styles.settingsCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="lock" size={20} color="#9BD13D" />
              <Text style={styles.cardTitle}>Trocar Senha</Text>
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="vpn-key"
                size={16}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua nova senha"
                placeholderTextColor="#9CA3AF"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.changePasswordButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={loading ? "hourglass-empty" : "check"}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.buttonText}>
                {loading ? "Alterando..." : "Trocar Senha"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Security Tips Card */}
          <View style={styles.settingsCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="security" size={20} color="#9BD13D" />
              <Text style={styles.cardTitle}>Dicas de Segurança</Text>
            </View>

            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Use pelo menos 6 caracteres</Text>
            </View>

            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>
                Combine letras, números e símbolos
              </Text>
            </View>

            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>
                Evite informações pessoais óbvias
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
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
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9BD13D",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  tipText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    fontWeight: "500",
  },
});
