export type VideoGanhosEstado = "processando" | "concluido" | "sem_envio";

export type VideoGanhosResultado =
  | "aprovado"
  | "aceito_envie_complementar"
  | "reprovado"
  | "em_analise"
  | "erro_leitura"
  | "video_repetido"
  | null;

export type VideoGanhosAcao =
  | "aguardar"
  | "nenhuma"
  | "enviar_video_complementar"
  | "reenviar_video"
  | null;

export type VideoGanhosCriterioValor = boolean | null;

export type VideoGanhosCriterios = {
  aplicativo: VideoGanhosCriterioValor;
  nome: VideoGanhosCriterioValor;
  foto: VideoGanhosCriterioValor;
  ganhos: VideoGanhosCriterioValor;
};

export type VideoGanhosTentativas = {
  usadas: number;
  max: number;
} | null;

export type VideoGanhosStatusData = {
  feature_ativa: boolean;
  estado: VideoGanhosEstado;
  resultado: VideoGanhosResultado;
  criterios: VideoGanhosCriterios;
  mensagem: string;
  acao: VideoGanhosAcao;
  tentativas: VideoGanhosTentativas;
};
