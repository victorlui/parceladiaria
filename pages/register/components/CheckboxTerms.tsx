import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CheckboxTermsProps = {
  accepted: boolean;
  setAccepted: (accepted: boolean) => void;
  content: string;
  link?: boolean;
  showReadMore?: boolean;
};

export default function CheckboxTerms({
  accepted,
  setAccepted,
  content,
  link = false,
  showReadMore = false,
}: CheckboxTermsProps) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const renderHighlightedContent = (text: string) => {
    const parts = text.split(/(MOVA|Parcela Diária)/gi);

    return parts.map((part, index) => {
      const normalized = part.toLocaleLowerCase("pt-BR");
      const shouldHighlight =
        normalized === "mova" || normalized === "parcela diária";

      if (shouldHighlight) {
        return (
          <Text key={`${part}-${index}`} style={styles.highlightedText}>
            {part.toLocaleUpperCase("pt-BR")}
          </Text>
        );
      }

      return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
    });
  };

  React.useEffect(() => {
    setModalVisible(false);
  }, [content]);

  const toggleAccepted = () => setAccepted(!accepted);

  return (
    <>
      <View
        style={[
          styles.checkboxRow,
          { alignItems: !link && !showReadMore ? "center" : "flex-start" },
        ]}
      >
        <TouchableOpacity
          onPress={toggleAccepted}
          style={[styles.checkbox, accepted && styles.checkboxChecked]}
          activeOpacity={0.8}
        >
          {accepted && (
            <FontAwesome name="check" size={14} color={Colors.white} />
          )}
        </TouchableOpacity>

        <View style={styles.contentWrapper}>
          <TouchableOpacity onPress={toggleAccepted} activeOpacity={0.8}>
            <Text style={styles.checkboxText} numberOfLines={3}>
              {renderHighlightedContent(content)}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            {showReadMore && (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
                style={{ padding: 8 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.readMoreText}>Ler mais</Text>
              </TouchableOpacity>
            )}

            {link && <Text style={styles.termsLink}>26x R$ 30,30 por dia</Text>}
          </View>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Texto completo</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <FontAwesome
                  name="close"
                  size={18}
                  color={Colors.gray?.text || "#6B7280"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalText}>
                {renderHighlightedContent(content)}
              </Text>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.green.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.green.primary,
  },
  contentWrapper: {
    flex: 1,
    gap: 8,
  },
  checkboxText: {
    color: Colors.black,
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  readMoreText: {
    color: "#2563EB",
    fontWeight: "700",
  },
  termsLink: {
    color: Colors.green.primary,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    maxHeight: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    flex: 1,
    color: Colors.black,
    fontSize: 18,
    fontWeight: "700",
  },
  modalBody: {
    marginBottom: 18,
  },
  modalText: {
    color: Colors.black,
    fontSize: 15,
    lineHeight: 22,
  },
  highlightedText: {
    fontWeight: "700",
  },
  modalButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.green.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
