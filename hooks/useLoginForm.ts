import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, LoginSchema } from "../lib/validation";
import { cpfSchema, CPFSchema } from "@/lib/cpf_validation";

export const useLoginForm = () => {
  return useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });
};


export const useCPFForm = () => {
  return useForm<CPFSchema>({
    resolver: zodResolver(cpfSchema),
    mode: "onSubmit",
  });
}