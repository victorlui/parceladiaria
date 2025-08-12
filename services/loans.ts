import { AxiosError } from "axios";
import api from "./api";
import { useAuthStore } from "@/store/auth";
import { router } from "expo-router";

type LastLoan = {
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

type ClientData = {
  type: string;
  lastLoan: LastLoan;
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
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        router.replace("/login");
      }
    }
    throw error;
  }
}

export async function getLoansOpen(id: number | null) {
  try {
    const { data } = await api.get(`/v1/loan/${id}`);
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        router.replace("/login");
      }
    }
    throw error;
  }
}

export async function getRenovacao() {
  try {
    const { data } = await api.get(`v1/renew/rules`);
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        router.replace("/login");
      }
    }
    throw error;
  }
}
