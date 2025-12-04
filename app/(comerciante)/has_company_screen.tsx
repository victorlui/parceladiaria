import ButtonComponent from "@/components/ui/Button";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import LayoutRegister from "@/layouts/layout-register";
import { Etapas } from "@/utils";
import React from "react";

const HasACompany: React.FC = () => {
  const { mutate, isPending } = useUpdateUserMutation();

  const submit = (hasCompany: boolean) => {
    mutate({
      request: {
        tem_cnpj: hasCompany,
        etapa: Etapas.COMERCIANTE_ENVIANDO_TIPO_COMERCIO,
      },
    });
  };

  return (
    <LayoutRegister
      title="Sua empresa"
      subtitle="Você possui empresa aberta (CNPJ)?"
    >
      {isPending ? (
        <ButtonComponent
          title="Carregando..."
          iconLeft={null}
          iconRight={null}
          loading
          disabled
          onPress={() => {}}
        />
      ) : (
        <>
          <ButtonComponent
            title="Sim, tenho CNPJ"
            onPress={() => submit(true)}
            iconLeft="checkmark"
            iconRight={null}
          />
          <ButtonComponent
            title="Não, sou autônome"
            onPress={() => submit(false)}
            iconLeft="close"
            iconRight={null}
            outline
          />
        </>
      )}
    </LayoutRegister>
  );
};

export default HasACompany;
