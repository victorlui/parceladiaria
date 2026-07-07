import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type Props = {
  accepted: boolean;
  loadingAccept: boolean;
  toggleAccepted: () => void;
  acceptTermos: () => void;
  isReading?: boolean;
};

export const TermosFooter = React.memo(function TermosFooter({
  accepted,
  loadingAccept,
  toggleAccepted,
  acceptTermos,
  isReading = false,
}: Props) {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  return (
    <View style={styles.footer}>
      {!isReading && (
        <View style={styles.checkboxRow}>
          <Pressable style={styles.checkbox} onPress={toggleAccepted}>
            {accepted && (
              <FontAwesome
                name="check"
                size={14}
                color={Colors.green.primary}
              />
            )}
          </Pressable>
          <Text style={styles.checkboxText}>
            Li e aceito os Termos e Condições
          </Text>
        </View>
      )}
      <ButtonComponent
        disabled={!isReading && (!accepted || loadingAccept)}
        iconLeft={null}
        title="Aceitar e Continuar"
        onPress={acceptTermos}
        loading={loadingAccept}
      />
    </View>
  );
});

const getStyles = (width: number) => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  return StyleSheet.create({
    footer: {
      paddingHorizontal: 16,
      paddingTop: isSmallDevice ? 14 : 16,
      paddingBottom: isSmallDevice ? 16 : 18,
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
      gap: isSmallDevice ? 16 : 18,
      backgroundColor: Colors.white,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    checkbox: {
      width: isSmallDevice ? 22 : 24,
      height: isSmallDevice ? 22 : 24,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: Colors.borderColor,
      backgroundColor: Colors.white,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxText: {
      flex: 1,
      fontSize: isSmallDevice ? 13 : isMediumDevice ? 14 : 15,
      lineHeight: isSmallDevice ? 20 : isMediumDevice ? 22 : 24,
      fontWeight: "400",
      color: "#233047",
    },
  });
};
