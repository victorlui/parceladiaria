import React from "react";
import { Text, View } from "react-native";
import { Controller, Control } from "react-hook-form";
import { MaskedTextInput } from "react-native-mask-text";
import { clsx } from "clsx"; // ou use diretamente string de classes
import { Colors } from "@/constants/Colors";

interface FormInputProps {
  name: string;
  control: Control<any>;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  rules?: object;
  label?: string;
  maskType?: "cpf" | "currency" | "phone" | "custom";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maskOptions?: {
    mask: string;
    precision?: number;
    separator?: string;
    delimiter?: string;
    unit?: string;
    suffixUnit?: string;
  };
  
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  control,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  rules = {},
  label,
  maskType,
  maskOptions,
  autoCapitalize,   

}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        const styleInput = {
          borderWidth: 1,
          borderColor: error ? "#ef4444" : Colors.borderColor,
          borderRadius: 6,
          padding: 8,
          fontSize: 16,
          height: 60,
        };

        const renderInput = () => {
          if (maskType === "cpf") {
            return (
              <MaskedTextInput
                mask="999.999.999-99"
                onChangeText={(text) => {
                  const format = text.replace(/\D/g, "");
                  onChange(format);
                }}
                onBlur={onBlur}
                value={value}
                placeholder={placeholder}
                keyboardType="numeric"
                style={styleInput}
                
              />
            );
          }

          if (maskType === "currency") {
            return (
              <MaskedTextInput
                type="currency"
                options={{
                  prefix: maskOptions?.unit ?? "R$ ",
                  decimalSeparator: maskOptions?.separator ?? ",",
                  groupSeparator: maskOptions?.delimiter ?? ".",
                  precision: maskOptions?.precision ?? 2,
                }}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder={placeholder}
                keyboardType="numeric"
                style={styleInput}
              />
            );
          }

          if (maskType === "phone") {
            return (
              <MaskedTextInput
                mask="(99) 99999-9999"
                onChangeText={(text) => {
                  const format = text.replace(/\D/g, "");
                  onChange(format);
                }}
                onBlur={onBlur}
                value={value}
                placeholder={placeholder}
                keyboardType="phone-pad"
                style={styleInput}
              />
            );
          }

          if (maskType === "custom" && maskOptions?.mask) {
            return (
              <MaskedTextInput
                mask={maskOptions.mask}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder={placeholder}
                keyboardType={keyboardType}
                style={styleInput}
                autoCapitalize={autoCapitalize}
              />
            );
          }

          return (
            <MaskedTextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder={placeholder}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              style={styleInput}
              autoCapitalize={autoCapitalize}
            />
          );
        };

        return (
          <View className="mb-3">
            {label && (
              <Text className="mb-1 text-base text-gray-700">{label}</Text>
            )}
            {renderInput()}
            {error && (
              <Text className="mt-1 text-sm text-red-500">
                {error.message || "Campo obrigatório"}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
};
