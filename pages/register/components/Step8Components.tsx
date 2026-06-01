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
  const { refs, form, handleChange, errors, loadingCep, isCepValidated } =
    useRegisterAddress();

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
          refs.numero.current?.focus();
        }}
        error={errors.cep}
      />
      {loadingCep ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.green.button} />
          <Text style={styles.loadingText}>Buscando endereco pelo CEP...</Text>
        </View>
      ) : null}
      {isCepValidated ? (
        <View style={styles.autoFilledCard}>
          <Text style={styles.autoFilledTitle}>Endereco encontrado</Text>
          <Text style={styles.autoFilledText}>{form.endereco}</Text>
          <Text style={styles.autoFilledText}>{form.bairro}</Text>
          <Text style={styles.autoFilledText}>
            {form.cidade} - {form.estado}
          </Text>
        </View>
      ) : null}
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
        keyboardType="number-pad"
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
        returnKeyType="done"
        error={errors.complemento}
      />

      <ButtonComponent
        title="Próximo"
        onPress={onConfirm}
        loading={isLoading}
        iconLeft={null}
        disabled={
          loadingCep ||
          !isCepValidated ||
          form.numero === "" ||
          form.cep?.replace(/\D/g, "").length !== 8
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
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

  autoFilledCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F7F8FA",
    padding: 16,
    gap: 4,
  },

  autoFilledTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  autoFilledText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
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
