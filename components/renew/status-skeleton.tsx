import React from "react";
import { Animated, StyleSheet, View } from "react-native";

const SkeletonBlock = ({
  height,
  width,
  radius = 8,
}: {
  height: number;
  width: number | `${number}%`;
  radius?: number;
}) => (
  <View
    style={[
      styles.block,
      {
        height,
        width,
        borderRadius: radius,
      },
    ]}
  />
);

const RenewStatusSkeleton: React.FC = () => {
  const opacity = React.useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.backRow}>
        <SkeletonBlock height={18} width={90} radius={9} />
      </View>

      <View style={styles.heroCard}>
        <SkeletonBlock height={12} width={110} radius={6} />
        <View style={styles.heroGap} />
        <SkeletonBlock height={28} width="62%" radius={8} />
        <View style={styles.smallGap} />
        <SkeletonBlock height={16} width="88%" radius={8} />
        <View style={styles.smallGap} />
        <SkeletonBlock height={16} width="72%" radius={8} />
        <View style={styles.heroGap} />
        <View style={styles.dateCard}>
          <SkeletonBlock height={36} width={36} radius={18} />
          <View style={styles.dateText}>
            <SkeletonBlock height={10} width={120} radius={5} />
            <View style={styles.smallGap} />
            <SkeletonBlock height={22} width={110} radius={7} />
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <SkeletonBlock height={12} width={150} radius={6} />
        <View style={styles.sectionGap} />

        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index}>
            <View style={styles.itemRow}>
              <SkeletonBlock height={28} width={28} radius={14} />
              <View style={styles.itemText}>
                <SkeletonBlock height={16} width="74%" radius={8} />
                <View style={styles.smallGap} />
                <SkeletonBlock height={14} width="52%" radius={7} />
              </View>
            </View>

            {index < 2 ? <View style={styles.divider} /> : null}
          </View>
        ))}

        <View style={styles.warningBox}>
          <SkeletonBlock height={18} width={18} radius={9} />
          <View style={styles.itemText}>
            <SkeletonBlock height={14} width="90%" radius={7} />
            <View style={styles.smallGap} />
            <SkeletonBlock height={14} width="78%" radius={7} />
          </View>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <SkeletonBlock height={56} width="100%" radius={10} />

        <View style={styles.faqCard}>
          <View style={styles.itemRow}>
            <SkeletonBlock height={22} width={22} radius={11} />
            <View style={styles.itemText}>
              <SkeletonBlock height={16} width="82%" radius={8} />
            </View>
            <SkeletonBlock height={18} width={18} radius={9} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  block: {
    backgroundColor: "#E5E7EB",
  },
  backRow: {
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: "#DDE4E7",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 14,
  },
  heroGap: {
    height: 14,
  },
  smallGap: {
    height: 8,
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.45)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionGap: {
    height: 18,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  itemText: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  warningBox: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    padding: 12,
  },
  actionsSection: {
    marginTop: 18,
    gap: 16,
  },
  faqCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});

export default RenewStatusSkeleton;
