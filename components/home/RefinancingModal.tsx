import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";

interface RefinancingModalProps {
  visible: boolean;
  onClose: () => void;
  amount: any;
  installments: number;
}

const RefinancingModal = ({
  visible,
  onClose,
  amount,
  installments,
}: RefinancingModalProps) => {
  const router = useRouter();
  const { user } = useAuthStore();

  const handlePayNow = () => {
    onClose();
    router.push("/(tabs)/payments");
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
          <Text style={styles.modalTitle}>OFERTA APROVADA! 🎉</Text>
          <View>
            <Text style={[styles.modalText, { marginBottom: 0 }]}>
              Nome: {user?.nome}
            </Text>
            <Text style={styles.modalText}>
              CPF:{" "}
              {user?.cpf
                ? `***.${user.cpf.slice(3, 6)}.***-${user.cpf.slice(-2)}`
                : ""}
            </Text>
          </View>
          <Text style={styles.modalText}>
            Para CONFIRMAR sua proposta, você precisa pagar{" "}
            <Text style={{ fontWeight: "bold" }}>
              {installments} parcela de R$ {amount}
            </Text>{" "}
            ⏰ até <Text style={{ fontWeight: "bold" }}>hoje às 23h59</Text>{" "}
            (sem exceção).
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome5 name="check-circle" size={18} color="#28a745" />{" "}
              Após o pagamento:
            </Text>
            <Text style={styles.sectionItem}>
              • Suas parcelas em atraso serão reagendadas
            </Text>
            <Text style={styles.sectionItem}>
              • Você sairá do atraso imediatamente
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome5 name="times-circle" size={18} color="#dc3545" /> Se
              não pagar hoje:
            </Text>
            <Text style={styles.sectionItem}>
              • A proposta será CANCELADA automaticamente
            </Text>
            <Text style={styles.sectionItem}>
              • Você voltará à situação de atraso anterior
            </Text>
          </View>

          <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
            <Text style={styles.payButtonText}>$ Pagar Agora</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
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
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  section: {
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionItem: {
    fontSize: 14,
    marginLeft: 10,
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: "#1D756D",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 50,
    elevation: 2,
    marginTop: 10,
    alignItems: "center",
  },
  payButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 50,
    elevation: 2,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#1D756D",

    alignItems: "center",
  },
  closeButtonText: {
    color: "#1D756D",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default RefinancingModal;
