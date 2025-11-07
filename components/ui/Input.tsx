import React, { forwardRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { MaskedTextInput } from "react-native-mask-text";

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
  maskType?: "cpf" | "cellphone";
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
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const isInvalid = !!error;

    const mask =
      maskType === "cpf"
        ? "999.999.999-99"
        : maskType === "cellphone"
          ? "(99) 99999-9999"
          : undefined;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View
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
              ref={ref as any}
              value={value}
              onChangeText={(formatted, rawText) => onChangeText?.(rawText)}
              mask={mask}
              placeholder={placeholder}
              placeholderTextColor={Colors.gray.primary}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType ?? "number-pad"}
              autoCapitalize={autoCapitalize}
              editable={editable}
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
              ref={ref}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={Colors.gray.primary}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              editable={editable}
              maxLength={maxLength}
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
        </View>

        {isInvalid ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }
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
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: "#F9FAFB",
  },
  inputContainerFocused: {
    borderColor: Colors.green.primary,
  },
  inputContainerError: {
    borderColor: Colors.orange.primary,
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
    color: Colors.orange.primary,
  },
});

export default InputComponent;
