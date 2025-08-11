import React, { forwardRef } from "react";
import { Text, TextInput, View } from "react-native";
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
  maskType?: "cpf" | "currency" | "phone" | "vehiclePlate" | "custom";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maskOptions?: {
    mask: string;
    precision?: number;
    separator?: string;
    delimiter?: string;
    unit?: string;
    suffixUnit?: string;
  };
  onSubmitEditing?: () => void; // <- para chamar submit ou focar próximo
  returnKeyType?: "done" | "next";
}

export const FormInput = forwardRef<TextInput, FormInputProps>(
  (
    {
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
      onSubmitEditing,
      returnKeyType = "done",
    },
    ref
  ) => {
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

          const commonProps = {
            onBlur,
            value,
            placeholder,
            style: styleInput,
            ref,
            returnKeyType,
            onSubmitEditing,
          };

          const renderInput = () => {
            if (maskType === "cpf") {
              return (
                <MaskedTextInput
                  {...commonProps}
                  mask="999.999.999-99"
                  keyboardType="numeric"
                  onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                />
              );
            }

            if (maskType === "currency") {
              return (
                <MaskedTextInput
                  {...commonProps}
                  type="currency"
                  keyboardType="numeric"
                  options={{
                    prefix: maskOptions?.unit ?? "R$ ",
                    decimalSeparator: maskOptions?.separator ?? ",",
                    groupSeparator: maskOptions?.delimiter ?? ".",
                    precision: maskOptions?.precision ?? 2,
                  }}
                  onChangeText={onChange}
                />
              );
            }

            if (maskType === "phone") {
              return (
                <MaskedTextInput
                  {...commonProps}
                  mask="(99) 99999-9999"
                  keyboardType="phone-pad"
                  onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                />
              );
            }

            if (maskType === "custom" && maskOptions?.mask) {
              return (
                <MaskedTextInput
                  {...commonProps}
                  mask={maskOptions.mask}
                  keyboardType={keyboardType}
                  autoCapitalize={autoCapitalize}
                  onChangeText={onChange}
                />
              );
            }

            if (maskType === "vehiclePlate") {
              return (
                <MaskedTextInput
                  {...commonProps}
                  keyboardType="default"
                  autoCapitalize="characters"
                  maxLength={8} // 7 + hífen
                  onChangeText={(text) => {
                    let cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, ""); // Só letras e números
                    let formatted = cleaned;

                    if (cleaned.length > 3) {
                      formatted = cleaned.slice(0, 3) + "-" + cleaned.slice(3);
                    }

                    onChange(formatted);
                  }}
                />
              );
            }

            return (
              <MaskedTextInput
                {...commonProps}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                autoCapitalize={autoCapitalize}
                onChangeText={onChange}
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
  }
);

FormInput.displayName = "FormInput";
