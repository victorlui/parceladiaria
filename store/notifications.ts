import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type NotificationState = {
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
  pendingRoute: string | null;
  setPendingRoute: (route: string | null) => void;
};

export const useNotificationsStore = create<NotificationState>()(
  persist(
    (set) => ({
      pushToken: null,
      setPushToken: (token) => set({ pushToken: token }),
      pendingRoute: null,
      setPendingRoute: (route) => set({ pendingRoute: route }),
    }),
    {
      name: "notifications_storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pushToken: state.pushToken,
      }),
    },
  ),
);
