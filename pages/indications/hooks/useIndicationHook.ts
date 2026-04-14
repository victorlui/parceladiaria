import api from "@/services/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { IndicationResponse } from "../types/indications";

export function useIndicationHook() {
  const [indications, setIndications] = useState<IndicationResponse | null>(
    null,
  );
  const [termos, setTermos] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<boolean>(false);
  const [loadingTermo, setLoadingTermo] = useState<boolean>(false);
  const [loadingAccept, setLoadingAccept] = useState<boolean>(false);
  const [foiIndicado, setFoiIndicado] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      getIndications();
    }, []),
  );

  const newIndications = useMemo(() => indications?.data, [indications]);

  async function getIndications() {
    setLoadingTermo(true);
    try {
      const response = await api.get<IndicationResponse>("/v1/affiliate");
      console.log("getIndications", response.data);
      if (!response.data.data?.termos_aceitos) {
        await getTermos();
        return;
      }
      setIndications(response.data);
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoadingTermo(false);
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

    console.log("acceptTermos", accepted);
    setLoadingAccept(true);
    try {
      const response = await api.post("/v1/affiliate/accept-terms");
      console.log("aceitou termos", response.data);
    } catch (error) {
      console.log("error ao aceitar termos", error);
    } finally {
      setLoadingAccept(false);
    }
  }

  const changePixKey = (key: string) => {
    console.log("changePixKey", key);
    setIndications((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev?.data,

          pix_key: key,
        },
      } as IndicationResponse;
    });
  };

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

  return {
    indications,
    termos,
    accepted,
    loadingTermo,
    loadingAccept,
    newIndications,
    toggleAccepted,
    acceptTermos,
    changePixKey,
    updateSaqueAtual,
  };
}
