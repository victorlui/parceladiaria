import { Image, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/Button";
import { StatusBar } from "expo-status-bar";
import BackIcon from "@/components/BackIcon";

export default function TermsOfUse() {
  const insets = useSafeAreaInsets();
  

  const handleContinue = () => {
    console.log("continue");
    router.push({ pathname: "/(register)/phone-screen" });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white p-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StatusBar style="dark" />
        <BackIcon />

      <View className="flex-row items-center gap-4 my-6">
        <Image
          source={require("@/assets/images/google-docs.png")}
          className="w-12 h-12"
          resizeMode="contain"
        />
        <View>
          <Text className="text-2xl font-bold text-gray-900">
            Termos e condições
          </Text>
          <Text className="text-gray-600">Atualizado: 08/08/2025</Text>
        </View>
      </View>

      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-xl font-bold mb-4">
            TERMOS DE USO – PARCELA DIÁRIA
          </Text>

          <Text className="font-bold mt-4 mb-2">1. INTRODUÇÃO</Text>
          <Text className="mb-2">
            Bem-vindo(a) ao Parcela Diária!
            {"\n\n"}
            Estes Termos de Uso (“Termos”) regem o acesso e a utilização dos
            serviços oferecidos pelo site www.parceladiaria.com.br (“Site”) e
            demais plataformas vinculadas, operadas por Parcela Diária
            (“Empresa”). Ao acessar ou utilizar qualquer dos nossos serviços,
            você declara expressamente que concorda com todos os termos e
            condições aqui estabelecidos.
          </Text>

          <Text className="font-bold mt-4 mb-2">2. OBJETO DOS TERMOS</Text>
          <Text className="mb-2">
            2.1. Os presentes Termos destinam-se a regular a relação entre a
            Empresa e os usuários, abrangendo a utilização de serviços
            relacionados à oferta, análise e concessão de créditos, bem como
            quaisquer outras funcionalidades disponibilizadas no Site.
            {"\n\n"}
            2.2. Este documento estabelece as condições para acesso, cadastro,
            uso e segurança dos serviços prestados pela Empresa.
          </Text>

          <Text className="font-bold mt-4 mb-2">3. ACEITAÇÃO DOS TERMOS</Text>
          <Text className="mb-2">
            3.1. Ao utilizar os serviços do Site e/ou Aplicativo o Usuário
            concorda integralmente com estes Termos, responsabilizando-se pelo
            seu cumprimento.
            {"\n\n"}
            3.2. Se o Usuário não concordar com qualquer parte destes Termos,
            deverá interromper imediatamente a utilização dos serviços.
          </Text>

          <Text className="font-bold mt-4 mb-2">4. ALTERAÇÕES DOS TERMOS</Text>
          <Text className="mb-2">
            4.1. A Empresa reserva-se o direito de modificar, a qualquer tempo,
            estes Termos, mediante a atualização da sua versão no Site.
            {"\n\n"}
            4.2. As alterações entrarão em vigor na data de sua publicação, e o
            acesso continuado aos serviços constituirá aceitação tácita das
            mudanças.
          </Text>

          <Text className="font-bold mt-4 mb-2">5. CADASTRO E SEGURANÇA</Text>
          <Text className="mb-2">
            5.1. Para acessar determinados serviços, o Usuário deverá realizar
            um cadastro, fornecendo informações verdadeiras, precisas e
            atualizadas, bem como enviando os documentos solicitados, na forma
            em que solicitados, sob pena de responsabilização.
            {"\n\n"}
            5.2. O Usuário é o único responsável por manter o sigilo de suas
            credenciais de acesso, comprometendo-se a notificar imediatamente a
            Empresa em caso de qualquer uso não autorizado.
            {"\n\n"}
            5.3. O Usuário resta ciente de que após o envio dos documentos
            solicitados, os documentos irão para análise prévia. Após a análise,
            caso o Usuário seja aprovado, o mesmo irá receber um link via
            WhatsApp (pelo número previamente fornecido) com os termos para
            conhecimento e aceite.
          </Text>

          <Text className="font-bold mt-4 mb-2">6. SERVIÇOS OFERECIDOS</Text>
          <Text className="mb-2">
            6.1. O Parcela Diária atua na oferta de serviços financeiros, que
            podem incluir, mas não se limitam a análise e concessão de créditos,
            por meio de uma plataforma online.
            {"\n\n"}
            6.2. A concessão de crédito está sujeita à análise de risco,
            aprovação e verificação das informações fornecidas pelo Usuário, com
            base em critérios previamente estabelecidos pela Empresa. O Usuário
            não possui qualquer direito de indenização em caso de não aceite.
            {"\n\n"}
            6.3. Informações detalhadas sobre critérios de aprovação, juros,
            prazos e encargos serão disponibilizadas no ato da contratação e
            durante o processo de solicitação de crédito.
            {"\n\n"}
            6.4. A Parcela Diária poderá, a qualquer tempo e sem a necessidade
            de aviso prévio, suspender os serviços, caso seja averiguado
            qualquer risco ou fraude, sem que isso gere qualquer direito de
            indenização do Usuário.
          </Text>

          <Text className="font-bold mt-4 mb-2">7. OBRIGAÇÕES DO USUÁRIO</Text>
          <Text className="mb-2">
            O Usuário se compromete a:
            {"\n\n"}- Fornecer dados corretos e atualizados durante o cadastro e
            ao longo da utilização dos serviços;
            {"\n"}- Utilizar o Site e os serviços da Empresa unicamente para
            fins lícitos e de acordo com a legislação aplicável;
            {"\n"}- Manter a confidencialidade de suas credenciais de acesso,
            não as compartilhando com terceiros;
            {"\n"}- Respeitar todas as disposições legais e regulamentares
            relacionadas à utilização dos serviços;
            {"\n"}- Cumprir com o quanto pactuado, inclusive com a obrigação de
            pagamento dos créditos ora concedidos.
          </Text>

          <Text className="font-bold mt-4 mb-2">
            8. DIREITOS E OBRIGAÇÕES DA EMPRESA
          </Text>
          <Text className="mb-2">
            8.1. A Empresa compromete-se a prestar os serviços com diligência e
            eficiência, adotando medidas de segurança para proteger os dados dos
            Usuários.
            {"\n\n"}
            8.2. A Empresa poderá, a seu exclusivo critério:
            {"\n"}- Efetuar atualizações e manutenções no Site que possam causar
            interrupções temporárias nos serviços;
            {"\n"}- Solicitar comprovação adicional de informações para garantir
            a veracidade dos dados fornecidos;
            {"\n"}- Restringir ou bloquear o acesso do Usuário caso constate
            descumprimento destes Termos ou indícios de uso indevido.
            {"\n\n"}
            8.3. A Empresa não se responsabiliza por eventuais prejuízos
            decorrentes de falhas ou indisponibilidade temporária dos serviços,
            salvo em casos comprovados de negligência ou má-fé.
          </Text>

          <Text className="font-bold mt-4 mb-2">
            9. PROPRIEDADE INTELECTUAL
          </Text>
          <Text className="mb-2">
            9.1. Todos os conteúdos exibidos no Site e/ou no aplicativo
            incluindo, mas não se limitando a textos, imagens, logotipos e
            softwares, são de propriedade exclusiva da Empresa ou de terceiros
            autorizados.
            {"\n\n"}
            9.2. É expressamente proibida a reprodução, distribuição, alteração
            ou qualquer uso desses conteúdos sem a prévia autorização por
            escrito da Empresa.
          </Text>

          <Text className="font-bold mt-4 mb-2">
            10. POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS
          </Text>
          <Text className="mb-2">
            10.1. A utilização dos serviços implica a aceitação da nossa
            Política de Privacidade, disponível no Site e/ou aplicativo, que
            estabelece as diretrizes para coleta, armazenamento e tratamento dos
            dados pessoais dos Usuários.
            {"\n\n"}
            10.2. A Empresa se compromete a utilizar as informações pessoais dos
            Usuários de forma segura e de acordo com a legislação aplicável,
            como a Lei Geral de Proteção de Dados (LGPD).
          </Text>

          <Text className="font-bold mt-4 mb-2">
            11. LIMITAÇÕES DE RESPONSABILIDADE
          </Text>
          <Text className="mb-2">
            11.1. Em nenhuma hipótese a Empresa será responsabilizada por danos
            diretos, indiretos, incidentais ou consequenciais resultantes da
            utilização ou da impossibilidade de utilização dos serviços.
            {"\n\n"}
            11.2. O Usuário concorda que os serviços são fornecidos “no estado
            em que se encontram” e que qualquer utilização é por sua conta e
            risco.
          </Text>

          <Text className="font-bold mt-4 mb-2">12. RESCISÃO</Text>
          <Text className="mb-2">
            12.1. O Usuário pode rescindir o uso dos serviços a qualquer
            momento, bastando para isso interromper o acesso ao Site.
            {"\n\n"}
            12.2. A Empresa reserva-se o direito de rescindir ou suspender o
            acesso do Usuário, sem aviso prévio, caso identifique violações a
            estes Termos ou atividades que possam comprometer a segurança e
            integridade dos serviços.
          </Text>

          <Text className="font-bold mt-4 mb-2">13. DISPOSIÇÕES GERAIS</Text>
          <Text className="mb-2">
            13.1. Caso qualquer cláusula destes Termos seja considerada inválida
            ou inexequível, as demais cláusulas permanecerão em pleno vigor.
            {"\n\n"}
            13.2. A eventual tolerância de qualquer das partes quanto ao
            descumprimento de qualquer disposição destes Termos não implicará em
            renúncia de direitos ou alteração destes termos.
            {"\n\n"}
            13.3. Estes Termos constituem o entendimento integral entre as
            partes, substituindo quaisquer acordos anteriores, escritos ou
            verbais.
          </Text>

          <Text className="font-bold mt-4 mb-2">
            14. LEGISLAÇÃO APLICÁVEL E FORO
          </Text>
          <Text className="mb-10">
            14.1. Estes Termos serão regidos e interpretados de acordo com as
            leis brasileiras.
            {"\n\n"}
            14.2. Fica eleito o Foro da comarca de [Cidade/Estado] para dirimir
            quaisquer controvérsias decorrentes destes Termos, com renúncia
            expressa a qualquer outro.
          </Text>
        </ScrollView>

        <View className="mt-4">
          <Button
            variant="primary"
            title="Aceitar termos e condições"
            onPress={handleContinue}
            fullWidth={true}
            className="py-4"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
