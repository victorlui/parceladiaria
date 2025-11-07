import React from "react";
import { Text, ActivityIndicator, Pressable } from "react-native";
import { clsx } from "clsx";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
  isBack?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
  fullWidth = true,
  className,
  icon,
  isBack = false,
}) => {
  const baseStyle =
    "rounded-md px-4 py-3 items-center justify-center h-[50px] flex-row items-center gap-6";

  const widthStyle = fullWidth ? "w-full" : "w-auto";

  const variantStyle = {
    primary: "bg-[#14524A]",
    secondary: "bg-[#111224]",
    danger: "bg-[#bb2124]",
    outline: "bg-transparent border border-[#14524A]",
  }[variant];

  const textColor =
    variant === "outline"
      ? "text-[#14524A] font-semibold text-[18px]"
      : "text-white font-semibold text-[18px]";

  const disabledStyle = disabled || isLoading ? "opacity-50" : "";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      className={clsx(
        baseStyle,
        widthStyle,
        variantStyle,
        disabledStyle,
        className
      )}
    >
      {isBack && icon}

      {isLoading ? (
        <ActivityIndicator color={variant === "outline" ? "#14524A" : "#fff"} />
      ) : (
        <Text className={textColor}>{title}</Text>
      )}
      {!isBack && icon}
    </Pressable>
  );
};
