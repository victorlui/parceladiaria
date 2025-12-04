import api from "./api";
import { router } from "expo-router";
import { Alert } from "react-native";
import { QRCodeData } from "@/store/qrcode";
import { errorHandler } from "@/utils";

export type Loan = {
  id: number;
  customer: number;
  amount: string;
  date: string;
  loan_interest: string;
  due_date: string;
  frequency: string;
  installment_amount: null;
  origin: string;
};

export type Installment = {
  id: number;
  description: string;
  installment: string;
  due_date: string;
  amount: number;
  paid: string;
  data: string;
};

type ClientData = {
  type: string;
  lastLoan: Loan;
};

export type ClientInfo = {
  id: number;
  name: string;
  cpf: string;
  data: ClientData;
};

type Response = {
  success: boolean;
  data: ClientInfo;
  message: string;
};

export async function getLoanActive(): Promise<Response> {
  try {
    const { data } = await api.get("v1/client");
    return data;
  } catch (error: unknown) {
    throw error;
  }
}

export async function getLoansOpen(id: number | null) {
  try {
    const { data } = await api.get(`/v1/loan/${id}`);
    return data;
  } catch (error: unknown) {
    throw error;
  }
}

export async function getLoans(): Promise<Loan[]> {
  try {
    const response = await api.get("/v1/loan");
    return response.data.data.data;
  } catch (error: unknown) {
    throw error;
  }
}

export async function getLoanInstallments(
  loanId: number
): Promise<Installment[]> {
  try {
    const response = await api.get(`/v1/loan/${loanId}`);
    return response.data.data?.data || [];
  } catch (error: unknown) {
    throw error;
  }
}

export type PropsDataUser = {
  address: string;
  birth: null | string;
  city: string;
  cpf: string;
  email: string;
  name: string;
  neighborhood: string;
  phone: string;
  uf: string;
  zip_code: string;
};

// buscar informações do usuario
export async function getClientInfo(): Promise<PropsDataUser> {
  try {
    const response = await api.get(`/v1/client/data/info`);
    return response.data.data || {};
  } catch (error: unknown) {
    throw error;
  }
}

// trocar a senha
export async function changePassword(password: string) {
  try {
    await api.post("/v1/client/change-password", {
      password: password,
    });
    Alert.alert("Sucesso", "Senha alterada com sucesso.");
    router.back();
  } catch (error: unknown) {
    throw error;
  }
}

export type PropsQRCode = {
  bank_tax: string;
  payment: QRCodeData;
  qty: number;
  total_with_tax: number;
  totalamount: number;
};

export async function gerarQRCode(
  id: number[]
): Promise<PropsQRCode | undefined> {
  try {
    const response = await api.post("/v1/payment", {
      id: id,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

export async function getPaymentStatus(id: number) {
  try {
    const response = await api.get(`/v1/payment/${id}`);
    return response.data.data;
  } catch (error: unknown) {
    throw error;
  }
}
