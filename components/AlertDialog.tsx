import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { Link } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, Image, Modal } from "react-native";

type AlertType = "info" | "error" | "warning" | "success";

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
  sac?: boolean;
}

const icons = {
  error: require("@/assets/images/close.png"),
  warning: require("@/assets/images/warning.png"),
  info: require("@/assets/images/info.png"),
  success: require("@/assets/images/checked.png"),
};

export function AlertComponent({
  type,
  title,
  message,
  buttonText,
  onPress,
  sac = false,
}: AlertProps) {
  // Define cores e ícones de acordo com o tipo
  useDisableBackHandler();
  const bgColor = "bg-white";
  const buttonBg =
    type === "success"
      ? "bg-green-500"
      : type === "info"
        ? "bg-blue-500"
        : type === "warning"
          ? "bg-yellow-500"
          : "bg-red-400";

  const icon = icons[type];

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View
          className={`p-6 rounded-xl shadow-md w-72 ${bgColor} items-center`}
        >
          <Image
            source={icon}
            className="w-16 h-16 mb-4"
            resizeMode="contain"
          />
          {title ? (
            <>
              <Text
                className={`text-xl font-bold ${!message ? "mb-6" : "mb-2"}`}
              >
                {title}
              </Text>
              {message && (
                <Text
                  className={`text-gray-600  text-center ${sac ? "mb-3" : "mb-6"}`}
                >
                  {message}
                </Text>
              )}
            </>
          ) : (
            <Text className="text-gray-600 mb-6 text-center">{message}</Text>
          )}
          {sac && (
            <Link
              href="https://www.parceladiaria.com.br/sac"
              className="text-blue-500 text-center font-semibold mb-6"
            >
              Clicando aqui
            </Link>
          )}

          <TouchableOpacity
            onPress={onPress}
            className={`px-6 py-3 rounded-lg ${buttonBg}`}
          >
            <Text className="text-white text-center font-semibold">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
