import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { options } from "../utils/profiles";
import { FontAwesome6 } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type Props = {
  onNext: (item: any) => void | Promise<void>;
  isLoading: boolean;
};

const Step4Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const onContinue = (item: (typeof options)[0]) => {
    onNext(item);
  };

  return (
    <>
      {options.map((item) => (
        <TouchableOpacity
          onPress={() => onContinue(item)}
          key={item.id}
          style={styles.item}
        >
          <FontAwesome6
            name={item.iconName as "car" | "motorbike" | "store"}
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
export default Step4Component;
