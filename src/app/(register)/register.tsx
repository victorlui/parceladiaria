import { useAuthStore } from "@/features/auth/store/useAuthStore";
import LayoutRegister from "@/features/register/components/Layout";
import Step10Component from "@/features/register/components/Step10Component";
import Step11Component from "@/features/register/components/Step11Component";
import Step12Component from "@/features/register/components/Step12Component";
import Step13Component from "@/features/register/components/Step13Component";
import Step1Component from "@/features/register/components/Step1Component";
import Step2Component from "@/features/register/components/Step2Component";
import Step3Component from "@/features/register/components/Step3Component";
import Step4Component from "@/features/register/components/Step4Component";
import Step5Component from "@/features/register/components/Step5Component";
import Step6Component from "@/features/register/components/Step6Component";
import Step7Component from "@/features/register/components/Step7Component";
import Step8Component from "@/features/register/components/Step8Component";
import Step9Component from "@/features/register/components/Step9Component";
import { useRegisterHook } from "@/features/register/hooks/useRegisterHook";
import { useRegisterStore } from "@/features/register/store/useRgisterStore";
import ButtonChat from "@/shared/components/ButtonChat";
import { getSteps } from "@/shared/utils/steps";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet } from "react-native";

export default function Register() {
  const { currentStep, nextStep, prevStep, setStep } = useRegisterStore();
  const {
    handleNextStep1,
    handleNextStep2,
    handleNextStep3,
    handleNextStep4,
    handleNextStep5,
    handleNextStep6,
    handleNextStep7,
    handleNextStep8,
    handleNextStep9,
    handleNextStep10,
    handleNextStep11,
    isLoading,
  } = useRegisterHook();
  const user = useAuthStore((state) => state.user);

  const [confirmAddress, setConfirmAddress] = useState(false);

  const steps = getSteps({
    hasConfirmAddress: confirmAddress,
  });

  const currentStepTexts = steps[currentStep - 1] ?? steps[0];

  return (
    <>
      <LayoutRegister
        title={currentStepTexts.title ?? "Olá! Vamos começar."}
        subtitle={
          currentStepTexts.subtitle ??
          "Para iniciar seu cadastro, informe seu CPF e data de nascimento."
        }
        showBackButton={currentStep >= 1}
        onBack={() => {
          console.log("user", user);
          if (currentStep === 1 || currentStep === 3) {
            router.back();
            return;
          }

          if (currentStep === 8) {
            setStep(5);
            return;
          }

          if (currentStep === 13) {
            setStep(11);
            return;
          }

          prevStep();
        }}
      >
        {currentStep === 1 && (
          <Step1Component onNext={handleNextStep1} isLoading={isLoading} />
        )}
        {currentStep === 2 && (
          <Step2Component onNext={handleNextStep2} isLoading={isLoading} />
        )}
        {currentStep === 3 && (
          <Step3Component onNext={handleNextStep3} isLoading={isLoading} />
        )}
        {currentStep === 4 && (
          <Step4Component onNext={handleNextStep4} isLoading={isLoading} />
        )}

        {currentStep === 5 && (
          <Step5Component onNext={handleNextStep5} isLoading={isLoading} />
        )}
        {currentStep === 6 && (
          <Step6Component onNext={handleNextStep6} isLoading={isLoading} />
        )}
        {currentStep === 7 && (
          <Step7Component onNext={handleNextStep7} isLoading={isLoading} />
        )}
        {currentStep === 8 && <Step8Component />}

        {currentStep === 9 && (
          <Step9Component onNext={handleNextStep8} isLoading={isLoading} />
        )}

        {currentStep === 10 && (
          <Step10Component onNext={handleNextStep9} isLoading={isLoading} />
        )}
        {currentStep === 11 && (
          <Step11Component
            onNext={handleNextStep10}
            isLoading={isLoading}
            confirmAddress={confirmAddress}
            setConfirmAddress={setConfirmAddress}
          />
        )}
        {currentStep === 12 && (
          <Step12Component onNext={handleNextStep11} isLoading={isLoading} />
        )}

        {currentStep === 13 && <Step13Component />}
      </LayoutRegister>
      {currentStep > 5 && <ButtonChat />}
    </>
  );
}

const styles = StyleSheet.create({});
