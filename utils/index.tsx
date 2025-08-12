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


  export enum StatusCadastro {
    DIVERGENTE = 'divergente',
    RECUSADO = 'recusado',
    APROVADO = 'aprovado',
    REANALISE = 'reanalise',
    PRE_APROVADO = 'pre-aprovado',
    ANALISE = 'analise',
  }

export enum Etapas {
  INICIO = 'Inicio',
  INICIO_BIRTH = 'inicio',
  REGISTRANDO_COMPROVANTE_ENDERECO = 'registrando_comprovante_endereco',
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
  ASSISTINDO_VIDEO = 'assistindo_video',
  FINALIZADO = 'Finalizado',
  MOTORISTA_REGISTRANDO_FRENTE_CNH = 'registrando_frente_cnh',
  MOTORISTA_REGISTRANDO_VERSO_CNH = 'registrando_verso_cnh',
  MOTORISTA_REGISTRANDO_PLACA_VEICULO = 'registrando_placa_veiculo',
  MOTORISTA_REGISTRANDO_DOCUMENTO_VEICULO = 'registrando_documento_veiculo',
  MOTORISTA_REGISTRANDO_FOTO_VEICULO = 'registrando_foto_veiculo',
  MOTORISTA_REGISTRANDO_DOCUMENTO_PROPRIETARIO = 'registrando_documento_proprietario',
  MOTORISTA_REGISTRANDO_PRINT_ADICIONAL = 'registrando_print_adicional',
  MOTORISTA_REGISTRANDO_COMPROVANTE_GANHOS = 'registrando_comprovante_ganhos',
  APP_ANALISE = 'analise'
}


const routeMap: Record<Etapas, string> = {
  [Etapas.INICIO]: "/(register)/birthday_screen",
  [Etapas.INICIO_BIRTH]: "/(register)/birthday_screen",
  [Etapas.REGISTRANDO_COMPROVANTE_ENDERECO]: "/(register)/address_document",
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
  [Etapas.MOTORISTA_REGISTRANDO_FRENTE_CNH]: "/(motorista)/cnh_front_screen",
  [Etapas.MOTORISTA_REGISTRANDO_VERSO_CNH]: "/(motorista)/cnh_verso_screen",
  [Etapas.MOTORISTA_REGISTRANDO_PLACA_VEICULO]: "/(motorista)/placa_veiculo_screen",
  [Etapas.MOTORISTA_REGISTRANDO_DOCUMENTO_VEICULO]: "/(motorista)/document_veiculo_screen",
  [Etapas.MOTORISTA_REGISTRANDO_FOTO_VEICULO]: "/(motorista)/vehicle_photo_screen",
  [Etapas.MOTORISTA_REGISTRANDO_DOCUMENTO_PROPRIETARIO]: "/(motorista)/profile_photo_screen",
  [Etapas.MOTORISTA_REGISTRANDO_COMPROVANTE_GANHOS]: "/(motorista)/comprovante_ganhos_screen",
  [Etapas.MOTORISTA_REGISTRANDO_PRINT_ADICIONAL]: "/(motorista)/additional_print_screen",
  [Etapas.ASSISTINDO_VIDEO]: "/(app)/video_screen",
  [Etapas.APP_ANALISE]: "/(app)/home",

  [Etapas.FINALIZADO]: "/login",

};

export function getRouteByEtapa(etapa: Etapas): string | undefined {
  return routeMap[etapa];
}