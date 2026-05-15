import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

type Props = {
  onNext: (affiliateCode: string) => void | Promise<void>;
  isLoading: boolean;
};

const AffiliateCode: React.FC<Props> = ({ onNext, isLoading }) => {
  const { data } = useRegisterStore();
  const { showWarning } = useAlerts();
  const phoneRef = React.useRef<TextInput>(null);
  const [loading, setLoading] = React.useState(false);
  const [affiliateCode, setAffiliateCode] = React.useState(
    data?.afiliado || "",
  );

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
        showWarning("Atenção!", data.message);
        return;
      }
      onNext("");
      console.log("sucesso", data.data);
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

export default AffiliateCode;
