type StepContext = {
  hasConfirmAddress?: boolean;
};

export const getSteps = (ctx: StepContext = {}) => [
  {
    title: "Olá! Vamos começar.",
    subtitle:
      "Para iniciar seu cadastro, informe seu CPF e data de nascimento.",
  },

  {
    title: "Crie sua senha",
    subtitle: "Crie uma senha segura para acessar sua área do cliente.",
  },

  {
    title: "Seu número de telefone",
    subtitle: "Para começar, informe seu número.",
  },

  {
    title: "Sua profissão",
    subtitle: "Para começar, informe sua profissão.",
  },

  {
    title: "",
    subtitle: "",
  },

  {
    title: "Qual o seu e-mail?",
    subtitle: "Ele será usado para o seu cadastro e acesso.",
  },

  {
    title: "Confirme sua chave PIX",

    subtitle: "O valor será enviado para esta chave. Está correto?",
  },

  {
    title: ctx.hasConfirmAddress
      ? "Confirmar Endereço "
      : "Informe seu endereço",

    subtitle: ctx.hasConfirmAddress
      ? "Seu endereço esta correto?"
      : "Preencha todos os campos obrigatórios.",
  },
  {
    title: "Informe seu CNPJ",
    subtitle: "Digite os números do seu CNPJ.",
  },
  {
    title: "Qual o seu tipo de comércio?",
    subtitle: "Ex: Barbearia, Lanchonete, Oficina, etc.",
  },
];
