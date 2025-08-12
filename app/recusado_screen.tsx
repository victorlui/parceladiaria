import { useAuthStore } from "@/store/auth";
import React, { useState } from "react";
import { Image, View, Text, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import NotAccess from "@/assets/images/access-denied.svg";
import DrawerMenu from "@/components/DrawerMenu";

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default function RecusadoScreen() {
  const { user } = useAuthStore();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const handleMenuPress = () => {
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
  };

  return (
    <SafeAreaView 
      edges={['top', 'bottom']} 
      className="flex-1 bg-gradient-to-b from-blue-50 to-white"
    >
      {/* Container principal com padding responsivo */}
      <View className={`flex-1 ${isTablet ? 'px-12 py-8' : 'px-6 py-4'}`}>
        
        {/* Header com logo e menu */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity 
            onPress={handleMenuPress}
            className="p-2"
          >
            <Ionicons name="menu" size={28} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-1 items-center">
            <Image 
              source={require("@/assets/images/apenas-logo.png")} 
              className={`w-full ${isTablet ? 'h-32' : 'h-24'}`}
              resizeMode="contain" 
            />
          </View>
          
          <View className="w-12" />
        </View>

        {/* Conteúdo central */}
        <View className="flex-1 justify-center items-center px-4">
          
          {/* Ilustração */}
          <View className="mb-8">
            <NotAccess height={isTablet ? 380 : 350} />
          </View>

          {/* Card com informações */}
          <View className="bg-white rounded-2xl shadow-lg p-6 mx-4 mb-8 border border-gray-100">
            <View className="items-center">
              {/* Ícone de status */}
              <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-red-100">
                <Text className="text-2xl text-red-600">
                  ❌
                </Text>
              </View>

              {/* Título principal */}
              <Text className={`font-bold text-center mb-3 ${
                isTablet ? 'text-3xl' : 'text-2xl'
              } text-gray-800 leading-tight`}>
                Cadastro Recusado
              </Text>

              {/* Subtítulo */}
              <Text className={`text-center text-gray-600 leading-relaxed ${
                isTablet ? 'text-lg' : 'text-base'
              }`}>
                {user?.motivo_recusa || "Infelizmente, seu cadastro não foi aprovado. Entre em contato conosco para mais informações."}
              </Text>

              {/* Badge de status */}
              <View className="mt-4 px-4 py-2 rounded-full bg-red-100">
                <Text className="font-semibold text-sm text-red-800">
                  RECUSADO
                </Text>
              </View>
            </View>
          </View>
        </View>

      </View>
      
      {/* DrawerMenu */}
      <DrawerMenu 
        isVisible={isDrawerVisible} 
        onClose={handleCloseDrawer}
        showOnlyLogout={true}
      />
    </SafeAreaView>
  );
}
