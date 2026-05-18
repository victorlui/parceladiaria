import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type ModalNoticeProps = {
  visible: boolean;
  onClose: () => void;
};

const ModalNotice: React.FC<ModalNoticeProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>
            Atenção — Instabilidade{"\n"}Santander{" "}
            <Text style={styles.titleIcon}>⚠️</Text>
          </Text>

          <View style={styles.body}>
            <Text style={styles.text}>
              Estamos enfrentando{" "}
              <Text style={styles.textStrong}>problemas de instabilidade</Text>{" "}
              para enviar pagamentos via{" "}
              <Text style={styles.textStrong}>PIX</Text> para contas do banco{" "}
              <Text style={styles.textStrong}>Santander</Text>.
            </Text>

            <Text style={styles.text}>
              Se a sua chave PIX cadastrada for do{" "}
              <Text style={styles.textStrong}>Santander</Text>, recomendamos
              fortemente que você{" "}
              <Text style={styles.textStrong}>
                troque para uma chave PIX de outro banco
              </Text>{" "}
              antes de confirmar a renovação. Isso garante que você receba o
              valor sem atrasos ou transtornos.
            </Text>

            <Text style={styles.text}>
              Você poderá alterar sua chave PIX na próxima etapa, após
              selecionar o valor do empréstimo.
            </Text>
          </View>

          <Pressable style={styles.button} onPress={onClose}>
            <Ionicons name="checkmark" size={18} color={Colors.white} />
            <Text style={styles.buttonText}>Entendi</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 12,
  },
  titleIcon: {
    fontSize: 20,
  },
  body: {
    gap: 12,
    marginBottom: 18,
  },
  text: {
    fontSize: 14.5,
    lineHeight: 22,
    color: "#4B5563",
    textAlign: "left",
  },
  textStrong: {
    fontWeight: "800",
    color: "#374151",
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.green.button,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
});

export default ModalNotice;
