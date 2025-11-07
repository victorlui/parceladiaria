import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type PixKeyType = "cpf" | "email" | "phone" | "random";

interface PixKeySelectProps {
  value: PixKeyType;
  onChange: (value: PixKeyType) => void;
}

const OPTIONS: Array<{
  value: PixKeyType;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  description: string;
}> = [
  { value: "cpf", label: "CPF", iconName: "id-card", description: "Informe seu CPF como chave PIX" },
  { value: "email", label: "E-mail", iconName: "mail", description: "Use seu endereço de e-mail" },
  { value: "phone", label: "Telefone", iconName: "call", description: "Número de celular com DDD" },
  { value: "random", label: "Chave Aleatória", iconName: "key", description: "Chave aleatória do banco" },
];

const PixKeySelect: React.FC<PixKeySelectProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(
    () => OPTIONS.find((o) => o.value === value) ?? OPTIONS[0],
    [value]
  );

  const openPicker = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...OPTIONS.map((o) => o.label), "Cancelar"],
          cancelButtonIndex: OPTIONS.length,
          title: "Tipo de Chave PIX",
          userInterfaceStyle: "light",
        },
        (buttonIndex) => {
          if (buttonIndex >= 0 && buttonIndex < OPTIONS.length) {
            onChange(OPTIONS[buttonIndex].value);
          }
        }
      );
    } else {
      setOpen(true);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={openPicker}
        className="border border-gray-300 rounded-xl px-4 py-3 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name={selected.iconName} size={18} color="#374151" />
          <Text className="text-gray-900 font-semibold">{selected.label}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </TouchableOpacity>

      {/* Android modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 bg-black/50 items-center justify-center"
        >
          <Pressable
            onPress={() => {}}
            className="mx-5 bg-white rounded-2xl p-4 w-[92%]"
            style={{ elevation: 4 }}
          >
            <Text className="text-center text-lg font-bold mb-3">Tipo de Chave PIX</Text>
            {OPTIONS.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex-row items-center justify-between border rounded-xl px-4 py-3 mb-2 ${
                    isSelected ? "border-green-500 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name={opt.iconName}
                      size={18}
                      color={isSelected ? Colors.green.primary : "#374151"}
                    />
                    <View>
                      <Text
                        className={`font-semibold ${
                          isSelected ? "text-green-700" : "text-gray-900"
                        }`}
                      >
                        {opt.label}
                      </Text>
                      <Text className="text-gray-500 text-xs">{opt.description}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.green.primary} />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => setOpen(false)}
              className="mt-2 rounded-xl py-3"
              style={{ backgroundColor: Colors.green.primary }}
            >
              <Text className="text-center text-white font-semibold">Fechar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default PixKeySelect;