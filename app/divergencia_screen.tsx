import { useCheckStatus } from "@/hooks/useCheckStatus";
import DivergenciaScreen from "@/pages/divergencia/DivergenciaScreenn";
import React from "react";

const Divergencia: React.FC = () => {
  useCheckStatus("/divergencia_screen");

  return <DivergenciaScreen />;
};

export default Divergencia;
