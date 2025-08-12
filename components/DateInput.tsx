import React, { useState } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

interface DateInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions;
  label?: string;
}

export function DateInput<T extends FieldValues>({
  name,
  control,
  rules,
  label = "Data de Nascimento",
}: DateInputProps<T>) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date?: Date) => {
    if (!date) return "Selecionar data";
    return date.toLocaleDateString("pt-BR");
  };

  const handleChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
    onChange: (value: Date) => void
  ) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={
        rules as Omit<
          RegisterOptions<T, Path<T>>,
          "setValueAs" | "disabled" | "valueAsNumber" | "valueAsDate"
        >
      }
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>

          <TouchableOpacity
            style={[styles.input, error && styles.inputError]}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.inputText}>{formatDate(value)}</Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error.message}</Text>}

          {showPicker && (
            <DateTimePicker
              value={value || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "spinner"}
              maximumDate={new Date()}
              onChange={(event, date) => handleChange(event, date, onChange)}
              textColor="#222222"
            />
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: "#222222",
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    backgroundColor: "transparent",
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontSize: 20,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  inputText: {
    color: "#222222",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
