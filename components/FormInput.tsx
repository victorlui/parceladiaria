import React, { forwardRef } from "react";
import { Text, TextInput, View, ViewStyle } from "react-native";
import { Controller, Control } from "react-hook-form";
import { MaskedTextInput } from "react-native-mask-text";
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
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => {
         // Ajustamos os estilos para acomodar o ícone
          const containerStyle = {
            flexDirection: "row", // 👈 Alinha o ícone e o input na mesma linha
            alignItems: "center", // 👈 Alinha verticalmente
            borderWidth: 1,
            borderColor: error ? "#ef4444" : Colors.borderColor,
            borderRadius: 6,
            height: 60,
            paddingHorizontal: 8, // 👈 Ajuste o padding horizontal para o container
          };

          const inputStyle = {
            flex: 1, // 👈 Faz o input ocupar o espaço restante
            fontSize: 16,
            height: "100%", // 👈 Ocupa a altura do container
            paddingLeft: 8, // 👈 Adiciona padding à esquerda do texto do input
          };

          const commonProps = {
            onBlur,
            value,
            placeholder,
            style: inputStyle,
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
              {/* O View com 'containerStyle' agora envolve o ícone e o input */}
              <View style={containerStyle as ViewStyle}>
                {/* 2. Renderizamos o ícone se ele existir */}
                {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
                {renderInput()}
              </View>
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
