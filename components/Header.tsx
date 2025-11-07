import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

interface HeaderProps {
  title: string;
  subtitle?: string;
  iconName?: string;
  iconLibrary?: "MaterialIcons" | "FontAwesome5";
  onMenuPress?: () => void;
  showMenuButton?: boolean;
}

export default function Header({
  title,
  subtitle,
  iconName = "wallet",
  iconLibrary = "FontAwesome5",
  onMenuPress,
  showMenuButton = true,
}: HeaderProps) {
  const renderIcon = () => {
    if (iconLibrary === "MaterialIcons") {
      return <MaterialIcons name={iconName as any} size={24} color="#053D39" />;
    }
    return <FontAwesome5 name={iconName as any} size={24} color="#053D39" />;
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {showMenuButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name="menu" size={24} color="#1F2937" />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(155, 209, 61, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "rgba(155, 209, 61, 0.1)",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
});
