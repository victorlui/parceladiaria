import api from "@/services/api";
import { getLoans } from "@/services/loans";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { IndicationResponse, Indications } from "../types/indications";

export function useIndicationHook() {
  const [indications, setIndications] = useState<IndicationResponse | null>(
    null,
  );
  const [termos, setTermos] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<boolean>(false);
  const [loadingTermo, setLoadingTermo] = useState<boolean>(false);
  const [loadingAccept, setLoadingAccept] = useState<boolean>(false);
  const [foiIndicado, setFoiIndicado] = useState<boolean | null>(null);
  const [totalLoans, setTotalLoans] = useState<number>(0);
  const [loadingLoans, setLoadingLoans] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      getIndications();
      getTotalLoans();
    }, []),
  );

  const newIndications = useMemo(() => indications?.data, [indications]);

  async function getIndications() {
    setLoadingTermo(true);
    try {
      const response = await api.get("/v1/affiliate");
      const data = response.data?.data;
      const hasFoiIndicado =
        !!data && Object.prototype.hasOwnProperty.call(data, "foi_indicado");

      if (hasFoiIndicado) {
        setFoiIndicado(Boolean(data?.foi_indicado));
        setIndications(null);
        setTermos(null);
        return;
      }

      setFoiIndicado(null);
      setIndications((prev) => {
        const prevPixKey = prev?.data?.pix_key;
        const next = response.data as IndicationResponse;
        const nextData = next?.data;

        if (!nextData) return next;
        if (!prevPixKey) return next;
        if (nextData.pix_key === prevPixKey) return next;

        return {
          ...next,
          data: {
            ...nextData,
            pix_key: prevPixKey,
          },
        };
      });

      if (data?.termos_aceitos === false) {
        await getTermos();
        return;
      }

      setTermos(null);
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoadingTermo(false);
    }
  }

  async function getTotalLoans() {
    setLoadingLoans(true);
    try {
      const loans = await getLoans();
      setTotalLoans(Array.isArray(loans) ? loans.length : 0);
    } catch (error) {
      console.log("error", error);
      setTotalLoans(0);
    } finally {
      setLoadingLoans(false);
    }
  }

  async function getTermos() {
    try {
      const response = await api.get("/termos/Termos_afiliado");
      setTermos(response.data.termo.content);
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoadingTermo(false);
    }
  }

  const toggleAccepted = useCallback(() => {
    setAccepted((prev) => !prev);
  }, []);

  async function acceptTermos() {
    if (!accepted) {
      return;
    }

    setLoadingAccept(true);
    try {
      await api.post("/v1/affiliate/accept-terms");
      setAccepted(false);
      setTermos(null);
      await getIndications();
    } catch (error) {
      console.log("error ao aceitar termos", error);
    } finally {
      setLoadingAccept(false);
    }
  }

  const changePixKey = useCallback((key: string) => {
    setIndications((prev) => {
      if (!prev) return prev;

      const currentData: Indications = prev.data ?? ({} as Indications);

      return {
        ...prev,
        data: {
          ...currentData,
          pix_key: key,
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

  return {
    indications,
    termos,
    accepted,
    loadingTermo,
    loadingAccept,
    loadingLoans,
    newIndications,
    foiIndicado,
    totalLoans,
    toggleAccepted,
    acceptTermos,
    changePixKey,
    updateSaqueAtual,
    updateTotalLoans,
  };
}
