import React from "react";
import ModalAlert from "./ModalAlert";
import { useAlertStore } from "../store/useAlertStore";

export default function GlobalAlert() {
  const { visible, type, title, message, confirmText, hideAlert } =
    useAlertStore();

  return (
    <ModalAlert
      visible={visible}
      type={type}
      title={title}
      message={message}
      confirmText={confirmText}
      onClose={hideAlert}
    />
  );
}
