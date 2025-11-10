// TimelineItem.js
import { Colors } from "@/constants/Colors";
import { formatCurrency } from "@/utils/formats";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  amount: number;
  installment: number;
  totalInstallments: number;
  isLast: boolean;
  date_due: string;
  loan?: any;
  isEmpty?: boolean;
}

// Helper para normalizar diferentes formatos de data em um Date válido
const normalizeDate = (input: unknown): Date | null => {
  if (!input) return null;
  if (input instanceof Date && !isNaN(input.getTime())) return input;

  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === "string") {
    // Tenta primeiro via parseISO; se não for ISO, cai para new Date
    try {
      const d = parseISO(input);
      if (!isNaN(d.getTime())) return d;
    } catch {}
    const d2 = new Date(input);
    return isNaN(d2.getTime()) ? null : d2;
  }

  return null;
};

const TimelineItem = ({
  amount,
  installment,
  totalInstallments,
  isLast,
  date_due,
  loan,
  isEmpty,
}: Props) => {
  const dueDateObj = normalizeDate(date_due);
  const loanDateObj = normalizeDate(loan?.date);

  return (
    <View style={styles.container}>
      {/* COLUNA ESQUERDA: Linha e Ponto */}
      <View style={styles.timelineColumn}>
        {/* O Ponto (Bolinha) */}
        <View style={styles.dot}>
          {/* O círculo interno branco, se você precisar de um 'anel' */}
          <View style={styles.innerDot} />
        </View>

        {/* A Linha Vertical que conecta os pontos (ocultada no último item) */}
        {!isLast && !isEmpty && <View style={styles.line} />}
      </View>

      {/* COLUNA DIREITA: Conteúdo */}
      {!isLast && !isEmpty && (
        <View style={styles.contentColumn}>
          <View style={styles.checkContainer}>
            <FontAwesome5 name="check" size={15} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.contentText}>
              Pagamento:{" "}
              <Text style={{ color: Colors.green.primary }}>
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(amount)}
              </Text>{" "}
              <Text style={{ color: Colors.gray.text }}>
                {" "}
                - Parcela {installment}/{totalInstallments}
              </Text>
            </Text>
            <Text style={{ color: Colors.gray.text, fontWeight: "400" }}>
              Data de pagamento:{" "}
              {dueDateObj ? format(dueDateObj, "dd/MM/yyyy") : "-"}
            </Text>
          </View>
        </View>
      )}

      {(isLast || isEmpty) && (
        <View style={styles.loanContainer}>
          <View>
            <View
              style={[
                styles.headerLoan,
                {
                  width: "100%",
                  justifyContent: "space-between",
                  borderBottomWidth: 1,
                  paddingBottom: 10,
                  borderColor: Colors.borderColor,
                },
              ]}
            >
              <View style={styles.headerLoan}>
                <View style={styles.iconLoan}>
                  <FontAwesome name="plus-circle" size={20} color="white" />
                </View>
                <Text style={styles.loanTitle}>Novo Empréstimo</Text>
              </View>
              <Text style={styles.loanAmount}>
                {formatCurrency(loan?.amount)}
              </Text>
            </View>
            <View style={[styles.headerLoan, { marginVertical: 4 }]}>
              <FontAwesome5
                name="calendar-day"
                size={14}
                color={Colors.gray.primary}
              />
              <Text style={{ color: Colors.gray.text }}>
                {loanDateObj ? format(loanDateObj, "dd/MM/yyyy") : "-"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// StyleSheet.create({...})
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 20,
  },

  // Estilos da Coluna Esquerda (Linha e Ponto)
  timelineColumn: {
    alignItems: "center",
    marginRight: 15,
  },

  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white", // Cor da bolinha (Azul forte)
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Garante que a bolinha fique ACIMA da linha
    borderWidth: 1,
    borderColor: Colors.blue.primary, // Adiciona uma borda externa branca se precisar
  },
  innerDot: {
    // Cria o efeito de anel (a bolinha menor dentro)
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.blue.primary,
  },
  line: {
    // Posiciona a linha ABAIXO do ponto
    position: "absolute",
    top: 20, // Começa abaixo da altura do ponto (20px)
    bottom: -20, // Continua até o fim do container (ajustado pelo marginBottom)
    width: 1, // Espessura da linha
    backgroundColor: Colors.green.primary, // Cor da linha (Verde escuro da sua imagem)
  },

  // Estilos da Coluna Direita (Conteúdo)
  contentColumn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: Colors.borderColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  containerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  checkContainer: {
    width: 25,
    height: 25,
    borderRadius: 16,
    backgroundColor: Colors.blue.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: "bold",
  },
  // NOVO ESTILO: card do empréstimo (diferente dos demais itens)
  loanContainer: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: Colors.borderColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLoan: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconLoan: {
    backgroundColor: Colors.green.secondary,
    width: 30,
    height: 30,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  loanTitle: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.9,
    marginBottom: 4,
    textAlign: "left",
  },
  loanAmount: {
    color: Colors.green.text,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TimelineItem;
