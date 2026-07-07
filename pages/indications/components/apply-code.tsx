import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

type Props = {
  code: string;
  setCode: (value: string) => void;
  loading?: boolean;
  onSubmit: () => void;
};

const ApplyCode = ({ code, setCode, loading = false, onSubmit }: Props) => {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  return (
    <View style={styles.applyCodeCard}>
      <View style={styles.applyCodeCardTitleRow}>
        <View style={styles.titleWrapper}>
          <Ionicons
            name="people"
            size={width < 360 ? 18 : 20}
            color={Colors.black}
          />
          <Text style={styles.applyCodeCardTitle}>
            Foi indicado por alguém?
          </Text>
        </View>

        <Text style={styles.applyCodeSubtitle}>
          Digite o código de quem te indicou.
        </Text>
      </View>

      <InputComponent
        placeholder="DIGITE O CÓDIGO"
        value={code}
        onChangeText={setCode}
        returnKeyType="send"
        onSubmitEditing={() => onSubmit()}
        editable={!loading}
        autoCapitalize="characters"
        containerStyle={styles.inputContainer}
      />

      <ButtonComponent
        loading={loading}
        iconLeft={"check"}
        iconRight={null}
        title="Aplicar Código"
        onPress={() => onSubmit()}
        disabled={loading || !code.trim()}
      />
    </View>
  );
};

export default ApplyCode;

const getStyles = (width: number) => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  return StyleSheet.create({
    applyCodeCard: {
      backgroundColor: "#F1FAF8",
      borderRadius: isSmallDevice ? 22 : 26,
      paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 26,
      paddingVertical: isSmallDevice ? 20 : isMediumDevice ? 24 : 28,
      borderWidth: 1,
      borderColor: "#D7E1DF",
      shadowColor: "#053D39",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
      gap: isSmallDevice ? 16 : 18,
    },
    applyCodeCardTitleRow: {
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: 8,
    },
    titleWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    applyCodeCardTitle: {
      color: "#233047",
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 27 : 30,
      fontWeight: "700",
    },
    applyCodeSubtitle: {
      color: "#475569",
      fontSize: isSmallDevice ? 13 : isMediumDevice ? 14 : 15,
      lineHeight: isSmallDevice ? 20 : isMediumDevice ? 22 : 24,
      textAlign: "left",
    },
    inputContainer: {
      marginTop: 2,
    },
  });
};
