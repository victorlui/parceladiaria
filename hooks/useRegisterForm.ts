import { addressSchema, AddressSchema } from "@/lib/address_validation";
import { emailSchema, EmailSchema } from "@/lib/email_validation";
import {
  passwordLoginSchema,
  PasswordLoginSchema,
} from "@/lib/password_validation";
import { passwordsSchema, PasswordsSchema } from "@/lib/passwords._validation";
import { phoneSchema, PhoneSchema } from "@/lib/phone_validation";
import { plateSchema, PlateSchema } from "@/lib/plate_veiicle";
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

export const usePasswordsLoginForm = () => {
  return useForm<PasswordLoginSchema>({
    resolver: zodResolver(passwordLoginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      password: "Senha@123",
    },
  });
};

export const useEmailForm = () => {
  return useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
};

export const useAddressForm = () => {
  return useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
};

export const usePlateForm = () => {
  return useForm<PlateSchema>({
    resolver: zodResolver(plateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
};
