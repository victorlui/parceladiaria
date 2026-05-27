import { create } from "zustand";
import { ModalAlertType } from "../components/ModalAlert";

interface AlertState {
  visible: boolean;
  type: ModalAlertType;
  title: string;
  message: string;
  confirmText?: string;
  showAlert: (
    type: ModalAlertType,
    title: string,
    message: string,
    confirmText?: string
  ) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  type: "error",
  title: "",
  message: "",
  confirmText: "OK",
  showAlert: (type, title, message, confirmText = "OK") =>
    set({ visible: true, type, title, message, confirmText }),
  hideAlert: () => set({ visible: false }),
}));
