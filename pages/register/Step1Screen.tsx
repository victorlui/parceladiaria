import { useRegisterHooks } from "./hooks/useRegisterHooks";
import { useState } from "react";
import { getSteps } from "./utils/steps";
import LayoutRegister from "@/layouts/layout-register";
import Step1Component from "./components/Step1Component";
import Step2Component from "./components/Step2Component";
import Step3Component from "./components/Step3Component";
import Step4Component from "./components/Step4Component";
import Step5Component from "./components/Step5Component";
import Step6Component from "./components/Step6Component";
import Step7Component from "./components/Step7Component";
import Step8Components from "./components/Step8Components";
import StepCNPJComponents from "./components/StepCNPJComponent";
import StetTipoComercioComponent from "./components/StetTipoComercioComponent";

const Step1Register: React.FC = () => {
  const {
    step,
    handleNextStep1,
    handleNextStep2,
    handleNextStep3,
    handleNextStep4,
    handleNextStep5,
    handleNextStep6,
    handleNextStep7,
    handleNextStep8,
    handleNextStepCNPJ,
    handleNextStepBussinesType,
    isLoading,
  } = useRegisterHooks();

  const [confirmAddress, setConfirmAddress] = useState(false);

  const steps = getSteps({
    hasConfirmAddress: confirmAddress,
  });

  const currentStep = steps[step];
  return (
    <LayoutRegister
      title={currentStep.title ?? "Olá! Vamos começar."}
      subtitle={
        currentStep.subtitle ??
        "Para iniciar seu cadastro, informe seu CPF e data de nascimento."
      }
    >
      {step === 0 && (
        <Step1Component onNext={handleNextStep1} isLoading={isLoading} />
      )}

      {step === 1 && (
        <Step2Component onNext={handleNextStep2} isLoading={isLoading} />
      )}

      {step === 2 && (
        <Step3Component onNext={handleNextStep3} isLoading={isLoading} />
      )}

      {step === 3 && (
        <Step4Component onNext={handleNextStep4} isLoading={isLoading} />
      )}

      {step === 4 && <Step5Component onNext={handleNextStep5} />}

      {step === 5 && (
        <Step6Component onNext={handleNextStep6} isLoading={isLoading} />
      )}

      {step === 6 && (
        <Step7Component onNext={handleNextStep7} isLoading={isLoading} />
      )}

      {step === 7 && (
        <Step8Components
          onNext={handleNextStep8}
          isLoading={isLoading}
          confirmAddress={confirmAddress}
          setConfirmAddress={setConfirmAddress}
        />
      )}

      {/** Comerciante gravando cnpj */}
      {step === 8 && (
        <StepCNPJComponents onNext={handleNextStepCNPJ} isLoading={isLoading} />
      )}

      {/** Comerciante gravando tipo de comércio */}
      {step === 9 && (
        <StetTipoComercioComponent
          onNext={handleNextStepBussinesType}
          isLoading={isLoading}
        />
      )}
    </LayoutRegister>
  );
};

export default Step1Register;
