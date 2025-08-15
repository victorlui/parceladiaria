import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TermsCheckbox } from './TermsCheckbox';
import { Colors } from '@/constants/Colors';

interface TermsAndConditionsModalProps {
  visible: boolean;
  onClose: () => void;
  termsAccepted: {
    terms: boolean;
    dataSharing: boolean;
    payments: boolean;
    ccb: boolean;
  };
  onToggleTerm: (termId: keyof TermsAndConditionsModalProps['termsAccepted']) => void;
  onContinue: () => void;
  onOpenLink: (type: 'terms' | 'privacy') => void;
  allTermsAccepted: boolean;
  isLoading: boolean;
  termsData: Array<{
    id: string;
    label: string;
  }>;
}

export default function TermsAndConditionsModal({
  visible,
  onClose,
  termsAccepted,
  onToggleTerm,
  onContinue,
  onOpenLink,
  allTermsAccepted,
  isLoading,
  termsData,
}: TermsAndConditionsModalProps) {
  const handleAcceptAndContinue = () => {
    if (allTermsAccepted) {
      onClose();
      onContinue();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          {/* Header do Modal */}
          <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
            <Text className="text-xl font-bold">Termos e Condições</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Conteúdo do Modal */}
          <ScrollView
            className="flex-1 p-5"
            contentContainerStyle={{ paddingBottom: 150 }}
          >
            {/* Seções dos Termos */}
            <View className="gap-6 mb-8">
              <View>
                <Text className="text-lg font-semibold mb-2">
                  1. Termos de Uso
                </Text>
                <Text className="text-gray-700">
                  Os Termos de Uso definem as condições para utilizar os
                  serviços do banco, incluindo a conta digital e produtos
                  financeiros.
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold mb-2">
                  2. Política de Privacidade
                </Text>
                <Text className="text-gray-700">
                  Detalha a coleta, armazenamento e uso dos dados pessoais dos
                  clientes, garantindo segurança e transparência.
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold mb-2">
                  3. Contrato de Empréstimo (CCB)
                </Text>
                <Text className="text-gray-700">
                  Registra os detalhes do empréstimo concedido, incluindo
                  prazos, taxas e obrigações do cliente.
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold mb-2">
                  4. Termos de Adesão à Conta Digital
                </Text>
                <Text className="text-gray-700">
                  Regulamenta a criação e uso da conta digital, com regras
                  sobre movimentações e tarifas aplicáveis.
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold mb-2">
                  5. Política de Pagamentos e Reembolsos
                </Text>
                <Text className="text-gray-700">
                  Define os métodos aceitos para pagamentos, prazos de
                  compensação e regras para reembolsos.
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold mb-2">
                  6. Termos de Segurança e Autenticação
                </Text>
                <Text className="text-gray-700">
                  Explica medidas de proteção contra fraudes, como
                  autenticação em duas etapas e monitoramento de atividades
                  suspeitas.
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold mb-2">
                  7. Política de Combate à Fraude
                </Text>
                <Text className="text-gray-700">
                  Estabelece diretrizes para a prevenção de fraudes e lavagem
                  de dinheiro, conforme normas regulatórias.
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold mb-2">
                  8. Política de Atendimento ao Cliente
                </Text>
                <Text className="text-gray-700">
                  Define canais de suporte, tempo médio de resposta e regras
                  para reclamações e contestações.
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold mb-2">
                  9. Termos de Encerramento de Conta
                </Text>
                <Text className="text-gray-700">
                  Especifica os procedimentos para encerrar a conta, incluindo
                  quitação de débitos pendentes.
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold mb-2">
                  10. Política de Atualização de Termos
                </Text>
                <Text className="text-gray-700">
                  Explica que os termos podem ser alterados e como os clientes
                  serão informados sobre as mudanças.
                </Text>
              </View>
            </View>

            {/* Checkboxes dos Termos */}
            <View className="gap-4 mb-8">
              {termsData.map((term) => (
                <TermsCheckbox
                  key={term.id}
                  checked={termsAccepted[term.id as keyof typeof termsAccepted]}
                  onPress={() =>
                    onToggleTerm(term.id as keyof typeof termsAccepted)
                  }
                  label={term.label}
                  onOpenLink={(type) => onOpenLink(type)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Botões do Modal refatorados */}
          <View className="p-5 border-t border-gray-200 bg-white">
            <View className="gap-3">
              {/* Botão Aceitar e Continuar */}
              <TouchableOpacity
                onPress={handleAcceptAndContinue}
                disabled={!allTermsAccepted || isLoading}
                style={{
                  backgroundColor:
                    allTermsAccepted && !isLoading
                      ? Colors.primaryColor
                      : '#d1d5db',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                }}
              >
                <View className="flex-row items-center justify-center gap-3">
                  {isLoading ? (
                    <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={allTermsAccepted ? 'white' : '#9ca3af'}
                    />
                  )}
                  <Text
                    className={`font-semibold text-base ${
                      allTermsAccepted && !isLoading
                        ? 'text-white'
                        : 'text-gray-500'
                    }`}
                  >
                    {isLoading ? 'Processando...' : 'Aceitar e Continuar'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Botão Cancelar */}
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-100 border border-gray-300 rounded-xl py-4 px-6 active:bg-gray-200"
              >
                <View className="flex-row items-center justify-center gap-3">
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#6b7280"
                  />
                  <Text className="text-gray-600 font-semibold text-base">
                    Cancelar
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}