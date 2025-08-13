import api from "./api";
import { errorHandler } from "@/utils";

export async function renewList() {
  try {
    const response = await api.get("/v1/renew");
    console.log("res", response);
  } catch (error) {
    errorHandler(error);
    throw error;
  }
}

export async function renewStatus() {
  try {
    const response = await api.get("/v1/renew/rules");
    console.log("res rules", response);
  } catch (error) {
    errorHandler(error);
    throw error;
  }
}
