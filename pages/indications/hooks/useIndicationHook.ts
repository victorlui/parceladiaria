import { useAlerts } from "@/components/useAlert";
import { api } from "@/services/api";
import { getLoans } from "@/services/loans";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { IndicationResponse, Indications } from "../types/indications";

export function useIndicationHook() {
  const { showSuccess, showError } = useAlerts();
  const [indications, setIndications] = useState<IndicationResponse | null>(
    null,
  );
  const [termos, setTermos] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<boolean>(false);
  const [loadingTermo, setLoadingTermo] = useState<boolean>(false);
  const [loadingAccept, setLoadingAccept] = useState<boolean>(false);
  const [loadingIndications, setLoadingIndications] = useState<boolean>(false);
  const [loadingLoans, setLoadingLoans] = useState<boolean>(false);
  const [loadingApply, setLoadingApply] = useState<boolean>(false);
  const [totalLoans, setTotalLoans] = useState<number>(0);

  const getTermos = useCallback(async () => {
    setLoadingTermo(true);
    try {
      const response = await api.get("/termos/Termos_afiliado");
      const content = response.data.termo.content;
      setTermos(content);
      return content;
    } catch (error) {
      return error;
    } finally {
      setLoadingTermo(false);
    }
  }, []);

  const getIndications = useCallback(async () => {
    setLoadingIndications(true);
    try {
      const { data } = await api.get("/v1/affiliate");
      setIndications(data);
      const termosAceitos =
        data?.data?.v3?.termos_aceitos ?? data?.data?.termos_aceitos ?? false;

      if (data?.data?.v3?.programa_ativo && !termosAceitos) {
        await getTermos();
      }
    } catch {
      return;
    } finally {
      setLoadingIndications(false);
    }
  }, [getTermos]);

  const getTotalLoans = useCallback(async () => {
    setLoadingLoans(true);
    try {
      const loans = await getLoans();
      setTotalLoans(Array.isArray(loans) ? loans.length : 0);
    } catch {
      setTotalLoans(0);
    } finally {
      setLoadingLoans(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void getIndications();
      void getTotalLoans();
    }, [getIndications, getTotalLoans]),
  );

  const newIndications = useMemo(() => indications?.data, [indications]);

  const toggleAccepted = useCallback(() => {
    setAccepted((prev) => !prev);
  }, []);

  const clearTermos = useCallback(() => {
    setTermos(null);
    setAccepted(false);
  }, []);

  const acceptTermos = useCallback(async () => {
    setLoadingAccept(true);
    try {
      await api.post("/v1/affiliate/accept-terms");
      await getIndications();
    } catch (error) {
      return error;
    } finally {
      setLoadingAccept(false);
    }
  }, [getIndications]);

  const changePixKey = useCallback((key: string) => {
    setIndications((prev) => {
      if (!prev) return prev;

      const currentData: Indications = prev.data ?? ({} as Indications);

      return {
        ...prev,
        data: {
          ...currentData,
          pix_key: key,
          pixKey: key,
        },
      };
    });
  }, []);

  const updateSaqueAtual = useCallback(
    (status: string, valorSacado: number) => {
      setIndications((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            saque_atual: {
              status,
              valor: String(valorSacado),
              erro: null,
            },
          },
        } as IndicationResponse;
      });
    },
    [],
  );

  const updateTotalLoans = useCallback((total: number) => {
    setTotalLoans(total);
  }, []);

  async function applyCode(code: string) {
    setLoadingApply(true);
    try {
      await api.post("/v1/affiliate/apply-code", {
        codigo: code,
      });
      setLoadingApply(false);
      showSuccess("Sucesso", "Código aplicado com sucesso");
      setIndications((prev) =>
        prev
          ? {
              ...prev,
              data: {
                ...prev.data,
                codigo_disponivel: true,
                foi_indicado: true,
              },
            }
          : prev,
      );
    } catch (error: any) {
      showError(
        "Atenção",
        error.response?.data?.message ?? "Erro ao aplicar código",
      );
    } finally {
      setLoadingApply(false);
    }
  }

  return {
    indications,
    termos,
    accepted,
    loadingTermo,
    loadingAccept,
    loadingLoans,
    loadingIndications,
    loadingApply,
    newIndications,
    totalLoans,
    toggleAccepted,
    acceptTermos,
    changePixKey,
    updateSaqueAtual,
    updateTotalLoans,
    getTermos,
    clearTermos,
    applyCode,
  };
}
