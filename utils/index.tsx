import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AxiosError } from "axios";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import * as Crypto from "expo-crypto";
import { uuid } from "zod";

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
        "Precisamos de permissão para acessar câmera e fotos."
      );
      return false;
    }
  }
  return true;
}

export async function generateSignature(
  uuid: string,
  secret: string,
  timestamp: string
) {
  const payload = `${uuid}${timestamp}${secret}`;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload
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
}

export enum Etapas {
  INICIO = "Inicio",
  INICIO_BIRTH = "inicio",
  ASSISTINDO_VIDEO = "assistindo_video",
  FINALIZADO = "Finalizado",
  APP_ANALISE = "analise",
  REGISTRANDO_COMPROVANTE_ENDERECO = "registrando_comprovante_endereco",
  REGISTRANDO_PROFISSAO = "registrando_profissao",
  REGISTRANDO_EMAIL = "registrando_email",
  REGISTRANDO_ENDERECO = "registrando_endereco",
  REGISTRANDO_PIX = "registrando_pix",
  INFORMANDO_PIX = "Informando PIX",

  REGISTRANDO_TIMELESS_FACE = "Reconhecimento facial",

  // motorista carro ou moto
  MOTORISTA_REGISTRANDO_FRENTE_CNH = "Enviando frente documento CNH",
  MOTORISTA_REGISTRANDO_VERSO_CNH = "Enviando verso CNH",
  MOTORISTA_REGISTRANDO_VIDEO_PERFIL = "Enviando video perfil",

  //comerciante
  COMERCIANTE_INFORMANDO_SE_POSSUI_EMPRESA = "Informando se possui empresa",
  COMERCIANTE_ENVIANDO_TIPO_COMERCIO = "Enviando tipo de comercio",
  COMERCIANTE_ENVIANDO_VIDEO_FACHADA = "Enviando video fachada",
  COMERCIANTE_ENVIANDO_VIDEO_INTERIOR = "Enviando video interior",
  COMERCIANTE_ENVIANDO_FRONT_DOCUMENTO_PESSOAL = "Enviando frente documento pessoal",
  COMERCIANTE_ENVIANDO_VERSO_DOCUMENTO_PESSOAL = "Enviando verso documento pessoal",
}

const routeMap: Record<Etapas, string> = {
  [Etapas.INICIO]: "/(register_new)/register-email",
  [Etapas.INICIO_BIRTH]: "/(register)/birthday_screen",
  [Etapas.REGISTRANDO_COMPROVANTE_ENDERECO]: "/(register)/address_document",
  [Etapas.REGISTRANDO_PROFISSAO]: "/(register)/profile_selection",
  [Etapas.REGISTRANDO_EMAIL]: "/(register)/email_screen",
  [Etapas.REGISTRANDO_ENDERECO]: "/(register)/address_screen",
  [Etapas.REGISTRANDO_PIX]: "/(register)/chave_pix",
  [Etapas.INFORMANDO_PIX]: "/(register)/chave_pix",

  [Etapas.REGISTRANDO_TIMELESS_FACE]: "/(register_new)/timeless_face",

  // motorista carro ou moto
  [Etapas.MOTORISTA_REGISTRANDO_FRENTE_CNH]: "/(motorista_new)/cnh_front",
  [Etapas.MOTORISTA_REGISTRANDO_VERSO_CNH]: "/(motorista_new)/cnh_verso",
  [Etapas.MOTORISTA_REGISTRANDO_VIDEO_PERFIL]: "/(motorista_new)/video_perfil",

  //comerciante
  [Etapas.COMERCIANTE_INFORMANDO_SE_POSSUI_EMPRESA]:
    "/(comerciante)/has_company_screen",
  [Etapas.COMERCIANTE_ENVIANDO_TIPO_COMERCIO]:
    "/(comerciante)/bussines_type_screen",
  [Etapas.COMERCIANTE_ENVIANDO_VIDEO_FACHADA]:
    "/(comerciante)/storefront_video_screen",
  [Etapas.COMERCIANTE_ENVIANDO_VIDEO_INTERIOR]:
    "/(comerciante)/storeinterior_video_screen",
  [Etapas.COMERCIANTE_ENVIANDO_FRONT_DOCUMENTO_PESSOAL]:
    "/(comerciante)/document_photo_front_screen",
  [Etapas.COMERCIANTE_ENVIANDO_VERSO_DOCUMENTO_PESSOAL]:
    "/(comerciante)/document_photo_back_screen",

  [Etapas.ASSISTINDO_VIDEO]: "/(app)/video_screen",
  [Etapas.APP_ANALISE]: "/(app)/home",

  [Etapas.FINALIZADO]: "/login",
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
  return new Date()
    .toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    .replace(
      /(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)\s(AM|PM)/,
      (_, month, day, year, hours, minutes, seconds, period) => {
        const h = period === "PM" ? parseInt(hours) + 12 : parseInt(hours);
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${h.toString().padStart(2, "0")}:${minutes}:${seconds}-03:00`;
      }
    );
}
