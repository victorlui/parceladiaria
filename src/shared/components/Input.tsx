import React, { forwardRef, useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { MaskedTextInput } from "react-native-mask-text";
import { Colors } from "../constants/colors";

type InputProps = {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  maskType?: "cpf" | "cellphone" | "date" | "cep" | "cnpj" | "otp";
} & Omit<TextInputProps, "style" | "onChangeText" | "value" | "placeholder">;

const InputComponent = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      icon,
      rightIcon,
      error,
      containerStyle,
      inputStyle,
      editable = true,
      secureTextEntry,
      keyboardType,
      autoCapitalize = "none",
      onBlur,
      onFocus,
      maxLength,
      maskType,
      returnKeyType,
      onSubmitEditing,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const isInvalid = !!error;
    const [inputNode, setInputNode] = useState<TextInput | null>(null);

    const mask =
      maskType === "cpf"
        ? "999.999.999-99"
        : maskType === "cnpj"
          ? "99.999.999/9999-99"
          : maskType === "cellphone"
            ? "(99) 99999-9999"
            : maskType === "cep"
              ? "99999-999"
              : maskType === "date"
                ? "99/99/9999"
                : maskType === "otp"
                  ? "999999"
                  : undefined;

    const computedMaxLength =
      maskType === "otp" ? 6 : mask ? mask.length : maxLength;
    const handleSetRef = useCallback(
      (node: any) => {
        setInputNode(node);

        if (!ref) return;
        if (typeof ref === "function") {
          ref(node);
        } else {
          (ref as any).current = node;
        }
      },
      [ref],
    );

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <Pressable
          onPress={() => inputNode?.focus?.()}
          accessibilityRole="button"
          style={[
            styles.inputContainer,
            focused && styles.inputContainerFocused,
            isInvalid && styles.inputContainerError,
            !editable && styles.inputContainerDisabled,
          ]}
        >
          {icon ? <View style={styles.icon}>{icon}</View> : null}

          {mask ? (
            <MaskedTextInput
              ref={handleSetRef as any}
              value={value}
              onChangeText={(formatted, rawText) => onChangeText?.(rawText)}
              mask={mask}
              placeholder={placeholder}
              placeholderTextColor={Colors.gray.primary}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType ?? "number-pad"}
              autoCapitalize={autoCapitalize}
              editable={editable}
              maxLength={computedMaxLength}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              style={[styles.input, inputStyle]}
              {...rest}
            />
          ) : (
            <TextInput
              ref={handleSetRef}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={Colors.gray.primary}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              editable={editable}
              maxLength={computedMaxLength}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              style={[styles.input, inputStyle]}
              {...rest}
            />
          )}

          {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
        </Pressable>

        {isInvalid ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

InputComponent.displayName = "InputComponent";

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: Colors.gray.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 22 : 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: "#F9FAFB",
  },
  inputContainerFocused: {
    borderColor: Colors.green.primary,
  },
  inputContainerError: {
    borderColor: Colors.error.medium,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.error.medium,
  },
});

export default InputComponent;
