import { api } from "@/services/api";
import { VideoGanhosStatusData } from "../types/videoGanhos";

const defaultStatusData: VideoGanhosStatusData = {
  feature_ativa: false,
  estado: "sem_envio",
  resultado: null,
  criterios: {
    aplicativo: null,
    nome: null,
    foto: null,
    ganhos: null,
  },
  mensagem: "",
  acao: null,
  tentativas: null,
};

export async function getVideoGanhosStatus(): Promise<VideoGanhosStatusData> {
  const response = await api.get("/v1/client/video-ganhos/status");
  const payload = response.data?.data ?? response.data ?? {};
  const criterios = payload?.criterios ?? {};
  const tentativas = payload?.tentativas;

  return {
    feature_ativa: Boolean(payload?.feature_ativa),
    estado: payload?.estado ?? defaultStatusData.estado,
    resultado: payload?.resultado ?? defaultStatusData.resultado,
    criterios: {
      aplicativo:
        typeof criterios?.aplicativo === "boolean"
          ? criterios.aplicativo
          : null,
      nome: typeof criterios?.nome === "boolean" ? criterios.nome : null,
      foto: typeof criterios?.foto === "boolean" ? criterios.foto : null,
      ganhos: typeof criterios?.ganhos === "boolean" ? criterios.ganhos : null,
    },
    mensagem:
      typeof payload?.mensagem === "string"
        ? payload.mensagem
        : defaultStatusData.mensagem,
    acao: payload?.acao ?? defaultStatusData.acao,
    tentativas:
      tentativas &&
      typeof tentativas?.usadas === "number" &&
      typeof tentativas?.max === "number"
        ? {
            usadas: tentativas.usadas,
            max: tentativas.max,
          }
        : null,
  };
}
