import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";


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

export async function requestPermissions () {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar câmera e fotos."
        );
        return false;
      }
    }
    return true;
  };


export enum Etapas {
  REGISTRANDO_PROFISSAO = 'registrando_profissao',
  REGISTRANDO_EMAIL = 'registrando_email',
  REGISTRANDO_ENDERECO = 'registrando_endereco',
  REGISTRANDO_PIX = 'registrando_pix',
  REGISTRANDO_FRENTE_DOCUMENTO_COMERCIO = 'registrando_frente_documento_comercio',
  REGISTRANDO_VERSO_DOCUMENTO_COMERCIO = 'registrando_verso_documento_comercio',
  REGISTRANDO_TIPO_COMERCIO = 'registrando_tipo_comercio',
  REGISTRANDO_EMPRESA_ABERTA = 'registrando_empresa_aberta',
  REGISTRANDO_TEM_COMERCIO = 'registrando_tem_comercio',
  REGISTRANDO_CONTRATO_SOCIAL = 'registrando_contrato_social',
  REGISTRANDO_FRENTE_COMERCIO = 'registrando_frente_comercio',
  REGISTRANDO_INTERIOR_COMERCIO = 'registrando_interior_comercio',
  REGISTRANDO_VIDEO_COMERCIO = 'registrando_video_comercio',
  FINALIZADO = 'finalizado',
}


const routeMap: Record<Etapas, string> = {
  [Etapas.REGISTRANDO_PROFISSAO]: "/(register)/profile_selection",
  [Etapas.REGISTRANDO_EMAIL]: "/(register)/email_screen",
  [Etapas.REGISTRANDO_ENDERECO]: "/(register)/address_screen",
  [Etapas.REGISTRANDO_PIX]: "/(register)/chave_pix",
  [Etapas.REGISTRANDO_FRENTE_DOCUMENTO_COMERCIO]: "/(comerciante)/document_photo_front_screen",
  [Etapas.REGISTRANDO_VERSO_DOCUMENTO_COMERCIO]: "/(comerciante)/document_photo_back_screen",
  [Etapas.REGISTRANDO_TIPO_COMERCIO]: "/(comerciante)/bussines_type_screen",
  [Etapas.REGISTRANDO_EMPRESA_ABERTA]: "/(comerciante)/bussines_description_screen",
  [Etapas.REGISTRANDO_TEM_COMERCIO]: "/(comerciante)/has_company_screen",
  [Etapas.REGISTRANDO_CONTRATO_SOCIAL]: "/(comerciante)/contract_social_screen",
  [Etapas.REGISTRANDO_FRENTE_COMERCIO]: "/(comerciante)/storefront_photo_screen",
  [Etapas.REGISTRANDO_INTERIOR_COMERCIO]: "/(comerciante)/storeinterior_photo_screen",
  [Etapas.REGISTRANDO_VIDEO_COMERCIO]: "/(comerciante)/storevideo_photo_screen",
  [Etapas.FINALIZADO]: "/login",

};

export function getRouteByEtapa(etapa: Etapas): string | undefined {
  return routeMap[etapa];
}