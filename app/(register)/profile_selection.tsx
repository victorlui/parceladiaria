import Spinner from "@/components/Spinner";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { useState } from "react";
import { 
  Text, 
  TouchableOpacity, 
  View, 
  Alert, 
  Image, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

const profileOptions = [
  {
    id: "motorista_carro",
    label: "Motorista De App - Carro",
    profissaoValue: "MOTORISTA DE APP (CARRO)",
    iconName: "car",
  },
  {
    id: "motorista_moto",
    label: "Motorista De App - Moto",
    profissaoValue: "MOTORISTA DE APP (MOTO)",
    iconName: "motorbike",
  },
  { 
    id: "comerciante", 
    label: "Comerciante", 
    profissaoValue: "COMERCIANTE",
    iconName: "store",
  },
];

export default function ProfileSelection() {
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const { mutate, isPending } = useUpdateUserMutation();

  const onContinue = () => {
    if (!selectedProfile) {
      Alert.alert("Seleção obrigatória", "Por favor, selecione um perfil.");
      return;
    }

    let etapa = selectedProfile === 'comerciante' 
      ? Etapas.REGISTRANDO_FRENTE_DOCUMENTO_COMERCIO
      : Etapas.MOTORISTA_REGISTRANDO_FRENTE_CNH;

    const request = {
      etapa,
      profissao: profileOptions.find((option) => option.id === selectedProfile)?.profissaoValue,
    };

    mutate({ request });
  };

  const handlePress = (id: string) => {
    setSelectedProfile(id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {isPending && <Spinner />}

      <LinearGradient
        colors={["#FAFBFC", "#F8FAFC", "#FFFFFF"]}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Header with back button */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("@/assets/images/apenas-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* Welcome Card */}
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Selecione seu perfil</Text>
                <Text style={styles.welcomeSubtitle}>
                  Escolha a opção que melhor descreve sua atividade profissional
                </Text>
              </View>

              {/* Profile Options Card */}
              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="work" size={20} color="#9BD13D" />
                  <Text style={styles.cardTitle}>Opções de Perfil</Text>
                </View>

                <View style={styles.optionsContainer}>
                  {profileOptions.map((option) => {
                    const isSelected = selectedProfile === option.id;

                    return (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => handlePress(option.id)}
                        style={[
                          styles.profileOption,
                          isSelected && styles.profileOptionSelected
                        ]}
                      >
                          <View style={styles.profileOptionContent}>
                            <View style={styles.profileOptionLeft}>
                              <MaterialCommunityIcons
                                name={option.iconName as "car" | "motorbike" | "store"}
                                size={32}
                                color={isSelected ? '#ffffff' : '#9BD13D'}
                                style={styles.profileIcon}
                              />
                              <Text
                                style={[
                                  styles.profileLabel,
                                  isSelected && styles.profileLabelSelected
                                ]}
                              >
                                {option.label}
                              </Text>
                            </View>
                            
                            <View
                              style={[
                                styles.radioButton,
                                isSelected && styles.radioButtonSelected
                              ]}
                            >
                              {isSelected && (
                                <View style={styles.radioButtonInner} />
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    (!selectedProfile || isPending) && styles.buttonDisabled
                  ]}
                  onPress={onContinue}
                  disabled={!selectedProfile || isPending}
                >
                  {isPending ? (
                    <MaterialIcons name="hourglass-empty" size={20} color="white" />
                  ) : (
                    <MaterialIcons name="arrow-forward" size={20} color="white" />
                  )}
                  <Text style={styles.buttonText}>
                    {isPending ? "Salvando..." : "Continuar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
 backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(155, 209, 61, 0.1)",
  },
  logoContainer: {
    alignItems: 'center',
   
  },
  logo: {

    height: 120,
    resizeMode: 'contain',
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(155, 209, 61, 0.1)',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: '#9BD13D',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(155, 209, 61, 0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  profileOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  profileOptionSelected: {
    backgroundColor: '#9BD13D',
    borderColor: '#9BD13D',
  },
  profileOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    marginRight: 16,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 16,
  },
  profileLabelSelected: {
    color: '#FFFFFF',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9BD13D',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
