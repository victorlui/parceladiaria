import ButtonChat from "@/components/ui/ButtonChat";
import { useState } from "react";
import AffiliateCode from "./AffiliateCode";
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
import { useRegisterHooks } from "./hooks/useRegisterHooks";
import LayoutRegister from "./layouts/layout-register";
import { getSteps } from "./utils/steps";

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
    handleNextStepAffiliateCode,
    handlePrevStep,
    isLoading,
  } = useRegisterHooks();

  const [confirmAddress, setConfirmAddress] = useState(false);

  const steps = getSteps({
    hasConfirmAddress: confirmAddress,
  });

  const currentStep = steps[step] ?? steps[0];
  return (
    <>
      <LayoutRegister
        title={currentStep.title ?? "Olá! Vamos começar."}
        subtitle={
          currentStep.subtitle ??
          "Para iniciar seu cadastro, informe seu CPF e data de nascimento."
        }
        showBackButton={step > 0}
        onBack={handlePrevStep}
      >
        {/* Gravando cpf e data de nascimento  */}
        {step === 0 && (
          <Step1Component onNext={handleNextStep1} isLoading={isLoading} />
        )}

        {/* Gravando senha   */}
        {step === 1 && (
          <Step2Component onNext={handleNextStep2} isLoading={isLoading} />
        )}

        {/* Gravando telefone e registrando no sistema   */}
        {step === 2 && (
          <Step3Component onNext={handleNextStep3} isLoading={isLoading} />
        )}

        {/** Comerciante gravando código de afiliado */}
        {step === 3 && (
          <AffiliateCode
            onNext={handleNextStepAffiliateCode}
            isLoading={isLoading}
          />
        )}

        {/* Gravando profissão  se for comerciante vai para o passo 9 se não vai para o passo 5  */}
        {step === 4 && (
          <Step4Component onNext={handleNextStep4} isLoading={isLoading} />
        )}

        {/* Gravando limite   */}
        {step === 5 && <Step5Component onNext={handleNextStep5} />}

        {/* Gravando email   */}
        {step === 6 && (
          <Step6Component onNext={handleNextStep6} isLoading={isLoading} />
        )}

        {/* Gravando pix */}
        {step === 7 && (
          <Step7Component onNext={handleNextStep7} isLoading={isLoading} />
        )}

        {/* Gravando endereço   */}
        {step === 8 && (
          <Step8Components
            onNext={handleNextStep8}
            isLoading={isLoading}
            confirmAddress={confirmAddress}
            setConfirmAddress={setConfirmAddress}
          />
        )}

        {/** Comerciante gravando cnpj */}
        {step === 9 && (
          <StepCNPJComponents
            onNext={handleNextStepCNPJ}
            isLoading={isLoading}
          />
        )}

        {/** Comerciante gravando tipo de comércio */}
        {step === 10 && (
          <StetTipoComercioComponent
            onNext={handleNextStepBussinesType}
            isLoading={isLoading}
          />
        )}
      </LayoutRegister>
      {step > 4 && <ButtonChat />}
    </>
  );
};

export default Step1Register;
