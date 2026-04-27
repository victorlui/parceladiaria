import { formatCurrencyBRL } from "@/utils/formats";
import React from "react";
import { Text, View } from "react-native";

interface Props {
  valueSelected: string;
  valueToReceive: string;
}

const InfoConfirm: React.FC<Props> = ({ valueSelected, valueToReceive }) => {
  return (
    <View className="bg-[#F9F9F9] rounded-xl px-4 py-3 gap-2">
      <View className="flex-row justify-between gap-2">
        <Text style={{ fontSize: 14, fontWeight: "400" }}>
          Valor selecionado:
        </Text>
        <Text style={{ fontWeight: "bold" }}>
          {formatCurrencyBRL(valueSelected)}
        </Text>
      </View>
      <View className="flex-row justify-between gap-2">
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Valor recebe:</Text>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {formatCurrencyBRL(valueToReceive)}
        </Text>
      </View>
    </View>
  );
};

export default InfoConfirm;
