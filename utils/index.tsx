import { useAuthStore } from "@/store/auth";
import { AxiosError } from "axios";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert, Platform } from "react-native";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDateToISO(date: Date) {
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

export async function requestPermissions() {
  if (Platform.OS !== "web") {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar câmera e fotos.",
      );
      return false;
    }
  }
  return true;
}

export async function generateSignature(
  uuid: string,
  secret: string,
  timestamp: string,
) {
  const payload = `${uuid}${timestamp}${secret}`;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload,
  );
  return hash;
}

export enum StatusCadastro {
  DIVERGENTE = "divergente",
  RECUSADO = "recusado",
  APROVADO = "aprovado",
  REANALISE = "reanalise",
  PRE_APROVADO = "pre-aprovado",
  ANALISE = "analise",
  FINALIZADO = "Finalizado",
  FINALIZADO_APP = "finalizado",
  PENDENTE = "pendente",
  PROPOSTA_EXPIRADO = "proposta-expirada",
}

export enum Etapas {
  INICIO = "Inicio",
  LIMITE = "Limite",
  CNPJ = "Registrando CNPJ",
  FINALIZADO = "Finalizado",
  FINALIZADO_APP = "finalizado",
  AFILIADO_CODE = "AFILIADO_CODE",
  APP_ANALISE = "analise",
  REGISTRANDO_PROFISSAO = "Informando Profissão",
  REGISTRANDO_EMAIL = "registrando_email",
  REGISTRANDO_ENDERECO = "registrando_endereco",
  INFORMANDO_ENDERECO = "Informando Endereço",
  REGISTRANDO_PIX = "registrando_pix",
  INFORMANDO_PIX = "Informando PIX",
  INFORMANDO_TIPO_COMERCIO = "Informando Tipo Comércio",
  REGISTRANDO_TIMELESS_FACE = "Reconhecimento facial",
  ACEITANDO_TERMOS = "Aceitando termos",

  OPEN_FINANCE = "Openfinance",
  PALENCA = "Palenca",
}

const routeMap: Record<Etapas, string> = {
  [Etapas.INICIO]: "/(register)/step1",
  [Etapas.LIMITE]: "/(register)/step1",
  [Etapas.REGISTRANDO_PROFISSAO]: "/(register)/step1",
  [Etapas.REGISTRANDO_EMAIL]: "/(register)/step1",
  [Etapas.AFILIADO_CODE]: "/(register)/step1",

  [Etapas.CNPJ]: "/(register)/step1",
  [Etapas.INFORMANDO_TIPO_COMERCIO]: "/(register)/step1",

  [Etapas.REGISTRANDO_ENDERECO]: "/(register_new)/register-address",
  [Etapas.INFORMANDO_ENDERECO]: "/(register_new)/register-address",

  [Etapas.REGISTRANDO_PIX]: "/(register)/chave_pix",
  [Etapas.INFORMANDO_PIX]: "/(register)/chave_pix",

  [Etapas.REGISTRANDO_TIMELESS_FACE]: "/face_recognition",
  [Etapas.ACEITANDO_TERMOS]: "/(register_new)/register-finish",

  [Etapas.APP_ANALISE]: "/(app)/home",

  // OpenFinance
  [Etapas.OPEN_FINANCE]: "/(register_new)/register-openfinance",
  [Etapas.PALENCA]: "/(register)/palenca",

  [Etapas.FINALIZADO]: "/login",
  [Etapas.FINALIZADO_APP]: "/login",
};

export function getRouteByEtapa(etapa: Etapas): string | undefined {
  return routeMap[etapa];
}

export function errorHandler(error: any) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      Alert.alert("Sessão expirada", "Faça login novamente.", [
        {
          text: "OK",
          onPress: () => {
            useAuthStore.getState().logout();
            router.replace("/login");
          },
        },
      ]);
    }
  }
}

export function convertData() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date());
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart("minute")}:${getPart("second")}-03:00`;
}
