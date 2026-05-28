import { FontAwesome } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import ButtonComponent from "@/shared/components/Button";
import InputComponent from "@/shared/components/Input";
import { Colors } from "@/shared/constants/colors";
import { useAlertStore } from "@/shared/store/useAlertStore";
import { PIX_OPTIONS, PixType, PixValue } from "@/shared/utils/pix";
import AlertsTextPix from "./AlertsTextPix";

interface Props {
  onNext: (pixValue: any, selected: PixType | null) => void | Promise<void>;
  isLoading: boolean;
}

const Step10Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const { user } = useAuthStore();
  const { showAlert } = useAlertStore();
  const inputRef = useRef<TextInput>(null);
  const [selected, setSelected] = useState<PixType | null>(null);
  const [confirm, setConfirm] = useState<boolean>(true);
  const [pixValue, setPixValue] = useState("");

  const renderIcon = (type: PixType) => {
    const iconName =
      type === "cpf" ? "id-card" : type === "email" ? "envelope" : "phone";

    return (
      <FontAwesome name={iconName} size={30} color={Colors.green.primary} />
    );
  };

  const handleNext = () => {
    if (!pixValue && !confirm) {
      showAlert("warning", "Campo obrigatório", "Informe sua chave pix");
      return;
    }

    if (selected && !confirm && !PIX_OPTIONS[selected].validator(pixValue)) {
      showAlert(
        "warning",
        "Chave pix inválida",
        "Informe uma chave pix válida",
      );
      return;
    }

    onNext(
      pixValue !== ""
        ? pixValue
        : user?.[PIX_OPTIONS[selected ?? "cpf"].value as PixValue],
      selected,
    );
  };

  if (selected && confirm) {
    return (
      <>
        <View style={styles.selectedItem}>
          <Text style={styles.selectedText}>
            {user?.[PIX_OPTIONS[selected].value as PixValue]}
          </Text>
        </View>
        <ButtonComponent
          title="Sim, está correto"
          onPress={handleNext}
          iconLeft="checkmark-sharp"
          iconRight={null}
          loading={isLoading}
        />

        {PIX_OPTIONS[selected].label !== "CPF" && (
          <ButtonComponent
            title="Não, corrigir"
            onPress={() => {
              setConfirm(false);
            }}
            outline
            iconLeft="close"
            iconRight={null}
            loading={isLoading}
          />
        )}
      </>
    );
  }

  if (selected && !confirm) {
    return (
      <>
        <InputComponent
          ref={inputRef}
          placeholder={PIX_OPTIONS[selected].placeholder}
          keyboardType={PIX_OPTIONS[selected].keyboardType}
          maskType={PIX_OPTIONS[selected]?.maskType}
          icon={PIX_OPTIONS[selected].icon}
          value={pixValue}
          returnKeyType="done"
          onChangeText={setPixValue}
          onSubmitEditing={() => {
            Keyboard.dismiss();
          }}
        />
        <ButtonComponent
          title="Confirmar e Continuar"
          onPress={handleNext}
          iconLeft="checkmark-sharp"
          iconRight={null}
          loading={isLoading}
        />

        <ButtonComponent
          title="Voltar"
          onPress={() => {
            setSelected(null);
            setConfirm(true);
            setPixValue("");
          }}
          outline
          iconLeft="close"
          iconRight={null}
          loading={isLoading}
        />
      </>
    );
  }

  return (
    <>
      <AlertsTextPix />

      {Object.entries(PIX_OPTIONS).map(([key, item]) => (
        <TouchableOpacity
          key={key}
          style={styles.item}
          onPress={() => {
            setSelected(key as PixType);
            setConfirm(true);
          }}
        >
          {renderIcon(key as PixType)}

          <View>
            <Text style={styles.title}>{item.label}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  warning: {
    gap: 10,
    paddingHorizontal: 13,
    borderLeftWidth: 5,
    borderColor: "#D97706",
    borderRadius: 12,
    marginVertical: 10,
    paddingVertical: 15,
  },

  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  alertaTexto: {
    color: "#5d4037",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },

  item: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    width: "100%",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.gray.primary,
  },

  selectedItem: {
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: "dashed",
    paddingHorizontal: 15,
    paddingVertical: 25,
    gap: 8,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.green.text,
  },

  selectedValues: {
    fontWeight: "400",
    color: Colors.black,
  },
});

export default Step10Component;
