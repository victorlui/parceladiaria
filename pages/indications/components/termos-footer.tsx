import React from "react";
import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  accepted: boolean;
  loadingAccept: boolean;
  toggleAccepted: () => void;
  acceptTermos: () => Promise<void>;
};

export const TermosFooter = React.memo(function TermosFooter({
  accepted,
  loadingAccept,
  toggleAccepted,
  acceptTermos,
}: Props) {

  return (
    <View style={styles.footer}>
      <View style={styles.checkboxRow}>
        <Pressable style={styles.checkbox} onPress={toggleAccepted}>
          {accepted && (
            <FontAwesome name="check" size={14} color={Colors.green.primary} />
          )}
        </Pressable>
        <Text style={styles.checkboxText}>
          Li e aceito os Termos e Condições
        </Text>
      </View>
      <ButtonComponent
        disabled={!accepted || loadingAccept}
        iconLeft={null}
        title="Continuar"
        onPress={acceptTermos}
        loading={loadingAccept}
      />
    </View>
  );
});
const styles = StyleSheet.create({
  footer: {
    flex: 0.2,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#0F172A",
  },
  checkboxPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0F172A",
  },
});
