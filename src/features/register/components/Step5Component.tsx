import PulsingImageLoader from "@/shared/components/PulsingImageLoader";
import { Colors } from "@/shared/constants/colors";
import { options } from "@/shared/utils/profiles";
import { FontAwesome6 } from "@expo/vector-icons";
import React, { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onNext: (item: any) => void | Promise<void>;
  isLoading: boolean;
};

const Step5Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const isSubmittingRef = useRef(false);

  const onContinue = async (item: (typeof options)[0]) => {
    if (isLoading) return;
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    try {
      await onNext(item);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingBox}>
        <PulsingImageLoader />
        <Text style={styles.loadingText}>Enviando...</Text>
      </View>
    );
  }

  return (
    <>
      {options.map((item) => (
        <TouchableOpacity
          onPress={() => onContinue(item)}
          key={item.id}
          style={styles.item}
        >
          <FontAwesome6
            name={item.iconName as "car" | "motorcycle" | "store"}
            size={32}
            color={Colors.green.primary}
          />
          <Text style={styles.title}>{item.label}</Text>
          <Text style={styles.subtitle}>{item.profissaoValue}</Text>
        </TouchableOpacity>
      ))}
    </>
  );
};
const styles = StyleSheet.create({
  loadingBox: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },
  loadingText: {
    color: Colors.green.text,
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  item: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray.primary,
  },
});
export default Step5Component;
