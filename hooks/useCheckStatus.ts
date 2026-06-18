import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useCheckStatus(currentRoute: string) {
  const [isChecking, setIsChecking] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setRedirectPath(null);

      const checkStatus = async () => {
        setIsChecking(true);
        try {
          const response = await api.get("/v1/client");
          const dataClient =
            response.data?.data?.data || response.data?.data || response.data;

          if (dataClient?.type === "client") {
            const infoResponse = await api.get("/v1/client/data/info");
            const userData = infoResponse.data.data;
            const user = {
              nome: userData.name,
              email: userData.email,
              cpf: userData.cpf,
              cidade: userData.city,
              bairro: userData.neighborhood,
              status: userData.status,
              estado: userData.uf,
              endereco: userData.address,
              msg_painel: userData.msg_painel,
              msg_status: userData.msg_status,
              lastLoan: dataClient?.lastLoan,
              zip_code: userData.zip_code,
              phone: userData.phone,
              pix: userData.chave_pix ?? "",
              status_doc: userData.status_doc,
              isLoggedIn: true,
              observacoes: userData.observacoes,
              email_verificado: userData.email_verificado,
              phone_verificado: userData.phone_verificado,
            };
            const token = useRegisterStore.getState().token || "";
            await useAuthStore.getState().login(token, user);

            if (isActive) {
              setRedirectPath("/(tabs)/home");
            }
          } else {
            const status = dataClient?.status;

            useRegisterStore.getState().setData({
              ...useRegisterStore.getState().data,
              ...dataClient,
              primeira_analise:
                response.data?.data?.data?.primeira_analise ?? 0,
            });

            const routeByStatus: Record<string, any> = {
              divergente: "/divergencia_screen",
              recusado: "/recusado_screen",
              aprovado: "/pre_aprovado_screen",
              "pre-aprovado": "/pre_aprovado_screen",
              analise: "/analise_screen",
              reanalise: "/reanalise_screen",
              "proposta-expirada": "/divergencia_screen",
            };

            const targetRoute =
              status && routeByStatus[status] ? routeByStatus[status] : null;

            if (isActive && targetRoute && targetRoute !== currentRoute) {
              setRedirectPath(targetRoute);
            }
          }
        } catch (error) {
          return error;
        } finally {
          if (isActive) {
            setIsChecking(false);
          }
        }
      };

      checkStatus();

      return () => {
        isActive = false;
      };
    }, [currentRoute]),
  );

  return { isChecking, redirectPath };
}
