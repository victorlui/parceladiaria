export const EVENTS = {
  LOGIN: "login",
  LOGOUT: "logout",

  SCREEN_VIEW: "visualizacao_tela",
  MODAL_OPENED: "modal_aberto",
  MODAL_CLOSED: "modal_fechado",
  TERMS_ACCEPTED: "termos_finais_aceitos",

  DOCUMENT_SENT: "documento_enviado",
  SELFIE_SENT: "selfie_enviada",

  OFFER_CREATED: "oferta_criada",

  API_ERROR: "erro_api",
  APP_ERROR: "erro_aplicacao",
  ALERT_SHOWN: "alerta_exibido",
} as const;

export const ANALYTICS_SOURCES = {
  API_INTERCEPTOR: "interceptador_api",
  API_INTERCEPTOR_ALERT: "alerta_interceptador_api",
  APP_OPEN: "abertura_aplicativo",
  AUTHENTICATED_USER: "usuario_autenticado",
  GLOBAL_ERROR_HANDLER: "tratador_global_erros",
  LOGOUT_RESET: "reset_logout",
  MODAL_TRACKING: "rastreamento_modal",
} as const;

export const API_ALERT_TYPES = {
  SESSION_EXPIRED: "sessao_expirada",
  SERVER_ERROR: "erro_servidor",
  TIMEOUT: "tempo_limite",
  CONNECTION_ERROR: "erro_conexao",
  BLOCKED: "bloqueado",
  FORBIDDEN: "proibido",
  RATE_LIMIT: "limite_requisicoes",
} as const;

export const LOGIN_ANALYTICS_SOURCES = {
  CHECK_CPF: "login_verificar_cpf",
  SUBMIT_PASSWORD: "login_enviar_senha",
  LOAD_INCOMPLETE_REGISTRATION: "login_carregar_cadastro_incompleto",
  LOAD_CLIENT_INFO: "login_carregar_dados_cliente",
} as const;

export const VERIFICATION_ANALYTICS_SOURCES = {
  CONFIRM_OTP: "verificacao_confirmar_otp",
  RESEND_SMS: "verificacao_reenviar_sms",
  RESEND_EMAIL: "verificacao_reenviar_email",
  COMPLETE_LOGIN: "verificacao_concluir_login",
  LOAD_INCOMPLETE_REGISTRATION: "verificacao_carregar_cadastro_incompleto",
  LOAD_CLIENT_INFO: "verificacao_carregar_dados_cliente",
} as const;

export const REGISTER_ANALYTICS_SOURCES = {
  STEP1_SEARCH_CPF: "cadastro_passo1_buscar_cpf",
  STEP1_INFO_CPF: "cadastro_passo1_info_cpf",
  STEP3_REGISTER: "cadastro_passo3_registrar",
  STEP3_UPDATE_USER: "cadastro_passo3_atualizar_usuario",
  AFFILIATE_CODE: "cadastro_codigo_afiliado",
  STEP4_PROFESSION: "cadastro_passo4_profissao",
  STEP4_PREFETCH: "cadastro_passo4_prefetch",
  STEP_CNPJ: "cadastro_passo_cnpj",
  STEP_BUSINESS_TYPE: "cadastro_passo_tipo_negocio",
  STEP6_EMAIL: "cadastro_passo6_email",
  STEP7_PIX: "cadastro_passo7_pix",
  STEP8_ADDRESS: "cadastro_passo8_endereco",
  TERMS_LOAD: "cadastro_termos_carregar",
  TERMS_COMPLETE_UPDATE: "cadastro_termos_concluir_atualizacao",
  TERMS_COMPLETE_CLIENT: "cadastro_termos_concluir_cliente",
  TERMS_COMPLETE_CLIENT_INFO: "cadastro_termos_concluir_dados_cliente",
  OPEN_FINANCE_NEXT_STEP: "cadastro_open_finance_ir_proximo_passo",
  OPEN_FINANCE_CONNECT: "cadastro_open_finance_conectar_klavi",
  OPEN_FINANCE_CHECK_STATUS: "cadastro_open_finance_verificar_status_analise",
  OPEN_FINANCE_INITIALIZE_SETTINGS:
    "cadastro_open_finance_inicializar_configuracoes",
  OPEN_FINANCE_INITIALIZE_KLAVI_DRIVER:
    "cadastro_open_finance_inicializar_klavi_motorista",
  OPEN_FINANCE_INITIALIZE_KLAVI_BUSINESS:
    "cadastro_open_finance_inicializar_klavi_comerciante",
  REGISTER_PALENCA_INIT: "cadastro_palenca_inicializar",
} as const;

export const DIVERGENCIA_ANALYTICS_SOURCES = {
  UPLOAD_DOCUMENT: "divergencia_enviar_documento",
  SEND_OTP: "divergencia_enviar_otp",
  OPEN_FINANCE_CONNECT: "divergencia_open_finance_conectar",
  OPEN_FINANCE_CHECK_STATUS: "divergencia_open_finance_verificar_status",
  PALENCA_INIT: "divergencia_palenca_iniciar",
  PHONE_CHANGE_SEND_OTP: "divergencia_alterar_telefone_enviar_otp",
  PHONE_CHANGE_CONFIRM_OTP: "divergencia_alterar_telefone_confirmar_otp",
  CONFIRM_OTP: "divergencia_confirmar_otp",
  PHONE_CHANGE_RESEND_OTP: "divergencia_alterar_telefone_reenviar_otp",
  RESEND_OTP: "divergencia_reenviar_otp",
  FINALIZE_UPDATE: "divergencia_finalizar_atualizacao",
  FINALIZE_CLIENT: "divergencia_finalizar_cliente",
  FINALIZE_CLIENT_INFO: "divergencia_finalizar_dados_cliente",
  EXPIRED_DOCUMENT_SUBMIT: "divergencia_proposta_expirada_enviar_documento",
} as const;

export const PRE_APPROVED_ANALYTICS_SOURCES = {
  ACCEPT_TERMS: "pre_aprovado_aceitar_termos",
} as const;

export const TAB_SCREENS = {
  HOME: "Home",
  LOANS: "Tela Emprestimos",
  PAYMENTS: "Tela Pagamentos",
  PROFILE: "Tela Perfil",
  CONFIG: "Tela Configuracoes",
  RENEW: "Tela Renovacao",
  RENEW_LIST: "Tela Renovacao Lista",
} as const;

export const TAB_ANALYTICS_SOURCES = {
  HOME_LOAD_AGREEMENT: "aba_inicio_carregar_acordo",
  LOANS_LOAD: "aba_emprestimos_carregar",
  PAYMENTS_REFRESH_CLIENT: "aba_pagamentos_atualizar_cliente",
  CONFIG_LOAD_DEVICES: "aba_configuracoes_carregar_dispositivos",
  CONFIG_REVOKE_DEVICE: "aba_configuracoes_revogar_dispositivo",
  CONFIG_LOAD_TERMS: "aba_configuracoes_carregar_termos",
  CONFIG_CHANGE_PASSWORD: "aba_configuracoes_alterar_senha",
  RENEW_STATUS: "aba_renovacao_status",
  RENEW_LIST: "aba_renovacao_lista",
} as const;

export const ANALYTICS_FLOWS = {
  APP: "aplicativo",
  DIVERGENCIA: "divergencia",
  LOGIN: "login",
  REGISTER: "cadastro",
  VERIFICATION: "verificacao",
  ACORDO: "acordo",
} as const;

export const REGISTER_SCREENS = {
  STEP_CPF_BIRTHDATE: "Registrar CPF e Data de Nascimento",
  STEP_PASSWORD: "Registrar Senha e Confirmar",
  STEP_PHONE: "Registrar Telefone",
  STEP_AFFILIATE_CODE: "Registrar Código de Afiliado e Confirmar",
  STEP_PROFESSION: "Registrar Profissão",
  STEP_LIMIT: "Registrar Limite de Transações",
  STEP_EMAIL: "Registrar Email",
  STEP_PIX: "Registrar Chave PIX",
  STEP_ADDRESS: "Registrar Endereço",
  STEP_CNPJ: "Registrar CNPJ",
  STEP_BUSINESS_TYPE: "Registrar Tipo de Negócio",
  OPEN_FINANCE: "Registro de OpenFinance",
  TERMS: "Termos",
  UNKNOWN_STEP: "Registro desconhecido",
} as const;

export const AUTH_SCREENS = {
  LOGIN_CPF: "Tela de Login com CPF",
  LOGIN_PASSWORD: "Tela de Login com Senha",
  VERIFICATION_OTP: "Tela de Verificacao de OTP com Codigo",
} as const;

export const DIVERGENCIA_SCREENS = {
  HOME: "Divergencia",
  SEND_DOCUMENT: "Divergencia - Envio de Documento",
  OPEN_FINANCE: "Divergencia - Open Finance",
  PALENCA: "Divergencia - Palenca",
  OTP: "Divergencia - Verificacao de OTP",
  EXPIRED_DOCUMENT: "Divergencia - Proposta Expirada",
} as const;

const REGISTER_STEP_SCREEN_MAP: Record<number, string> = {
  0: REGISTER_SCREENS.STEP_CPF_BIRTHDATE,
  1: REGISTER_SCREENS.STEP_PASSWORD,
  2: REGISTER_SCREENS.STEP_PHONE,
  3: REGISTER_SCREENS.STEP_AFFILIATE_CODE,
  4: REGISTER_SCREENS.STEP_PROFESSION,
  5: REGISTER_SCREENS.STEP_LIMIT,
  6: REGISTER_SCREENS.STEP_EMAIL,
  7: REGISTER_SCREENS.STEP_PIX,
  8: REGISTER_SCREENS.STEP_ADDRESS,
  9: REGISTER_SCREENS.STEP_CNPJ,
  10: REGISTER_SCREENS.STEP_BUSINESS_TYPE,
};

export function getRegisterStepScreenName(step: number) {
  return REGISTER_STEP_SCREEN_MAP[step] ?? REGISTER_SCREENS.UNKNOWN_STEP;
}
