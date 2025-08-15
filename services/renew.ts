import api from "./api";

export async function renewStatus() {
  try {
    const response = await api.get("v1/renew/rules");
    return response;
  } catch (error) {
    throw error;
  }
}

export type PropsListRenew = {
  debt: number;
  discount_iof: string;
  discount_tic: string;
  id: number;
  installments: number;
  loan_value: string;
  paidAmount: number;
  qtyPaid: number;
  qtyUnpaid: number;
  tax: string;
  tax_iof: string;
  tax_tic: string;
  to_receive: string;
  unpaidAmount: number;
};

export async function renewList(): Promise<PropsListRenew[]> {
  try {
    const response = await api.get("/v1/renew");

    return response.data.data;
  } catch (error) {
    throw error;
  }
}
