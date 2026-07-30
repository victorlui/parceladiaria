import RenewStatusPanel from "@/components/renew/status-panel";
import RenewStatusSkeleton from "@/components/renew/status-skeleton";
import { renewStatus } from "@/services/renew";
import { useRenewStore } from "@/store/renew";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_SKELETON_TIME_MS = 600;

const RenewScreen: React.FC = () => {
  const { renew, setRenew } = useRenewStore();
  const isFocused = useIsFocused();
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [faqExpanded, setFaqExpanded] = useState(false);

  useEffect(() => {
    if (!isFocused) return;

    let isActive = true;

    const run = async () => {
      const startedAt = Date.now();
      setIsLoadingStatus(true);

      try {
        const response = await renewStatus();
        console.log("renewStatus", response);
        if (!isActive) return;
        setRenew(response.data.data);
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_SKELETON_TIME_MS - elapsed);

        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        if (isActive) setIsLoadingStatus(false);
      }
    };

    void run();

    return () => {
      isActive = false;
    };
  }, [isFocused, setRenew]);

  if (isLoadingStatus) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          contentInsetAdjustmentBehavior="automatic"
        >
          <RenewStatusSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!renew) {
    return null;
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="automatic"
      >
        <RenewStatusPanel
          renew={renew}
          faqExpanded={faqExpanded}
          onToggleFaq={() => setFaqExpanded((prev) => !prev)}
          onBack={() => router.back()}
          onPayPress={() => router.push("/(tabs)/payments")}
          onRenewPress={() => router.push("/renew_list")}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
});

export default RenewScreen;
