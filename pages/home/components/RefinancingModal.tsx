import ButtonComponent from "@/components/ui/Button";
import {
  RefinanciamentoV2,
  RefinanciamentoV2Bloco,
} from "@/interfaces/login_inteface";
import { useAuthStore } from "@/store/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

interface RefinancingModalProps {
  visible: boolean;
  onClose: () => void;
  amount: any;
  installments: number;
  refinanciamentoV2?: RefinanciamentoV2 | null;
}

const formatCurrencyBR = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "0,00";
  const num =
    typeof value === "string"
      ? Number(value.replace(/[^\d.,-]/g, "").replace(",", "."))
      : Number(value);
  if (Number.isNaN(num)) return "0,00";
  return num.toFixed(2).replace(".", ",");
};

const RED_OPEN_TAG = "[[" + "VERMELHO" + "]]";
const RED_CLOSE_TAG = "[[" + "/VERMELHO" + "]]";
const BOLD_TAG = "**";
const NEWLINE_TAG = "\n";

const placeholderRegex = new RegExp("\\[VALOR_PARCELA\\]", "g");
const splitRegexSrc =
  "(\\[\\[VERMELHO\\]\\]|\\[\\[\\/VERMELHO\\]\\]|\\*\\*|\\n)";
const splitRegex = new RegExp(splitRegexSrc);

const applyInlineFormatting = (
  text: string,
  valorParcela: string,
): (string | React.ReactElement)[] => {
  const withPlaceholders = text.replace(placeholderRegex, valorParcela);

  const parts: (string | React.ReactElement)[] = [];
  const segments = withPlaceholders.split(splitRegex);
  let boldActive = false;
  let redActive = false;
  let keyCounter = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg === BOLD_TAG) {
      boldActive = !boldActive;
      continue;
    }
    if (seg === RED_OPEN_TAG) {
      redActive = true;
      continue;
    }
    if (seg === RED_CLOSE_TAG) {
      redActive = false;
      continue;
    }
    if (seg === NEWLINE_TAG) {
      parts.push(
        React.createElement(Text, { key: "br-" + keyCounter++ }, NEWLINE_TAG),
      );
      continue;
    }
    if (!seg || seg.length === 0) continue;

    const style: any[] = [];
    if (boldActive) style.push(styles.inlineBold);
    if (redActive) style.push(styles.inlineRed);

    if (style.length > 0) {
      parts.push(
        React.createElement(Text, { key: "fmt-" + keyCounter++, style }, seg),
      );
    } else {
      parts.push(seg);
    }
  }

  return parts;
};

const renderInlineText = (text: string, valorParcela: string) => {
  const parts = applyInlineFormatting(text, valorParcela);
  if (parts.length === 1 && typeof parts[0] === "string") {
    return React.createElement(Text, null, parts[0] as string);
  }
  return React.createElement(Text, null, ...parts);
};

const BlocoInfo = ({
  bloco,
  valorParcela,
}: {
  bloco: Extract<RefinanciamentoV2Bloco, { tipo: "info" | "aviso" }>;
  valorParcela: string;
}) => {
  return (
    <View style={styles.blocoContainer}>
      <Text style={styles.blocoTituloBold}>
        {renderInlineText(bloco.titulo, valorParcela)}
      </Text>
      <View style={styles.blocoItensList}>
        {bloco.itens.map((item, idx) => (
          <View key={idx} style={styles.blocoItemRow}>
            <Text style={styles.blocoBullet}>•</Text>
            <Text style={styles.blocoItemText}>
              {renderInlineText(item, valorParcela)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const BlocoDestaque = ({
  bloco,
  valorParcela,
}: {
  bloco: Extract<RefinanciamentoV2Bloco, { tipo: "destaque" }>;
  valorParcela: string;
}) => {
  return (
    <View style={styles.blocoDestaque}>
      <Text style={styles.blocoTituloBold}>
        {renderInlineText(bloco.titulo, valorParcela)}
      </Text>
      <Text style={styles.blocoDestaqueTexto}>
        {renderInlineText(bloco.texto, valorParcela)}
      </Text>
    </View>
  );
};

const RefinancingModal = ({
  visible,
  onClose,
  amount,
  installments,
  refinanciamentoV2,
}: RefinancingModalProps) => {
  const router = useRouter();
  const { user } = useAuthStore();

  const rawValorParcela =
    refinanciamentoV2?.valor_parcela !== undefined &&
    refinanciamentoV2?.valor_parcela !== null
      ? refinanciamentoV2.valor_parcela
      : amount;
  const valorParcela = useMemo(
    () => formatCurrencyBR(rawValorParcela),
    [rawValorParcela],
  );
  const shortName = useMemo(() => {
    const nome = user?.nome ?? "";
    const partes = nome.trim().split(/\s+/);
    return partes.length > 0 ? partes[0] : nome;
  }, [user?.nome]);

  const cpfMasked = useMemo(() => {
    const cpf = user?.cpf ?? "";
    if (cpf.length < 11) return cpf;
    return `***.${cpf.slice(3, 6)}.***-${cpf.slice(-2)}`;
  }, [user?.cpf]);

  const handlePayNow = () => {
    onClose();
    router.push("/(tabs)/payments");
  };

  const usaV2 = !!refinanciamentoV2;

  const renderV2 = () => {
    if (!refinanciamentoV2) return null;

    return (
      <>
        <Text style={styles.modalTitleV2}>
          {renderInlineText(refinanciamentoV2.titulo, valorParcela)}
        </Text>

        <View style={styles.identBlock}>
          <Text>
            <Text style={styles.identCpf}>NOME: </Text>
            <Text style={styles.identName}>{shortName}</Text>
          </Text>
          <Text>
            <Text style={styles.identCpf}>CPF: </Text>
            <Text style={styles.identName}>{cpfMasked}</Text>
          </Text>
        </View>

        <Text style={styles.leadText}>
          {renderInlineText(refinanciamentoV2.lead, valorParcela)}
        </Text>

        {refinanciamentoV2.blocos.map((bloco, idx) => (
          <View key={idx} style={idx > 0 ? styles.blocoSpacing : undefined}>
            {bloco.tipo === "destaque" ? (
              <BlocoDestaque bloco={bloco} valorParcela={valorParcela} />
            ) : (
              <BlocoInfo bloco={bloco} valorParcela={valorParcela} />
            )}
          </View>
        ))}

        <View style={styles.v2Actions}>
          <ButtonComponent
            title={refinanciamentoV2.cta_pagar}
            onPress={handlePayNow}
            iconLeft="attach-money"
            iconRight={null}
          />
          <View style={styles.closeBtnWrapper}>
            <ButtonComponent
              title={refinanciamentoV2.cta_fechar}
              onPress={onClose}
              iconLeft={null}
              iconRight={null}
              outline
            />
          </View>
        </View>
      </>
    );
  };

  const renderLegado = () => (
    <>
      <Text style={styles.modalTitleLegado}>OFERTA APROVADA! 🎉</Text>
      <View>
        <Text style={[styles.modalText, { marginBottom: 0 }]}>
          Nome: {user?.nome}
        </Text>
        <Text style={styles.modalText}>CPF: {cpfMasked}</Text>
      </View>
      <Text style={styles.modalText}>
        Para CONFIRMAR sua proposta, você precisa pagar{" "}
        <Text style={{ fontWeight: "bold" }}>
          {installments} parcela de R$ {amount}
        </Text>{" "}
        ⏰ até <Text style={{ fontWeight: "bold" }}>hoje às 23h59</Text> (sem
        exceção).
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="checkmark-circle" size={18} color="#28a745" /> Após o
          pagamento:
        </Text>
        <Text style={styles.sectionItem}>
          • Suas parcelas em atraso serão reagendadas
        </Text>
        <Text style={styles.sectionItem}>
          • Você sairá do atraso imediatamente
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="close-circle" size={18} color="#dc3545" /> Se não
          pagar hoje:
        </Text>
        <Text style={styles.sectionItem}>
          • A proposta será CANCELADA automaticamente
        </Text>
        <Text style={styles.sectionItem}>
          • Você voltará à situação de atraso anterior
        </Text>
      </View>

      <View style={styles.closeBtnWrapper}>
        <ButtonComponent
          title="Fechar"
          onPress={onClose}
          iconLeft={null}
          iconRight={null}
          outline
        />
      </View>
    </>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {usaV2 ? renderV2() : renderLegado()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 16,
  },
  modalView: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
  },
  inlineBold: {
    fontWeight: "800",
    color: "#0F172A",
  },
  inlineRed: {
    color: "#DC2626",
    fontWeight: "700",
  },
  modalTitleLegado: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
    color: "#0F172A",
  },
  modalTitleV2: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
    textAlign: "center",
    color: "#0F172A",
    lineHeight: 26,
  },
  identBlock: {
    alignSelf: "stretch",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginBottom: 14,
    gap: 2,
  },
  identName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  identCpf: {
    fontSize: 12,
    color: "#6B7280",
  },
  leadText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#1F2937",
    marginBottom: 10,
  },
  blocoContainer: {
    marginTop: 6,
  },
  blocoSpacing: {
    marginTop: 16,
  },
  blocoTituloBold: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    lineHeight: 22,
  },
  blocoItensList: {
    marginTop: 4,
    gap: 6,
  },
  blocoItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  blocoBullet: {
    fontSize: 14,
    color: "#475569",
    marginTop: 2,
    lineHeight: 20,
  },
  blocoItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  blocoDestaque: {
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F0DCAE",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  blocoDestaqueTexto: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#78350F",
  },
  v2Actions: {
    marginTop: 22,
    gap: 10,
  },
  closeBtnWrapper: {
    marginTop: 4,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    alignSelf: "stretch",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionItem: {
    fontSize: 14,
    marginLeft: 4,
    lineHeight: 20,
    color: "#374151",
  },
});

export default RefinancingModal;
