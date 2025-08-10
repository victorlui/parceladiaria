import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { BackHandler } from "react-native";

export function useDisableBackHandler() {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true; // true = bloqueia a ação padrão
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => subscription.remove();
    }, [])
  );
}
