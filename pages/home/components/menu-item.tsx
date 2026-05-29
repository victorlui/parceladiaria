import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CircleIcon from "../../../components/ui/CircleIcon";

type Item = {
  key: string;
  title: string;
  icon: React.ReactNode;
  badge: boolean;
  titleBadge: string;
  onPress?: () => void;
  disabled?: boolean;
};

export const MenuItem: React.FC<Item> = ({
  title,
  icon,
  badge,
  titleBadge,
  onPress,
  disabled,
}) => {
  return (
    <Animated.View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchable}
        disabled={disabled}
      >
        <View style={styles.iconContainer}>
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{titleBadge}</Text>
            </View>
          )}
          <CircleIcon
            icon={icon}
            color={disabled ? "#4B5563" : "#fff"}
            size={64}
            gradientColors={
              disabled ? ["#6b717a", "#8a919b"] : ["#2CCA6C", "#16A34A"]
            } // gradiente verde como na imagem
            gradientStart={{ x: 0.1, y: 0.1 }}
            gradientEnd={{ x: 0.9, y: 0.9 }}
          />
        </View>
        <Text style={styles.titleText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "25%",
    marginVertical: 20,
  },
  touchable: {
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
  },
  badgeContainer: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: "#dc2626",
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
  },
  titleText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
    width: 96,
  },
});
