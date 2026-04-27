import React from "react";
import { Alert, Linking, Modal, StyleSheet, Text, View } from "react-native";
import ButtonComponent from "../../../components/ui/Button";
import { useAuthStore } from "@/store/auth";
import { router } from "expo-router";

interface RefinancingModalProps {
  visible: boolean;
  onClose: () => void;
}

const MenssagemModal: React.FC<RefinancingModalProps> = ({
  visible,
  onClose,
}) => {
  const { logout } = useAuthStore();

  const contactSupport = async () => {
    const phoneNumber = "5511952133321";
    const message = "Olá! Poderia me ajudar?";

    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      logout();
      router.replace("/login");
    } else {
      Alert.alert("Erro", "WhatsApp não está instalado.");
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Aviso!!</Text>
          <Text style={styles.modalText}>
            Entre em contato com suporte para resolver pendências sobre o seu
            contrato
          </Text>
          <View style={{ width: "100%" }}>
            <ButtonComponent
              title="Entrar em contato"
              iconLeft={null}
              iconRight={null}
              onPress={contactSupport}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 30,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignContent: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
});

export default MenssagemModal;
