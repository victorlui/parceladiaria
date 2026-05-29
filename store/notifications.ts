import { create } from "zustand";

type NotificationState = {
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
  pendingRoute: string | null;
  setPendingRoute: (route: string | null) => void;
};

export const useNotificationsStore = create<NotificationState>((set) => ({
  pushToken: null,
  setPushToken: (token) => set({ pushToken: token }),
  pendingRoute: null,
  setPendingRoute: (route) => set({ pendingRoute: route }),
}));
