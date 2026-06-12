export type AcordoResponse = {
  message: string;
  success: boolean;
  data: {
    id: number;
    numero_interno: string;
    status:
      | "aguardando_entrada"
      | "aguardando_aceite"
      | "aprovado"
      | "firmado"
      | "anulado"; // Adicione outros status possíveis se houver
    saldo_negociado: number;
    entrada_valor: number;
    entrada_vencimento: string;
    venc_primeiro: string;
    frequencia: "semanal" | string; // Adicione outras frequências possíveis se houver
    cronograma: {
      rotulo: string;
      vencimento: string;
      valor: number;
    }[];
  };
};
