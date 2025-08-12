import React from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import {Checkbox} from "expo-checkbox"; // ou qualquer outro componente de checkbox
import { Colors } from "@/constants/Colors";

interface TermsCheckboxProps {
  checked: boolean;
  onPress: () => void;
  label: string;
  onOpenLink?: (type: "terms" | "privacy") => void;
}

export function TermsCheckbox({ checked, onPress, label, onOpenLink }: TermsCheckboxProps) {
  const renderLabel = () => {
    // Divide o texto para colocar links clicáveis
    if (label.includes("Termos e Condições de Uso") && label.includes("Política de Privacidade")) {
      return (
        <Text>
          Declaro aceitar os{" "}
          <Text
            style={{ color: Colors.primaryColor }}
            onPress={() => onOpenLink?.("terms")}
          >
            Termos e Condições de Uso
          </Text>{" "}
          e a{" "}
          <Text
            style={{ color: Colors.primaryColor }}
            onPress={() => onOpenLink?.("privacy")}
          >
            Política de Privacidade
          </Text>
        </Text>
      );
    }

    return <Text>{label}</Text>;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}
    >
      <Checkbox
        value={checked}
        onValueChange={onPress}
        color={checked ? Colors.primaryColor : undefined}
      />
      <View style={{ flex: 1 }}>{renderLabel()}</View>
    </TouchableOpacity>
  );
}
