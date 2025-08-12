import React, { forwardRef, useRef } from "react";
import { Text, TextInput, View, TouchableOpacity } from "react-native";
import { Controller, Control } from "react-hook-form";
import { MaskedTextInput } from "react-native-mask-text";

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
  icon?: React.ReactNode;
  
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
      icon
    },
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => {
          // Usando classes Tailwind para melhor compatibilidade no APK
          const containerClasses = `flex-row items-center border rounded-md h-16 px-3 ${
            error ? "border-red-500" : "border-gray-300"
          }`;

          const inputClasses = "flex-1 text-lg h-full px-3 text-gray-900";

          const currentRef = ref || inputRef;

          const handleContainerPress = () => {
            const inputToFocus = (typeof ref === 'function' ? inputRef.current : ref?.current) || inputRef.current;
            if (inputToFocus) {
              inputToFocus.focus();
            }
          };

          const renderInput = () => {
            // Props específicos para MaskedTextInput (sem className)
            const maskedProps = {
              onBlur,
              value,
              placeholder,
              ref: currentRef,
              returnKeyType,
              onSubmitEditing,
              placeholderTextColor: "#9CA3AF",
              style: { color: "#111827", flex: 1, fontSize: 18, paddingHorizontal: 12, height: "100%" },
            };

            // Props específicos para TextInput normal
            const textInputProps = {
              ...maskedProps,
              className: inputClasses,
            };

            if (maskType === "cpf") {
              return (
                <MaskedTextInput
                  {...maskedProps}
                  mask="999.999.999-99"
                  keyboardType="numeric"
                  onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                />
              );
            }

            if (maskType === "currency") {
              return (
                <MaskedTextInput
                  {...maskedProps}
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
                  {...maskedProps}
                  mask="(99) 99999-9999"
                  keyboardType="phone-pad"
                  onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                />
              );
            }

            if (maskType === "custom" && maskOptions?.mask) {
              return (
                <MaskedTextInput
                  {...maskedProps}
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
                  {...maskedProps}
                  keyboardType="default"
                  autoCapitalize="characters"
                  maxLength={8}
                  onChangeText={(text) => {
                    let cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    let formatted = cleaned;

                    if (cleaned.length > 3) {
                      formatted = cleaned.slice(0, 3) + "-" + cleaned.slice(3);
                    }

                    onChange(formatted);
                  }}
                />
              );
            }

            // Para inputs normais, usar TextInput ao invés de MaskedTextInput
            return (
              <TextInput
                {...textInputProps}
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
              <TouchableOpacity 
                onPress={handleContainerPress} 
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
              >
                <View className={containerClasses}>
                  {icon && (
                    <View className="mr-2" pointerEvents="none">
                      {icon}
                    </View>
                  )}
                  {renderInput()}
                </View>
              </TouchableOpacity>
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
