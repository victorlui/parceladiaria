import Spinner from "@/components/Spinner";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { useState } from "react";
import { Text, TouchableOpacity, View, Alert, Image, Animated } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [scaleAnim] = useState(new Animated.Value(1));

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
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LayoutRegister isLogo={false} isBack onContinue={onContinue}>
      {isPending && <Spinner />}
      <View className="flex-1 px-4">
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/apenas-logo.png")}
            className="w-full h-48"
            resizeMode="contain"
          />
        </View>
        
        <Text className="text-center text-3xl font-bold mb-8 text-gray-800">
          Selecione seu perfil
        </Text>

        <View className="space-y-4 flex-1">
          {profileOptions.map((option) => {
            const isSelected = selectedProfile === option.id;

            return (
              <Animated.View 
                key={option.id}
                style={{ transform: [{ scale: scaleAnim }] }}
              >
                <TouchableOpacity
                  onPress={() => handlePress(option.id)}
                  className="overflow-hidden"
                >
                  <View
                    className={`p-4 rounded-xl shadow-md ${
                      isSelected ? 'bg-[#7FD223]' : 'bg-white'
                    }`}
                  >
                    <View className="flex-row items-center justify-between rounded-md">
                      <View className="flex-row items-center flex-1">
                        <MaterialCommunityIcons
                          name={option.iconName as "car" | "motorbike" | "store"}
                          size={32}
                          color={isSelected ? '#ffffff' : '#7FD223'}
                          style={{ marginRight: 16 }}
                        />
                        <Text
                          className={`text-lg font-bold ${
                            isSelected ? 'text-white' : 'text-gray-800'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </View>
                      
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          isSelected 
                            ? 'border-white bg-transparent' 
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <View className="w-3 h-3 rounded-full bg-white" />
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </LayoutRegister>
  );
}
