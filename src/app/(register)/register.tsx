import { useAuthStore } from "@/features/auth/store/useAuthStore";
import LayoutRegister from "@/features/register/components/Layout";
import Step1Component from "@/features/register/components/Step1Component";
import Step2Component from "@/features/register/components/Step2Component";
import Step3Component from "@/features/register/components/Step3Component";
import Step4Component from "@/features/register/components/Step4Component";
import { useRegisterHook } from "@/features/register/hooks/useRegisterHook";
import { useRegisterStore } from "@/features/register/store/useRgisterStore";
import { router } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

export default function Register() {
  const { currentStep, nextStep, prevStep } = useRegisterStore();
  const {
    handleNextStep1,
    handleNextStep2,
    handleNextStep3,
    handleNextStep4,
    isLoading,
  } = useRegisterHook();
  const user = useAuthStore((state) => state.user);

  return (
    <LayoutRegister
      title={"Olá! Vamos começar."}
      subtitle={
        "Para iniciar seu cadastro, informe seu CPF e data de nascimento."
      }
      showBackButton={currentStep >= 1}
      onBack={() => {
        console.log("user", user);
        if (currentStep === 1) {
          router.back();
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
    </LayoutRegister>
  );
}

const styles = StyleSheet.create({});
