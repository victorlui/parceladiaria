import { addressSchema, AddressSchema } from "@/lib/address_validation";
import { emailSchema, EmailSchema } from "@/lib/email_validation";
import { passwordsSchema, PasswordsSchema } from "@/lib/passwords._validation";
import { phoneSchema, PhoneSchema } from "@/lib/phone_validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const usePhoneForm = () => {
  return useForm<PhoneSchema>({
    resolver: zodResolver(phoneSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
};

export const usePasswordsForm = () => {
  return useForm<PasswordsSchema>({
    resolver: zodResolver(passwordsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
};

export const useEmailForm = () => {
  return useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
    mode: "onSubmit", // só valida no submit
    reValidateMode: "onChange", // ou "onBlur" se quiser validar ao sair do campo
  });
};

export const useAddressForm = () => {
  return useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    mode: "onSubmit", // só valida no submit
    reValidateMode: "onChange", // ou "onBlur" se quiser validar ao sair do campo
  });
};
