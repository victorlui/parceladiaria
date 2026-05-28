import ButtonComponent from "@/shared/components/Button";
import InputComponent from "@/shared/components/Input";
import { Colors } from "@/shared/constants/colors";
import api from "@/shared/service/api";
import { useAlertStore } from "@/shared/store/useAlertStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

type Props = {
  onNext: (affiliateCode: string) => void | Promise<void>;
  isLoading: boolean;
};

const Step4Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const { showAlert } = useAlertStore();
  const phoneRef = React.useRef<TextInput>(null);
  const [loading, setLoading] = React.useState(false);
  const [affiliateCode, setAffiliateCode] = React.useState("");

  const handleSkip = async () => {
    setAffiliateCode("");
    await onNext("");
  };

  const onSubmit = async () => {
    if (!affiliateCode) {
      onNext("");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(
        `affiliate/validate-code/${affiliateCode}`,
      );
      if (!data.data.valid) {
        showAlert("warning", "Atenção!", data.message);
        return;
      }
      onNext("");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <InputComponent
        placeholder="000000"
        autoCapitalize="characters"
        icon={
          <Ionicons name="megaphone" size={20} color={Colors.gray.primary} />
        }
        ref={phoneRef}
        value={affiliateCode}
        onChangeText={setAffiliateCode}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      <ButtonComponent
        title={"Continuar"}
        onPress={() => onSubmit()}
        loading={isLoading || loading}
        iconLeft={null}
        disabled={isLoading || loading || !affiliateCode}
      />

      <TouchableOpacity
        style={styles.transparentButton}
        onPress={handleSkip}
        disabled={isLoading || loading}
      >
        <Text style={styles.transparentButtonText}>
          Não tenho código, continuar
        </Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  transparentButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  transparentButtonText: {
    color: Colors.green.button,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Step4Component;
