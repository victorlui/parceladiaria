import { create } from "zustand";

type ScrollToTopState = {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
};

export const useScrollToTopStore = create<ScrollToTopState>((set) => ({
  isVisible: false,
  show: () => set({ isVisible: true }),
  hide: () => set({ isVisible: false }),
}));

