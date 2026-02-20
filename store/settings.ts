import { create } from "zustand";

interface SettingsProps {
  openfinance: {
    comerciante: {
      connect: boolean;
      eco: boolean;
    };
    motorista: {
      connect: boolean;
      eco: boolean;
    };
  };
}

interface SettingsState {
  openfinance: SettingsProps | null;
  setOpenfinance: (openfinance: SettingsProps) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  openfinance: null,
  setOpenfinance: (openfinance: SettingsProps) => set({ openfinance }),
}));
