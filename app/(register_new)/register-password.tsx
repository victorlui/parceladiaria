import { Colors } from "@/constants/Colors";
import LayoutRegister from "@/layouts/layout-register";
import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import React, { useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRegisterNewStore } from "@/store/register_new";

const RegisterPassword: React.FC = () => {
  const { data, setData } = useRegisterNewStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const confirmRef = useRef<TextInput>(null);

  const criteria = useMemo(() => {
    const min8 = password.length >= 8;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%&*]/.test(password);
    return { min8, hasLetter, hasNumber, hasSymbol };
  }, [password]);

  const allValid = useMemo(
    () =>
      criteria.min8 &&
      criteria.hasLetter &&
      criteria.hasNumber &&
      criteria.hasSymbol,
    [criteria]
  );

  const confirmError =
    confirmTouched && confirmPassword && confirmPassword !== password
      ? "As senhas não coincidem"
      : undefined;

  const Indicator: React.FC<{ ok: boolean; text: string }> = ({ ok, text }) => (
    <View style={styles.indicatorRow}>
      <View
        style={[
          styles.indicatorDot,
          { backgroundColor: ok ? Colors.green.secondary : Colors.gray.text },
        ]}
      />
      <Text
        style={[
          styles.indicatorText,
          { color: ok ? Colors.green.secondary : Colors.gray.text },
        ]}
      >
        {text}
      </Text>
    </View>
  );

  const handleContinue = () => {
    if (!allValid || confirmPassword !== password || !confirmPassword) return;

    setLoading(true);
    try {
      setData({
        ...data,
        password,
      });
      router.push("/(register_new)/pre-approved-limit");
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutRegister
      title="Crie sua senha"
      subtitle="Crie uma senha segura para acessar sua área do cliente."
    >
      <View style={styles.formContainer}>
        <InputComponent
          placeholder="Mínimo 8 caracteres"
          secureTextEntry={!showPassword}
          value={password}
          icon={
            <FontAwesome name="lock" size={20} color={Colors.gray.primary} />
          }
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
              <FontAwesome
                name={showPassword ? "eye-slash" : "eye"}
                size={20}
                color={Colors.gray.primary}
              />
            </TouchableOpacity>
          }
          onChangeText={setPassword}
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />

        <View style={styles.criteriaBox}>
          <Indicator ok={criteria.min8} text="Mínimo 8 caracteres" />
          <Indicator ok={criteria.hasLetter} text="Pelo menos 1 letra" />
          <Indicator ok={criteria.hasNumber} text="Pelo menos 1 número" />
          <Indicator
            ok={criteria.hasSymbol}
            text="Pelo menos 1 símbolo (!@#$%&*)"
          />
        </View>

        <InputComponent
          ref={confirmRef}
          placeholder="Digite a senha novamente"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          icon={
            <FontAwesome name="lock" size={20} color={Colors.gray.primary} />
          }
          rightIcon={
            <TouchableOpacity onPress={() => setShowConfirm((s) => !s)}>
              <FontAwesome
                name={showConfirm ? "eye-slash" : "eye"}
                size={20}
                color={Colors.gray.primary}
              />
            </TouchableOpacity>
          }
          onChangeText={setConfirmPassword}
          returnKeyType="done"
          onBlur={() => setConfirmTouched(true)}
          error={confirmError}
          onSubmitEditing={handleContinue}
        />

        <ButtonComponent
          title="Continuar"
          onPress={handleContinue}
          iconRight="arrow-forward"
          loading={loading}
        />
      </View>
    </LayoutRegister>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    gap: 16,
    paddingHorizontal: 20,
  },
  criteriaBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ECF3F5",
    gap: 8,
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorText: {
    fontSize: 14,
  },
});

export default RegisterPassword;
