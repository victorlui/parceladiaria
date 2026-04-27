import InfoBalance from "@/components/ui/InfoBalance";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

interface HeaderInfoProps {
  loading: boolean;
  skeletonOpacity: number;
  user: any | null;
}
const COLORS = {
  GRADIENT_START: "#209c91",
  GRADIENT_END: "#28a999",
};

const HeaderInfo = ({ loading, skeletonOpacity, user }: HeaderInfoProps) => {
  return (
    <LinearGradient
      colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {loading ? (
        <Animated.View style={{ opacity: skeletonOpacity }}>
          <View
            style={{
              height: 20,
              width: 140,
              backgroundColor: "#E5E7EB",
              borderRadius: 6,
              marginTop: 20,
            }}
          />
          <View
            style={{
              height: 36,
              width: 220,
              backgroundColor: "#E5E7EB",
              borderRadius: 6,
              marginVertical: 8,
            }}
          />
          <View
            style={{
              width: 260,
              backgroundColor: "#E5E7EB",
              borderRadius: 6,
            }}
          />
        </Animated.View>
      ) : (
        <InfoBalance user={user || null} />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    paddingHorizontal: 15,
  },
});

export default HeaderInfo;
