import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  modalType: 'terms' | 'privacy' | null;
  htmlContent?: string;
}

export default function TermsModal({
  visible,
  onClose,
  modalType,
  htmlContent = '',
}: TermsModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-white p-5">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold">
            {modalType === 'terms'
              ? 'Termos e Condições de Uso'
              : 'Política de Privacidade'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1">
          <View>
            {modalType === 'terms' && (
              <View>
                <Text className="font-bold text-lg mb-4 block">
                  PAGAMENTOS
                </Text>
                <Text>
                  Lembrando, os pagamentos são diários de segunda à sábado
                  (incluindo feriados), exceto aos domingos. O pagamento das
                  suas parcelas deverá ser realizado apenas pelo nosso site
                  na área de clientes.
                </Text>
                <Text className="font-bold text-lg mt-6 mb-4 block">
                  MULTAS E JUROS POR ATRASO
                </Text>
                <Text>
                  Em casos de atrasos no pagamento, ocorrerá uma
                  renegociação automática de sua dívida conforme acordado em
                  contrato. Esta penalidade acontece a cada 2 (dois)
                  atrasos. O valor acrescentado será de 5% sobre o valor
                  total financiado. O valor da penalidade será lançado em
                  forma de uma parcela extra em seu contrato, tendo a data
                  de pagamento para um dia após a sua última parcela
                  lançada.
                </Text>
                <Text className="font-bold text-lg mt-6 mb-4 block">
                  RENOVAÇÕES
                </Text>
                <Text>
                  O aumento de limite é progressivo de R$300,00 em R$300,00
                  a cada renovação, podendo chegar até o valor máximo de
                  R$1.500,00. Para renovar o seu empréstimo você deve
                  atender as condições, que estão disponíveis na sua área do
                  cliente, em nosso site.
                </Text>
              </View>
            )}

            {modalType === 'privacy' && (
              <View
                style={{
                  flex: 1,
                  marginBottom: 20,
                  borderRadius: 8,
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  backgroundColor: '#FFFFFF',
                  minHeight: 600,
                }}
              >
                <WebView
                  originWhitelist={['*']}
                  source={{ html: htmlContent }}
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={true}
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  scalesPageToFit={false}
                  startInLoadingState={true}
                  javaScriptEnabled={false}
                  domStorageEnabled={false}
                  allowsInlineMediaPlayback={false}
                  mediaPlaybackRequiresUserAction={true}
                  bounces={false}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Close Button */}
        <Pressable
          onPress={onClose}
          style={{
            padding: 15,
            backgroundColor: '#eee',
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          <Text>Fechar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}