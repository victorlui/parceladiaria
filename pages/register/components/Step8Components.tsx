import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRegisterAddress } from "../hooks/useRegisterAddress";
import { Address } from "../types/address";

interface Props {
  onNext: (address: Address) => void | Promise<void>;
  isLoading: boolean;
  confirmAddress: boolean;
  setConfirmAddress: React.Dispatch<React.SetStateAction<boolean>>;
}
const Step8Components: React.FC<Props> = ({
  onNext,
  isLoading,
  confirmAddress,
  setConfirmAddress,
}) => {
  const { refs, form, handleChange, errors, loadingCep } = useRegisterAddress();

  const onConfirm = () => {
    setConfirmAddress(true);
  };

  const onSubmit = () => {
    onNext(form);
  };

  if (confirmAddress) {
    return (
      <>
        <View style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>Confirmar endereço</Text>

          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>
              {form.endereco}, {form.numero || "S/N"}
              {form.complemento ? ` - ${form.complemento}` : ""}
            </Text>

            <Text style={styles.addressText}>{form.bairro}</Text>

            <Text style={styles.addressText}>
              {form.cidade} - {form.estado}
            </Text>

            <Text style={styles.addressText}>CEP: {form.cep}</Text>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={onSubmit}>
            <Text style={styles.confirmButtonText}>Confirmar endereço</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setConfirmAddress(false)}
          >
            <Text style={styles.changeButtonText}>Alterar endereço</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <InputComponent
        placeholder="Informe seu CEP"
        keyboardType="number-pad"
        maskType="cep"
        icon={
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={Colors.gray.primary}
          />
        }
        ref={refs.cep}
        value={form.cep}
        onChangeText={handleChange("cep")}
        returnKeyType="next"
        onSubmitEditing={() => {
          refs.endereco.current?.focus();
        }}
        error={errors.cep}
      />
      <InputComponent
        ref={refs.endereco}
        placeholder="Informe sua Rua"
        icon={
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={Colors.gray.primary}
          />
        }
        value={form.endereco}
        onChangeText={handleChange("endereco")}
        returnKeyType="next"
        onSubmitEditing={() => refs.numero.current?.focus()}
        error={errors.endereco}
        editable={!loadingCep}
        rightIcon={loadingCep ? <ActivityIndicator size="small" /> : null}
      />
      <InputComponent
        ref={refs.numero}
        placeholder="Informe seu Número"
        icon={
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={Colors.gray.primary}
          />
        }
        value={form.numero}
        onChangeText={handleChange("numero")}
        returnKeyType="next"
        onSubmitEditing={() => refs.complemento.current?.focus()}
        error={errors.numero}
      />
      <InputComponent
        ref={refs.complemento}
        placeholder="Complemento (opcional)"
        icon={
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={Colors.gray.primary}
          />
        }
        value={form.complemento}
        onChangeText={handleChange("complemento")}
        returnKeyType="next"
        onSubmitEditing={() => refs.bairro.current?.focus()}
        error={errors.complemento}
      />
      <InputComponent
        ref={refs.bairro}
        placeholder="Informe seu Bairro"
        icon={
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={Colors.gray.primary}
          />
        }
        value={form.bairro}
        onChangeText={handleChange("bairro")}
        returnKeyType="next"
        error={errors.bairro}
        onSubmitEditing={() => refs.estado.current?.focus()}
      />
      <InputComponent
        ref={refs.estado}
        placeholder="Informe seu Estado"
        editable={false}
        icon={
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={Colors.gray.primary}
          />
        }
        value={form.estado}
        onChangeText={handleChange("estado")}
        returnKeyType="next"
        onSubmitEditing={() => refs.cidade.current?.focus()}
        error={errors.estado}
      />
      <InputComponent
        ref={refs.cidade}
        placeholder="Informe sua Cidade"
        icon={
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={Colors.gray.primary}
          />
        }
        value={form.cidade}
        onChangeText={handleChange("cidade")}
        returnKeyType="done"
        error={errors.cidade}
        editable={false}
      />

      <ButtonComponent
        title="Próximo"
        onPress={onConfirm}
        loading={isLoading}
        iconLeft={null}
        disabled={
          Object.values(errors).some((error) => error !== "") ||
          !form.endereco ||
          form.numero === "" ||
          form.cep.replace(/\D/g, "").length !== 8
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  loadingInput: {
    opacity: 0.7,
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -4,
    marginBottom: 4,
    paddingHorizontal: 4,
  },

  loadingText: {
    fontSize: 14,
    color: "#666",
  },

  confirmCard: {
    marginTop: 20,
    backgroundColor: "#F7F8FA",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 16,
    width: "100%",
  },

  confirmTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  addressContainer: {
    gap: 6,
  },

  addressText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },

  confirmButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.green.button,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  changeButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.green.button,
  },

  changeButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Step8Components;
