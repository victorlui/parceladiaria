import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";

interface Props {
  textButton1: string;
  textButton2: string;
  onConfirm: () => void;
  handleChangePress: () => void;
  loading: boolean;
}

const ButtonModal: React.FC<Props> = ({
  textButton1,
  textButton2,
  onConfirm,
  handleChangePress,
  loading,
}) => {
  return (
    <View className="mt-4 flex-row gap-3">
      <TouchableOpacity
        onPress={handleChangePress}
        disabled={loading}
        style={{
          borderWidth: 1,
          borderColor: Colors.green.primary,
          opacity: loading ? 0.5 : 1,
        }}
        className="flex-1  rounded-xl py-4 "
      >
        <Text
          style={{
            color: Colors.green.primary,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {textButton1}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onConfirm}
        className="flex-1 rounded-xl py-4 "
        style={{ backgroundColor: Colors.green.primary }}
      >
        {loading ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="small" color={Colors.white} />
            <Text
              style={{
                color: Colors.white,
                fontWeight: "bold",
                textAlign: "center",
                marginLeft: 8,
              }}
            >
              Salvando...
            </Text>
          </View>
        ) : (
          <Text
            style={{
              color: Colors.white,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {textButton2}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ButtonModal;
