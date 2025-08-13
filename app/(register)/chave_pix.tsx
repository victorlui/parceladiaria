import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/auth";
import { useRegisterAuthStore } from "@/store/register";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const pixKeyTypes = [
  { value: "cpf", label: "CPF", icon: "card-outline" },
  { value: "email", label: "E-mail", icon: "mail-outline" },
  { value: "phone", label: "Telefone", icon: "call-outline" },
];

export default function ChavePixScreen() {
  const { cpf, email: emailRegister, phone: phoneRegister } = useRegisterAuthStore();

  const { user } = useAuthStore();
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [email, setEmail] = useState<string>(user?.email ?? emailRegister ?? "");
  const [phone, setPhone] = useState<string>(user?.whatsapp ?? phoneRegister ?? "");
  const [modalVisible, setModalVisible] = useState(false);
  const [tempPixValue, setTempPixValue] = useState("");
  const { mutate, isPending } = useUpdateUserMutation();

  const getIconBackgroundColor = (value:string) => {
    switch (value) {
      case 'cpf':
        return '#00C851';
      case 'email':
        return '#00C851';
      case 'phone':
        return '#00C851';
      default:
        return '#607D8B';
    }
  };

  function onSubmit() {
    if (!email && selectedProfile === "email") {
      Alert.alert("Atenção!!", "Por favor, insira um e-mail como pix");
      return;
    }

    if (!phone && selectedProfile === "phone") {
      Alert.alert("Atenção!!", "Por favor, insira um número de telefone como pix");
      return;
    }

    if (!selectedProfile) {
      Alert.alert("Atenção!!", "Por favor, selecione uma chave pix");
      return;
    }

    const request = {
      chave: selectedProfile,
      pix: selectedProfile === "cpf" ? cpf : selectedProfile === "email" ? email : `+55${phone}`,
      etapa: Etapas.REGISTRANDO_PROFISSAO,
    };

    mutate({ request: request });
  }

  const handleConfirmPix = () => {
    if (selectedProfile === "email") {
      setEmail(tempPixValue);
    } else if (selectedProfile === "phone") {
      setPhone(tempPixValue);
    }
    setModalVisible(false);
    setTempPixValue("");
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

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
                {/* Header com botão voltar */}
                <View style={styles.header}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                  >
                    <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
                  </TouchableOpacity>
                </View>

                <View style={styles.logoContainer}>
                  <Image
                    source={require("@/assets/images/apenas-logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.welcomeCard}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="pix" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.welcomeTitle}>
                    Configure sua chave PIX
                  </Text>
                  <Text style={styles.welcomeSubtitle}>
                    Escolha uma chave PIX para receber pagamentos
                  </Text>
                </View>

                <View style={styles.inputCard}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons name="account-balance-wallet" size={20} color="#9BD13D" />
                    <Text style={styles.cardTitle}>Tipos de chave PIX</Text>
                  </View>

                  <View style={styles.inputContainer}>
                    {pixKeyTypes.map((option) => {
                      const isSelected = selectedProfile === option.value;
                      const bgColor = getIconBackgroundColor(option.value);

                      return (
                        <View key={option.value} style={styles.pixOptionContainer}>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedProfile(option.value);
                              if (option.value !== "cpf") {
                                setTempPixValue(option.value === "email" ? email : phone);
                                setModalVisible(true);
                              }
                            }}
                            style={[
                              styles.pixOption,
                              {
                                borderColor: isSelected ? Colors.primaryColor : "#E5E7EB",
                                backgroundColor: isSelected ? `${bgColor}15` : 'transparent',
                              }
                            ]}
                          >
                            <View
                              style={[
                                styles.pixIconContainer,
                                {
                                  backgroundColor: isSelected ? bgColor : '#f5f5f5',
                                }
                              ]}
                            >
                              <Ionicons 
                                name={option.icon as 'card-outline' | 'mail-outline' | 'call-outline'}
                                size={24} 
                                color={isSelected ? '#fff' : '#666'} 
                              />
                            </View>
                            <View style={styles.pixOptionContent}>
                              <Text
                                style={[
                                  styles.pixOptionLabel,
                                  {
                                    color: isSelected ? bgColor : '#222222',
                                  }
                                ]}
                              >
                                {option.label}
                              </Text>
                              <Text style={styles.pixOptionDescription}>
                                {option.value === 'cpf' ? 'Seu CPF como chave' : 
                                 option.value === 'email' ? 'Seu e-mail como chave' : 
                                 'Seu telefone como chave'}
                              </Text>
                            </View>
                          </TouchableOpacity>

                          {selectedProfile === "cpf" && isSelected && (
                            <Text style={styles.selectedPixKey}>
                              Chave PIX: <Text style={styles.selectedPixValue}>{cpf}</Text>
                            </Text>
                          )}

                          {selectedProfile === "email" && isSelected && email && (
                            <Text style={styles.selectedPixKey}>
                              Chave PIX: <Text style={styles.selectedPixValue}>{email}</Text>
                            </Text>
                          )}

                          {selectedProfile === "phone" && isSelected && phone && (
                            <Text style={styles.selectedPixKey}>
                              Chave PIX: <Text style={styles.selectedPixValue}>{phone}</Text>
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.continueButton,
                      isPending && styles.buttonDisabled,
                    ]}
                    onPress={onSubmit}
                    disabled={isPending}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={isPending ? "hourglass-empty" : "arrow-forward"}
                      size={20}
                      color="#FFFFFF"
                    />
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-6 rounded-lg w-[90%]">
              <Text className="text-xl font-bold mb-4">
                {selectedProfile === "email" ? "Digite seu e-mail" : "Digite seu telefone"}
              </Text>
              <TextInput
                placeholder={selectedProfile === "email" ? "E-mail" : "Telefone"}
                className="border p-3 rounded-md h-[58px] mb-4"
                keyboardType={selectedProfile === "email" ? "email-address" : "phone-pad"}
                value={tempPixValue}
                onChangeText={setTempPixValue}
                style={{ borderColor: Colors.borderColor }}
              />
              <View className="flex-row justify-between gap-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-red-500 p-3 rounded-md flex-1"
                >
                  <Text className="text-white text-center">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmPix}
                  className="bg-green-500 p-3 rounded-md flex-1"
                >
                  <Text className="text-white text-center">Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background
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
   flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 10,
    marginLeft: 20,
    marginTop: 20,

  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(155, 209, 61, 0.1)",
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logo: {
    height: 120,
    resizeMode: 'contain',
  },
  welcomeCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#9BD13D',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  pixOptionContainer: {
    marginBottom: 15,
  },
  pixOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 8,
  },
  pixIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pixOptionContent: {
    flex: 1,
  },
  pixOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pixOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedPixKey: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    paddingLeft: 16,
  },
  selectedPixValue: {
    fontWeight: '600',
    color: '#333',
  },
  continueButton: {
    backgroundColor: Colors.primaryColor,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
