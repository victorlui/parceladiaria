import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PulsingImageLoader from "../register/components/PulsingImageLoader";
import Dashboard from "./components/dashboard";
import ProgramaPausado from "./components/programa-pausado";
import RequisitosIndications from "./components/requisitos-indicacao";
import { TermosBody } from "./components/termos";
import { TermosFooter } from "./components/termos-footer";
import { useIndicationHook } from "./hooks/useIndicationHook";

const IndicationsScreen: React.FC = () => {
  const {
    indications,
    termos,
    accepted,
    loadingAccept,
    loadingTermo,
    loadingIndications,
    loadingApply,
    acceptTermos,
    getTermos,
    applyCode,
  } = useIndicationHook();

  const termosAceitos =
    indications?.data?.v3?.termos_aceitos ??
    indications?.data?.termos_aceitos ??
    false;

  const shouldShowTermsScreen =
    Boolean(indications?.data?.v3?.programa_ativo) && !termosAceitos;

  if (
    loadingIndications ||
    (shouldShowTermsScreen && loadingTermo && !termos)
  ) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text={
          loadingIndications
            ? "Caregando dados"
            : loadingTermo
              ? "Caregando termos"
              : ""
        }
      />
    );
  }

  if (shouldShowTermsScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <TermosBody termos={termos || ""} />
        <TermosFooter
          isReading={true}
          accepted={accepted}
          loadingAccept={loadingAccept}
          toggleAccepted={acceptTermos}
          acceptTermos={() => {
            acceptTermos();
          }}
        />
      </SafeAreaView>
    );
  }

  if (
    indications?.data?.v3?.programa_ativo &&
    (indications?.data?.v3?.requisitos?.parcela1_paga === false ||
      indications?.data?.v3?.requisitos?.tem_contrato === false)
  ) {
    return <RequisitosIndications />;
  }
  if (indications?.data?.v3?.programa_ativo === false) {
    return <ProgramaPausado />;
  }

  return (
    <Dashboard
      indications={indications?.data || {}}
      termos={termos}
      loadingTermo={loadingTermo}
      loadingApply={loadingApply}
      getTermos={getTermos}
      applyCode={applyCode}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
});

export default IndicationsScreen;
