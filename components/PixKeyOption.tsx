import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

// Define as propriedades que o nosso componente vai receber
interface Props {
  value: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  infoText: string;
  isSelected: boolean;
  onPress: () => void;
  // A propriedade 'children' permite que passemos outros componentes (como o TextInput)
  // para dentro deste componente.
  children?: React.ReactNode;
}

export function PixKeyOption({
  value,
  label,
  iconName,
  infoText,
  isSelected,
  onPress,
  children,
}: Props) {
  // Define a cor de fundo do ícone com base na chave PIX
  const getIconBackgroundColor = () => {
    switch (value) {
      case 'cpf':
        return '#007BFF'; // Azul
      case 'email':
        return '#00C851'; // Verde
      case 'phone':
        return '#FF5722'; // Laranja
      default:
        return '#607D8B'; // Cinza
    }
  };

  return (
    <View key={value} className="mb-4">
      <TouchableOpacity
        onPress={onPress}
        className={`flex-row items-center p-4 rounded-xl border ${isSelected ? 'border-primaryColor shadow-md' : 'border-[#E0E0E0]'}`}
        style={{
          borderColor: isSelected ? Colors.primaryColor : Colors.borderColor,
          backgroundColor: isSelected ? '#F0F9E8' : '#FFFFFF',
        }}
      >
        {/* Container do ícone com fundo colorido */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: getIconBackgroundColor() }}
        >
          <Ionicons name={iconName} size={20} color="#fff" />
        </View>

        {/* Textos da chave PIX */}
        <View className="flex-1">
          <Text
            className={`font-semibold text-base ${isSelected ? 'text-primaryColor' : 'text-gray-800'}`}
          >
            {label}
          </Text>
          <Text className="text-gray-500 text-sm">
            {infoText}
          </Text>
        </View>

        {/* Radio Button */}
        <View
          className="w-5 h-5 rounded-full items-center justify-center ml-2"
          style={{
            borderWidth: 2,
            borderColor: isSelected ? Colors.primaryColor : Colors.borderColor,
            backgroundColor: isSelected ? Colors.primaryColor : 'transparent',
          }}
        >
          {isSelected && (
            <View className="w-2.5 h-2.5 rounded-full bg-white" />
          )}
        </View>
      </TouchableOpacity>
      
      {children}
    </View>
  );
}
