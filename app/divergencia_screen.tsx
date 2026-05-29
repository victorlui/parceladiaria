import { useCheckStatus } from "@/hooks/useCheckStatus";
import DivergenciaScreen from "@/pages/divergencia/DivergenciaScreenn";
import { Redirect } from "expo-router";
import React from "react";

const Divergencia: React.FC = () => {
  const { redirectPath } = useCheckStatus("/divergencia_screen");

  if (redirectPath) {
    return <Redirect href={redirectPath as any} />;
  }

  return <DivergenciaScreen />;
};

export default Divergencia;
