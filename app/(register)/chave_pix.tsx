import LayoutRegister from "@/components/ui/LayoutRegister";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/auth";
import { useRegisterAuthStore } from "@/store/register";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { Ionicons } from '@expo/vector-icons';

const pixKeyTypes = [
  { value: "cpf", label: "CPF", icon: "card-outline" },
  { value: "email", label: "E-mail", icon: "mail-outline" },
  { value: "phone", label: "Telefone", icon: "call-outline" },
];

export default function ChavePixScreen() {
  const { cpf } = useRegisterAuthStore();
  const { user } = useAuthStore();
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [phone, setPhone] = useState<string>(user?.whatsapp ?? "");
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
    <LayoutRegister
      isBack
      onContinue={onSubmit}
      isLogo={false}
      loading={isPending}
    >
      <View className="flex-1 justify-between">
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/apenas-logo.png")}
            className="w-full h-48"
            resizeMode="contain"
          />
        </View>

        <View>
          <Text className="text-2xl mb-5 text-center">
            Configure sua chave PIX para receber pagamentos
          </Text>
        </View>

        <View className="flex-1 px-6">
          <Text className="font-semibold text-xl mb-4">Tipos de chave PIX</Text>
          {pixKeyTypes.map((option) => {
            const isSelected = selectedProfile === option.value;
            const bgColor = getIconBackgroundColor(option.value);

            return (
              <View key={option.value}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedProfile(option.value);
                    if (option.value !== "cpf") {
                      setTempPixValue(option.value === "email" ? email : phone);
                      setModalVisible(true);
                    }
                  }}
                  className="flex-row items-center border my-3 p-4 rounded-lg"
                  style={{
                    borderColor: isSelected ? Colors.primaryColor : Colors.borderColor,
                    backgroundColor: isSelected ? `${bgColor}15` : 'transparent',
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isSelected ? bgColor : '#f5f5f5',
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 15,
                    }}
                  >
                    <Ionicons 
                      name={option.icon as 'card-outline' | 'mail-outline' | 'call-outline'}
                      size={24} 
                      color={isSelected ? '#fff' : '#666'} 
                    />
                  </View>
                  <View>
                    <Text
                      className="font-bold text-lg"
                      style={{
                        color: isSelected ? bgColor : '#222222',
                      }}
                    >
                      {option.label}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {option.value === 'cpf' ? 'Seu CPF como chave' : 
                       option.value === 'email' ? 'Seu e-mail como chave' : 
                       'Seu telefone como chave'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {selectedProfile === "cpf" && isSelected && (
                  <Text className="text-md text-[#222222] ml-2">
                    Chave PIX: <Text className="font-bold">{cpf}</Text>
                  </Text>
                )}

                {selectedProfile === "email" && isSelected && email && (
                  <Text className="text-md text-[#222222] ml-2">
                    Chave PIX: <Text className="font-bold">{email}</Text>
                  </Text>
                )}

                {selectedProfile === "phone" && isSelected && phone && (
                  <Text className="text-md text-[#222222] ml-2">
                    Chave PIX: <Text className="font-bold">{phone}</Text>
                  </Text>
                )}
              </View>
            );
          })}
        </View>

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
      </View>
    </LayoutRegister>
  );
}
