import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import ButtonComponent from "@/components/ui/Button";

interface StatusDocModalProps {
  visible: boolean;
  onUpdate: () => void;
  onClose: () => void;
}

export const StatusDocModal: React.FC<StatusDocModalProps> = ({
  visible,
  onUpdate,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Atualização Necessária</Text>
            <FontAwesome5
              name="exclamation-triangle"
              size={24}
              color="#D97706"
              style={styles.icon}
            />
          </View>

          <Text style={styles.modalText}>
            <Text style={styles.boldText}>Atenção!</Text> Identificamos uma
            pendência em sua documentação.
          </Text>

          <Text style={styles.modalText}>
            Para garantir que você consiga realizar{" "}
            <Text style={styles.boldText}>futuras renovações</Text> e novos
            empréstimos, é necessário atualizar seus documentos o quanto antes.
          </Text>

          <View style={styles.buttonContainer}>
            <ButtonComponent
              title="Atualizar Documentos"
              onPress={onUpdate}
              iconRight={null}
              iconLeft={null}
            />
            <View style={styles.spacer} />
            <ButtonComponent
              title="Fechar"
              onPress={onClose}
              outline
              iconRight={null}
              iconLeft={null}
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
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalView: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  icon: {
    marginBottom: 0,
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "left",
    marginBottom: 16,
    lineHeight: 24,
    width: "100%",
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 8,
  },
  spacer: {
    height: 12,
  },
});

export default StatusDocModal;