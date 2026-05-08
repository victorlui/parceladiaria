import InputComponent from "@/components/ui/Input";
import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Indicator } from "./Indicator";
import ButtonComponent from "@/components/ui/Button";

type Props = {
  onNext: (password: string) => void | Promise<void>;
  isLoading: boolean;
};

const Step2Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(true);
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
    [criteria],
  );

  const confirmError =
    confirmPassword && confirmPassword !== password
      ? "As senhas não coincidem"
      : undefined;

  const handleContinue = () => {
    if (!allValid || confirmPassword !== password || !confirmPassword) return;
    onNext(password);
  };
  return (
    <>
      <InputComponent
        placeholder="Mínimo 8 caracteres"
        secureTextEntry={!showPassword}
        value={password}
        icon={<FontAwesome name="lock" size={20} color={Colors.gray.primary} />}
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
        icon={<FontAwesome name="lock" size={20} color={Colors.gray.primary} />}
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
        error={confirmError}
        onSubmitEditing={handleContinue}
      />

      <ButtonComponent
        title="Continuar"
        onPress={handleContinue}
        iconRight="arrow-forward"
        iconLeft={null}
        loading={isLoading}
        disabled={!allValid || confirmPassword !== password || !confirmPassword}
      />
    </>
  );
};

const styles = StyleSheet.create({
  criteriaBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ECF3F5",
    gap: 8,
  },
});

export default Step2Component;
